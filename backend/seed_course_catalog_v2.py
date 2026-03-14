"""
Seed Course Catalog v2 — Syllabus-Aware
========================================
Parses course PDFs from the ``Courses/`` folder, extracts actual syllabus
content, and uses Gemini to map each course to hard technical skills.

For courses WITHOUT a PDF, falls back to batch name-only mapping.

Usage::

    cd backend
    python seed_course_catalog_v2.py
    python seed_course_catalog_v2.py --pdf ../curr.pdf --courses-dir ../Courses
    python seed_course_catalog_v2.py --no-llm   # keyword-only fallback for all

Prerequisites:
  - ``.env`` in project root with MONGODB_URI, GEMINI_API
  - ``curr.pdf`` in the project root
  - ``Courses/`` folder with individual course PDFs
  - PyMuPDF installed (pip install PyMuPDF)
"""

from __future__ import annotations

import argparse
import asyncio
import glob
import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Ensure backend is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR.parent / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
)
logger = logging.getLogger(__name__)


def _scan_course_pdfs(courses_dir: Path) -> Dict[str, Path]:
    """
    Scan the Courses folder and build a map of course_code → file path.

    Filename convention: ``{CODE}_{REST}.pdf`` or ``.docx``.
    For duplicate codes, the first file found is used.
    """
    code_to_file: Dict[str, Path] = {}
    for fpath in sorted(courses_dir.iterdir()):
        if fpath.suffix.lower() not in (".pdf", ".docx"):
            continue
        code = fpath.name.split("_")[0].upper()
        if code not in code_to_file:
            code_to_file[code] = fpath
    return code_to_file


def _classify_courses(
    courses: List[Dict],
    code_to_file: Dict[str, Path],
) -> Tuple[List[Dict], List[Dict]]:
    """
    Split courses into (with_pdf, without_pdf) based on available files.
    """
    with_pdf = []
    without_pdf = []
    for c in courses:
        code = (c.get("course_code") or "").upper()
        if code in code_to_file:
            with_pdf.append(c)
        else:
            without_pdf.append(c)
    return with_pdf, without_pdf


