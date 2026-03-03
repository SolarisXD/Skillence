"""
Course Catalog Service
======================
Maps university courses to canonical skills from the skill taxonomy.

Two-tier approach:
  - **Tier 1 (default):** Course names only → one Gemini call for the
    entire catalog.  Produces a coarse but useful mapping.
  - **Tier 2 (optional):** Upload individual course PDFs for detailed
    syllabus-level extraction (future enhancement).

The mapping is stored in MongoDB (``course_catalog`` collection) and
reused across all students in the same institution.  A single mapping
call costs ~1-2 Gemini API calls regardless of how many students are
enrolled.

Collection schema (``course_catalog``):
  {
    "_id": ObjectId,
    "course_code": str | None,
    "course_name": str,
    "mapped_skills": [str],         # canonical taxonomy skills
    "credits": float | None,
    "category": str | None,         # PC, PE, UC, etc.
    "created_at": datetime,
    "updated_at": datetime,
  }
"""

from __future__ import annotations

import json
import os
import re
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set

import requests

from app.database import get_database

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────
# Taxonomy helpers
# ──────────────────────────────────────────────────────────────────

_TAXONOMY_PATH = Path(__file__).resolve().parent.parent / "data" / "skill_taxonomy.json"


def _load_taxonomy_skills() -> List[str]:
    """Return flat list of all canonical skill names."""
    try:
        with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        skills = []
        for key, val in data.items():
            if key.startswith("_") or not isinstance(val, list):
                continue
            skills.extend(val)
        return skills
    except Exception as e:
        logger.warning("Could not load taxonomy: %s", e)
        return []


# ──────────────────────────────────────────────────────────────────
# Gemini-based course→skill mapping
# ──────────────────────────────────────────────────────────────────

_MAP_PROMPT = """You are a university curriculum analyst.  Given a list of university course names (from a B.Tech Computer Science / IT program), map each course to the most relevant technical skills from the provided taxonomy.

RULES:
1. Each course should map to 1-5 canonical skill names from the taxonomy.
2. Use EXACT skill names from the taxonomy (lowercase).
3. If a course has no clear mapping, return an empty list for it.
4. Courses like "English", "Ethics", "Constitution" should map to soft skills if applicable, or empty.

TAXONOMY (canonical skill names):
{taxonomy}

COURSES:
{courses}

Return ONLY valid JSON (no markdown fences, no explanation).  Format:
{{
  "mappings": [
    {{ "course_name": "...", "skills": ["skill1", "skill2"] }},
    ...
  ]
}}
"""


