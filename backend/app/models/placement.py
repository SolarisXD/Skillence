"""Pydantic models for the Placement Cell feature.

Defines models for company drives, applications, student academics,
course catalog entries, and all supporting sub-models.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class DriveStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    COMPLETED = "completed"


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    NOT_SHORTLISTED = "not_shortlisted"
    SELECTED = "selected"
    REJECTED = "rejected"


class UserRole(str, Enum):
    STUDENT = "student"
    PLACEMENT_CELL = "placement_cell"


# ─── Grade Mapping ────────────────────────────────────────────────────────────

GRADE_TO_POINTS: Dict[str, Optional[float]] = {
    "S": 10.0,
    "A": 9.0,
    "B": 8.0,
    "C": 7.0,
    "D": 6.0,
    "E": 5.0,
    "F": 0.0,
    "N": 0.0,
    "P": None,   # Pass/Fail — excluded from skill scoring
}


# ─── Sub-models ───────────────────────────────────────────────────────────────

class SkillWeight(BaseModel):
    """A skill with an importance weight (0.0–1.0)."""
    skill: str
    weight: float = Field(ge=0.0, le=1.0, default=0.5)


class JDStructured(BaseModel):
    """Structured representation of a Job Description."""
    role_title: str = ""
    required_skills: List[SkillWeight] = []
    preferred_skills: List[SkillWeight] = []
    description_summary: Optional[str] = None


class DriveCriteria(BaseModel):
    """Eligibility criteria for a company drive."""
    min_tenth_percentage: Optional[float] = None
    min_twelfth_percentage: Optional[float] = None
    min_ug_cgpa: Optional[float] = None
    max_shortlist_count: int = Field(default=200, ge=1)


class PackageInfo(BaseModel):
    """Compensation and location details."""
    ctc: Optional[str] = None
    base_salary: Optional[str] = None
    location: Optional[str] = None
    role_type: Optional[str] = None  # "Full-time", "Internship", etc.


class GradeEntry(BaseModel):
    """One row from a student's grade history."""
    course_code: str
    course_name: str
    course_type: Optional[str] = None       # LT, LTP, LP, PJ, OC, P
    credits: float = 0.0
    grade: str
    grade_points: Optional[float] = None    # S=10, A=9, …
    exam_month: Optional[str] = None
    course_distribution: Optional[str] = None  # PC, PE, C, ME, NMC, …


class SkillBreakdownEntry(BaseModel):
    """Detailed score breakdown for one skill in a match."""
    student_competency: float = 0.0
    weight: float = 0.0
    weighted_score: float = 0.0


# ─── Company Drive ────────────────────────────────────────────────────────────

class CompanyDriveBase(BaseModel):
    """Fields shared by create/update/read operations."""
    company_name: str
    role_title: str = ""
    company_logo_url: Optional[str] = None
    criteria: DriveCriteria = DriveCriteria()
    application_deadline: Optional[str] = None   # "YYYY-MM-DD"
    drive_date: Optional[str] = None              # "YYYY-MM-DD"
    package: Optional[PackageInfo] = None


class CompanyDriveCreate(CompanyDriveBase):
    """Payload for creating a new company drive."""
    pass


class CompanyDriveUpdate(BaseModel):
    """Payload for updating an existing drive (all fields optional)."""
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    company_logo_url: Optional[str] = None
    criteria: Optional[DriveCriteria] = None
    application_deadline: Optional[str] = None
    drive_date: Optional[str] = None
    package: Optional[PackageInfo] = None
    status: Optional[DriveStatus] = None


class CompanyDriveInDB(CompanyDriveBase):
    """Full drive document as stored in MongoDB."""
    id: Optional[str] = None
    created_by: str = ""
    jd_raw_text: Optional[str] = None
    jd_structured: Optional[JDStructured] = None
    status: DriveStatus = DriveStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CompanyDriveResponse(CompanyDriveBase):
    """Drive data returned to clients."""
    id: str
    created_by: str
    jd_structured: Optional[JDStructured] = None
    status: DriveStatus
    created_at: datetime
    updated_at: datetime


