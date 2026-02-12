from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import re
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
import requests
import logging
from datetime import datetime, timedelta
from app.utils.security import verify_token
from app.services.learning_plan_service import LearningPlanService
from app.services.career_recommendation_service import CareerRecommendationService
from app.models.learning_roadmap import (
    LearningRoadmapProgress, 
    PhaseProgress, 
    TaskProgress, 
    TaskCompletionUpdate,
    PhaseDeadlineUpdate,
    RoadmapProgressResponse,
    RoadmapCreationRequest,
    ProgressSummary,
    TaskStatus,
    PhaseStatus
)

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class CareerRecommendation(BaseModel):
    occupation_code: str
    title: str
    score: float
    tech_score: float
    traditional_score: float
    ai_score: float
    hot_tech_matches: List[str]
    regular_tech_matches: List[str]
    required_skills: List[str]
    hot_technologies: List[str]
    explanation: Optional[str] = ""

class CareerRecommendationResponse(BaseModel):
    success: bool
    recommendations: List[CareerRecommendation]
    profile_summary: str
    total_tech_skills: int
    message: str

# Utility functions (copied from test_recommender.py)
def tokenize(text):
    """Enhanced tokenization with better handling"""
    if not text:
        return set()
    text = re.sub(r"[^0-9a-zA-Z\+\#]+", " ", text).lower()
    toks = {t for t in text.split() if len(t) > 1}
    toks = {t for t in toks if not t.isdigit() and len(t) > 2}
    return toks

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract user ID from JWT token.
    """
    try:
        token = credentials.credentials
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")
        return user_id
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

def extract_technical_skills(profile):
    """Extract technical skills with enhanced priority"""
    tech_skills = set()
    
    if not profile:
        return tech_skills
    
    pd = profile.get('profile_data', {})
    
    # High priority: explicit technical skills
    skills = pd.get('skills', {})
    if isinstance(skills, dict):
        tech_list = skills.get('technical', [])
        if isinstance(tech_list, list):
            for skill in tech_list:
                tech_skills.add(skill.lower())
    
    # Extract from project descriptions
    projects = pd.get('projects', [])
    for project in projects:
        if isinstance(project, dict):
            name = project.get('name', '')
            tech_skills.update(tokenize(name))
            
            desc = project.get('description', '')
            if desc:
                tech_patterns = re.findall(r'\b(?:API|ML|AI|TensorFlow|PyTorch|React|Node|Python|JavaScript|Azure|AWS|MongoDB|Flask|Docker|Kubernetes|Git|GitHub|SQL|NoSQL|REST|GraphQL|Express|Vue|Angular|Django|FastAPI|Pandas|NumPy|Scikit|OpenCV|BERT|GPT|Transformer|Neural|Machine Learning|Deep Learning|Computer Vision|Natural Language Processing|NLP|OCR|Database|Backend|Frontend|Full Stack|DevOps|Cloud|Microservices|Serverless)\b', desc, re.IGNORECASE)
                tech_skills.update([t.lower() for t in tech_patterns])
                
            techs = project.get('technologies', [])
            if isinstance(techs, list):
                for tech in techs:
                    tech_skills.add(tech.lower())
    
    # Extract from certifications
    certs = pd.get('certifications', [])
    for cert in certs:
        if isinstance(cert, dict):
            name = cert.get('name', '')
            tech_patterns = re.findall(r'\b(?:Python|Java|C\+\+|JavaScript|React|Angular|Vue|Node|Machine Learning|AI|Data Science|AWS|Azure|GCP|Docker|Kubernetes|MongoDB|SQL|Git|GitHub|TensorFlow|PyTorch|Scikit|Pandas|NumPy|Flask|Django|FastAPI|REST|API|Database|Cloud|DevOps|Agile|Scrum)\b', name, re.IGNORECASE)
            tech_skills.update([t.lower() for t in tech_patterns])
    
    return tech_skills

def extract_profile_tokens(profile):
    """Extract all profile tokens with enhanced categorization"""
    tech_skills = extract_technical_skills(profile)
    general_tokens = set()
    
    if not profile:
        return tech_skills, general_tokens
    
    pd = profile.get('profile_data', {})
    
    for key in ['achievements', 'education']:
        items = pd.get(key, [])
        for item in items:
            if isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        general_tokens.update(tokenize(v))
            elif isinstance(item, str):
                general_tokens.update(tokenize(item))
    
    general_tokens = general_tokens - tech_skills
    return tech_skills, general_tokens

def load_technology_skills():
    """Load technology skills from O*NET data"""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'career_data', 'skills_data')
    tech_file = os.path.join(data_dir, 'Technology Skills.xlsx')
    
    if not os.path.exists(tech_file):
        logger.warning(f"Technology Skills file not found at {tech_file}")
        return {}
    
    try:
        df = pd.read_excel(tech_file)
        tech_by_job = {}
        
        for _, row in df.iterrows():
            soc_code = row['O*NET-SOC Code']
            example = str(row.get('Example', '')).lower()
            commodity = str(row.get('Commodity Title', '')).lower()
            hot_tech = row.get('Hot Technology', 'N')
            
            if soc_code not in tech_by_job:
                tech_by_job[soc_code] = {'hot': [], 'regular': []}
            
            for tech in [example, commodity]:
                if tech and len(tech) > 3 and tech != 'nan':
                    if hot_tech == 'Y':
                        tech_by_job[soc_code]['hot'].append(tech)
                    else:
                        tech_by_job[soc_code]['regular'].append(tech)
        
        return tech_by_job
    except Exception as e:
        logger.error(f"Error loading technology skills: {e}")
        return {}

def enhance_jobs_with_tech(jobs, tech_skills_by_job):
    """Enhance job data with technology skills"""
    for job in jobs:
        soc_code = job['occupation_code']
        if soc_code in tech_skills_by_job:
            job['hot_technologies'] = tech_skills_by_job[soc_code]['hot']
            job['technologies'] = tech_skills_by_job[soc_code]['regular']
        else:
            job['hot_technologies'] = []
            job['technologies'] = []
    return jobs

def filter_relevant_jobs(jobs, target_soc_prefixes=['15-', '17-']):
    """Filter jobs to only relevant technical categories"""
    filtered = []
    for job in jobs:
        soc_code = job['occupation_code']
        if any(soc_code.startswith(prefix) for prefix in target_soc_prefixes):
            filtered.append(job)
    return filtered

def calculate_tech_match_score(profile_tech_skills, job_tech_skills, hot_tech_skills):
    """Calculate technology matching score"""
    profile_set = set(profile_tech_skills)
    job_set = set(job_tech_skills)
    hot_set = set(hot_tech_skills)
    
    hot_matches = profile_set & hot_set
    regular_matches = profile_set & (job_set - hot_set)
    
    hot_partial = sum(1 for p in profile_set for h in hot_set if p in h or h in p)
    regular_partial = sum(1 for p in profile_set for j in (job_set - hot_set) if p in j or j in p)
    
    hot_score = len(hot_matches) * 3 + hot_partial * 1.5
    regular_score = len(regular_matches) * 2 + regular_partial * 1
    
    total_score = hot_score + regular_score
    
    return {
        'total_score': total_score,
        'hot_matches': list(hot_matches),
        'regular_matches': list(regular_matches),
    }

def use_gemini_for_profile_analysis(profile_summary, top_jobs):
    """Use Gemini AI to provide intelligent analysis"""
    gemini_api = os.getenv('GEMINI_API')
    gemini_endpoint = os.getenv('GEMINI_ENDPOINT')
    
    if not gemini_api or not gemini_endpoint:
        return {}
    
    try:
        job_list = []
        for i, job in enumerate(top_jobs[:5], 1):
            job_list.append(f"{i}. {job['title']} ({job['occupation_code']})")
        
        jobs_text = "\n".join(job_list)
        
        prompt = f"""Analyze this candidate profile against these top job matches and provide intelligence scores.