def _try_repair_json(raw: str) -> Optional[dict]:
    """
    Attempt to repair common Gemini JSON issues:
    - Trailing commas before } or ]
    - Unterminated strings (truncated output)
    """
    # Strip markdown code fences
    raw = re.sub(r"```(?:json)?\s*", "", raw).strip()
    raw = re.sub(r"```\s*$", "", raw).strip()

    # 1. Direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # 2. Remove trailing commas
    cleaned = re.sub(r",\s*([}\]])", r"\1", raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. If truncated: close from last complete object
    last_brace = raw.rfind("}")
    if last_brace > 0:
        truncated = raw[: last_brace + 1]
        open_brackets = truncated.count("[") - truncated.count("]")
        open_braces = truncated.count("{") - truncated.count("}")
        truncated += "]" * open_brackets + "}" * open_braces
        truncated = re.sub(r",\s*([}\]])", r"\1", truncated)
        try:
            return json.loads(truncated)
        except json.JSONDecodeError:
            pass

    # 4. Extract complete mapping objects via regex
    objects = re.findall(
        r'\{\s*"course_name"\s*:\s*"[^"]*"\s*,\s*"skills"\s*:\s*\[[^\]]*\]\s*\}',
        raw,
    )
    if objects:
        rebuilt = '{"mappings": [' + ", ".join(objects) + "]}"
        try:
            return json.loads(rebuilt)
        except json.JSONDecodeError:
            pass

    return None


def _map_courses_with_gemini(course_names: List[str]) -> Optional[Dict[str, List[str]]]:
    """
    Send all course names to Gemini in batches and get
    course→skills mapping.

    Uses ``responseMimeType: application/json`` to force valid
    JSON output, smaller batches (30), and a JSON repair fallback.

    Returns dict mapping course_name → list of canonical skills,
    or None on failure.
    """
    api_key = os.getenv("GEMINI_API")
    endpoint = os.getenv(
        "GEMINI_ENDPOINT",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    )
    if not api_key:
        logger.warning("GEMINI_API not set — cannot map courses with LLM")
        return None

    taxonomy_skills = _load_taxonomy_skills()
    taxonomy_str = ", ".join(taxonomy_skills[:400])  # cap to avoid token overflow

    BATCH_SIZE = 30  # reduced from 60 to avoid JSON truncation
    all_mappings: Dict[str, List[str]] = {}

    for i in range(0, len(course_names), BATCH_SIZE):
        batch = course_names[i : i + BATCH_SIZE]
        courses_str = "\n".join(f"- {c}" for c in batch)

        prompt = _MAP_PROMPT.format(taxonomy=taxonomy_str, courses=courses_str)

        try:
            resp = requests.post(
                f"{endpoint}?key={api_key}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 8192,
                        "responseMimeType": "application/json",
                    },
                },
                timeout=60,
            )
            resp.raise_for_status()

            raw_text = (
                resp.json()
                .get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )

            # Try direct JSON parse (responseMimeType should guarantee valid JSON)
            parsed = None
            try:
                parsed = json.loads(raw_text)
            except json.JSONDecodeError as je:
                logger.warning("Direct JSON parse failed for batch %d: %s", i, je)
                parsed = _try_repair_json(raw_text)

            if parsed is None:
                logger.error(
                    "Could not parse Gemini response for batch %d. Raw (first 300 chars): %s",
                    i, raw_text[:300],
                )
                continue

            for m in parsed.get("mappings", []):
                name = m.get("course_name", "").strip()
                skills = [s.strip().lower() for s in m.get("skills", [])]
                if name:
                    all_mappings[name.lower()] = skills

            logger.info(
                "Gemini course mapping batch %d-%d: %d courses mapped",
                i, i + len(batch), len(batch),
            )

        except Exception as e:
            logger.error("Gemini course mapping failed for batch %d: %s", i, e)
            # Continue with other batches

    return all_mappings if all_mappings else None


# ──────────────────────────────────────────────────────────────────
# Fallback: naive keyword matching
# ──────────────────────────────────────────────────────────────────