# ─── Applications ─────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    """Student applies to a drive."""
    drive_id: str


class ApplicationInDB(BaseModel):
    """Application document in MongoDB."""
    id: Optional[str] = None
    drive_id: str
    student_id: str
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    match_score: Optional[float] = None
    skill_breakdown: Optional[Dict[str, SkillBreakdownEntry]] = None
    is_shortlisted: bool = False
    status: ApplicationStatus = ApplicationStatus.APPLIED


class ApplicationResponse(BaseModel):
    """Application data returned to clients."""
    id: str
    drive_id: str
    student_id: str
    applied_at: datetime
    match_score: Optional[float] = None
    skill_breakdown: Optional[Dict[str, Any]] = None
    is_shortlisted: bool = False
    status: ApplicationStatus

    # Optionally populated when returning to placement cell
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_cgpa: Optional[float] = None


# ─── Student Academics ────────────────────────────────────────────────────────

class StudentAcademicsCreate(BaseModel):
    """Manual entry of academic info."""
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    ug_cgpa: Optional[float] = None


class StudentAcademicsInDB(BaseModel):
    """Student academics document in MongoDB."""
    id: Optional[str] = None
    user_id: str
    register_number: Optional[str] = None
    student_name: Optional[str] = None
    program: Optional[str] = None
    school: Optional[str] = None
    grade_history: List[GradeEntry] = []
    skill_competency_map: Dict[str, float] = {}
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    ug_cgpa: Optional[float] = None
    uploaded_at: Optional[datetime] = None
    grade_history_hash: Optional[str] = None


class StudentAcademicsResponse(BaseModel):
    """Academic data returned to clients."""
    user_id: str
    register_number: Optional[str] = None
    student_name: Optional[str] = None
    program: Optional[str] = None
    grade_history: List[GradeEntry] = []
    skill_competency_map: Dict[str, float] = {}
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    ug_cgpa: Optional[float] = None


# ─── Course Catalog ───────────────────────────────────────────────────────────

class CourseCatalogEntry(BaseModel):
    """One course in the catalog."""
    id: Optional[str] = None
    course_code: str
    course_name: str
    credits: float = 0.0
    category: str = ""           # "Programme Core", "Programme Elective", etc.
    department: Optional[str] = None
    skills: List[str] = []       # Mapped canonical skills
    detailed_topics: Optional[List[str]] = None
    source: str = "curriculum_pdf"  # or "course_pdf"


class CourseCatalogUploadResponse(BaseModel):
    """Response after uploading a curriculum PDF."""
    total_courses: int = 0
    categories: Dict[str, int] = {}
    courses: List[CourseCatalogEntry] = []


# ─── Matching / Shortlisting ─────────────────────────────────────────────────

class MatchResult(BaseModel):
    """Result of scoring one student against one drive."""
    student_id: str
    eligible: bool = True
    ineligibility_reason: Optional[str] = None
    total_score: float = 0.0
    required_skills_score: float = 0.0
    preferred_skills_score: float = 0.0
    resume_bonus: float = 0.0
    cgpa_bonus: float = 0.0
    skill_breakdown: Dict[str, SkillBreakdownEntry] = {}


class ShortlistRequest(BaseModel):
    """Request to trigger shortlisting for a drive."""
    top_n: Optional[int] = None  # Return only top N students
    eligible_only: bool = True   # Exclude ineligible students


class ShortlistResponse(BaseModel):
    """Result of a shortlisting operation."""
    drive_id: str
    total_applicants: int = 0
    eligible_applicants: int = 0
    shortlisted_count: int = 0
    shortlisted: List[ApplicationResponse] = []


# ─── Drive list for students (with eligibility info) ─────────────────────────

class StudentDriveView(CompanyDriveResponse):
    """Drive as seen by a student — includes their eligibility status."""
    is_eligible: bool = True
    ineligibility_reasons: List[str] = []
    has_applied: bool = False
    application_status: Optional[ApplicationStatus] = None
    match_score: Optional[float] = None