CANDIDATE PROFILE:
{profile_summary}

TOP JOB MATCHES:
{jobs_text}

For each job, rate the match quality from 0-10 considering technical skill alignment, experience level fit, and career progression potential.

Respond with ONLY a JSON object in this exact format:
{{
  "job_scores": {{
    "1": 8.5,
    "2": 7.0,
    "3": 6.5,
    "4": 9.0,
    "5": 7.5
  }}
}}"""

        headers = {"Content-Type": "application/json"}
        params = {"key": gemini_api}
        
        payload = {
            "contents": [{
                "role": "user", 
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.1
            }
        }
        
        response = requests.post(gemini_endpoint, headers=headers, params=params, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if 'candidates' in data and len(data['candidates']) > 0:
            text = data['candidates'][0]['content']['parts'][0]['text']
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
                
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
    
    return {}

def create_profile_summary(profile):
    """Create a concise profile summary for AI analysis"""
    pd = profile.get('profile_data', {})
    
    tech_skills = extract_technical_skills(profile)
    education = pd.get('education', [])
    projects = pd.get('projects', [])
    
    summary_parts = []
    
    if tech_skills:
        summary_parts.append(f"Technical Skills: {', '.join(list(tech_skills)[:10])}")
    
    if education:
        edu_info = []
        for edu in education:
            if isinstance(edu, dict):
                degree = edu.get('degree', '')
                institution = edu.get('institution', '')
                if degree and institution:
                    edu_info.append(f"{degree} from {institution}")
        if edu_info:
            summary_parts.append(f"Education: {'; '.join(edu_info)}")
    
    if projects:
        project_names = []
        for proj in projects[:3]:
            if isinstance(proj, dict):
                name = proj.get('name', '')
                if name:
                    project_names.append(name)
        if project_names:
            summary_parts.append(f"Key Projects: {', '.join(project_names)}")
    
    return ". ".join(summary_parts)

def score_occupations(profile, jobs, top_k=10):
    """Score occupations using the same logic as test_recommender.py"""
    tech_skills, general_tokens = extract_profile_tokens(profile)
    
    results = []
    
    for job in jobs:
        req = job.get('required', [])
        opt = job.get('optional', [])
        
        hot_tech = job.get('hot_technologies', [])
        regular_tech = job.get('technologies', [])
        
        tech_match = calculate_tech_match_score(tech_skills, regular_tech, hot_tech)
        
        req_token_sets = [(s, tokenize(s)) for s in req]
        opt_token_sets = [(s, tokenize(s)) for s in opt]
        
        all_profile_tokens = tech_skills | general_tokens
        
        req_matches = sum(1 for name, toks in req_token_sets if toks & all_profile_tokens)
        opt_matches = sum(1 for name, toks in opt_token_sets if toks & all_profile_tokens)
        
        req_score = req_matches / max(1, len(req))
        opt_score = opt_matches / max(1, len(opt)) if len(opt) > 0 else 0
        
        traditional_score = 0.6 * req_score + 0.4 * opt_score
        tech_score = min(1.0, tech_match['total_score'] / 10.0)
        
        base_score = 0.3 * traditional_score + 0.7 * tech_score
        
        results.append({
            'occupation_code': job['occupation_code'],
            'title': job['title'],
            'base_score': base_score,
            'tech_score': tech_score,
            'traditional_score': traditional_score,
            'tech_matches': tech_match,
            'required_matches': [name for name, toks in req_token_sets if toks & all_profile_tokens],
            'optional_matches': [name for name, toks in opt_token_sets if toks & all_profile_tokens],
            'hot_technologies': hot_tech[:5],
            'technologies': regular_tech[:5],
            'ai_score': 0.5
        })
    
    results.sort(key=lambda x: x['base_score'], reverse=True)
    
    # Apply AI enhancement for top 5
    try:
        profile_summary = create_profile_summary(profile)
        ai_analysis = use_gemini_for_profile_analysis(profile_summary, results[:5])
        
        if ai_analysis and 'job_scores' in ai_analysis:
            job_scores = ai_analysis['job_scores']
            for i, result in enumerate(results[:5], 1):
                if str(i) in job_scores:
                    ai_score = float(job_scores[str(i)]) / 10.0
                    result['ai_score'] = ai_score
                    result['final_score'] = 0.7 * result['base_score'] + 0.3 * ai_score
                else:
                    result['final_score'] = result['base_score']
            
            for result in results[5:]:
                result['final_score'] = result['base_score']
            
            results.sort(key=lambda x: x['final_score'], reverse=True)
    except Exception as e:
        logger.error(f"AI enhancement failed: {e}")
        for result in results:
            result['final_score'] = result['base_score']
    
    return results[:top_k]

@router.post("/recommendations", response_model=CareerRecommendationResponse)
async def get_career_recommendations(user_id: str = Depends(get_current_user_id)):
    """Get career path recommendations using ML pre-filter + Gemini ranking."""
    try:
        # Load user profile from MongoDB
        mongo_uri = os.getenv('MONGODB_URI')
        if not mongo_uri:
            raise HTTPException(status_code=500, detail="Database configuration error")

        client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
        db = client.skillence_db
        profile = db.profiles.find_one({'user_id': user_id})
        client.close()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Use the new ML + Gemini recommendation service
        svc = CareerRecommendationService.get_instance()
        results, profile_summary, total_skills = svc.get_recommendations(profile, top_k=10)

        recommendations = [
            CareerRecommendation(
                occupation_code=r["occupation_code"],
                title=r["title"],
                score=r["score"],
                tech_score=r["tech_score"],
                traditional_score=r["traditional_score"],
                ai_score=r["ai_score"],
                hot_tech_matches=r["hot_tech_matches"],
                regular_tech_matches=r["regular_tech_matches"],
                required_skills=r["required_skills"],
                hot_technologies=r["hot_technologies"],
                explanation=r["explanation"],
            )
            for r in results
        ]

        return CareerRecommendationResponse(
            success=True,
            recommendations=recommendations,
            profile_summary=profile_summary,
            total_tech_skills=total_skills,
            message=f"Found {len(recommendations)} relevant career recommendations",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating career recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Pydantic models for career path saving
class CareerPathSave(BaseModel):
    occupation_code: str
    title: str
    score: float
    explanation: str

class CareerPathResponse(BaseModel):
    success: bool
    message: str
    career_path: Optional[dict] = None

@router.post("/save-career-path")
async def save_career_path(
    career_path_data: CareerPathSave,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Save selected career path for the authenticated user
    """
    try:
        # Verify token and get user_id
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Connect to MongoDB
        from app.database import get_database
        db = get_database()
        profiles_collection = db.profiles
        
        # Create career path document
        career_path_doc = {
            "occupation_code": career_path_data.occupation_code,
            "title": career_path_data.title,
            "score": career_path_data.score,
            "explanation": career_path_data.explanation,
            "saved_at": datetime.utcnow().isoformat()
        }
        
        # Update user profile with career path
        result = await profiles_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "career_path": career_path_doc,
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
        
        if result.acknowledged:
            return CareerPathResponse(
                success=True,
                message="Career path saved successfully",
                career_path=career_path_doc
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to save career path")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving career path: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save career path")

