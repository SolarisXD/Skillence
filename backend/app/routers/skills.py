from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.data.skills_data import SKILLS_DATA
from app.routers.auth import get_current_user
from app.database import get_database
from app.models.skill import UserActivityUpdate, UserActivityResponse, SkillModel, SavedSkillEntry
from app.services.youtube_service import fetch_youtube_videos
from app.services.resource_fetcher import fetch_topic_resources

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
    """Search skills by name, category, or description."""
    query = q.lower()
    results = []
    for skill_id, skill_data in SKILLS_DATA.items():
        if (query in skill_data["name"].lower()
                or query in skill_data["category"].lower()
                or query in skill_data.get("description", "").lower()):
            results.append({
                "id": skill_data["id"],
                "name": skill_data["name"],
                "category": skill_data["category"],
                "description": skill_data["description"]
            })
    return results


@router.get("/youtube/{skill_id}")
async def get_youtube_videos(skill_id: str, count: int = 5):
    """Fetch top YouTube educational videos for a skill via YouTube Data API v3."""
    if skill_id not in SKILLS_DATA:
        raise HTTPException(status_code=404, detail="Skill not found")

    skill_name = SKILLS_DATA[skill_id]["name"]
    videos = await fetch_youtube_videos(skill_name, max_results=min(count, 10))
    return {"skill_id": skill_id, "videos": videos}


@router.get("/{skill_id}")
async def get_skill(skill_id: str):
    """Get full details of a specific skill with enhanced metadata."""
    if skill_id not in SKILLS_DATA:
        raise HTTPException(status_code=404, detail="Skill not found")
    return SKILLS_DATA[skill_id]


@router.get("/{skill_id}/resources")
async def get_skill_resources(skill_id: str, topic: str):
    """
    Fetch external learning resources for a specific roadmap topic.
    Strategy: Try DuckDuckGo first for fresh, up-to-date resources.
    If the dynamic fetch fails or returns only generic fallbacks,
    serve the pre-defined curated resource links instead.
    """
    if skill_id not in SKILLS_DATA:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    skill = SKILLS_DATA[skill_id]
    skill_category = skill["category"]
    
    # Step 1: Try DuckDuckGo for fresh, up-to-date resources
    try:
        resources = await fetch_topic_resources(topic, skill_category)
        
        # Check if the fetcher returned real results (not just a generic "Search Engine" fallback)
        has_real_results = any(
            r.get("source", "") != "Search Engine" for r in resources
        ) if resources else False
        
        if has_real_results:
            return {"skill_id": skill_id, "topic": topic, "resources": resources}
    except Exception:
        pass  # DuckDuckGo failed — fall through to static resources
    
    # Step 2: Fallback — serve pre-defined curated resource links
    roadmap = skill.get("roadmap", [])
    if isinstance(roadmap, list):
        for phase in roadmap:
            if isinstance(phase, dict):
                for t in phase.get("topics", []):
                    if isinstance(t, dict) and t.get("name") == topic:
                        static_resources = t.get("resources", [])
                        if static_resources:
                            formatted = []
                            for r in static_resources:
                                formatted.append({
                                    "title": r.get("title", ""),
                                    "description": f"Learn about {topic} from {r.get('source', 'Web')}.",
                                    "url": r.get("url", ""),
                                    "source": r.get("source", "Web Resource")
                                })
                            return {"skill_id": skill_id, "topic": topic, "resources": formatted}

    # Step 3: Last resort — generic search link
    return {"skill_id": skill_id, "topic": topic, "resources": [{
        "title": f"Learn {topic}",
        "description": "Explore documentation and tutorials.",
        "url": f"https://www.google.com/search?q={topic.replace(' ', '+')}+{skill_category}",
        "source": "Search Engine"
    }]}


# --- User Activity Endpoints ---

@router.get("/user/activity", response_model=UserActivityResponse)
async def get_user_activity(current_user: dict = Depends(get_current_user)):
    """Get the currently logged in user's saved skills, progress, and bookmark details."""
    db = get_database()
    user_skills_coll = db.user_skills
    user_id = current_user.get("id") or str(current_user.get("_id"))

    activity = await user_skills_coll.find_one({"user_id": user_id})
    if not activity:
        return UserActivityResponse(user_id=user_id, saved_skills=[], progress={}, saved_details={})

    return UserActivityResponse(
        user_id=activity["user_id"],
        saved_skills=activity.get("saved_skills", []),
        progress=activity.get("progress", {}),
        saved_details={
            k: SavedSkillEntry(**v) if isinstance(v, dict) else SavedSkillEntry(skill_id=k)
            for k, v in activity.get("saved_details", {}).items()
        }
    )


@router.post("/user/activity", response_model=UserActivityResponse)
async def update_user_activity(update_data: UserActivityUpdate, current_user: dict = Depends(get_current_user)):
    """Update saved skills, progress, status, and completed steps."""
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
            "progress": {},
            "saved_details": {}
        }

    saved_skills = set(activity.get("saved_skills", []))
    progress = activity.get("progress", {})
    saved_details = activity.get("saved_details", {})

    sid = update_data.skill_id

    # Update saved status
    if update_data.is_saved is True:
        saved_skills.add(sid)
        if sid not in saved_details:
            saved_details[sid] = {
                "skill_id": sid,
                "status": "interested",
                "progress_percentage": 0,
                "bookmarked_at": datetime.utcnow().isoformat(),
                "completed_steps": []
            }
    elif update_data.is_saved is False and sid in saved_skills:
        saved_skills.discard(sid)
        saved_details.pop(sid, None)

    # Update status (interested / learning / completed)
    if update_data.status and sid in saved_details:
        saved_details[sid]["status"] = update_data.status

    # Update progress percentage
    if update_data.progress_percentage is not None and sid in saved_details:
        saved_details[sid]["progress_percentage"] = update_data.progress_percentage

    # Update completed roadmap steps
    if update_data.completed_steps is not None and sid in saved_details:
        saved_details[sid]["completed_steps"] = update_data.completed_steps

    # Legacy progress field
    if update_data.progress is not None:
        progress[sid] = update_data.progress

    # Save to db
    updated_doc = {
        "user_id": user_id,
        "saved_skills": list(saved_skills),
        "progress": progress,
        "saved_details": saved_details
    }

    await user_skills_coll.update_one(
        {"user_id": user_id},
        {"$set": updated_doc},
        upsert=True
    )

    return UserActivityResponse(
        user_id=user_id,
        saved_skills=list(saved_skills),
        progress=progress,
        saved_details={
            k: SavedSkillEntry(**v) if isinstance(v, dict) else SavedSkillEntry(skill_id=k)
            for k, v in saved_details.items()
        }
    )
