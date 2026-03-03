"""
Curriculum PDF Parser
=====================
Extracts structured course data from VIT-style curriculum PDFs.

VIT curriculum PDFs use a **multi-line table** where each table cell
appears on its own line in PyMuPDF text output.  The repeating structure
per course is:

    serial_number
    course_code        (e.g. CSE2004)
    course_title       (may span 1-3 lines)
    course_type        (multi-line: "Lecture and", "Tutorial  Hours", "Only")
    version            (e.g. "1.0")
    L  T  P  J         (lecture/tutorial/practical/J counts, one per line)
    total_credits      (e.g. "4.0")

Courses are grouped under category headers like "Programme Core",
"Programme Elective", "University Core - Natural Science Core", etc.

Output: list of dicts with keys:
  - course_code (str)
  - course_name (str)
  - credits (float | None)
  - category (str | None)   # PC, PE, UCNS, UCBES, etc.
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────

COURSE_CODE_RE = re.compile(r"^[A-Z]{2,5}\d{3,4}[A-Z]?$")

# Category headers mapping (VIT curriculum section names → short codes)
CATEGORY_MAP = {
    "programme core": "PC",
    "programme elective": "PE",
    "university core - natural science core": "UCNS",
    "university core - basic engineering sciences core": "UCBES",
    "university core - skill development courses": "UCSD",
    "university core - humanities social science and management core": "UCHSS",
    "university core - project and internships": "UCPI",
    "university elective - natural science electives": "UENSE",
    "university elective - multidisciplinary electives": "UEME",
    "university elective - humanities, social sciences and management electives": "UEHSSM",
    "university elective - open electives": "UEOE",
    "non - graded mandatory courses": "NMC",
}

# Lines that indicate a section header (case-insensitive prefix match)
HEADER_KEYWORDS = [
    "programme core", "programme elective",
    "university core", "university elective",
    "non - graded", "total credits",
    "credit info", "report on", "page ",
    "sl.no", "course code", "course title", "course type",
    "ver", "credits",
]


def _is_serial_number(line: str) -> bool:
    return line.strip().isdigit()


def _is_float(line: str) -> bool:
    try:
        float(line.strip())
        return True
    except ValueError:
        return False


def _is_header_or_skip(line: str) -> bool:
    low = line.strip().lower()
    for kw in HEADER_KEYWORDS:
        if low.startswith(kw):
            return True
    return False


def _detect_category(line: str) -> Optional[str]:
    """If a line is a category header, return its short code."""
    low = line.strip().lower()
    for header, code in CATEGORY_MAP.items():
        if low.startswith(header):
            return code
    return None


# ──────────────────────────────────────────────────────────────────
# Line-by-line parser
# ──────────────────────────────────────────────────────────────────

def _parse_courses_from_lines(lines: List[str]) -> List[Dict]:
    """
    Walk through lines and extract course entries.
    """
    courses: List[Dict] = []
    current_category: Optional[str] = None
    seen_codes: set = set()
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Check for category headers
        cat = _detect_category(line)
        if cat:
            current_category = cat
            i += 1
            continue

        # Skip header/meta lines
        if _is_header_or_skip(line) or not line:
            i += 1
            continue

        # Look for course code
        if not COURSE_CODE_RE.match(line):
            i += 1
            continue

        code = line
        i += 1

        # Collect course title lines
        title_parts = []
        while i < len(lines):
            ln = lines[i].strip()
            # Stop at: another course code, serial number before a code,
            # "Lecture and", version number, float (credits), or header
            if COURSE_CODE_RE.match(ln):
                break
            if _is_serial_number(ln):
                # peek ahead — if next line is a course code, stop
                if i + 1 < len(lines) and COURSE_CODE_RE.match(lines[i + 1].strip()):
                    break
            if ln.lower().startswith("lecture") or ln.lower().startswith("practical"):
                break
            if _is_header_or_skip(ln):
                break
            if _is_float(ln) and float(ln) <= 10:
                # Could be version or credits — check context
                break
            if _detect_category(ln):
                break
            title_parts.append(ln)
            i += 1

        course_name = " ".join(title_parts).strip()

        # Skip course type lines ("Lecture and", "Tutorial  Hours", "Only", etc.)
        while i < len(lines):
            ln = lines[i].strip().lower()
            if any(kw in ln for kw in ["lecture", "tutorial", "practical", "hours", "only"]):
                i += 1
            else:
                break

        # Version (float like "1.0")
        if i < len(lines) and _is_float(lines[i].strip()):
            i += 1  # skip version

        # L, T, P, J columns (individual digits, one per line)
        ltp_count = 0
        while i < len(lines) and lines[i].strip().isdigit() and ltp_count < 4:
            i += 1
            ltp_count += 1

        # Total credits (float)
        credits = None
        if i < len(lines) and _is_float(lines[i].strip()):
            credits = float(lines[i].strip())
            i += 1

        if code and course_name and code not in seen_codes:
            seen_codes.add(code)
            courses.append({
                "course_code": code,
                "course_name": course_name,
                "credits": credits,
                "category": current_category,
            })

    return courses


# ──────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────

def parse_curriculum_text(text: str) -> List[Dict]:
    """
    Parse raw text extracted from a curriculum PDF into structured
    course entries.

    Parameters
    ----------
    text : str
        Text extracted via PyMuPDF.

    Returns
    -------
    list[dict]
        Each dict has keys: course_code, course_name, credits, category.
    """
    lines = text.split("\n")
    courses = _parse_courses_from_lines(lines)

    logger.info("Curriculum parser: extracted %d courses", len(courses))
    return courses


async def parse_curriculum_pdf(file_bytes: bytes) -> List[Dict]:
    """
    Extract courses from a curriculum PDF file.

    Parameters
    ----------
    file_bytes : bytes
        Raw PDF content.

    Returns
    -------
    list[dict]
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise RuntimeError(
            "PyMuPDF (fitz) is required for curriculum PDF parsing. "
            "Install it with: pip install PyMuPDF"
        )

    full_text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            full_text += page.get_text("text") + "\n"

    return parse_curriculum_text(full_text)


def parse_curriculum_from_names(course_names: List[str]) -> List[Dict]:
    """
    Build course entries from a plain list of course names
    (no PDF needed).

    Parameters
    ----------
    course_names : list[str]
        e.g. ["Data Structures", "Operating Systems", "Machine Learning"]

    Returns
    -------
    list[dict]
    """
    return [
        {
            "course_code": None,
            "course_name": re.sub(r"\s+", " ", n).strip(),
            "credits": None,
            "category": None,
        }
        for n in course_names
        if n.strip()
    ]