@router.get("/get-career-path")
async def get_career_path(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get saved career path for the authenticated user
    """
    try:
        # Verify token and get user_id
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Connect to MongoDB
        from app.database import get_database
        db = get_database()
        profiles_collection = db.profiles
        
        # Find user profile with career path
        profile = await profiles_collection.find_one(
            {"user_id": user_id},
            {"career_path": 1, "_id": 0}
        )
        
        if profile and "career_path" in profile:
            return CareerPathResponse(
                success=True,
                message="Career path retrieved successfully",
                career_path=profile["career_path"]
            )
        else:
            return CareerPathResponse(
                success=True,
                message="No career path found",
                career_path=None
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving career path: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve career path")

# Learning Plan Models
class LearningPlanResponse(BaseModel):
    success: bool
    message: str
    learning_plan: Optional[Dict[str, Any]] = None

class SkillUpdate(BaseModel):
    skills_to_add: List[str]
    skill_category: str = "technical"  # technical, soft, languages

class SkillUpdateResponse(BaseModel):
    success: bool
    message: str
    updated_skills: Optional[Dict[str, Any]] = None

# Initialize learning plan service
learning_plan_service = LearningPlanService()

@router.get("/learning-plan")
async def get_learning_plan(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Generate personalized learning plan based on saved career path and user profile.
    Only generates skills analysis - roadmap structure is handled separately.
    """
    try:
        # Verify token and get user_id
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Connect to MongoDB
        from app.database import get_database
        db = get_database()
        profiles_collection = db.profiles
        
        # Get user profile with career path
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        career_path = profile.get("career_path")
        if not career_path:
            raise HTTPException(status_code=404, detail="No career path selected. Please select a career path first.")
        
        # Generate learning plan (just skills analysis)
        learning_plan = learning_plan_service.generate_learning_plan(profile, career_path)
        
        # Persist the learning plan in the career_path document so it survives page reloads
        try:
            await profiles_collection.update_one(
                {"user_id": user_id},
                {"$set": {"career_path.saved_learning_plan": learning_plan}}
            )
        except Exception as save_err:
            logger.warning(f"Failed to persist learning plan: {save_err}")
        
        return LearningPlanResponse(
            success=True,
            message="Learning plan generated successfully",
            learning_plan=learning_plan
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating learning plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate learning plan")

@router.post("/generate-roadmap")
async def generate_and_save_roadmap(
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate complete learning roadmap and save it with progress tracking.
    This creates the persistent roadmap structure.
    """
    try:
        from app.database import get_database
        db = get_database()
        profiles_collection = db.profiles
        
        # Get user profile with career path
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        career_path = profile.get("career_path")
        if not career_path:
            raise HTTPException(status_code=404, detail="No career path selected. Please select a career path first.")
        
        # Generate complete learning plan with roadmap
        learning_plan = learning_plan_service.generate_learning_plan(profile, career_path)
        
        # Create roadmap request
        roadmap_request = RoadmapCreationRequest(
            career_path_id=career_path["occupation_code"],
            learning_plan_data=learning_plan,
            estimated_duration_months=12  # Default to 12 months
        )
        
        # Call the create roadmap function
        roadmap_response = await create_learning_roadmap(roadmap_request, user_id)
        
        return {
            "success": True,
            "message": "Learning roadmap generated and saved successfully",
            "learning_plan": learning_plan,
            "roadmap_progress": roadmap_response.roadmap_progress
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate roadmap")

@router.post("/add-learned-skills")
async def add_learned_skills(
    skill_update: SkillUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Add learned skills to user profile and optionally regenerate learning plan
    """
    try:
        # Verify token and get user_id
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Connect to MongoDB
        from app.database import get_database
        db = get_database()
        profiles_collection = db.profiles
        
        # Get current user profile
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Update skills in profile
        profile_data = profile.get("profile_data", {})
        current_skills = profile_data.get("skills", {})
        
        # Add new skills to the appropriate category
        category_skills = current_skills.get(skill_update.skill_category, [])
        
        # Add only new skills (avoid duplicates)
        new_skills_added = []
        for new_skill in skill_update.skills_to_add:
            # Ensure the skill is a string and properly formatted
            skill_to_add = str(new_skill).strip()
            if skill_to_add and skill_to_add not in category_skills:
                category_skills.append(skill_to_add)
                new_skills_added.append(skill_to_add)
        
        current_skills[skill_update.skill_category] = category_skills
        profile_data["skills"] = current_skills
        
        # Update profile in database
        result = await profiles_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "profile_data": profile_data,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.acknowledged:
            # Auto-regenerate learning plan if skills were actually added and user has a career path
            regenerated_plan = None
            if new_skills_added and profile.get("career_path"):
                try:
                    # Get updated profile for learning plan generation
                    updated_profile = await profiles_collection.find_one({"user_id": user_id})
                    career_path = updated_profile.get("career_path")
                    
                    # Regenerate learning plan with updated skills
                    regenerated_plan = learning_plan_service.generate_learning_plan(updated_profile, career_path)
                    logger.info(f"Auto-regenerated learning plan after adding {len(new_skills_added)} skills")
                except Exception as e:
                    logger.error(f"Error auto-regenerating learning plan: {e}")
                    # Don't fail the skill update if learning plan regeneration fails
            
            return SkillUpdateResponse(
                success=True,
                message=f"Successfully added {len(new_skills_added)} new skills to {skill_update.skill_category} skills" + 
                       (" and updated learning plan" if regenerated_plan else ""),
                updated_skills=current_skills
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to update skills")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding learned skills: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add learned skills")

@router.post("/regenerate-learning-plan")
async def regenerate_learning_plan(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Regenerate learning plan with updated profile data
    """
    try:
        # Verify token and get user_id
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Connect to MongoDB
        from app.database import get_database
        db = get_database()
        profiles_collection = db.profiles
        
        # Get user profile with career path
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        career_path = profile.get("career_path")
        if not career_path:
            raise HTTPException(status_code=404, detail="No career path selected. Please select a career path first.")
        
        # Force regenerate learning plan (could add cache invalidation here)
        learning_plan = learning_plan_service.generate_learning_plan(profile, career_path)
        
        # Persist the regenerated plan so it survives page reloads
        try:
            await profiles_collection.update_one(
                {"user_id": user_id},
                {"$set": {"career_path.saved_learning_plan": learning_plan}}
            )
        except Exception as save_err:
            logger.warning(f"Failed to persist regenerated learning plan: {save_err}")
        
        return LearningPlanResponse(
            success=True,
            message="Learning plan regenerated successfully with updated skills",
            learning_plan=learning_plan
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating learning plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to regenerate learning plan")

# New Learning Roadmap Progress Endpoints

@router.post("/roadmap/create")
async def create_learning_roadmap(
    roadmap_request: RoadmapCreationRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new learning roadmap with progress tracking"""
    try:
        from app.database import get_database
        db = get_database()
        
        # Get user's career path
        profiles_collection = db.profiles
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile or not profile.get("career_path"):
            raise HTTPException(status_code=404, detail="Career path not found")
        
        career_path = profile["career_path"]
        
        # Parse estimated duration
        duration_months = roadmap_request.estimated_duration_months
        estimated_completion = datetime.utcnow() + timedelta(days=duration_months * 30)
        
        # Create phases with tasks from learning plan
        phases = []
        learning_plan = roadmap_request.learning_plan_data
        roadmap_phases = learning_plan.get("learning_roadmap", {}).get("phases", [])
        
        for idx, phase_data in enumerate(roadmap_phases, 1):
            # Calculate phase deadline (distribute evenly across total duration)
            phase_duration_days = (duration_months * 30) // len(roadmap_phases)
            phase_deadline = datetime.utcnow() + timedelta(days=phase_duration_days * idx)
            
            # Create tasks for this phase
            tasks = []
            
            # 1. Add regular tasks (3-4 tasks to do) - generate from phase context
            phase_title = phase_data.get("title", f"Phase {idx}")
            phase_description = phase_data.get("description", "")
            
            # Generate contextual tasks based on phase
            if "foundation" in phase_title.lower() or idx == 1:
                tasks.extend([
                    TaskProgress(task_id=f"task_{idx}_1", task_name="Set up development environment", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_2", task_name="Complete introductory courses", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_3", task_name="Build first practice project", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_4", task_name="Join relevant communities", task_type="task")
                ])
            elif "technical" in phase_title.lower() or "development" in phase_title.lower() or idx == 2:
                tasks.extend([
                    TaskProgress(task_id=f"task_{idx}_1", task_name="Complete intermediate projects", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_2", task_name="Practice coding challenges", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_3", task_name="Build portfolio website", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_4", task_name="Contribute to open source", task_type="task")
                ])
            elif "specialization" in phase_title.lower() or "mastery" in phase_title.lower() or idx == 3:
                tasks.extend([
                    TaskProgress(task_id=f"task_{idx}_1", task_name="Complete capstone project", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_2", task_name="Obtain relevant certifications", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_3", task_name="Apply for job opportunities", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_4", task_name="Network with professionals", task_type="task")
                ])
            else:
                # Generic tasks
                tasks.extend([
                    TaskProgress(task_id=f"task_{idx}_1", task_name="Complete learning objectives", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_2", task_name="Practice hands-on exercises", task_type="task"),
                    TaskProgress(task_id=f"task_{idx}_3", task_name="Build relevant projects", task_type="task")
                ])
            
            # 2. Add skills as skills (for Skills Focus section)
            for skill_idx, skill in enumerate(phase_data.get("skills_to_learn", [])):
                if isinstance(skill, dict):
                    skill_name = (skill.get("skill") or skill.get("technology")
                                  or skill.get("name") or skill.get("knowledge")
                                  or str(skill))
                else:
                    skill_name = str(skill)
                tasks.append(TaskProgress(
                    task_id=f"skill_{idx}_{skill_idx}",
                    task_name=skill_name,
                    task_type="skill"
                ))
            
            # 3. Add learning resources as resources (for Recommended Resources section)
            for res_idx, resource in enumerate(phase_data.get("learning_resources", [])):
                if isinstance(resource, dict):
                    resource_title = (resource.get("title") or resource.get("name")
                                      or str(resource))
                else:
                    resource_title = str(resource)
                tasks.append(TaskProgress(
                    task_id=f"resource_{idx}_{res_idx}",
                    task_name=resource_title,
                    task_type="resource"
                ))
            
            # 4. Add milestones as milestones (for Key Milestones section)
            for mil_idx, milestone in enumerate(phase_data.get("milestones", [])):
                milestone_name = milestone if isinstance(milestone, str) else str(milestone)
                tasks.append(TaskProgress(
                    task_id=f"milestone_{idx}_{mil_idx}",
                    task_name=milestone_name,
                    task_type="milestone"
                ))
            
            phase = PhaseProgress(
                phase_number=idx,
                phase_title=phase_data.get("title", f"Phase {idx}"),
                target_deadline=phase_deadline,
                tasks=tasks
            )
            phases.append(phase)
        
        # Create roadmap progress document
        roadmap_progress = LearningRoadmapProgress(
            user_id=user_id,
            career_path_id=career_path["occupation_code"],
            career_title=career_path["title"],
            occupation_code=career_path["occupation_code"],
            learning_plan_data=learning_plan,
            phases=phases,
            estimated_completion_date=estimated_completion,
            original_estimated_duration=f"{duration_months} months"
        )
        
        # Save to database
        roadmaps_collection = db.learning_roadmaps
        roadmap_dict = roadmap_progress.dict()
        roadmap_dict["_id"] = f"{user_id}_{career_path['occupation_code']}"
        
        result = await roadmaps_collection.replace_one(
            {"user_id": user_id, "career_path_id": career_path["occupation_code"]},
            roadmap_dict,
            upsert=True
        )
        
        return RoadmapProgressResponse(
            success=True,
            message="Learning roadmap created successfully",
            roadmap_progress=roadmap_progress
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating learning roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to create learning roadmap")

@router.get("/roadmap/progress")
async def get_roadmap_progress(
    user_id: str = Depends(get_current_user_id)
):
    """Get learning roadmap progress for the user"""
    try:
        from app.database import get_database
        db = get_database()
        
        # Get user's current career path
        profiles_collection = db.profiles
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile or not profile.get("career_path"):
            raise HTTPException(status_code=404, detail="Career path not found")
        
        career_path = profile["career_path"]
        
        # Get roadmap progress
        roadmaps_collection = db.learning_roadmaps
        roadmap_doc = await roadmaps_collection.find_one({
            "user_id": user_id,
            "career_path_id": career_path["occupation_code"]
        })
        
        if not roadmap_doc:
            return RoadmapProgressResponse(
                success=True,
                message="No roadmap found",
                roadmap_progress=None
            )
        
        # Remove MongoDB _id before creating Pydantic model
        roadmap_doc.pop("_id", None)
        roadmap_progress = LearningRoadmapProgress(**roadmap_doc)
        
        return RoadmapProgressResponse(
            success=True,
            message="Roadmap progress retrieved successfully",
            roadmap_progress=roadmap_progress
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving roadmap progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve roadmap progress")

@router.post("/roadmap/update-task")
async def update_task_completion(
    task_update: TaskCompletionUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update task completion status"""
    try:
        from app.database import get_database
        db = get_database()
        
        # Get user's career path
        profiles_collection = db.profiles
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile or not profile.get("career_path"):
            raise HTTPException(status_code=404, detail="Career path not found")
        
        career_path = profile["career_path"]
        
        # Update task status
        roadmaps_collection = db.learning_roadmaps
        update_data = {
            "phases.$[phase].tasks.$[task].status": task_update.status.value,
            "last_updated": datetime.utcnow()
        }
        
        if task_update.status == TaskStatus.COMPLETED:
            update_data["phases.$[phase].tasks.$[task].completed_at"] = datetime.utcnow()
        
        if task_update.notes:
            update_data["phases.$[phase].tasks.$[task].notes"] = task_update.notes
        
        result = await roadmaps_collection.update_one(
            {"user_id": user_id, "career_path_id": career_path["occupation_code"]},
            {"$set": update_data},
            array_filters=[
                {"phase.tasks": {"$elemMatch": {"task_id": task_update.task_id}}},
                {"task.task_id": task_update.task_id}
            ]
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Recalculate progress
        await _recalculate_progress(db, user_id, career_path["occupation_code"])
        
        return {"success": True, "message": "Task updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update task")

@router.post("/roadmap/update-deadline")
async def update_phase_deadline(
    deadline_update: PhaseDeadlineUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update phase deadline"""
    try:
        from app.database import get_database
        db = get_database()
        
        # Get user's career path
        profiles_collection = db.profiles
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile or not profile.get("career_path"):
            raise HTTPException(status_code=404, detail="Career path not found")
        
        career_path = profile["career_path"]
        
        # Update phase deadline
        roadmaps_collection = db.learning_roadmaps
        result = await roadmaps_collection.update_one(
            {"user_id": user_id, "career_path_id": career_path["occupation_code"]},
            {
                "$set": {
                    "phases.$[phase].target_deadline": deadline_update.new_deadline,
                    "last_updated": datetime.utcnow()
                }
            },
            array_filters=[{"phase.phase_number": deadline_update.phase_number}]
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Phase not found")
        
        return {"success": True, "message": "Deadline updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating deadline: {e}")
        raise HTTPException(status_code=500, detail="Failed to update deadline")

@router.get("/roadmap/summary")
async def get_progress_summary(
    user_id: str = Depends(get_current_user_id)
):
    """Get progress summary for quick display"""
    try:
        from app.database import get_database
        db = get_database()
        
        # Get user's career path
        profiles_collection = db.profiles
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile or not profile.get("career_path"):
            raise HTTPException(status_code=404, detail="Career path not found")
        
        career_path = profile["career_path"]
        
        # Get roadmap
        roadmaps_collection = db.learning_roadmaps
        roadmap_doc = await roadmaps_collection.find_one({
            "user_id": user_id,
            "career_path_id": career_path["occupation_code"]
        })
        
        if not roadmap_doc:
            return {"success": True, "summary": None}
        
        # Calculate summary statistics
        total_phases = len(roadmap_doc.get("phases", []))
        completed_phases = sum(1 for phase in roadmap_doc.get("phases", []) 
                             if phase.get("status") == PhaseStatus.COMPLETED.value)
        
        total_tasks = sum(len(phase.get("tasks", [])) for phase in roadmap_doc.get("phases", []))
        completed_tasks = sum(
            sum(1 for task in phase.get("tasks", []) if task.get("status") == TaskStatus.COMPLETED.value)
            for phase in roadmap_doc.get("phases", [])
        )
        
        overall_progress = roadmap_doc.get("overall_progress_percentage", 0.0)
        
        # Calculate days remaining
        completion_date = roadmap_doc.get("estimated_completion_date")
        if isinstance(completion_date, str):
            completion_date = datetime.fromisoformat(completion_date.replace('Z', '+00:00'))
        
        days_remaining = max(0, (completion_date - datetime.utcnow()).days) if completion_date else 0
        
        # Determine if on track (simple heuristic)
        expected_progress = min(100, (datetime.utcnow() - datetime.fromisoformat(roadmap_doc["roadmap_start_date"].replace('Z', '+00:00'))).days / 
                                   ((completion_date - datetime.fromisoformat(roadmap_doc["roadmap_start_date"].replace('Z', '+00:00'))).days or 1) * 100)
        on_track = overall_progress >= expected_progress * 0.8  # 80% of expected progress
        
        summary = ProgressSummary(
            overall_progress=overall_progress,
            completed_phases=completed_phases,
            total_phases=total_phases,
            completed_tasks=completed_tasks,
            total_tasks=total_tasks,
            days_remaining=days_remaining,
            on_track=on_track
        )
        
        return {"success": True, "summary": summary}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting progress summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get progress summary")

async def _recalculate_progress(db, user_id: str, career_path_id: str):
    """Helper function to recalculate progress percentages"""
    try:
        roadmaps_collection = db.learning_roadmaps
        roadmap_doc = await roadmaps_collection.find_one({
            "user_id": user_id,
            "career_path_id": career_path_id
        })
        
        if not roadmap_doc:
            return
        
        phases = roadmap_doc.get("phases", [])
        total_tasks = 0
        completed_tasks = 0
        
        # Update phase progress
        for phase in phases:
            phase_tasks = phase.get("tasks", [])
            phase_total = len(phase_tasks)
            phase_completed = sum(1 for task in phase_tasks if task.get("status") == TaskStatus.COMPLETED.value)
            
            phase_progress = (phase_completed / phase_total * 100) if phase_total > 0 else 0
            phase["progress_percentage"] = phase_progress
            
            # Update phase status
            if phase_completed == phase_total and phase_total > 0:
                phase["status"] = PhaseStatus.COMPLETED.value
                if not phase.get("actual_completion_date"):
                    phase["actual_completion_date"] = datetime.utcnow()
            elif phase_completed > 0:
                phase["status"] = PhaseStatus.IN_PROGRESS.value
            
            total_tasks += phase_total
            completed_tasks += phase_completed
        
        # Calculate overall progress
        overall_progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Update document
        await roadmaps_collection.update_one(
            {"user_id": user_id, "career_path_id": career_path_id},
            {
                "$set": {
                    "phases": phases,
                    "overall_progress_percentage": overall_progress,
                    "last_updated": datetime.utcnow()
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error recalculating progress: {e}")
