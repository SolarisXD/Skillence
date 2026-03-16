"""
Seed Course Catalog
===================
One-time script to parse the curriculum PDF and populate the
``course_catalog`` MongoDB collection with course→skill mappings.

Developer runs this ONCE after setting up the DB:

    cd backend
    python seed_course_catalog.py

Prerequisites:
  - .env file with MONGODB_URL, GEMINI_API set
  - curr.pdf in the project root (or specify --pdf path)
  - PyMuPDF installed (pip install PyMuPDF)

This uses the same service functions as the main app, but runs
outside of FastAPI via asyncio.
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path

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


async def main(pdf_path: Path, use_llm: bool):
    # Lazy imports so dotenv is loaded first
    from app.database import connect_to_mongo, close_mongo_connection
    from app.services.curriculum_parser import parse_curriculum_pdf
    from app.services.course_catalog_service import process_curriculum

    if not pdf_path.exists():
        logger.error("PDF not found: %s", pdf_path)
        sys.exit(1)

    # Connect to MongoDB (required outside FastAPI startup)
    await connect_to_mongo()

    try:
        logger.info("Reading PDF: %s", pdf_path)
        file_bytes = pdf_path.read_bytes()

        logger.info("Parsing curriculum...")
        courses = await parse_curriculum_pdf(file_bytes)
        logger.info("Extracted %d courses", len(courses))

        if not courses:
            logger.error("No courses found in the PDF.")
            sys.exit(1)

        logger.info("Mapping courses → skills (use_llm=%s) ...", use_llm)
        result = await process_curriculum(courses=courses, use_llm=use_llm)

        logger.info("─" * 50)
        logger.info("SEED COMPLETE")
        logger.info("  Total courses:  %d", result["total_courses"])
        logger.info("  Mapped courses: %d", result["mapped_count"])
        logger.info("  Saved to DB:    %d", result["saved_to_db"])
        logger.info("  Sample:")
        for name, skills in result["sample_mappings"].items():
            logger.info("    %-40s → %s", name, skills)
        logger.info("─" * 50)
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed course catalog from curriculum PDF")
    parser.add_argument(
        "--pdf",
        type=Path,
        default=BACKEND_DIR.parent / "curr.pdf",
        help="Path to the curriculum PDF (default: ../curr.pdf)",
    )
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Skip Gemini and use keyword-only mapping",
    )
    args = parser.parse_args()

    asyncio.run(main(args.pdf, use_llm=not args.no_llm))
