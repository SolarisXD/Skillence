"""
Grade History PDF Parser
========================
Extracts structured academic data from VIT-style grade-history PDFs.

VIT PDFs use a **multi-line table** where each cell is on a separate
line (PyMuPDF text extraction output).  This parser walks lines
sequentially, detecting course-code lines to anchor each entry.

Parses:
  - Student metadata (name, register number, program) from footer
  - Per-entry course code, title, type, credits, grade, exam month,
    course option, distribution category
  - CGPA from the "CGPA Details" section
  - Handles re-takes: keeps the **best** grade per course code

Output model:
  {
    "student_info": { "name", "register_number", "program", "school" },
    "semesters": [{ "semester_label": "all", "courses": [...] }],
    "all_courses": [ ... ],   # best-grade-only
    "cgpa": float | None
  }

Grade-to-Points Mapping (VIT 10-point scale):
  S=10, A=9, B=8, C=7, D=6, E=5, F=0, N=0, P=pass (excluded), W=withdrawn
"""

from __future__ import annotations

import re
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────

GRADE_TO_POINTS: Dict[str, Optional[float]] = {
    "S": 10.0, "A": 9.0, "B": 8.0, "C": 7.0,
    "D": 6.0,  "E": 5.0, "F": 0.0, "N": 0.0,
    "P": None,  # Pass/Fail — excluded from GPA
    "W": None,  # Withdrawn
    "I": None,  # Incomplete
}

VALID_GRADES = set(GRADE_TO_POINTS.keys())

# Course code pattern: 2-5 uppercase letters + 3-4 digits + optional letter
COURSE_CODE_RE = re.compile(r"^[A-Z]{2,5}\d{3,4}[A-Z]?$")

# Course type keywords (VIT uses LT, LTP, PJ, EL, etc.)
COURSE_TYPE_RE = re.compile(r"^(LT|LTP|PJ|EL|L|P|T)$", re.IGNORECASE)

# Exam month pattern: "Feb-2023", "Apr-2024", "Mar-2025"
EXAM_MONTH_RE = re.compile(r"^[A-Z][a-z]{2}-\d{4}$")

# Known distribution categories (from VIT curriculum)
KNOWN_DIST = {
    "PC", "PE", "UC", "UE", "MC", "NMC", "C",
    "UCNS", "UCBES", "UCSD", "UCHSS", "UCPI",
    "UENSE", "UEOE", "UEME", "UEHSSM",
}


# ──────────────────────────────────────────────────────────────────
# Line-by-line parser (state machine)
# ──────────────────────────────────────────────────────────────────

def _is_serial_number(line: str) -> bool:
    """Check if line is just a serial number (integer)."""
    return line.strip().isdigit()


def _is_float(line: str) -> bool:
    try:
        float(line.strip())
        return True
    except ValueError:
        return False


def _parse_entries_from_lines(lines: List[str]) -> List[Dict]:
    """
    Walk through lines and extract course entries.

    The VIT grade-history table has this repeating structure:
      serial_number
      course_code
      course_title (1-3 lines)
      course_type (LT, LTP, PJ)
      credits (float)
      grade (single letter)
      exam_month (Feb-2023)
      result_declared_on (date)
      course_option (NIL)
      distribution (UCNS, PC, etc.)
      category_code (C, MC, etc.) — sometimes absent
    """
    entries: List[Dict] = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Look for a course code
        if not COURSE_CODE_RE.match(line):
            i += 1
            continue

        code = line
        i += 1

        # Collect course title lines (until we hit a course type or credits)
        title_parts = []
        while i < len(lines):
            ln = lines[i].strip()
            if COURSE_TYPE_RE.match(ln) or _is_float(ln):
                break
            if COURSE_CODE_RE.match(ln) or _is_serial_number(ln):
                break
            if EXAM_MONTH_RE.match(ln):
                break
            if ln in VALID_GRADES and len(ln) == 1:
                break
            title_parts.append(ln)
            i += 1

        course_name = " ".join(title_parts).strip()

        # Course type (optional)
        course_type = None
        if i < len(lines) and COURSE_TYPE_RE.match(lines[i].strip()):
            course_type = lines[i].strip()
            i += 1

        # Credits (float)
        credits = None
        if i < len(lines) and _is_float(lines[i].strip()):
            credits = float(lines[i].strip())
            i += 1

        # Grade (single letter)
        grade = None
        if i < len(lines) and lines[i].strip() in VALID_GRADES:
            grade = lines[i].strip()
            i += 1

        # Exam month
        exam_month = None
        if i < len(lines) and EXAM_MONTH_RE.match(lines[i].strip()):
            exam_month = lines[i].strip()
            i += 1

        # Result declared on (date — skip)
        if i < len(lines) and re.match(r"\d{2}-[A-Z][a-z]{2}-\d{4}", lines[i].strip()):
            i += 1

        # Course option (NIL — skip)
        if i < len(lines) and lines[i].strip().upper() == "NIL":
            i += 1

        # Distribution code
        distribution = None
        if i < len(lines) and lines[i].strip() in KNOWN_DIST:
            distribution = lines[i].strip()
            i += 1

        # Category code (C, MC, etc.) — sometimes present
        category = None
        if i < len(lines) and lines[i].strip() in {"C", "MC", "NMC", "PC", "PE", "UC", "UE"}:
            category = lines[i].strip()
            i += 1

        if code and grade:
            entries.append({
                "course_code": code,
                "course_name": course_name,
                "course_type": course_type,
                "credits": credits,
                "grade": grade,
                "exam_month": exam_month,
                "distribution": distribution,
                "category": category,
            })

    return entries


