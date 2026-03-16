"""
Matching & Scoring Engine
=========================
Pure algorithmic matching — ZERO LLM calls at query time.

Scores a student against a company drive's JD requirements using:
  - Weighted skill overlap (required_skills + preferred_skills)
  - Resume bonus (resume mentions skills not in courses)
  - CGPA bonus
  - Eligibility gate (10th %, 12th %, CGPA thresholds)

Formula:
  total_score = (required_score * 0.70)
              + (preferred_score * 0.15)
              + (resume_bonus * 0.10)
              + (cgpa_bonus * 0.05)

  Where:
    required_score  = avg(student_skill_score / 10) for matched required skills
    preferred_score = avg(student_skill_score / 10) for matched preferred skills
    resume_bonus    = fraction of JD skills found in resume but not in courses
    cgpa_bonus      = student_cgpa / 10

All scores are normalised to 0.0 – 1.0 range.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Tuple

from app.database import get_database
from app.services.student_academics_service import (
    get_academics,
    get_student_full_skill_profile,
)

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────
# Weight constants
# ──────────────────────────────────────────────────────────────────

W_REQUIRED = 0.70
W_PREFERRED = 0.15
W_RESUME = 0.10
W_CGPA = 0.05


# ──────────────────────────────────────────────────────────────────
# Eligibility gate
# ──────────────────────────────────────────────────────────────────

def check_eligibility(
    student: Dict,
    criteria: Dict,
) -> Tuple[bool, List[str]]:
    """
    Check if a student passes the drive's eligibility criteria.

    Parameters
    ----------
    student : dict
        Student academics document (from student_academics collection).
    criteria : dict
        From CompanyDrive.criteria — has min_tenth, min_twelfth, min_cgpa,
        allowed_branches, active_backlogs.

    Returns
    -------
    (is_eligible: bool, reasons: list[str])
        reasons lists why the student is NOT eligible (empty if eligible).
    """
    reasons = []

    # 10th percentage
    min_tenth = criteria.get("min_tenth_percentage")
    student_tenth = student.get("tenth_percentage")
    if min_tenth is not None and student_tenth is not None:
        if student_tenth < min_tenth:
            reasons.append(
                f"10th percentage {student_tenth}% < required {min_tenth}%"
            )

    # 12th percentage
    min_twelfth = criteria.get("min_twelfth_percentage")
    student_twelfth = student.get("twelfth_percentage")
    if min_twelfth is not None and student_twelfth is not None:
        if student_twelfth < min_twelfth:
            reasons.append(
                f"12th percentage {student_twelfth}% < required {min_twelfth}%"
            )

    # CGPA
    min_cgpa = criteria.get("min_cgpa")
    student_cgpa = student.get("cgpa")
    if min_cgpa is not None and student_cgpa is not None:
        if student_cgpa < min_cgpa:
            reasons.append(
                f"CGPA {student_cgpa} < required {min_cgpa}"
            )

    # Active backlogs
    max_backlogs = criteria.get("active_backlogs")
    if max_backlogs is not None:
        # Count F/N grades in all_courses
        backlogs = sum(
            1 for c in student.get("all_courses", [])
            if c.get("grade") in ("F", "N")
        )
        if backlogs > max_backlogs:
            reasons.append(
                f"Active backlogs {backlogs} > allowed {max_backlogs}"
            )

    return (len(reasons) == 0, reasons)


# ──────────────────────────────────────────────────────────────────
# Skill matching score
# ──────────────────────────────────────────────────────────────────

def _compute_skill_score(
    student_skills: Dict[str, float],
    jd_skills: List[Dict],
) -> Tuple[float, List[str], List[str]]:
    """
    Compute normalised skill match score.

    Parameters
    ----------
    student_skills : dict
        skill_name → score (0-10 scale)
    jd_skills : list[dict]
        Each has "skill" and "weight" keys.

    Returns
    -------
    (score: float 0-1, matched: list[str], missing: list[str])
    """
    if not jd_skills:
        return 0.0, [], []

    matched = []
    missing = []
    weighted_sum = 0.0
    total_weight = 0.0

    for item in jd_skills:
        skill = item.get("skill", "").lower()
        weight = item.get("weight", 0.5)
        total_weight += weight

        student_score = student_skills.get(skill, 0.0)
        if student_score > 0:
            matched.append(skill)
            # Normalise student score to 0-1 range (was 0-10)
            weighted_sum += (student_score / 10.0) * weight
        else:
            missing.append(skill)

    if total_weight == 0:
        return 0.0, matched, missing

    return weighted_sum / total_weight, matched, missing


# ──────────────────────────────────────────────────────────────────
# Main scoring function
# ──────────────────────────────────────────────────────────────────

def score_student_for_drive(
    student_academics: Dict,
    student_skill_profile: Dict[str, float],
    jd_structured: Dict,
    drive_criteria: Dict,
) -> Dict:
    """
    Score a single student against a single drive.

    Parameters
    ----------
    student_academics : dict
        From ``student_academics`` collection.
    student_skill_profile : dict
        skill → score (0-10) from get_student_full_skill_profile().
    jd_structured : dict
        Parsed JD with required_skills, preferred_skills.
    drive_criteria : dict
        Eligibility criteria from CompanyDrive.

    Returns
    -------
    dict with:
      - eligible (bool)
      - eligibility_reasons (list[str])
      - total_score (float 0-1)
      - required_score, preferred_score, resume_bonus, cgpa_bonus
      - matched_skills, missing_skills
    """
    # Step 1: Eligibility gate
    eligible, reasons = check_eligibility(student_academics, drive_criteria)

    # Step 2: Required skill score
    required_skills = jd_structured.get("required_skills", [])
    req_score, req_matched, req_missing = _compute_skill_score(
        student_skill_profile, required_skills
    )

    # Step 3: Preferred skill score
    preferred_skills = jd_structured.get("preferred_skills", [])
    pref_score, pref_matched, pref_missing = _compute_skill_score(
        student_skill_profile, preferred_skills
    )

    # Step 4: Resume bonus — skills from resume not in course-based profile
    course_skills = set(student_academics.get("skill_profile", {}).keys())
    resume_skills = set(
        s.lower() for s in student_academics.get("resume_skills", [])
    )
    # Skills that are in JD AND in resume but NOT in course profile
    all_jd_skill_names = set(
        s["skill"].lower()
        for s in required_skills + preferred_skills
    )
    resume_extra = resume_skills & all_jd_skill_names - course_skills
    resume_bonus = len(resume_extra) / max(len(all_jd_skill_names), 1)

    # Step 5: CGPA bonus
    cgpa = student_academics.get("cgpa") or 0
    cgpa_bonus = min(cgpa / 10.0, 1.0)

    # Step 6: Weighted total
    total_score = (
        req_score * W_REQUIRED
        + pref_score * W_PREFERRED
        + resume_bonus * W_RESUME
        + cgpa_bonus * W_CGPA
    )
    total_score = round(min(total_score, 1.0), 4)

    all_matched = list(set(req_matched + pref_matched))
    all_missing = list(set(req_missing + pref_missing) - set(all_matched))

    return {
        "eligible": eligible,
        "eligibility_reasons": reasons,
        "total_score": total_score,
        "required_score": round(req_score, 4),
        "preferred_score": round(pref_score, 4),
        "resume_bonus": round(resume_bonus, 4),
        "cgpa_bonus": round(cgpa_bonus, 4),
        "matched_skills": all_matched,
        "missing_skills": all_missing,
        "matched_count": len(all_matched),
        "total_jd_skills": len(all_jd_skill_names),
    }


# ──────────────────────────────────────────────────────────────────
# Batch shortlisting
# ──────────────────────────────────────────────────────────────────

async def shortlist_students_for_drive(
    drive_id: str,
    top_n: Optional[int] = None,
    eligible_only: bool = True,
) -> List[Dict]:
    """
    Rank all students for a given drive and return the shortlist.

    Parameters
    ----------
    drive_id : str
        The CompanyDrive document ID.
    top_n : int, optional
        If specified, return only the top N students.
    eligible_only : bool
        If True, exclude students who fail eligibility.

    Returns
    -------
    list[dict] — sorted by total_score descending. Each dict has:
      user_id, student_name, register_number, total_score, eligible,
      matched_skills, missing_skills, cgpa, ...
    """
    db = get_database()

    # Load the drive
    from bson import ObjectId

    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise ValueError(f"Drive {drive_id} not found")

    jd_structured = drive.get("jd_structured", {})
    criteria = drive.get("criteria", {})

    # Load all students
    cursor = db.student_academics.find({})
    students = await cursor.to_list(length=5000)

    results = []
    for student in students:
        user_id = student.get("user_id")

        # Build full skill profile (course + resume)
        skill_profile = dict(student.get("skill_profile", {}))
        for s in student.get("resume_skills", []):
            if s.lower() not in skill_profile:
                skill_profile[s.lower()] = 6.0

        # Score
        score_result = score_student_for_drive(
            student_academics=student,
            student_skill_profile=skill_profile,
            jd_structured=jd_structured,
            drive_criteria=criteria,
        )

        if eligible_only and not score_result["eligible"]:
            continue

        results.append({
            "user_id": user_id,
            "student_name": student.get("student_info", {}).get("name", "Unknown"),
            "register_number": student.get("student_info", {}).get("register_number"),
            "cgpa": student.get("cgpa"),
            "tenth_percentage": student.get("tenth_percentage"),
            "twelfth_percentage": student.get("twelfth_percentage"),
            **score_result,
        })

    # Sort by total_score descending
    results.sort(key=lambda x: x["total_score"], reverse=True)

    if top_n:
        results = results[:top_n]

    logger.info(
        "Shortlisted %d/%d students for drive %s",
        len(results), len(students), drive_id,
    )
    return results
