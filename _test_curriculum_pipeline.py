"""
Test Script: Curriculum → Skill Mapping Pipeline
=================================================
Reads curr.pdf, parses courses, maps them to skills via Gemini
(with improved JSON handling) and prints results for verification.

Usage:
    cd backend
    python ../_test_curriculum_pipeline.py

Does NOT write to the database.
"""

import json
import os
import re
import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional

import requests

# ── Setup paths so we can import from backend/app ────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(SCRIPT_DIR / ".env")

from app.services.curriculum_parser import parse_curriculum_text

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Taxonomy loader ─────────────────────────────────────────────
TAXONOMY_PATH = BACKEND_DIR / "app" / "data" / "skill_taxonomy.json"


def load_taxonomy_skills() -> List[str]:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    skills = []
    for key, val in data.items():
        if key.startswith("_") or not isinstance(val, list):
            continue
        skills.extend(val)
    return skills


# ── Gemini mapping (FIXED version) ──────────────────────────────

MAP_PROMPT = """You are a university curriculum analyst.  Given a list of university course names (from a B.Tech Computer Science / IT program), map each course to the most relevant technical skills from the provided taxonomy.

RULES:
1. Each course should map to 1-5 canonical skill names from the taxonomy.
2. Use EXACT skill names from the taxonomy (lowercase).
3. If a course has no clear mapping, return an empty list for it.
4. Courses like "English", "Ethics", "Constitution" should map to soft skills if applicable, or empty.

TAXONOMY (canonical skill names):
{taxonomy}

COURSES:
{courses}

Return ONLY valid JSON.  Format:
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

    # 2. Remove trailing commas (e.g., {"a": 1,} → {"a": 1})
    cleaned = re.sub(r",\s*([}\]])", r"\1", raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. If truncated (unterminated string/array): try to close it
    #    Find last valid entry by searching for the last complete object
    last_brace = raw.rfind("}")
    if last_brace > 0:
        # Try to close from the last complete object
        truncated = raw[: last_brace + 1]
        # Close any open arrays and objects
        open_brackets = truncated.count("[") - truncated.count("]")
        open_braces = truncated.count("{") - truncated.count("}")
        truncated += "]" * open_brackets + "}" * open_braces
        truncated = re.sub(r",\s*([}\]])", r"\1", truncated)
        try:
            return json.loads(truncated)
        except json.JSONDecodeError:
            pass

    # 4. Try extracting just the array of mappings
    match = re.search(r'"mappings"\s*:\s*\[', raw)
    if match:
        arr_start = match.end() - 1  # position of [
        # Find all complete {"course_name": ..., "skills": [...]} objects
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


def map_courses_with_gemini(course_names: List[str]) -> Optional[Dict[str, List[str]]]:
    """
    Fixed Gemini mapping with:
    - responseMimeType: application/json  (forces valid JSON output)
    - Batch size reduced from 60 to 30
    - maxOutputTokens increased to 8192
    - JSON repair fallback
    """
    api_key = os.getenv("GEMINI_API")
    endpoint = os.getenv(
        "GEMINI_ENDPOINT",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    )
    if not api_key:
        logger.error("GEMINI_API env var not set — set it in .env")
        return None

    taxonomy_skills = load_taxonomy_skills()
    taxonomy_str = ", ".join(taxonomy_skills[:400])

    BATCH_SIZE = 30  # reduced from 60
    all_mappings: Dict[str, List[str]] = {}

    for i in range(0, len(course_names), BATCH_SIZE):
        batch = course_names[i: i + BATCH_SIZE]
        courses_str = "\n".join(f"- {c}" for c in batch)
        prompt = MAP_PROMPT.format(taxonomy=taxonomy_str, courses=courses_str)

        logger.info("── Gemini batch %d-%d (%d courses) ──", i, i + len(batch), len(batch))

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

            # Try direct JSON parse first (responseMimeType should guarantee valid JSON)
            parsed = None
            try:
                parsed = json.loads(raw_text)
            except json.JSONDecodeError as e:
                logger.warning("Direct JSON parse failed: %s", e)
                logger.info("Attempting JSON repair...")
                parsed = _try_repair_json(raw_text)

            if parsed is None:
                logger.error(
                    "Could not parse Gemini response for batch %d. "
                    "Raw (first 500 chars):\n%s",
                    i, raw_text[:500],
                )
                continue

            batch_count = 0
            for m in parsed.get("mappings", []):
                name = m.get("course_name", "").strip()
                skills = [s.strip().lower() for s in m.get("skills", [])]
                if name:
                    all_mappings[name.lower()] = skills
                    batch_count += 1

            logger.info("  → Mapped %d / %d courses in this batch", batch_count, len(batch))

        except requests.exceptions.HTTPError as e:
            logger.error("Gemini HTTP error for batch %d: %s", i, e)
            if hasattr(e, "response") and e.response is not None:
                logger.error("  Response body: %s", e.response.text[:500])
        except Exception as e:
            logger.error("Gemini call failed for batch %d: %s", i, e)

    return all_mappings if all_mappings else None


# ── Keyword fallback ────────────────────────────────────────────

KEYWORD_MAP: Dict[str, List[str]] = {
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


def map_courses_keyword(course_names: List[str]) -> Dict[str, List[str]]:
    result: Dict[str, List[str]] = {}
    for name in course_names:
        name_lower = name.lower()
        matched: List[str] = []
        for keyword, skills in KEYWORD_MAP.items():
            if keyword in name_lower:
                for s in skills:
                    if s not in matched:
                        matched.append(s)
        result[name_lower] = matched
    return result


# ── Main ────────────────────────────────────────────────────────

def main():
    curr_pdf_path = SCRIPT_DIR / "curr.pdf"
    if not curr_pdf_path.exists():
        logger.error("curr.pdf not found at %s", curr_pdf_path)
        sys.exit(1)

    # 1. Parse curriculum PDF
    logger.info("=" * 60)
    logger.info("STEP 1: Parsing curriculum PDF")
    logger.info("=" * 60)

    try:
        import fitz
    except ImportError:
        logger.error("PyMuPDF not installed. Run: pip install PyMuPDF")
        sys.exit(1)

    full_text = ""
    with fitz.open(str(curr_pdf_path)) as doc:
        for page in doc:
            full_text += page.get_text("text") + "\n"

    courses = parse_curriculum_text(full_text)
    logger.info("Parsed %d courses from curr.pdf\n", len(courses))

    # Print all parsed courses
    print("\n┌─────────────────────────────────────────────────────────┐")
    print("│  PARSED COURSES                                         │")
    print("├─────┬────────────┬──────────────────────────────┬───────┤")
    print("│  #  │ Code       │ Name                         │ Cat   │")
    print("├─────┼────────────┼──────────────────────────────┼───────┤")
    for idx, c in enumerate(courses, 1):
        code = (c.get("course_code") or "—")[:10].ljust(10)
        name = (c.get("course_name") or "—")[:28].ljust(28)
        cat = (c.get("category") or "—")[:5].ljust(5)
        print(f"│ {str(idx).rjust(3)} │ {code} │ {name} │ {cat} │")
    print("└─────┴────────────┴──────────────────────────────┴───────┘")

    # 2. Map courses to skills with Gemini
    logger.info("\n" + "=" * 60)
    logger.info("STEP 2: Mapping courses → skills (Gemini)")
    logger.info("=" * 60)

    course_names = [c["course_name"] for c in courses if c.get("course_name")]
    gemini_mappings = map_courses_with_gemini(course_names)

    # 3. Also get keyword fallback for comparison
    logger.info("\n" + "=" * 60)
    logger.info("STEP 3: Keyword fallback mapping (for comparison)")
    logger.info("=" * 60)

    keyword_mappings = map_courses_keyword(course_names)

    # 4. Merge: prefer Gemini, fall back to keyword
    final_mappings: Dict[str, List[str]] = {}
    for name in course_names:
        key = name.lower()
        gemini_skills = (gemini_mappings or {}).get(key, [])
        kw_skills = keyword_mappings.get(key, [])
        # Use Gemini if it returned skills, otherwise keyword
        final_mappings[key] = gemini_skills if gemini_skills else kw_skills

    # 5. Print full results
    print("\n" + "=" * 80)
    print("  FINAL COURSE → SKILL MAPPINGS")
    print("=" * 80)

    mapped_count = 0
    unmapped_courses = []
    all_skills_used = set()

    for idx, c in enumerate(courses, 1):
        name = c.get("course_name", "")
        key = name.lower()
        skills = final_mappings.get(key, [])
        source = ""
        if (gemini_mappings or {}).get(key):
            source = " [Gemini]"
        elif keyword_mappings.get(key):
            source = " [Keyword]"
        else:
            source = " [UNMAPPED]"

        if skills:
            mapped_count += 1
            all_skills_used.update(skills)
            skills_str = ", ".join(skills)
        else:
            unmapped_courses.append(name)
            skills_str = "— (no skills mapped)"

        code = c.get("course_code") or "—"
        print(f"\n  {idx:3d}. [{code}] {name}{source}")
        print(f"       Skills: {skills_str}")

    # 6. Summary stats
    print("\n" + "=" * 80)
    print("  SUMMARY")
    print("=" * 80)
    print(f"  Total courses parsed:       {len(courses)}")
    print(f"  Courses with skills mapped: {mapped_count}")
    print(f"  Courses with NO mapping:    {len(unmapped_courses)}")
    print(f"  Unique skills used:         {len(all_skills_used)}")

    if gemini_mappings:
        print(f"  Gemini mapped:              {len(gemini_mappings)}")
    else:
        print("  Gemini mapping:             FAILED (used keyword fallback)")

    kw_mapped = sum(1 for v in keyword_mappings.values() if v)
    print(f"  Keyword fallback mapped:    {kw_mapped}")

    if unmapped_courses:
        print(f"\n  UNMAPPED COURSES ({len(unmapped_courses)}):")
        for name in unmapped_courses:
            print(f"    - {name}")

    print("\n  UNIQUE SKILLS FOUND:")
    for skill in sorted(all_skills_used):
        print(f"    • {skill}")

    print("\n" + "=" * 80)
    print("  TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
