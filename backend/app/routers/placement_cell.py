"""
Placement Cell Router
=====================
API endpoints for the Placement Cell role:
  - CRUD for company drives
  - JD upload and parsing
  - Curriculum upload and course catalog setup
  - Student shortlisting and ranking
  - Application management

All endpoints require ``placement_cell`` role.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.database import get_database
from app.utils.role_auth import require_placement_cell
from app.models.placement import (
    CompanyDriveCreate,
    CompanyDriveResponse,
    ShortlistRequest,
    ShortlistResponse,
)
from app.services.jd_parser import parse_jd, extract_text_from_jd_pdf
from app.services.course_catalog_service import (
    get_course_catalog,
    add_single_course,
    update_course,
    delete_course,
    get_single_course,
)
from app.services.matching_engine import shortlist_students_for_drive

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/placement", tags=["Placement Cell"])


# ──────────────────────────────────────────────────────────────────
# Company Drive CRUD
# ──────────────────────────────────────────────────────────────────

@router.post("/drives", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_drive(
    drive: CompanyDriveCreate,
    user: dict = Depends(require_placement_cell),
):
    """Create a new company drive."""
    db = get_database()
    now = datetime.utcnow()

    drive_doc = {
        **drive.model_dump(),
        "created_by": user["user_id"],
        "jd_structured": None,  # populated when JD is uploaded
        "status": "upcoming",
        "created_at": now,
        "updated_at": now,
    }

    result = await db.company_drives.insert_one(drive_doc)

    return {
        "id": str(result.inserted_id),
        "message": "Drive created successfully",
        "company_name": drive.company_name,
    }


@router.get("/drives", response_model=List[dict])
async def list_drives(
    status_filter: Optional[str] = Query(None, alias="status"),
    user: dict = Depends(require_placement_cell),
):
    """List all drives (optionally filtered by status)."""
    db = get_database()
    query = {"created_by": user["user_id"]}
    if status_filter:
        query["status"] = status_filter

    cursor = db.company_drives.find(query).sort("created_at", -1)
    drives = await cursor.to_list(length=100)

    return [
        {
            "id": str(d["_id"]),
            "company_name": d.get("company_name"),
            "role_title": d.get("role_title"),
            "status": d.get("status"),
            "drive_date": d.get("drive_date"),
            "application_deadline": d.get("application_deadline"),
            "criteria": d.get("criteria"),
            "package": d.get("package"),
            "jd_structured": d.get("jd_structured"),
            "jd_raw_text": d.get("jd_raw_text"),
            "has_jd": d.get("jd_structured") is not None,
            "created_at": d.get("created_at"),
        }
        for d in drives
    ]


@router.get("/drives/{drive_id}", response_model=dict)
async def get_drive(
    drive_id: str,
    user: dict = Depends(require_placement_cell),
):
    """Get full drive details."""
    db = get_database()
    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    drive["id"] = str(drive.pop("_id"))
    return drive


@router.put("/drives/{drive_id}", response_model=dict)
async def update_drive(
    drive_id: str,
    updates: dict,
    user: dict = Depends(require_placement_cell),
):
    """Update drive fields (status, criteria, dates, etc.)."""
    db = get_database()
    updates["updated_at"] = datetime.utcnow()

    # Prevent overwriting critical fields
    updates.pop("_id", None)
    updates.pop("created_by", None)
    updates.pop("jd_structured", None)

    result = await db.company_drives.update_one(
        {"_id": ObjectId(drive_id)},
        {"$set": updates},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Drive not found")

    return {"message": "Drive updated", "drive_id": drive_id}


@router.delete("/drives/{drive_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_drive(
    drive_id: str,
    user: dict = Depends(require_placement_cell),
):
    """Delete a drive."""
    db = get_database()
    result = await db.company_drives.delete_one({"_id": ObjectId(drive_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Drive not found")


# ──────────────────────────────────────────────────────────────────
# JD Upload & Parsing
# ──────────────────────────────────────────────────────────────────

@router.post("/drives/{drive_id}/jd", response_model=dict)
async def upload_jd(
    drive_id: str,
    file: UploadFile = File(None),
    jd_text: Optional[str] = Form(None),
    use_llm: bool = Form(True),
    user: dict = Depends(require_placement_cell),
):
    """
    Upload and parse a Job Description for a drive.

    Accepts either a PDF file or plain text.  Uses Gemini LLM for
    extraction (one API call), with keyword fallback.
    """
    db = get_database()

    # Verify drive exists
    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    # Extract text from file or use provided text
    pdf_bytes = None
    if file:
        pdf_bytes = await file.read()
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if not pdf_bytes and not jd_text:
        raise HTTPException(status_code=400, detail="Provide either a JD PDF or text")

    # Extract raw text from PDF if uploaded
    raw_text = jd_text
    if pdf_bytes and not raw_text:
        try:
            raw_text = await extract_text_from_jd_pdf(pdf_bytes)
        except Exception:
            raw_text = "(PDF text extraction failed)"

    # Parse JD
    jd_structured = await parse_jd(
        jd_text=jd_text,
        jd_pdf_bytes=pdf_bytes,
        use_llm=use_llm,
    )

    # Save to drive
    await db.company_drives.update_one(
        {"_id": ObjectId(drive_id)},
        {
            "$set": {
                "jd_structured": jd_structured,
                "jd_raw_text": raw_text or "",
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return {
        "message": "JD parsed and saved",
        "drive_id": drive_id,
        "job_title": jd_structured.get("job_title"),
        "required_skills_count": len(jd_structured.get("required_skills", [])),
        "preferred_skills_count": len(jd_structured.get("preferred_skills", [])),
        "domain": jd_structured.get("domain"),
        "jd_structured": jd_structured,
    }


# ──────────────────────────────────────────────────────────────────
# Curriculum & Course Catalog
# ──────────────────────────────────────────────────────────────────

@router.get("/curriculum/courses", response_model=List[dict])
async def list_courses(
    user: dict = Depends(require_placement_cell),
):
    """Get the full course catalog."""
    catalog = await get_course_catalog()
    return catalog


@router.post("/curriculum/courses", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_course(
    course_data: dict,
    user: dict = Depends(require_placement_cell),
):
    """
    Add a single course to the catalog manually.

    Body: { course_code, course_name, credits, category, mapped_skills }
    """
    if not course_data.get("course_name"):
        raise HTTPException(status_code=400, detail="course_name is required")

    course_id = await add_single_course(course_data)
    return {"id": course_id, "message": "Course added successfully"}


@router.put("/curriculum/courses/{course_id}", response_model=dict)
async def edit_course(
    course_id: str,
    updates: dict,
    user: dict = Depends(require_placement_cell),
):
    """
    Update a course entry (name, skills, credits, category).
    """
    updates.pop("_id", None)
    updates.pop("id", None)
    updates.pop("created_at", None)

    found = await update_course(course_id, updates)
    if not found:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course updated", "course_id": course_id}


@router.delete("/curriculum/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_course(
    course_id: str,
    user: dict = Depends(require_placement_cell),
):
    """Delete a course from the catalog."""
    deleted = await delete_course(course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Course not found")


# ──────────────────────────────────────────────────────────────────
# Student Shortlisting
# ──────────────────────────────────────────────────────────────────

@router.post("/drives/{drive_id}/shortlist", response_model=dict)
async def shortlist_students(
    drive_id: str,
    request: ShortlistRequest,
    user: dict = Depends(require_placement_cell),
):
    """
    Rank all eligible students for a drive and return the shortlist.

    This is a pure algorithmic operation — zero LLM calls.
    """
    db = get_database()

    # Verify drive exists and has a parsed JD
    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    if not drive.get("jd_structured"):
        raise HTTPException(
            status_code=400,
            detail="Drive has no parsed JD. Upload a JD first.",
        )

    ranked_students = await shortlist_students_for_drive(
        drive_id=drive_id,
        top_n=None,
        eligible_only=request.eligible_only,
    )

    configured_top_n = drive.get("max_shortlist_count")
    requested_top_n = request.top_n if isinstance(request.top_n, int) and request.top_n > 0 else None
    effective_top_n = requested_top_n or configured_top_n or len(ranked_students)
    effective_top_n = max(0, min(int(effective_top_n), len(ranked_students)))

    students_with_flags = []
    for index, student in enumerate(ranked_students):
        students_with_flags.append({
            **student,
            "is_shortlisted": index < effective_top_n,
        })

    shortlisted_count = sum(1 for student in students_with_flags if student.get("is_shortlisted"))

    now = datetime.utcnow()
    saved_shortlist = {
        "students": students_with_flags,
        "total_ranked": len(students_with_flags),
        "shortlisted_count": shortlisted_count,
        "top_n": effective_top_n,
        "eligible_only": request.eligible_only,
        "saved_at": now,
    }

    await db.company_drives.update_one(
        {"_id": ObjectId(drive_id)},
        {
            "$set": {
                "saved_shortlist": saved_shortlist,
                "updated_at": now,
            }
        },
    )

    return {
        "drive_id": drive_id,
        "company_name": drive.get("company_name"),
        "total_ranked": len(students_with_flags),
        "shortlisted_count": shortlisted_count,
        "top_n": effective_top_n,
        "students": students_with_flags,
        "saved_at": now,
    }


@router.get("/drives/{drive_id}/shortlist", response_model=dict)
async def get_saved_shortlist(
    drive_id: str,
    user: dict = Depends(require_placement_cell),
):
    """Return previously saved shortlist for a drive, if available."""
    db = get_database()
    drive = await db.company_drives.find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    saved = drive.get("saved_shortlist")
    if not saved:
        return {
            "drive_id": drive_id,
            "company_name": drive.get("company_name"),
            "exists": False,
            "total_ranked": 0,
            "students": [],
            "saved_at": None,
        }

    students = saved.get("students", [])
    saved_top_n = saved.get("top_n")

    shortlisted_count = saved.get("shortlisted_count")
    if not isinstance(shortlisted_count, int):
        has_explicit_flags = any("is_shortlisted" in row for row in students)
        if has_explicit_flags:
            shortlisted_count = sum(1 for row in students if row.get("is_shortlisted"))
        elif isinstance(saved_top_n, int):
            shortlisted_count = min(saved_top_n, len(students))
        else:
            shortlisted_count = len(students)

    return {
        "drive_id": drive_id,
        "company_name": drive.get("company_name"),
        "exists": True,
        "total_ranked": saved.get("total_ranked", len(students)),
        "shortlisted_count": shortlisted_count,
        "students": students,
        "saved_at": saved.get("saved_at"),
        "top_n": saved_top_n,
        "eligible_only": saved.get("eligible_only", True),
    }


# ──────────────────────────────────────────────────────────────────
# Application Management
# ──────────────────────────────────────────────────────────────────

@router.get("/drives/{drive_id}/applications", response_model=List[dict])
async def get_applications(
    drive_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    user: dict = Depends(require_placement_cell),
):
    """Get all applications for a drive."""
    db = get_database()
    query = {"drive_id": drive_id}
    if status_filter:
        query["status"] = status_filter

    cursor = db.applications.find(query).sort("applied_at", -1)
    apps = await cursor.to_list(length=500)

    # Collect user_ids to look up student names + registration numbers
    user_ids = list({a["user_id"] for a in apps if a.get("user_id")})
    student_map = {}
    if user_ids:
        stu_cursor = db.student_academics.find(
            {"user_id": {"$in": user_ids}},
            {"user_id": 1, "student_info": 1},
        )
        async for stu in stu_cursor:
            info = stu.get("student_info", {})
            student_map[stu["user_id"]] = {
                "name": info.get("name", "Unknown"),
                "register_number": info.get("register_number"),
            }

    result = []
    for a in apps:
        uid = a.get("user_id", "")
        stu_info = student_map.get(uid, {})
        result.append({
            "id": str(a["_id"]),
            "user_id": uid,
            "student_name": stu_info.get("name", uid),
            "register_number": stu_info.get("register_number"),
            "status": a.get("status"),
            "match_score": a.get("match_score"),
            "applied_at": a.get("applied_at"),
        })

    return result


@router.get("/applicants/{user_id}/profile", response_model=dict)
async def get_applicant_profile(
    user_id: str,
    user: dict = Depends(require_placement_cell),
):
    """Get combined profile + academics data for a student applicant."""
    db = get_database()

    profile_doc = await db.profiles.find_one(
        {"user_id": user_id},
        {"_id": 0, "user_id": 1, "profile_data": 1, "updated_at": 1},
    )
    academics_doc = await db.student_academics.find_one(
        {"user_id": user_id},
        {
            "_id": 0,
            "user_id": 1,
            "student_info": 1,
            "tenth_percentage": 1,
            "twelfth_percentage": 1,
            "cgpa": 1,
            "active_backlogs": 1,
            "all_courses": 1,
            "semesters": 1,
            "skill_profile": 1,
            "resume_skills": 1,
            "updated_at": 1,
        },
    )

    if not profile_doc and not academics_doc:
        raise HTTPException(status_code=404, detail="Applicant profile not found")

    profile_data = (profile_doc or {}).get("profile_data", {})
    contact_info = profile_data.get("contact_info") or profile_data.get("personalInfo") or {}
    academics_raw = academics_doc or {}

    return {
        "user_id": user_id,
        "profile_data": profile_data,
        "contact_info": contact_info,
        "profile_updated_at": (profile_doc or {}).get("updated_at"),
        "academics": {
            "student_info": academics_raw.get("student_info", {}),
            "tenth_percentage": academics_raw.get("tenth_percentage"),
            "twelfth_percentage": academics_raw.get("twelfth_percentage"),
            "cgpa": academics_raw.get("cgpa"),
            "active_backlogs": academics_raw.get("active_backlogs"),
            "all_courses": academics_raw.get("all_courses", []),
            "semesters": academics_raw.get("semesters", []),
            "skill_profile": academics_raw.get("skill_profile", {}),
            "resume_skills": academics_raw.get("resume_skills", []),
            "updated_at": academics_raw.get("updated_at"),
            "academic_scores": {
                "tenth_percentage": academics_raw.get("tenth_percentage"),
                "twelfth_percentage": academics_raw.get("twelfth_percentage"),
                "cgpa": academics_raw.get("cgpa"),
                "active_backlogs": academics_raw.get("active_backlogs"),
            },
        },
    }


@router.put("/applications/{app_id}/status", response_model=dict)
async def update_application_status(
    app_id: str,
    payload: dict = Body(...),
    user: dict = Depends(require_placement_cell),
):
    """Update an application's status (shortlisted, rejected, selected, etc.)."""
    db = get_database()
    new_status = payload.get("status", "")
    valid_statuses = {"applied", "shortlisted", "interview", "selected", "rejected", "withdrawn"}
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    result = await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": f"Application status updated to '{new_status}'", "app_id": app_id}
