from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from app.services.resume_service import ResumeService
from app.models.resume import ResumeResponse, ResumeData
from app.utils.security import verify_token
import logging

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

def get_resume_service():
    """Get resume service instance."""
    return ResumeService()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract user ID from JWT token.
    """
    try:
        token = credentials.credentials
        user_id = verify_token(token)
        return user_id
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.get("/test")
async def test_resume_endpoint():
    """Test endpoint to verify resume router is working."""
    return {"message": "Resume router is working", "status": "success"}

@router.post("/test-upload")
async def test_upload_resume(
    file: UploadFile = File(...),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Test upload endpoint without authentication for debugging.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF and DOCX files are supported"
            )
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="File size exceeds 10MB limit"
            )
        
        # Parse and save resume with test user ID
        result = await resume_service.parse_and_save_resume(
            file=file,
            user_id="test_user_123"
        )
        
        return ResumeResponse(
            success=True,
            message="Resume uploaded and parsed successfully",
            data=result.get("data"),
            parsing_confidence=result.get("parsing_confidence")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Test resume upload failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process resume: {str(e)}"
        )

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Upload and parse a resume file.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF and DOCX files are supported"
            )
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="File size exceeds 10MB limit"
            )
        
        # Parse and save resume
        result = await resume_service.parse_and_save_resume(
            file=file,
            user_id=user_id
        )
        
        return ResumeResponse(
            success=True,
            message="Resume uploaded and parsed successfully",
            data=result.get("data"),
            parsing_confidence=result.get("parsing_confidence")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to process resume"
        )

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Parse a resume file and return structured data.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF and DOCX files are supported"
            )
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="File size exceeds 10MB limit"
            )
        
        # Parse and save resume
        result = await resume_service.parse_and_save_resume(
            file=file,
            user_id=user_id
        )
        
        return {
            "success": True,
            "message": "Resume parsed successfully",
            "profile_data": result.get("data"),
            "parsing_confidence": result.get("parsing_confidence")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to process resume"
        )

@router.get("/{user_id}")
async def get_resume(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Retrieve resume data for authenticated user.
    """
    try:
        # Ensure user can only access their own resume
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        resume_data = await resume_service.get_resume_by_user_id(user_id)
        
        if resume_data:
            return ResumeResponse(
                success=True,
                message="Resume retrieved successfully",
                data=resume_data.get("resume_data"),
                parsing_confidence=resume_data.get("resume_data", {}).get("parsing_confidence")
            )
        else:
            return ResumeResponse(
                success=False,
                message="No resume found for user",
                data=None
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve resume: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to retrieve resume"
        )

@router.put("/{user_id}")
async def update_resume(
    user_id: str,
    resume_data: ResumeData,
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Update resume data for authenticated user.
    """
    try:
        # Ensure user can only update their own resume
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.update_resume_data(user_id, resume_data)
        
        if result:
            return ResumeResponse(
                success=True,
                message="Resume updated successfully",
                data=resume_data
            )
        else:
            raise HTTPException(
                status_code=404, 
                detail="Resume not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update resume: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to update resume"
        )

@router.post("/{user_id}/work-experience")
async def add_work_experience(
    user_id: str,
    experience_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Add work experience entry.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.add_work_experience(user_id, experience_data)
        
        if result:
            return {"success": True, "message": "Work experience added successfully"}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add work experience: {e}")
        raise HTTPException(status_code=500, detail="Failed to add work experience")

@router.put("/{user_id}/work-experience/{index}")
async def update_work_experience(
    user_id: str,
    index: int,
    experience_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Update work experience entry by index.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.update_work_experience(user_id, index, experience_data)
        
        if result:
            return {"success": True, "message": "Work experience updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Work experience not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update work experience: {e}")
        raise HTTPException(status_code=500, detail="Failed to update work experience")

@router.delete("/{user_id}/work-experience/{index}")
async def delete_work_experience(
    user_id: str,
    index: int,
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Delete work experience entry by index.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.delete_work_experience(user_id, index)
        
        if result:
            return {"success": True, "message": "Work experience deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Work experience not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete work experience: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete work experience")

@router.post("/{user_id}/projects")
async def add_project(
    user_id: str,
    project_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Add project entry.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.add_project(user_id, project_data)
        
        if result:
            return {"success": True, "message": "Project added successfully"}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add project: {e}")
        raise HTTPException(status_code=500, detail="Failed to add project")

@router.post("/{user_id}/certifications")
async def add_certification(
    user_id: str,
    cert_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Add certification entry.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.add_certification(user_id, cert_data)
        
        if result:
            return {"success": True, "message": "Certification added successfully"}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add certification: {e}")
        raise HTTPException(status_code=500, detail="Failed to add certification")

@router.post("/{user_id}/courses")
async def add_course(
    user_id: str,
    course_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Add course entry.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.add_course(user_id, course_data)
        
        if result:
            return {"success": True, "message": "Course added successfully"}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add course: {e}")
        raise HTTPException(status_code=500, detail="Failed to add course")

@router.post("/{user_id}/custom-sections")
async def add_custom_section(
    user_id: str,
    section_name: str = Form(...),
    section_content: str = Form(...),
    current_user_id: str = Depends(get_current_user_id),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Add custom section to resume.
    """
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await resume_service.add_custom_section(user_id, section_name, section_content)
        
        if result:
            return {"success": True, "message": "Custom section added successfully"}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add custom section: {e}")
        raise HTTPException(status_code=500, detail="Failed to add custom section")
