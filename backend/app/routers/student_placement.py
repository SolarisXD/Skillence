"""
Student Placement Router
========================
API endpoints for the Student role in the placement system:
  - Upload grade history and academic details
  - View eligible / upcoming / expired drives
  - Apply to drives
  - View own applications and match scores

All endpoints require ``student`` role.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, File, HTTPException, Query, UploadFile, status

from app.database import get_database
from app.utils.role_auth import require_student
from app.services.student_academics_service import (
    get_academics,
    process_grade_history,
    update_basic_info,
    update_resume_skills,
    get_student_full_skill_profile,
)
from app.services.matching_engine import check_eligibility, score_student_for_drive

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/student/placement", tags=["Student Placement"])


# ──────────────────────────────────────────────────────────────────
# Academic Profile
# ──────────────────────────────────────────────────────────────────

@router.get("/academics", response_model=dict)
async def get_my_academics(
    user: dict = Depends(require_student),
):
    """Get the current student's academic profile."""
    doc = await get_academics(user["user_id"])
    if not doc:
        return {
            "message": "No academic profile found. Upload your grade history to get started.",
            "has_profile": False,
        }
    doc["has_profile"] = True
    return doc


@router.post("/academics/grade-history", response_model=dict)
async def upload_grade_history(
    file: UploadFile = File(...),
    user: dict = Depends(require_student),
):
    """
    Upload a grade history PDF.

    Extracts courses, grades, CGPA, and builds a skill profile
    based on the course catalog.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()

    result = await process_grade_history(
        user_id=user["user_id"],
        file_bytes=file_bytes,
    )

    return {
        "message": "Grade history processed successfully",
        **result,
    }


@router.put("/academics/basic-info", response_model=dict)
async def update_my_basic_info(
    payload: dict = Body(...),
    user: dict = Depends(require_student),
):
    """Update 10th/12th percentages."""
    doc = await update_basic_info(
        user_id=user["user_id"],
        tenth_percentage=payload.get("tenth_percentage"),
        twelfth_percentage=payload.get("twelfth_percentage"),
    )
    return {"message": "Basic info updated", "academics": doc}


@router.get("/academics/skills", response_model=dict)
async def get_my_skills(
    user: dict = Depends(require_student),
):
    """Get the student's full skill profile (courses + resume), split by source."""
    doc = await get_academics(user["user_id"])
    if not doc:
        return {"total_skills": 0, "course_skills": {}, "resume_skills": []}

    course_skills = doc.get("skill_profile", {})
    resume_skills = doc.get("resume_skills", [])

    return {
        "total_skills": len(course_skills) + len(resume_skills),
        "course_skills": course_skills,
        "resume_skills": resume_skills,
    }


# ──────────────────────────────────────────────────────────────────
# Drive Browsing
# ──────────────────────────────────────────────────────────────────

@router.get("/drives", response_model=dict)
async def list_drives(
    tab: str = Query("upcoming", regex="^(upcoming|expired|not_eligible|all)$"),
    user: dict = Depends(require_student),
):
    """
    List drives visible to the student, filtered by tab:
      - **upcoming**: active drives where student IS eligible
      - **expired**: past drives
      - **not_eligible**: active drives where student is NOT eligible
      - **all**: everything
    """
    db = get_database()
    now = datetime.utcnow()

    # Load student academics for eligibility checks
    academics = await get_academics(user["user_id"])

    # Fetch all drive IDs this student has applied to (single query)
    applied_cursor = db.applications.find(
        {"user_id": user["user_id"]},
        {"drive_id": 1},
    )
    applied_drive_ids = {a["drive_id"] async for a in applied_cursor}

    # Load all drives
    cursor = db.company_drives.find().sort("drive_date", -1)
    all_drives = await cursor.to_list(length=200)

    upcoming = []
    expired = []
    not_eligible = []

    for d in all_drives:
        drive_id_str = str(d["_id"])
        drive_data = {
            "id": drive_id_str,
            "company_name": d.get("company_name"),
            "role_title": d.get("role_title"),
            "drive_date": d.get("drive_date"),
            "application_deadline": d.get("application_deadline"),
            "package": d.get("package"),
            "criteria": d.get("criteria"),
            "status": d.get("status"),
            "location": d.get("location"),
            "description": d.get("description"),
            "has_applied": drive_id_str in applied_drive_ids,
        }

        # Check if drive is expired
        deadline = d.get("application_deadline")
        is_expired = False
        if deadline:
            if isinstance(deadline, str):
                try:
                    deadline = datetime.fromisoformat(deadline)
                except ValueError:
                    pass
            if isinstance(deadline, datetime) and deadline < now:
                is_expired = True

        if d.get("status") == "expired" or is_expired:
            drive_data["tab"] = "expired"
            expired.append(drive_data)
            continue

        # Check eligibility
        if academics:
            eligible, reasons = check_eligibility(
                academics, d.get("criteria", {})
            )
            drive_data["eligible"] = eligible
            drive_data["eligibility_reasons"] = reasons

            if not eligible:
                drive_data["tab"] = "not_eligible"
                not_eligible.append(drive_data)
            else:
                drive_data["tab"] = "upcoming"
                upcoming.append(drive_data)
        else:
            # No academics uploaded — show as upcoming (eligibility unknown)
            drive_data["eligible"] = None
            drive_data["eligibility_reasons"] = ["Academic profile not uploaded"]
            drive_data["tab"] = "upcoming"
            upcoming.append(drive_data)

    if tab == "upcoming":
        return {"tab": "upcoming", "count": len(upcoming), "drives": upcoming}
    elif tab == "expired":
        return {"tab": "expired", "count": len(expired), "drives": expired}
    elif tab == "not_eligible":
        return {"tab": "not_eligible", "count": len(not_eligible), "drives": not_eligible}
    else:
        all_list = upcoming + expired + not_eligible
        return {"tab": "all", "count": len(all_list), "drives": all_list}