# Hand-crafted mapping for common CS/IT course names
_KEYWORD_MAP: Dict[str, List[str]] = {
    "data structure": ["data structures", "algorithms"],
    "algorithm": ["algorithms", "data structures"],
    "operating system": ["operating systems", "linux"],
    "computer network": ["computer networks", "networking", "tcp/ip"],
    "database": ["database design", "sql", "database management systems"],
    "machine learning": ["machine learning", "python", "scikit-learn"],
    "deep learning": ["deep learning", "neural networks", "tensorflow", "pytorch"],
    "artificial intelligence": ["machine learning", "deep learning", "nlp"],
    "natural language": ["natural language processing", "nlp"],
    "computer vision": ["computer vision", "opencv", "deep learning"],
    "web development": ["html", "css", "javascript", "react"],
    "web technology": ["html", "css", "javascript"],
    "software engineering": ["software engineering", "agile", "git"],
    "cloud computing": ["aws", "docker", "kubernetes", "cloud architecture"],
    "cyber security": ["network security", "cryptography", "ethical hacking"],
    "information security": ["information security", "cryptography"],
    "compiler": ["compiler design"],
    "automata": ["automata theory", "formal languages"],
    "discrete math": ["discrete mathematics", "graph theory"],
    "linear algebra": ["linear algebra"],
    "probability": ["probability", "statistics"],
    "calculus": ["calculus"],
    "python": ["python"],
    "java": ["java", "object-oriented programming"],
    "c programming": ["c"],
    "c++": ["c++", "object-oriented programming"],
    "object oriented": ["object-oriented programming", "design patterns"],
    "digital logic": ["computer architecture"],
    "computer architecture": ["computer architecture"],
    "computer organization": ["computer architecture"],
    "embedded system": ["embedded systems", "microcontrollers"],
    "internet of things": ["internet of things", "iot"],
    "mobile app": ["android", "mobile ui design"],
    "blockchain": ["blockchain", "smart contracts"],
    "big data": ["apache spark", "apache hadoop", "data pipeline"],
    "data mining": ["data preprocessing", "clustering", "classification"],
    "data analytics": ["exploratory data analysis", "statistical analysis", "data visualization"],
    "data science": ["data science and ml", "python", "pandas", "numpy"],
    "image processing": ["computer vision", "opencv"],
    "parallel": ["parallel computing", "concurrent programming"],
    "distributed": ["distributed systems"],
}


def _map_courses_keyword(course_names: List[str]) -> Dict[str, List[str]]:
    """Fallback: map courses to skills using keyword matching."""
    result: Dict[str, List[str]] = {}
    for name in course_names:
        name_lower = name.lower()
        matched_skills: List[str] = []
        for keyword, skills in _KEYWORD_MAP.items():
            if keyword in name_lower:
                for s in skills:
                    if s not in matched_skills:
                        matched_skills.append(s)
        result[name_lower] = matched_skills
    return result


# ──────────────────────────────────────────────────────────────────
# Database operations
# ──────────────────────────────────────────────────────────────────

