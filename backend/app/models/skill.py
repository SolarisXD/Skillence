from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime


class SkillCourse(BaseModel):
    name: str
    platform: str
    url: str
    rating: Optional[str] = None
    duration: Optional[str] = None


class SkillPractice(BaseModel):
    name: str
    url: str
    difficulty: Optional[str] = None  # "beginner", "intermediate", "advanced"


class SkillVideo(BaseModel):
    title: str
    url: str
    channel: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[str] = None
    view_count: Optional[str] = None
    published_at: Optional[str] = None


class SkillLink(BaseModel):
    title: str
    url: str


class RoadmapStep(BaseModel):
    title: str
    items: List[str] = []
    estimated_time: Optional[str] = None
    projects: List[str] = []


class SkillModel(BaseModel):
    id: str
    name: str
    category: str
    description: str
    overview: str
    image_url: Optional[str] = None
    roadmap: List[str]
    roadmap_url: Optional[str] = None
    youtube_videos: List[SkillVideo] = []
    articles: List[SkillLink] = []
    courses: List[SkillCourse] = []
    practice: List[SkillPractice] = []
    # Enhanced fields
    prerequisites: Optional[List[str]] = None
    career_roles: Optional[List[str]] = None
    difficulty: Optional[str] = None  # "beginner", "intermediate", "advanced"
    estimated_time: Optional[str] = None
    use_cases: Optional[List[str]] = None


class UserActivityUpdate(BaseModel):
    skill_id: str
    progress: Optional[str] = None
    is_saved: Optional[bool] = None
    status: Optional[str] = None  # "interested", "learning", "completed"
    progress_percentage: Optional[int] = None
    completed_steps: Optional[List[str]] = None  # roadmap step titles the user has checked off


class SavedSkillEntry(BaseModel):
    skill_id: str
    status: str = "interested"  # "interested", "learning", "completed"
    progress_percentage: int = 0
    bookmarked_at: str = ""
    completed_steps: List[str] = []


class UserActivityResponse(BaseModel):
    user_id: str
    saved_skills: List[str]
    progress: Dict[str, str]
    saved_details: Optional[Dict[str, SavedSkillEntry]] = None