@router.get("/drives/{drive_id}", response_model=dict)
async def get_drive_detail(
    drive_id: str,
    user: dict = Depends(require_student),
):
    """Get drive details with the student's match score."""
    db = get_database()

    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    drive_data = {
        "id": str(drive.pop("_id")),
        "company_name": drive.get("company_name"),
        "role_title": drive.get("role_title"),
        "drive_date": drive.get("drive_date"),
        "application_deadline": drive.get("application_deadline"),
        "package": drive.get("package"),
        "criteria": drive.get("criteria"),
        "description": drive.get("description"),
        "location": drive.get("location"),
        "jd_structured": drive.get("jd_structured"),
    }

    # Compute match score if student has academics and drive has JD
    academics = await get_academics(user["user_id"])
    if academics and drive.get("jd_structured"):
        skill_profile = await get_student_full_skill_profile(user["user_id"])
        score = score_student_for_drive(
            student_academics=academics,
            student_skill_profile=skill_profile,
            jd_structured=drive.get("jd_structured", {}),
            drive_criteria=drive.get("criteria", {}),
        )
        drive_data["match"] = score
    else:
        drive_data["match"] = None

    # Check if student already applied
    app = await db.applications.find_one({
        "drive_id": drive_id,
        "user_id": user["user_id"],
    })
    drive_data["already_applied"] = app is not None
    if app:
        drive_data["application_status"] = app.get("status")

    return drive_data


# ──────────────────────────────────────────────────────────────────
# Applications
# ──────────────────────────────────────────────────────────────────

@router.post("/drives/{drive_id}/apply", response_model=dict, status_code=status.HTTP_201_CREATED)
async def apply_to_drive(
    drive_id: str,
    user: dict = Depends(require_student),
):
    """Apply to a company drive."""
    db = get_database()

    # Verify drive exists
    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    # Check deadline
    deadline = drive.get("application_deadline")
    if deadline:
        if isinstance(deadline, str):
            try:
                deadline = datetime.fromisoformat(deadline)
            except ValueError:
                pass
        if isinstance(deadline, datetime) and deadline < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Application deadline has passed")

    # Check if already applied
    existing = await db.applications.find_one({
        "drive_id": drive_id,
        "user_id": user["user_id"],
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this drive")

    # Check eligibility
    academics = await get_academics(user["user_id"])
    if academics:
        eligible, reasons = check_eligibility(academics, drive.get("criteria", {}))
        if not eligible:
            raise HTTPException(
                status_code=400,
                detail=f"Not eligible: {'; '.join(reasons)}",
            )

    # Compute match score
    match_score = None
    if academics and drive.get("jd_structured"):
        skill_profile = await get_student_full_skill_profile(user["user_id"])
        score = score_student_for_drive(
            student_academics=academics,
            student_skill_profile=skill_profile,
            jd_structured=drive.get("jd_structured", {}),
            drive_criteria=drive.get("criteria", {}),
        )
        match_score = score.get("total_score")

    # Create application
    app_doc = {
        "drive_id": drive_id,
        "user_id": user["user_id"],
        "status": "applied",
        "match_score": match_score,
        "applied_at": datetime.utcnow(),
    }
    result = await db.applications.insert_one(app_doc)

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id),
        "match_score": match_score,
    }


@router.get("/applications", response_model=List[dict])
async def get_my_applications(
    user: dict = Depends(require_student),
):
    """Get all of the current student's applications."""
    db = get_database()

    cursor = db.applications.find(
        {"user_id": user["user_id"]}
    ).sort("applied_at", -1)
    apps = await cursor.to_list(length=100)

    results = []
    for a in apps:
        # Get drive info
        drive = await db.company_drives.find_one({"_id": ObjectId(a["drive_id"])})
        results.append({
            "id": str(a["_id"]),
            "drive_id": a["drive_id"],
            "company_name": drive.get("company_name") if drive else "Unknown",
            "role_title": drive.get("role_title") if drive else "Unknown",
            "status": a.get("status"),
            "match_score": a.get("match_score"),
            "applied_at": a.get("applied_at"),
        })

    return results


@router.delete("/applications/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_application(
    app_id: str,
    user: dict = Depends(require_student),
):
    """Withdraw an application."""
    db = get_database()

    app = await db.applications.find_one({
        "_id": ObjectId(app_id),
        "user_id": user["user_id"],
    })
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.get("status") not in ("applied", "shortlisted"):
        raise HTTPException(
            status_code=400,
            detail="Cannot withdraw — application is already in a later stage",
        )

    await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": "withdrawn", "updated_at": datetime.utcnow()}},
    )
