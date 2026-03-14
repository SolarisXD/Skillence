from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from app.data.skills_data import SKILLS_DATA
from app.routers.auth import get_current_user
from app.database import get_database
from app.models.skill import UserActivityUpdate, UserActivityResponse, SkillModel

router = APIRouter()

@router.get("", response_model=List[Dict[str, str]])
async def get_all_skills():
    """Return a list of minimal skill info for browsing."""
    skills = []
    for skill_id, skill_data in SKILLS_DATA.items():
        skills.append({
            "id": skill_data["id"],
            "name": skill_data["name"],
            "category": skill_data["category"],
            "description": skill_data["description"]
        })
    return skills

@router.get("/search", response_model=List[Dict[str, str]])
async def search_skills(q: str):
    """Search skills by name or category."""
    query = q.lower()
    results = []
    for skill_id, skill_data in SKILLS_DATA.items():
        if query in skill_data["name"].lower() or query in skill_data["category"].lower():
            results.append({
                "id": skill_data["id"],
                "name": skill_data["name"],
                "category": skill_data["category"],
                "description": skill_data["description"]
            })
    return results

@router.get("/{skill_id}", response_model=SkillModel)
async def get_skill(skill_id: str):
    """Get full details of a specific skill."""
    if skill_id not in SKILLS_DATA:
        raise HTTPException(status_code=404, detail="Skill not found")
    return SKILLS_DATA[skill_id]

# --- User Activity Endpoints ---

@router.get("/user/activity", response_model=UserActivityResponse)
async def get_user_activity(current_user: dict = Depends(get_current_user)):
    """Get the currently logged in user's saved skills and progress."""
    db = get_database()
    user_skills_coll = db.user_skills
    user_id = current_user.get("id") or str(current_user.get("_id"))
    
    activity = await user_skills_coll.find_one({"user_id": user_id})
    if not activity:
        return UserActivityResponse(user_id=user_id, saved_skills=[], progress={})
        
    return UserActivityResponse(
        user_id=activity["user_id"],
        saved_skills=activity.get("saved_skills", []),
        progress=activity.get("progress", {})
    )

@router.post("/user/activity", response_model=UserActivityResponse)
async def update_user_activity(update_data: UserActivityUpdate, current_user: dict = Depends(get_current_user)):
    """Update saved skills or progress for a skill."""
    db = get_database()
    user_skills_coll = db.user_skills
    user_id = current_user.get("id") or str(current_user.get("_id"))
    
    # Check if skill exists
    if update_data.skill_id not in SKILLS_DATA:
        raise HTTPException(status_code=404, detail="Skill not found in dataset")
        
    activity = await user_skills_coll.find_one({"user_id": user_id})
    
    if not activity:
        activity = {
            "user_id": user_id,
            "saved_skills": [],
            "progress": {}
        }
        
    saved_skills = set(activity.get("saved_skills", []))
    progress = activity.get("progress", {})
    
    # Update saved status
    if update_data.is_saved is True:
        saved_skills.add(update_data.skill_id)
    elif update_data.is_saved is False and update_data.skill_id in saved_skills:
        saved_skills.remove(update_data.skill_id)
        
    # Update progress
    if update_data.progress is not None:
        progress[update_data.skill_id] = update_data.progress
        
    # Save to db
    updated_doc = {
        "user_id": user_id,
        "saved_skills": list(saved_skills),
        "progress": progress
    }
    
    await user_skills_coll.update_one(
        {"user_id": user_id},
        {"$set": updated_doc},
        upsert=True
    )
    
    return UserActivityResponse(**updated_doc)
