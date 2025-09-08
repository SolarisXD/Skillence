from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None

class EducationEntry(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class WorkExperience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    responsibilities: List[str] = []
    achievements: List[str] = []

class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None
    github_url: Optional[str] = None
    role: Optional[str] = None

class Certification(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date_obtained: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None

class Course(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    completion_date: Optional[str] = None
    duration: Optional[str] = None
    certificate_url: Optional[str] = None
    description: Optional[str] = None

class Achievement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    issuer: Optional[str] = None

class SkillCategory(BaseModel):
    category: str
    skills: List[str] = []

class ResumeData(BaseModel):
    contact_info: ContactInfo = ContactInfo()
    # REMOVED: career_summary: Optional[str] = None
    education: List[EducationEntry] = []
    work_experience: List[WorkExperience] = []
    projects: List[Project] = []
    skills: List[SkillCategory] = []
    certifications: List[Certification] = []
    courses: List[Course] = []
    achievements: List[Achievement] = []
    languages: List[str] = []
    custom_sections: Dict[str, Any] = {}
    
    # Parsing metadata
    parsing_confidence: Optional[float] = None
    parsed_at: Optional[datetime] = None
    manual_edits: bool = False

class Resume(BaseModel):
    user_id: str
    resume_data: ResumeData
    file_hash: Optional[str] = None
    original_filename: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResumeResponse(BaseModel):
    success: bool
    message: str
    data: Optional[ResumeData] = None
    parsing_confidence: Optional[float] = None