from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from app.utils.security import verify_token
from app.database import get_database
from app.services.profile_transformer import ProfileTransformer
from app.services.student_academics_service import update_resume_skills
import logging
from datetime import datetime


async def _sync_resume_skills(user_id: str, profile_data: dict):
    """Extract skills from profile data and sync to student_academics."""
    try:
        skills_data = profile_data.get("skills", {})
        all_skills = []
        if isinstance(skills_data, dict):
            for cat in skills_data.values():
                if isinstance(cat, list):
                    all_skills.extend(s for s in cat if isinstance(s, str))
        elif isinstance(skills_data, list):
            all_skills = [s for s in skills_data if isinstance(s, str)]
        if all_skills:
            await update_resume_skills(user_id, all_skills)
    except Exception as e:
        logging.getLogger(__name__).warning(f"Resume skills sync failed: {e}")

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)
profile_transformer = ProfileTransformer()

@router.post("/test-save")
async def test_save_profile(
    profile_request: Dict[str, Any] = Body(...)
):
    """
    Test profile saving without authentication for debugging with data transformation.
    """
    try:
        db = get_database()
        profiles_collection = db.profiles
        
        # Extract profile data from request
        raw_profile_data = profile_request.get("profile_data", {})
        
        # Transform the profile data using ProfileTransformer
        transformed_profile_data = profile_transformer.transform_profile_data(raw_profile_data)
        
        # Test user ID
        test_user_id = "test_user_123"
        
        # Add metadata
        profile_document = {
            "user_id": test_user_id,
            "profile_data": transformed_profile_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "version": "1.0"
        }
        
        # Upsert profile (update if exists, insert if not)
        result = await profiles_collection.replace_one(
            {"user_id": test_user_id},
            profile_document,
            upsert=True
        )
        
        if result.acknowledged:
            return {
                "success": True,
                "message": "Test profile saved successfully",
                "profile_id": str(result.upserted_id) if result.upserted_id else "updated",
                "original_data": raw_profile_data,
                "transformed_data": transformed_profile_data,
                "user_id": test_user_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to save test profile"
            )
            
    except Exception as e:
        logger.error(f"Test profile save failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save test profile: {str(e)}"
        )

@router.get("/test-get")
async def test_get_profile():
    """
    Test profile retrieval without authentication for debugging.
    """
    try:
        db = get_database()
        profiles_collection = db.profiles
        
        # Find the test profile
        profile = await profiles_collection.find_one({"user_id": "test_user_123"})
        
        if profile:
            # Remove MongoDB ObjectId for JSON serialization
            profile.pop("_id", None)
            
            return {
                "success": True,
                "message": "Test profile retrieved successfully",
                "profile": profile
            }
        else:
            return {
                "success": False,
                "message": "No test profile found",
                "profile": None
            }
            
    except Exception as e:
        logger.error(f"Test profile retrieval failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve test profile: {str(e)}"
        )

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract user ID from JWT token.
    """
    try:
        token = credentials.credentials
        payload = verify_token(token)
        if payload is None:
            logger.error("Token verification returned None")
            raise HTTPException(status_code=401, detail="Invalid authentication token")

        user_id = payload.get("user_id")
        # Keep authentication log short to avoid leaking user identifiers in INFO logs
        logger.info("Accessing profile - authenticated")
        return user_id
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.post("/save")
async def save_profile(
    profile_request: Dict[str, Any] = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Save user profile data to MongoDB with data transformation.
    """
    try:
        db = get_database()
        profiles_collection = db.profiles
        
        # Extract profile data from request
        raw_profile_data = profile_request.get("profile_data", {})
        
        # Transform the profile data using ProfileTransformer
        transformed_profile_data = profile_transformer.transform_profile_data(raw_profile_data)
        
        # Add metadata
        profile_document = {
            "user_id": user_id,
            "profile_data": transformed_profile_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "version": "1.0"
        }
        
        # Upsert profile (update if exists, insert if not)
        result = await profiles_collection.replace_one(
            {"user_id": user_id},
            profile_document,
            upsert=True
        )
        
        if result.acknowledged:
            # Sync resume skills to student_academics for placement matching
            await _sync_resume_skills(user_id, transformed_profile_data)
            return {
                "success": True,
                "message": "Profile saved successfully",
                "profile_id": str(result.upserted_id) if result.upserted_id else "updated",
                "transformed_data": transformed_profile_data  # Include transformed data in response for debugging
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to save profile"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile save failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile data"
        )

@router.get("/")
async def get_profile(
    user_id: str = Depends(get_current_user_id)
):
    """
    Get user profile data from MongoDB.
    """
    try:
        db = get_database()
        profiles_collection = db.profiles

        logger.info("Fetching profile")

        # Find profile by user ID
        profile = await profiles_collection.find_one({"user_id": user_id})

        # Avoid logging the full profile at INFO level; keep detailed info at DEBUG
        logger.debug("DB query executed")

        if profile:
            # Remove MongoDB ObjectId for JSON serialization
            profile.pop("_id", None)

            # Backward-compatibility: ensure skills is categorized dict
            try:
                pd = profile.get("profile_data", {})
                skills = pd.get("skills")
                if isinstance(skills, list):
                    pd["skills"] = {"technical": skills, "soft": [], "languages": []}
                profile["profile_data"] = pd
            except Exception as e:
                logger.warning(f"Skills normalization failed: {e}")

            logger.info("Profile retrieved successfully")

            return {
                "success": True,
                "message": "Profile retrieved successfully",
                "profile": profile
            }
        else:
            logger.warning("No profile found for user")
            return {
                "success": False,
                "message": "No profile found for user",
                "profile": None
            }

    except Exception as e:
        logger.error(f"Profile retrieval failed for user_id {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve profile data"
        )

@router.put("/update")
async def update_profile(
    profile_request: Dict[str, Any] = Body(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update existing user profile data.
    """
    try:
        db = get_database()
        profiles_collection = db.profiles

        # Extract and transform profile data from request
        raw_profile_data = profile_request.get("profile_data", {})
        profile_data = profile_transformer.transform_profile_data(raw_profile_data)

        # Update profile
        result = await profiles_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "profile_data": profile_data,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count > 0:
            # Sync resume skills to student_academics for placement matching
            await _sync_resume_skills(user_id, profile_data)
            return {
                "success": True,
                "message": "Profile updated successfully"
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update profile data"
        )

@router.delete("/")
async def delete_profile(
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete user profile data.
    """
    try:
        db = get_database()
        profiles_collection = db.profiles
        
        # Delete profile
        result = await profiles_collection.delete_one({"user_id": user_id})
        
        if result.deleted_count > 0:
            return {
                "success": True,
                "message": "Profile deleted successfully"
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile deletion failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete profile data"
        )

@router.get("/template")
async def get_profile_template():
    """
    Get an empty profile template structure for form initialization.
    """
    try:
        empty_profile = profile_transformer.create_empty_profile()
        return {
            "success": True,
            "message": "Profile template retrieved successfully",
            "template": empty_profile
        }
    except Exception as e:
        logger.error(f"Failed to get profile template: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve profile template"
        )
