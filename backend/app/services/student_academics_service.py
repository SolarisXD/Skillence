"""
Student Academics Service
=========================
Manages student academic profiles — grade histories, skill profiles,
and academic eligibility data.

MongoDB collection: ``student_academics``
Schema:
  {
    "_id": ObjectId,
    "user_id": str,
    "student_info": { name, register_number, program, campus },
    "tenth_percentage": float | None,
    "twelfth_percentage": float | None,
    "cgpa": float | None,
    "semesters": [ ... ],
    "all_courses": [ ... ],           # best-grade deduped
    "skill_profile": { skill: score },  # from course performance
    "resume_skills": [str],            # from resume (if uploaded)
    "created_at": datetime,
    "updated_at": datetime,
  }
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Dict, List, Optional

from bson import ObjectId

from app.database import get_database
from app.services.grade_history_parser import (
    parse_grade_history_pdf,
    parse_grade_history_text,
    compute_course_performance,
)
from app.services.course_catalog_service import get_student_skill_profile_from_courses

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────
# CRUD operations
# ──────────────────────────────────────────────────────────────────

async def get_academics(user_id: str) -> Optional[Dict]:
    """Get a student's academic profile."""
    db = get_database()
    doc = await db.student_academics.find_one(
        {"user_id": user_id},
        {"_id": 0},
    )
    return doc


async def upsert_academics(
    user_id: str,
    data: Dict,
) -> Dict:
    """
    Create or update a student's academic record.

    Parameters
    ----------
    user_id : str
    data : dict
        May include: tenth_percentage, twelfth_percentage,
        student_info, semesters, all_courses, cgpa, resume_skills.

    Returns
    -------
    dict with the updated document.
    """
    db = get_database()
    now = datetime.utcnow()

    update_fields = {k: v for k, v in data.items() if v is not None}
    update_fields["updated_at"] = now

    result = await db.student_academics.update_one(
        {"user_id": user_id},
        {
            "$set": update_fields,
            "$setOnInsert": {"user_id": user_id, "created_at": now},
        },
        upsert=True,
    )

    return await get_academics(user_id)


async def process_grade_history(
    user_id: str,
    file_bytes: bytes,
) -> Dict:
    """
    Parse a grade history PDF and update the student's academic profile.

    This:
      1. Extracts courses + grades from the PDF
      2. Computes per-course grade points
      3. Builds a skill profile from the course catalog
      4. Saves everything to ``student_academics``

    Returns summary with course count, CGPA, and skill profile.
    """
    # Step 1: Parse the PDF
    parsed = await parse_grade_history_pdf(file_bytes)

    # Step 2: Build skill profile from course catalog
    skill_profile = await get_student_skill_profile_from_courses(
        completed_courses=parsed["all_courses"],
    )

    # Step 3: Save to DB
    academic_data = {
        "student_info": parsed["student_info"],
        "semesters": parsed["semesters"],
        "all_courses": parsed["all_courses"],
        "cgpa": parsed["cgpa"],
        "skill_profile": skill_profile,
    }

    doc = await upsert_academics(user_id, academic_data)

    return {
        "total_courses": len(parsed["all_courses"]),
        "total_semesters": len(parsed["semesters"]),
        "cgpa": parsed["cgpa"],
        "student_info": parsed["student_info"],
        "skill_count": len(skill_profile),
        "top_skills": sorted(skill_profile.items(), key=lambda x: x[1], reverse=True)[:10],
    }


async def update_basic_info(
    user_id: str,
    tenth_percentage: Optional[float] = None,
    twelfth_percentage: Optional[float] = None,
) -> Dict:
    """Update basic eligibility fields (10th, 12th percentages)."""
    data = {}
    if tenth_percentage is not None:
        data["tenth_percentage"] = tenth_percentage
    if twelfth_percentage is not None:
        data["twelfth_percentage"] = twelfth_percentage

    return await upsert_academics(user_id, data)


async def update_resume_skills(
    user_id: str,
    skills: List[str],
) -> Dict:
    """
    Update the student's resume-extracted skills.
    Called after resume parsing.
    """
    return await upsert_academics(user_id, {"resume_skills": skills})


async def get_student_full_skill_profile(user_id: str) -> Dict[str, float]:
    """
    Get a merged skill profile combining course-based skills
    and resume skills.

    Course skills have grade-weighted scores (0-10).
    Resume skills get a flat score of 6.0 (assumes competence).
    """
    doc = await get_academics(user_id)
    if not doc:
        return {}

    profile: Dict[str, float] = dict(doc.get("skill_profile", {}))

    # Merge resume skills (don't override course-based scores)
    for skill in doc.get("resume_skills", []):
        skill_lower = skill.lower()
        if skill_lower not in profile:
            profile[skill_lower] = 6.0  # default competence score

    return profile
