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
from datetime import datetime
from app.utils.security import verify_token
from app.services.learning_plan_service import LearningPlanService

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
    """Get career path recommendations for the authenticated user"""
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
        
        # Load O*NET jobs data
        onet_file = os.path.join(os.path.dirname(__file__), '..', 'career_data', 'onet_occupations_data.json')
        if not os.path.exists(onet_file):
            raise HTTPException(status_code=500, detail="Job data not found")
        
        with open(onet_file, 'r', encoding='utf-8') as f:
            jobs = json.load(f)
        
        # Load and enhance with technology skills
        tech_skills_by_job = load_technology_skills()
        jobs = enhance_jobs_with_tech(jobs, tech_skills_by_job)
        
        # Filter to relevant technical jobs
        relevant_jobs = filter_relevant_jobs(jobs)
        
        # Score occupations
        results = score_occupations(profile, relevant_jobs, top_k=10)
        
        # Extract profile information for response
        tech_skills, _ = extract_profile_tokens(profile)
        profile_summary = create_profile_summary(profile)
        
        # Convert results to response format
        recommendations = []
        for result in results:
            recommendations.append(CareerRecommendation(
                occupation_code=result['occupation_code'],
                title=result['title'],
                score=result['final_score'],
                tech_score=result['tech_score'],
                traditional_score=result['traditional_score'],
                ai_score=result['ai_score'],
                hot_tech_matches=result['tech_matches']['hot_matches'],
                regular_tech_matches=result['tech_matches']['regular_matches'],
                required_skills=result['required_matches'][:5],
                hot_technologies=result['hot_technologies'],
                explanation=f"This role matches {len(result['tech_matches']['hot_matches']) + len(result['tech_matches']['regular_matches'])} of your technical skills."
            ))
        
        return CareerRecommendationResponse(
            success=True,
            recommendations=recommendations,
            profile_summary=profile_summary,
            total_tech_skills=len(tech_skills),
            message=f"Found {len(recommendations)} relevant career recommendations"
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
    Generate personalized learning plan based on saved career path and user profile
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
        
        # Generate learning plan
        learning_plan = learning_plan_service.generate_learning_plan(profile, career_path)
        
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
