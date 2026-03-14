"""
Course Catalog Service
======================
Maps university courses to canonical skills from the skill taxonomy.

Three-tier approach:
  - **Tier 1 (best):** Individual course PDF syllabus → Gemini per
    course.  Uses actual unit content, experiments, and objectives for
    accurate skill extraction.
  - **Tier 2 (fallback):** Course names only → one Gemini call for a
    batch.  Produces a coarse but useful mapping when no PDF is available.
  - **Tier 3 (last resort):** Keyword-based matching from course names.

The mapping is stored in MongoDB (``course_catalog`` collection) and
reused across all students in the same institution.

Collection schema (``course_catalog``):
  {
    "_id": ObjectId,
    "course_code": str | None,
    "course_name": str,
    "mapped_skills": [str],         # canonical taxonomy skills
    "credits": float | None,
    "category": str | None,         # PC, PE, UC, etc.
    "has_pdf": bool,                # True if mapped from actual syllabus
    "syllabus_text": str | None,    # extracted syllabus (for audit)
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


# ── Syllabus-based prompt (single course, much more accurate) ─────
_SYLLABUS_MAP_PROMPT = """You are an expert technical curriculum analyst.

Given a university course's SYLLABUS CONTENT (unit topics, experiments, objectives), identify ONLY the concrete, hard technical skills that are **actually taught** in this course.

