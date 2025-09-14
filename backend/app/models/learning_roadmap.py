from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    """Status of individual tasks or milestones"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class PhaseStatus(str, Enum):
    """Status of learning phases"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskProgress(BaseModel):
    """Individual task or milestone progress"""
    task_id: str = Field(..., description="Unique identifier for the task")
    task_name: str = Field(..., description="Name of the task")
    task_type: str = Field(..., description="Type: 'skill', 'milestone', 'resource'")
    status: TaskStatus = Field(default=TaskStatus.NOT_STARTED)
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

class PhaseProgress(BaseModel):
    """Progress tracking for a learning phase"""
    phase_number: int = Field(..., description="Phase number (1, 2, 3)")
    phase_title: str = Field(..., description="Title of the phase")
    status: PhaseStatus = Field(default=PhaseStatus.NOT_STARTED)
    start_date: Optional[datetime] = None
    target_deadline: datetime = Field(..., description="Target completion date")
    actual_completion_date: Optional[datetime] = None
    tasks: List[TaskProgress] = Field(default_factory=list)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)

class LearningRoadmapProgress(BaseModel):
    """Complete learning roadmap progress tracking"""
    user_id: str = Field(..., description="User identifier")
    career_path_id: str = Field(..., description="Associated career path")
    career_title: str = Field(..., description="Career title")
    occupation_code: str = Field(..., description="O*NET occupation code")
    
    # Roadmap structure (from Gemini generation)
    learning_plan_data: Dict[str, Any] = Field(..., description="Original learning plan from Gemini")
    
    # Progress tracking
    phases: List[PhaseProgress] = Field(default_factory=list)
    overall_progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Timeline management
    roadmap_start_date: datetime = Field(default_factory=datetime.utcnow)
    estimated_completion_date: datetime = Field(..., description="Estimated completion date")
    original_estimated_duration: str = Field(..., description="Original duration estimate (e.g., '12 months')")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

# Request/Response models for API endpoints

class TaskCompletionUpdate(BaseModel):
    """Request model for updating task completion"""
    task_id: str
    status: TaskStatus
    notes: Optional[str] = None

class PhaseDeadlineUpdate(BaseModel):
    """Request model for updating phase deadlines"""
    phase_number: int
    new_deadline: datetime
    adjustment_reason: Optional[str] = None

class RoadmapProgressResponse(BaseModel):
    """Response model for roadmap progress"""
    success: bool
    message: str
    roadmap_progress: Optional[LearningRoadmapProgress] = None
    
class RoadmapCreationRequest(BaseModel):
    """Request model for creating a new roadmap"""
    career_path_id: str
    learning_plan_data: Dict[str, Any]
    estimated_duration_months: int = 12

class ProgressSummary(BaseModel):
    """Summary of progress for quick display"""
    overall_progress: float
    completed_phases: int
    total_phases: int
    completed_tasks: int
    total_tasks: int
    days_remaining: int
    on_track: bool