async def save_course_catalog(
    courses: List[Dict],
    skill_mappings: Dict[str, List[str]],
) -> int:
    """
    Save course→skill mappings to MongoDB.

    Parameters
    ----------
    courses : list[dict]
        From curriculum_parser — each has course_code, course_name, credits, category.
    skill_mappings : dict
        course_name (lowercase) → list of canonical skills.

    Returns
    -------
    int : number of documents upserted.
    """
    db = get_database()
    collection = db.course_catalog
    now = datetime.utcnow()
    count = 0

    for course in courses:
        name = course["course_name"]
        skills = skill_mappings.get(name.lower(), [])

        await collection.update_one(
            {
                "course_name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
            },
            {
                "$set": {
                    "course_code": course.get("course_code"),
                    "course_name": name,
                    "mapped_skills": skills,
                    "credits": course.get("credits"),
                    "category": course.get("category"),
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        count += 1

    logger.info("Saved %d course catalog entries", count)
    return count


async def get_course_catalog() -> List[Dict]:
    """Retrieve the full course catalog."""
    db = get_database()
    cursor = db.course_catalog.find(
        {},
        {"_id": 1, "course_code": 1, "course_name": 1, "mapped_skills": 1,
         "credits": 1, "category": 1, "created_at": 1, "updated_at": 1},
    )
    docs = await cursor.to_list(length=500)
    # Convert ObjectId to string
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


async def get_single_course(course_id: str) -> Optional[Dict]:
    """Retrieve a single course by its MongoDB _id."""
    from bson import ObjectId
    db = get_database()
    doc = await db.course_catalog.find_one({"_id": ObjectId(course_id)})
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


async def update_course(course_id: str, updates: Dict) -> bool:
    """
    Update a course entry (skills, name, etc.).

    Returns True if the course was found and updated.
    """
    from bson import ObjectId
    db = get_database()
    updates["updated_at"] = datetime.utcnow()
    result = await db.course_catalog.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": updates},
    )
    return result.matched_count > 0


async def add_single_course(course_data: Dict) -> str:
    """
    Add a single course to the catalog manually.

    Parameters
    ----------
    course_data : dict
        Keys: course_code, course_name, credits, category, mapped_skills.

    Returns
    -------
    str : The inserted document's ID.
    """
    db = get_database()
    now = datetime.utcnow()
    doc = {
        "course_code": course_data.get("course_code"),
        "course_name": course_data["course_name"],
        "mapped_skills": course_data.get("mapped_skills", []),
        "credits": course_data.get("credits"),
        "category": course_data.get("category"),
        "created_at": now,
        "updated_at": now,
    }
    result = await db.course_catalog.insert_one(doc)
    return str(result.inserted_id)


async def delete_course(course_id: str) -> bool:
    """Delete a course from the catalog. Returns True if deleted."""
    from bson import ObjectId
    db = get_database()
    result = await db.course_catalog.delete_one({"_id": ObjectId(course_id)})
    return result.deleted_count > 0


async def get_student_skill_profile_from_courses(
    completed_courses: List[Dict],
) -> Dict[str, float]:
    """
    Given a student's completed courses (with grades), build a
    weighted skill profile.

    Parameters
    ----------
    completed_courses : list[dict]
        Each has course_code, course_name, grade, credits.

    Returns
    -------
    dict mapping skill_name → weighted score (0-10 scale).
    """
    from app.services.grade_history_parser import GRADE_TO_POINTS

    # Load the catalog
    catalog = await get_course_catalog()
    # Build course_name (lower) → mapped_skills
    name_to_skills: Dict[str, List[str]] = {}
    for entry in catalog:
        name_to_skills[entry["course_name"].lower()] = entry.get("mapped_skills", [])

    # Accumulate skill scores weighted by grade
    skill_scores: Dict[str, List[float]] = {}

    for course in completed_courses:
        cname = course.get("course_name", "").lower()
        grade = course.get("grade", "")
        credits = course.get("credits") or 3  # default 3 credits

        pts = GRADE_TO_POINTS.get(grade)
        if pts is None:
            continue  # P/W/I — skip

        skills = name_to_skills.get(cname, [])
        # Also try matching by course code
        if not skills:
            code = course.get("course_code", "")
            for entry in catalog:
                if entry.get("course_code") == code and code:
                    skills = entry.get("mapped_skills", [])
                    break

        weighted_score = pts * (credits / 4.0)  # normalise credits (4 being typical max)
        for skill in skills:
            skill_scores.setdefault(skill, []).append(weighted_score)

    # Average the scores per skill
    result: Dict[str, float] = {}
    for skill, scores in skill_scores.items():
        result[skill] = round(sum(scores) / len(scores), 2)

    return result


# ──────────────────────────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────────────────────────

async def process_curriculum(
    courses: List[Dict],
    use_llm: bool = True,
) -> Dict:
    """
    Full pipeline: take parsed courses, map to skills, save to DB.

    Parameters
    ----------
    courses : list[dict]
        From ``curriculum_parser.parse_curriculum_pdf()``.
    use_llm : bool
        If True, uses Gemini for mapping.

    Returns
    -------
    dict with keys: total_courses, mapped_count, sample_mappings.
    """
    course_names = [c["course_name"] for c in courses if c.get("course_name")]

    # Get skill mappings
    mappings = None
    if use_llm:
        mappings = _map_courses_with_gemini(course_names)

    if mappings is None:
        logger.info("Using keyword fallback for course mapping")
        mappings = _map_courses_keyword(course_names)

    # Save to database
    saved = await save_course_catalog(courses, mappings)

    # Stats
    mapped_count = sum(1 for skills in mappings.values() if skills)
    sample = {k: v for k, v in list(mappings.items())[:5]}

    return {
        "total_courses": len(courses),
        "mapped_count": mapped_count,
        "saved_to_db": saved,
        "sample_mappings": sample,
    }