def _parse_student_info(text: str) -> Dict[str, Optional[str]]:
    """Extract student metadata from the footer section."""
    info: Dict[str, Optional[str]] = {
        "name": None,
        "register_number": None,
        "program": None,
        "school": None,
    }

    # Register number: line after "\tRegister No."
    m = re.search(r"Register\s*No\.?\s*\n\s*(\d{2}[A-Z]{3}\d{4,5})", text, re.IGNORECASE)
    if m:
        info["register_number"] = m.group(1).strip()
    else:
        # Fallback: any standalone registration number
        m = re.search(r"\b(\d{2}[A-Z]{3}\d{4,5})\b", text)
        if m:
            info["register_number"] = m.group(1).strip()

    # Name: line after "\tName"
    m = re.search(r"\bName\s*\n\s*(.+)", text, re.IGNORECASE)
    if m:
        info["name"] = m.group(1).strip()

    # Program: line(s) after "\tProgram"
    m = re.search(r"\bProgram\s*\n\s*(.+?)(?:\n\s*(.+?))?\n", text, re.IGNORECASE)
    if m:
        prog = m.group(1).strip()
        if m.group(2):
            prog += " " + m.group(2).strip()
        info["program"] = prog

    # School
    m = re.search(r"\bSchool\s*\n\s*(.+)", text, re.IGNORECASE)
    if m:
        info["school"] = m.group(1).strip()

    return info


def _extract_cgpa(text: str) -> Optional[float]:
    """
    Find CGPA from the 'CGPA Details' section.

    The section lists: Credits Registered, Credits Earned, CGPA, then
    grade counts.  The CGPA is the third numeric value after the header
    row.
    """
    # Find the CGPA Details section
    idx = text.find("CGPA Details")
    if idx < 0:
        idx = text.lower().find("cgpa")
    if idx < 0:
        return None

    # Look at lines after "CGPA Details"
    after = text[idx:]
    # Find a float that looks like a CGPA (1.0-10.0)
    floats = re.findall(r"\b(\d+\.\d{1,2})\b", after)
    for f in floats:
        val = float(f)
        if 1.0 <= val <= 10.0:
            return val
    return None


def _best_grade(grades: List[str]) -> str:
    """Return the best grade from a list (for re-takes)."""
    best = None
    best_pts = -1.0
    for g in grades:
        pts = GRADE_TO_POINTS.get(g)
        if pts is not None and pts > best_pts:
            best_pts = pts
            best = g
    return best if best else grades[-1]


# ──────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────

def parse_grade_history_text(text: str) -> Dict:
    """
    Parse raw text extracted from a VIT grade-history PDF.

    Returns
    -------
    dict with keys: student_info, semesters, all_courses, cgpa
    """
    student_info = _parse_student_info(text)
    cgpa = _extract_cgpa(text)

    lines = text.split("\n")
    entries = _parse_entries_from_lines(lines)

    # ── Deduplicate re-takes: keep best grade per course code ──
    code_entries: Dict[str, List[Dict]] = {}
    for entry in entries:
        code = entry["course_code"]
        code_entries.setdefault(code, []).append(entry)

    all_courses: List[Dict] = []
    for code, ent_list in code_entries.items():
        if len(ent_list) == 1:
            all_courses.append(ent_list[0])
        else:
            grades = [e["grade"] for e in ent_list]
            best_g = _best_grade(grades)
            best_entry = next(e for e in ent_list if e["grade"] == best_g)
            all_courses.append(best_entry)
            logger.info(
                "Course %s taken %d times — keeping best grade: %s",
                code, len(ent_list), best_g,
            )

    # Compute CGPA from entries if not found in document
    if cgpa is None and all_courses:
        total_credits = 0.0
        total_points = 0.0
        for c in all_courses:
            pts = GRADE_TO_POINTS.get(c["grade"])
            creds = c.get("credits") or 0
            if pts is not None and creds > 0:
                total_credits += creds
                total_points += pts * creds
        if total_credits > 0:
            cgpa = round(total_points / total_credits, 2)

    result = {
        "student_info": student_info,
        "semesters": [{"semester_label": "all", "courses": entries}],
        "all_courses": all_courses,
        "cgpa": cgpa,
    }

    logger.info(
        "Grade history parsed: %d entries, %d unique courses, CGPA=%s",
        len(entries), len(all_courses), cgpa,
    )
    return result


async def parse_grade_history_pdf(file_bytes: bytes) -> Dict:
    """
    Extract grade history from a PDF file.

    Parameters
    ----------
    file_bytes : bytes
        Raw PDF content.

    Returns
    -------
    dict  (see parse_grade_history_text)
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise RuntimeError(
            "PyMuPDF (fitz) is required for grade history PDF parsing. "
            "Install it with: pip install PyMuPDF"
        )

    full_text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            full_text += page.get_text("text") + "\n"

    return parse_grade_history_text(full_text)


def compute_course_performance(
    all_courses: List[Dict],
) -> Dict[str, float]:
    """
    Compute per-course grade points for skill weighting.

    Returns a dict mapping course_code → grade_points (0-10 scale).
    Courses with P/W/I grades are excluded.
    """
    result = {}
    for c in all_courses:
        code = c.get("course_code")
        grade = c.get("grade", "")
        pts = GRADE_TO_POINTS.get(grade)
        if code and pts is not None:
            result[code] = pts
    return result