STRICT RULES:
1. Return ONLY skills from the provided TAXONOMY list — use EXACT lowercase names.
2. Return 1-15 skills depending on course breadth. A narrow course may have 2-3; a broad one 10-15.
3. ONLY include a skill if the syllabus EXPLICITLY covers it (not if it's merely implied or tangential).
4. FORBIDDEN generic/vague terms — NEVER return any of these even if they appear in the taxonomy:
   scalability, problem-solving, communication, teamwork, leadership, critical thinking,
   time management, project management, analytical skills, adaptability, creativity,
   decision making, attention to detail, presentation skills, documentation,
   system design, cloud architecture, microservices architecture, software engineering,
   agile, scrum, kanban, waterfall, product management.
5. For non-technical courses (English, Ethics, Management, Constitution, Behavioural Science,
   Communication Skills, etc.) return an EMPTY list [].
6. For project/internship courses with no specific technical content, return an EMPTY list [].
7. Prefer SPECIFIC skills over general ones:
   - "tensorflow" over "deep learning" if TensorFlow is explicitly mentioned
   - "sql" over "database management systems" if SQL queries are taught
   - "python" over "programming languages" if Python is the language used
   - Include BOTH the specific AND general skill if the syllabus covers both depth and breadth.

TAXONOMY (use EXACT names from this list):
{taxonomy}

COURSE: {course_code} — {course_name}

SYLLABUS CONTENT:
{syllabus}

Return ONLY a JSON array of skill strings (no markdown, no explanation):
["skill1", "skill2", ...]
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


def _map_single_course_with_syllabus(
    course_code: str,
    course_name: str,
    syllabus_text: str,
) -> Optional[List[str]]:
    """
    Send a single course's syllabus to Gemini for accurate skill extraction.

    Returns list of canonical skill names, or None on failure.
    """
    api_key = os.getenv("GEMINI_API")
    endpoint = os.getenv(
        "GEMINI_ENDPOINT",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent",
    )
    if not api_key:
        logger.warning("GEMINI_API not set — cannot map course with LLM")
        return None

    taxonomy_skills = _load_taxonomy_skills()
    # Group by category for better prompt context
    taxonomy_str = ", ".join(taxonomy_skills)

    # Cap syllabus to avoid token overflow (keep first 4000 chars)
    truncated_syllabus = syllabus_text[:4000] if len(syllabus_text) > 4000 else syllabus_text

    prompt = _SYLLABUS_MAP_PROMPT.format(
        taxonomy=taxonomy_str,
        course_code=course_code or "N/A",
        course_name=course_name,
        syllabus=truncated_syllabus,
    )

    try:
        resp = None
        for attempt in range(4):
            resp = requests.post(
                f"{endpoint}?key={api_key}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 2048,
                        "responseMimeType": "application/json",
                    },
                },
                timeout=60,
            )
            if resp.status_code in (429, 503) and attempt < 3:
                import time
                wait = 15 * (attempt + 1)  # 15s, 30s, 45s
                logger.info("Gemini %d for %s, retrying in %ds...", resp.status_code, course_code, wait)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            break

        raw_text = (
            resp.json()
            .get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        # Parse the JSON array
        parsed = None
        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            # Try stripping markdown fences
            cleaned = re.sub(r"```(?:json)?\s*", "", raw_text).strip()
            cleaned = re.sub(r"```\s*$", "", cleaned).strip()
            try:
                parsed = json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        # Repair truncated JSON arrays: extract all complete quoted strings
        if parsed is None:
            strings = re.findall(r'"([^"]*)"', raw_text)
            if strings:
                parsed = strings
                logger.info("Repaired truncated JSON for %s (%d items)", course_code, len(strings))

        if parsed is None:
            logger.error(
                "Could not parse Gemini syllabus response for %s. Raw: %s",
                course_code, raw_text[:200],
            )
            return None

        # Validate: should be a list of strings
        if isinstance(parsed, list):
            skills = [s.strip().lower() for s in parsed if isinstance(s, str)]
        elif isinstance(parsed, dict) and "skills" in parsed:
            skills = [s.strip().lower() for s in parsed["skills"] if isinstance(s, str)]
        else:
            logger.warning("Unexpected response format for %s: %s", course_code, type(parsed))
            return None

        # Filter to only taxonomy skills
        taxonomy_set = {s.lower() for s in taxonomy_skills}
        valid_skills = [s for s in skills if s in taxonomy_set]

        if len(valid_skills) < len(skills):
            dropped = [s for s in skills if s not in taxonomy_set]
            logger.info("Dropped non-taxonomy skills for %s: %s", course_code, dropped)

        return valid_skills

    except Exception as e:
        logger.error("Gemini syllabus mapping failed for %s: %s", course_code, e)
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
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent",
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
    syllabus_data: Optional[Dict[str, Dict]] = None,
) -> int:
    """
    Save course→skill mappings to MongoDB.

    Parameters
    ----------
    courses : list[dict]
        From curriculum_parser — each has course_code, course_name, credits, category.
    skill_mappings : dict
        course_name (lowercase) → list of canonical skills.
    syllabus_data : dict | None
        course_code → {"syllabus_text": str, "has_pdf": bool}

    Returns
    -------
    int : number of documents upserted.
    """
    db = get_database()
    collection = db.course_catalog
    now = datetime.utcnow()
    count = 0

    syllabus_data = syllabus_data or {}

    for course in courses:
        name = course["course_name"]
        code = course.get("course_code", "")
        skills = skill_mappings.get(name.lower(), [])

        syl = syllabus_data.get(code, {})

        await collection.update_one(
            {
                "course_name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
            },
            {
                "$set": {
                    "course_code": code,
                    "course_name": name,
                    "mapped_skills": skills,
                    "credits": course.get("credits"),
                    "category": course.get("category"),
                    "has_pdf": syl.get("has_pdf", False),
                    "syllabus_text": syl.get("syllabus_text"),
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
    syllabus_data: Optional[Dict[str, Dict]] = None,
    skill_mappings_override: Optional[Dict[str, List[str]]] = None,
) -> Dict:
    """
    Full pipeline: take parsed courses, map to skills, save to DB.

    Parameters
    ----------
    courses : list[dict]
        From ``curriculum_parser.parse_curriculum_pdf()``.
    use_llm : bool
        If True, uses Gemini for mapping (for courses without syllabus).
    syllabus_data : dict | None
        course_code → {"syllabus_text": str, "has_pdf": bool}
    skill_mappings_override : dict | None
        Pre-computed course_name(lower) → skills.  When provided
        (e.g. from seed_course_catalog_v2), the batch Gemini call is
        skipped for courses already mapped.

    Returns
    -------
    dict with keys: total_courses, mapped_count, sample_mappings.
    """
    course_names = [c["course_name"] for c in courses if c.get("course_name")]

    if skill_mappings_override:
        mappings = dict(skill_mappings_override)
    else:
        # Get skill mappings via batch Gemini
        mappings = None
        if use_llm:
            mappings = _map_courses_with_gemini(course_names)

        if mappings is None:
            logger.info("Using keyword fallback for course mapping")
            mappings = _map_courses_keyword(course_names)

    # Save to database
    saved = await save_course_catalog(courses, mappings, syllabus_data)

    # Stats
    mapped_count = sum(1 for skills in mappings.values() if skills)
    sample = {k: v for k, v in list(mappings.items())[:5]}

    return {
        "total_courses": len(courses),
        "mapped_count": mapped_count,
        "saved_to_db": saved,
        "sample_mappings": sample,
    }