async def main(
    pdf_path: Path,
    courses_dir: Path,
    use_llm: bool,
    rate_limit: float,
):
    from app.database import connect_to_mongo, close_mongo_connection
    from app.services.curriculum_parser import parse_curriculum_pdf
    from app.services.course_pdf_parser import extract_syllabus_from_file
    from app.services.course_catalog_service import (
        _map_single_course_with_syllabus,
        _map_courses_with_gemini,
        _map_courses_keyword,
        process_curriculum,
    )

    if not pdf_path.exists():
        logger.error("Curriculum PDF not found: %s", pdf_path)
        sys.exit(1)

    # ── 1. Parse curriculum PDF for the master course list ──
    logger.info("Parsing curriculum: %s", pdf_path)
    file_bytes = pdf_path.read_bytes()
    courses = await parse_curriculum_pdf(file_bytes)
    logger.info("Found %d courses in curriculum", len(courses))

    if not courses:
        logger.error("No courses found in the PDF.")
        sys.exit(1)

    # ── 2. Scan Courses folder ──
    code_to_file: Dict[str, Path] = {}
    if courses_dir.exists():
        code_to_file = _scan_course_pdfs(courses_dir)
        logger.info("Found %d course PDFs in %s", len(code_to_file), courses_dir)
    else:
        logger.warning("Courses directory not found: %s", courses_dir)

    # ── 3. Classify ──
    with_pdf, without_pdf = _classify_courses(courses, code_to_file)
    logger.info(
        "Courses with PDF: %d  |  Without PDF: %d",
        len(with_pdf), len(without_pdf),
    )

    # ── 4. Process courses WITH PDFs (syllabus-based) ──
    all_mappings: Dict[str, List[str]] = {}
    syllabus_data: Dict[str, Dict] = {}
    stats = {"pdf_ok": 0, "pdf_empty_syllabus": 0, "pdf_gemini_fail": 0, "pdf_no_skills": 0}

    if with_pdf and use_llm:
        logger.info("─" * 60)
        logger.info("PHASE 1: Syllabus-based mapping (%d courses)", len(with_pdf))
        logger.info("─" * 60)

        consecutive_fails = 0

        for i, course in enumerate(with_pdf, 1):
            code = course["course_code"].upper()
            name = course["course_name"]
            fpath = code_to_file[code]

            # Extract syllabus
            try:
                result = extract_syllabus_from_file(str(fpath))
                syl_text = result["syllabus_text"]
            except Exception as e:
                logger.warning("  [%d/%d] %s — PDF parse error: %s", i, len(with_pdf), code, e)
                syl_text = ""

            syllabus_data[code] = {
                "syllabus_text": syl_text[:2000] if syl_text else None,  # store truncated for audit
                "has_pdf": True,
            }

            if not syl_text or len(syl_text) < 30:
                # Too little content — fall back to name-only later
                logger.info("  [%d/%d] %s %-40s — no syllabus, deferring", i, len(with_pdf), code, name[:40])
                stats["pdf_empty_syllabus"] += 1
                continue

            # Extra cooldown if we hit consecutive 429 failures
            if consecutive_fails >= 3:
                cooldown = 60
                logger.warning("  %d consecutive failures — cooling down %ds...", consecutive_fails, cooldown)
                time.sleep(cooldown)
                consecutive_fails = 0

            # Map via Gemini with syllabus
            skills = _map_single_course_with_syllabus(code, name, syl_text)

            if skills is None:
                logger.warning("  [%d/%d] %s %-40s — Gemini failed", i, len(with_pdf), code, name[:40])
                stats["pdf_gemini_fail"] += 1
                consecutive_fails += 1
            elif not skills:
                logger.info("  [%d/%d] %s %-40s — [] (non-technical)", i, len(with_pdf), code, name[:40])
                all_mappings[name.lower()] = []
                stats["pdf_no_skills"] += 1
                consecutive_fails = 0
            else:
                logger.info("  [%d/%d] %s %-40s — %s", i, len(with_pdf), code, name[:40], skills)
                all_mappings[name.lower()] = skills
                stats["pdf_ok"] += 1
                consecutive_fails = 0

            # Rate limit to avoid Gemini 429s
            if rate_limit > 0:
                time.sleep(rate_limit)

    # ── 5. Batch-map remaining courses (name-only) ──
    unmapped_courses = []
    for course in courses:
        if course["course_name"].lower() not in all_mappings:
            unmapped_courses.append(course)

    if unmapped_courses:
        logger.info("─" * 60)
        logger.info("PHASE 2: Name-only mapping (%d remaining courses)", len(unmapped_courses))
        logger.info("─" * 60)

        names = [c["course_name"] for c in unmapped_courses]

        batch_mappings = None
        if use_llm:
            batch_mappings = _map_courses_with_gemini(names)

        if batch_mappings is None:
            logger.info("Using keyword fallback for remaining courses")
            batch_mappings = _map_courses_keyword(names)

        for name_lower, skills in batch_mappings.items():
            if name_lower not in all_mappings:
                all_mappings[name_lower] = skills

        # Mark these without PDFs in syllabus_data
        for course in unmapped_courses:
            code = course.get("course_code", "")
            if code and code not in syllabus_data:
                syllabus_data[code] = {"syllabus_text": None, "has_pdf": False}

    # ── 6. Save to MongoDB ──
    logger.info("─" * 60)
    logger.info("PHASE 3: Saving to MongoDB")
    logger.info("─" * 60)

    await connect_to_mongo()
    try:
        result = await process_curriculum(
            courses=courses,
            use_llm=False,  # don't re-call Gemini
            syllabus_data=syllabus_data,
            skill_mappings_override=all_mappings,
        )

        # ── 7. Print report ──
        logger.info("─" * 60)
        logger.info("SEED v2 COMPLETE")
        logger.info("─" * 60)
        logger.info("  Total courses:         %d", result["total_courses"])
        logger.info("  Mapped (has skills):   %d", result["mapped_count"])
        logger.info("  Saved to DB:           %d", result["saved_to_db"])
        logger.info("")
        logger.info("  [Syllabus-based]")
        logger.info("    With PDF + skills:   %d", stats["pdf_ok"])
        logger.info("    Non-technical:       %d", stats["pdf_no_skills"])
        logger.info("    Empty syllabus:      %d", stats["pdf_empty_syllabus"])
        logger.info("    Gemini failure:      %d", stats["pdf_gemini_fail"])
        logger.info("")
        logger.info("  [Name-only fallback]:  %d", len(unmapped_courses))
        logger.info("")

        # Missing PDFs report
        missing = []
        for c in without_pdf:
            missing.append(f"    {c.get('course_code', '?'):>10}  {c['course_name']}")
        if missing:
            logger.info("  Missing PDFs (%d):", len(missing))
            for line in missing:
                logger.info(line)
        else:
            logger.info("  All courses have PDFs!")

        # Sample mappings
        logger.info("")
        logger.info("  Sample mappings:")
        shown = 0
        for name, skills in sorted(all_mappings.items()):
            if skills and shown < 10:
                logger.info("    %-45s → %s", name[:45], skills)
                shown += 1

        logger.info("─" * 60)

    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed course catalog v2 — syllabus-aware mapping",
    )
    parser.add_argument(
        "--pdf",
        type=Path,
        default=BACKEND_DIR.parent / "curr.pdf",
        help="Path to the curriculum PDF (default: ../curr.pdf)",
    )
    parser.add_argument(
        "--courses-dir",
        type=Path,
        default=BACKEND_DIR.parent / "Courses",
        help="Path to the Courses folder (default: ../Courses)",
    )
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Skip Gemini entirely and use keyword-only mapping",
    )
    parser.add_argument(
        "--rate-limit",
        type=float,
        default=1.5,
        help="Seconds to wait between Gemini calls (default: 1.5)",
    )
    args = parser.parse_args()

    asyncio.run(main(
        args.pdf,
        args.courses_dir,
        use_llm=not args.no_llm,
        rate_limit=args.rate_limit,
    ))
