from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class SkillCourse(BaseModel):
    name: str
    platform: str
    url: str

class SkillPractice(BaseModel):
    name: str
    url: str

class SkillVideo(BaseModel):
    title: str
    url: str

class SkillLink(BaseModel):
    title: str
    url: str

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
    courses: List[SkillCourse]
    practice: List[SkillPractice]

class UserActivityUpdate(BaseModel):
    skill_id: str
    progress: Optional[str] = None  # e.g. "foundation", "intermediate", "advanced", or None to just save
    is_saved: Optional[bool] = None

class UserActivityResponse(BaseModel):
    user_id: str
    saved_skills: List[str]
    progress: Dict[str, str]
