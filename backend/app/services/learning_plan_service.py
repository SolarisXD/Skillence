from typing import Dict, List, Any, Optional
import pandas as pd
import os
import logging
from datetime import datetime, timedelta
import json
from .gemini_service import GeminiService

# ML Skill Recommender (lazy-loaded singleton)
_skill_recommender = None

def _get_skill_recommender():
    """Lazily load the ML skill recommender to avoid startup overhead."""
    global _skill_recommender
    if _skill_recommender is None:
        try:
            from app.ml.inference.skill_recommender import SkillRecommender
            _skill_recommender = SkillRecommender()
            _skill_recommender.load()
        except Exception as e:
            logging.getLogger(__name__).warning(f"ML recommender unavailable: {e}")
            _skill_recommender = None
    return _skill_recommender

class LearningPlanService:
    """
    Service to generate personalized learning plans based on career path and user profile.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.skills_data = None
        self.tech_skills_data = None
        self.knowledge_data = None
        self.gemini_service = GeminiService()
        self._load_onet_data()
    
    def _load_onet_data(self):
        """Load O*NET data files for skill analysis"""
        try:
            base_path = os.path.join(os.path.dirname(__file__), '../career_data/skills_data')
            
            # Load Skills data
            skills_path = os.path.join(base_path, 'Skills.xlsx')
            if os.path.exists(skills_path):
                self.skills_data = pd.read_excel(skills_path)
                self.logger.info("Loaded Skills.xlsx successfully")
            
            # Load Technology Skills data
            tech_skills_path = os.path.join(base_path, 'Technology Skills.xlsx')
            if os.path.exists(tech_skills_path):
                self.tech_skills_data = pd.read_excel(tech_skills_path)
                self.logger.info("Loaded Technology Skills.xlsx successfully")
            
            # Load Knowledge data
            knowledge_path = os.path.join(base_path, 'Knowledge.xlsx')
            if os.path.exists(knowledge_path):
                self.knowledge_data = pd.read_excel(knowledge_path)
                self.logger.info("Loaded Knowledge.xlsx successfully")
                
        except Exception as e:
            self.logger.error(f"Error loading O*NET data: {e}")
    
    def extract_career_requirements(self, occupation_code: str) -> Dict[str, Any]:
        """Extract skill and technology requirements for a given occupation"""
        requirements = {
            "core_skills": [],
            "technical_skills": [],
            "hot_technologies": [],
            "knowledge_areas": []
        }
        
        try:
            # Extract core skills (importance > 4.0)
            if self.skills_data is not None:
                career_skills = self.skills_data[
                    (self.skills_data['O*NET-SOC Code'] == occupation_code) &
                    (self.skills_data['Scale Name'] == 'Importance') &
                    (self.skills_data['Data Value'] >= 4.0)
                ]
                requirements["core_skills"] = [
                    {
                        "skill": row['Element Name'],
                        "importance": row['Data Value'],
                        "level_required": "intermediate" if row['Data Value'] >= 4.5 else "basic"
                    }
                    for _, row in career_skills.iterrows()
                ]
            
            # Extract technology skills
            if self.tech_skills_data is not None:
                career_tech = self.tech_skills_data[
                    self.tech_skills_data['O*NET-SOC Code'] == occupation_code
                ]
                
                # Hot technologies (in-demand)
                hot_tech = career_tech[career_tech['Hot Technology'] == 'Y']
                requirements["hot_technologies"] = [
                    {
                        "technology": row['Example'],
                        "category": row['Commodity Title'],
                        "priority": "high"
                    }
                    for _, row in hot_tech.iterrows()
                ]
                
                # Regular technical skills
                regular_tech = career_tech[career_tech['Hot Technology'] != 'Y']
                requirements["technical_skills"] = [
                    {
                        "technology": row['Example'],
                        "category": row['Commodity Title'],
                        "priority": "medium"
                    }
                    for _, row in regular_tech.iterrows()
                ]
            
            # Extract knowledge areas
            if self.knowledge_data is not None:
                career_knowledge = self.knowledge_data[
                    (self.knowledge_data['O*NET-SOC Code'] == occupation_code) &
                    (self.knowledge_data['Scale Name'] == 'Importance') &
                    (self.knowledge_data['Data Value'] >= 4.0)
                ]
                requirements["knowledge_areas"] = [
                    {
                        "knowledge": row['Element Name'],
                        "importance": row['Data Value']
                    }
                    for _, row in career_knowledge.iterrows()
                ]
                
        except Exception as e:
            self.logger.error(f"Error extracting career requirements: {e}")
        
        return requirements
    
    def analyze_skill_gaps(self, user_profile: Dict[str, Any], career_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze gaps between user's current skills and career requirements with smart detection"""
        
        # Extract user's current skills
        profile_data = user_profile.get('profile_data', {})
        user_skills = profile_data.get('skills', {})
        user_technical = set(skill.lower() for skill in user_skills.get('technical', []))
        user_soft = set(skill.lower() for skill in user_skills.get('soft', []))
        
        # Extract user's technologies from projects
        user_technologies = set()
        projects = profile_data.get('projects', [])
        for project in projects:
            if isinstance(project, dict):
                techs = project.get('technologies', [])
                if isinstance(techs, list):
                    user_technologies.update(tech.lower() for tech in techs)
        
        # Combine all user technical skills for comprehensive matching
        all_user_tech_skills = user_technical | user_technologies
        
        skill_gaps = {
            "missing_core_skills": [],
            "missing_technical_skills": [],
            "missing_hot_technologies": [],
            "skill_level_gaps": [],
            "strengths": []
        }
        
        # Analyze core skills gaps
        for skill in career_requirements.get("core_skills", []):
            skill_name = skill["skill"].lower()
            # Enhanced matching - check for partial matches and synonyms
            is_matched = any(
                skill_name in user_skill or user_skill in skill_name or 
                self._are_skills_similar(skill_name, user_skill)
                for user_skill in user_soft | user_technical
            )
            
            if not is_matched:
                skill_gaps["missing_core_skills"].append({
                    "skill": skill["skill"],
                    "importance": skill["importance"],
                    "required_level": skill["level_required"],
                    "current_level": "none",
                    "priority": "high" if skill["importance"] >= 4.5 else "medium"
                })
        
        # Analyze technical skills gaps with smart filtering
        missing_tech_count = 0
        total_tech_requirements = len(career_requirements.get("technical_skills", []))
        
        for tech in career_requirements.get("technical_skills", []):
            tech_name = tech["technology"].lower()
            is_matched = any(
                tech_name in user_tech or user_tech in tech_name or
                self._are_skills_similar(tech_name, user_tech)
                for user_tech in all_user_tech_skills
            )
            
            if not is_matched:
                missing_tech_count += 1
                skill_gaps["missing_technical_skills"].append({
                    "technology": tech["technology"],
                    "category": tech["category"],
                    "priority": tech["priority"]
                })
        
        # Analyze hot technologies gaps with smart detection
        missing_hot_tech_count = 0
        total_hot_tech_requirements = len(career_requirements.get("hot_technologies", []))
        
        for hot_tech in career_requirements.get("hot_technologies", []):
            tech_name = hot_tech["technology"].lower()
            is_matched = any(
                tech_name in user_tech or user_tech in tech_name or
                self._are_skills_similar(tech_name, user_tech)
                for user_tech in all_user_tech_skills
            )
            
            if not is_matched:
                missing_hot_tech_count += 1
                skill_gaps["missing_hot_technologies"].append({
                    "technology": hot_tech["technology"],
                    "category": hot_tech["category"],
                    "priority": "critical"
                })
        
        # Smart detection: Calculate skill coverage percentage
        total_requirements = total_tech_requirements + total_hot_tech_requirements
        total_missing = missing_tech_count + missing_hot_tech_count
        
        if total_requirements > 0:
            skill_coverage = (total_requirements - total_missing) / total_requirements
            
            # Apply smart filtering based on coverage
            if skill_coverage >= 0.7:  # 70% or more skills covered
                # Reduce non-critical recommendations, focus on high-impact skills
                skill_gaps["missing_technical_skills"] = [
                    skill for skill in skill_gaps["missing_technical_skills"]
                    if skill.get("priority") in ["high", "critical"]
                ][:3]  # Limit to top 3
                
                skill_gaps["missing_hot_technologies"] = skill_gaps["missing_hot_technologies"][:2]  # Limit to top 2
                
            elif skill_coverage >= 0.5:  # 50-70% coverage
                # Moderate filtering
                skill_gaps["missing_technical_skills"] = skill_gaps["missing_technical_skills"][:5]
                skill_gaps["missing_hot_technologies"] = skill_gaps["missing_hot_technologies"][:3]
        
        # Identify strengths (matching skills) with enhanced detection
        for tech in career_requirements.get("hot_technologies", []) + career_requirements.get("technical_skills", []):
            tech_name = tech["technology"].lower()
            is_matched = any(
                tech_name in user_tech or user_tech in tech_name or
                self._are_skills_similar(tech_name, user_tech)
                for user_tech in all_user_tech_skills
            )
            
            if is_matched:
                skill_gaps["strengths"].append({
                    "technology": tech["technology"],
                    "category": tech.get("category", ""),
                    "match_type": "technology"
                })
        
        # Add core skills that match as strengths
        for skill in career_requirements.get("core_skills", []):
            skill_name = skill["skill"].lower()
            is_matched = any(
                skill_name in user_skill or user_skill in skill_name or
                self._are_skills_similar(skill_name, user_skill)
                for user_skill in user_soft | user_technical
            )
            
            if is_matched:
                skill_gaps["strengths"].append({
                    "skill": skill["skill"],
                    "match_type": "core_skill",
                    "importance": skill["importance"]
                })
        
        return skill_gaps
    
    def _are_skills_similar(self, skill1: str, skill2: str) -> bool:
        """Check if two skills are similar using common patterns and synonyms"""
        # Common technology synonyms and variations
        synonyms = {
            'javascript': ['js', 'node', 'nodejs'],
            'python': ['py'],
            'react': ['reactjs', 'react.js'],
            'angular': ['angularjs'],
            'vue': ['vuejs', 'vue.js'],
            'database': ['db', 'sql', 'nosql'],
            'machine learning': ['ml', 'ai', 'artificial intelligence'],
            'deep learning': ['dl', 'neural networks'],
            'data science': ['ds', 'analytics'],
            'web development': ['frontend', 'backend', 'full stack'],
            'cloud computing': ['aws', 'azure', 'gcp', 'cloud'],
            'devops': ['ci/cd', 'deployment', 'automation']
        }
        
        skill1_lower = skill1.lower().strip()
        skill2_lower = skill2.lower().strip()
        
        # Exact match
        if skill1_lower == skill2_lower:
            return True
        
        # Check synonyms
        for main_skill, variations in synonyms.items():
            if (skill1_lower == main_skill and skill2_lower in variations) or \
               (skill2_lower == main_skill and skill1_lower in variations) or \
               (skill1_lower in variations and skill2_lower in variations):
                return True
        
        # Check partial matches for compound terms
        skill1_words = set(skill1_lower.split())
        skill2_words = set(skill2_lower.split())
        
        if len(skill1_words) > 1 or len(skill2_words) > 1:
            # Check for significant overlap in multi-word skills
            overlap = skill1_words & skill2_words
            if overlap and len(overlap) >= min(len(skill1_words), len(skill2_words)) * 0.6:
                return True
        
        return False
    
    def generate_learning_roadmap(self, skill_gaps: Dict[str, Any], user_experience_level: str = "intermediate") -> Dict[str, Any]:
        """Generate a phased learning roadmap based on skill gaps"""
        
        roadmap = {
            "phases": [],
            "total_duration": "12 months",
            "estimated_hours_per_week": 10 if user_experience_level == "beginner" else 8
        }
        
        # Phase 1: Foundation (0-3 months)
        phase1_skills = []
        phase1_skills.extend(skill_gaps.get("missing_core_skills", [])[:3])  # Top 3 core skills
        
        phase1 = {
            "phase_number": 1,
            "title": "Foundation Phase",
            "duration": "3 months",
            "description": "Build essential skills and knowledge base",
            "skills_to_learn": phase1_skills,
            "learning_resources": self._generate_learning_resources(phase1_skills, "foundation"),
            "milestones": [
                "Complete fundamental skill courses",
                "Build first practice project",
                "Understand core concepts"
            ]
        }
        roadmap["phases"].append(phase1)
        
        # Phase 2: Technical Development (3-6 months)
        phase2_skills = []
        phase2_skills.extend(skill_gaps.get("missing_technical_skills", [])[:4])  # Top 4 technical skills
        
        phase2 = {
            "phase_number": 2,
            "title": "Technical Development",
            "duration": "3 months", 
            "description": "Develop technical competencies and practical skills",
            "skills_to_learn": phase2_skills,
            "learning_resources": self._generate_learning_resources(phase2_skills, "intermediate"),
            "milestones": [
                "Master key technical tools",
                "Complete intermediate projects",
                "Build portfolio pieces"
            ]
        }
        roadmap["phases"].append(phase2)
        
        # Phase 3: Specialization (6-12 months)
        phase3_skills = []
        phase3_skills.extend(skill_gaps.get("missing_hot_technologies", [])[:3])  # Top 3 hot technologies
        
        phase3 = {
            "phase_number": 3,
            "title": "Specialization & Mastery",
            "duration": "6 months",
            "description": "Master in-demand technologies and advanced concepts",
            "skills_to_learn": phase3_skills,
            "learning_resources": self._generate_learning_resources(phase3_skills, "advanced"),
            "milestones": [
                "Obtain relevant certifications",
                "Complete capstone project",
                "Build job-ready portfolio"
            ]
        }
        roadmap["phases"].append(phase3)
        
        return roadmap
    
    def _generate_learning_resources(self, skills: List[Dict[str, Any]], level: str) -> List[Dict[str, Any]]:
        """Generate learning resources for specific skills and level"""
        resources = []
        
        # Resource mapping based on common technologies and skills
        resource_map = {
            "foundation": {
                "courses": [
                    {"title": "CS50's Introduction to Computer Science", "provider": "Harvard/edX", "duration": "12 weeks", "type": "course"},
                    {"title": "Professional Skills Development", "provider": "Coursera", "duration": "4 weeks", "type": "course"}
                ],
                "books": [
                    {"title": "Clean Code", "author": "Robert Martin", "type": "book"},
                    {"title": "The Pragmatic Programmer", "author": "Hunt & Thomas", "type": "book"}
                ]
            },
            "intermediate": {
                "courses": [
                    {"title": "Full Stack Web Development", "provider": "Coursera", "duration": "6 weeks", "type": "course"},
                    {"title": "Data Structures and Algorithms", "provider": "edX", "duration": "8 weeks", "type": "course"}
                ],
                "practice": [
                    {"title": "Build a Portfolio Website", "platform": "Personal Project", "duration": "2 weeks", "type": "project"},
                    {"title": "HackerRank Problem Solving", "platform": "HackerRank", "duration": "ongoing", "type": "practice"}
                ]
            },
            "advanced": {
                "certifications": [
                    {"title": "AWS Cloud Practitioner", "provider": "Amazon", "duration": "4 weeks", "type": "certification"},
                    {"title": "Google Cloud Professional", "provider": "Google", "duration": "6 weeks", "type": "certification"}
                ],
                "projects": [
                    {"title": "Full-Stack Application", "platform": "GitHub", "duration": "4 weeks", "type": "project"},
                    {"title": "Open Source Contribution", "platform": "GitHub", "duration": "ongoing", "type": "project"}
                ]
            }
        }
        
        # Add level-appropriate resources
        level_resources = resource_map.get(level, resource_map["intermediate"])
        for category, items in level_resources.items():
            resources.extend(items)
        
        return resources[:5]  # Limit to 5 resources per phase
    
    def generate_learning_plan(self, user_profile: Dict[str, Any], career_path: Dict[str, Any]) -> Dict[str, Any]:
        """Generate complete personalized learning plan using ML recommendations + Gemini AI."""
        try:
            occupation_code = career_path.get("occupation_code", "")
            career_title = career_path.get("title", "")
            
            # Extract O*NET career requirements for reference
            onet_requirements = self.extract_career_requirements(occupation_code)
            
            # ── ML Skill Recommender Integration ──
            ml_recommendations = []
            recommender = _get_skill_recommender()
            if recommender and recommender.is_loaded:
                try:
                    # Collect user's current skills
                    profile_data = user_profile.get("profile_data", {})
                    user_skills_obj = profile_data.get("skills", {})
                    current_skills = list(user_skills_obj.get("technical", []))
                    # Also pull skills from projects
                    for proj in profile_data.get("projects", []):
                        if isinstance(proj, dict):
                            current_skills.extend(proj.get("technologies", []))
                    current_skills = list(set(s.strip() for s in current_skills if s.strip()))

                    ml_recommendations = recommender.recommend(
                        current_skills=current_skills,
                        target_occupation_code=occupation_code,
                        top_k=20,
                    )
                    self.logger.info(
                        f"ML recommender returned {len(ml_recommendations)} skill suggestions "
                        f"(from {len(current_skills)} user skills)"
                    )
                except Exception as ml_err:
                    self.logger.warning(f"ML recommender failed, continuing without it: {ml_err}")

            # Inject ML recommendations into O*NET requirements so Gemini sees them
            if ml_recommendations:
                onet_requirements["ml_recommended_skills"] = [
                    {"skill": r["skill"], "confidence": r["confidence"], "source": r["source"]}
                    for r in ml_recommendations
                ]

            # Generate enhanced learning plan using Gemini AI
            gemini_plan = self.gemini_service.generate_learning_plan(career_title, user_profile, onet_requirements)
            
            # Extract AI-generated skill descriptions (for ML/O*NET skills)
            ai_skill_descriptions = {}
            if gemini_plan:
                ai_skill_descriptions = gemini_plan.get("skill_descriptions", {})

            # If Gemini plan is successful, use it; otherwise fall back to original logic
            if gemini_plan and not gemini_plan.get("fallback", False):
                # Transform Gemini response to match our expected format
                learning_plan = self._transform_gemini_plan(gemini_plan, career_title, occupation_code, user_profile)
            else:
                # Fallback to original logic if Gemini fails
                self.logger.warning("Using fallback learning plan generation")
                skill_gaps = self.analyze_skill_gaps(user_profile, onet_requirements)
                roadmap = self.generate_learning_roadmap(skill_gaps)
                learning_plan = self._create_original_format_plan(career_title, occupation_code, skill_gaps, roadmap)
            
            # Attach ML recommendations to the final plan for frontend display
            if ml_recommendations:
                learning_plan["ml_skill_recommendations"] = ml_recommendations
                learning_plan["ml_powered"] = True
            else:
                learning_plan["ml_powered"] = False
            
            # ── Merge ML recommendations into priority_skills for unified display ──
            self._merge_ml_into_priority_skills(learning_plan, ml_recommendations, onet_requirements, user_profile, ai_skill_descriptions)
            
            return learning_plan
            
        except Exception as e:
            self.logger.error(f"Error generating learning plan: {e}")
            return {
                "error": "Failed to generate learning plan",
                "career_info": {"title": career_path.get("title", ""), "occupation_code": career_path.get("occupation_code", "")},
                "skill_gaps": {"missing_core_skills": [], "missing_technical_skills": [], "missing_hot_technologies": [], "strengths": []},
                "learning_roadmap": {"phases": []},
                "generated_at": datetime.utcnow().isoformat()
            }
    
    # ── Generic / non-actionable skills to filter out ──
    _GENERIC_SKILLS = {
        "mathematics", "math", "statistics", "english", "communication",
        "writing", "reading", "comprehension", "critical thinking",
        "problem solving", "active listening", "speaking", "monitoring",
        "social perceptiveness", "coordination", "time management",
        "judgment and decision making", "complex problem solving",
        "science", "instructing", "learning strategies",
    }

    def _merge_ml_into_priority_skills(
        self,
        learning_plan: Dict[str, Any],
        ml_recommendations: List[Dict],
        onet_requirements: Dict[str, Any],
        user_profile: Dict[str, Any],
        ai_skill_descriptions: Dict[str, str] = None,
    ) -> None:
        """Merge ML recommendations and O*NET hot technologies into a single
        unified ``priority_skills`` list inside ``skill_analysis``. This
        replaces the need for a separate ML section on the frontend.
        
        The result is a combined list capped at 12 items with attributes:
          - skill (str)
          - priority: critical | high | medium
          - reason (str)  — AI-generated description when available
          - confidence (float, 0-1, for ML items)
        """
        if ai_skill_descriptions is None:
            ai_skill_descriptions = {}

        # Build a case-insensitive lookup for AI descriptions
        desc_lookup = {k.lower(): v for k, v in ai_skill_descriptions.items()}
        skill_analysis = learning_plan.get("skill_analysis", {})
        existing_priority = list(skill_analysis.get("priority_skills", []))

        # Collect user's known skills to filter them out
        pd = user_profile.get("profile_data", {})
        user_skills_raw = set()
        for s in pd.get("skills", {}).get("technical", []):
            user_skills_raw.add(str(s).strip().lower())
        for proj in pd.get("projects", []):
            if isinstance(proj, dict):
                for t in proj.get("technologies", []):
                    user_skills_raw.add(str(t).strip().lower())

        # Tag existing Gemini skills with source
        seen_skills = set()
        unified: List[Dict] = []
        for sk in existing_priority:
            name = (sk.get("skill") or sk.get("technology") or "").strip()
            if not name or name.lower() in self._GENERIC_SKILLS:
                continue
            if name.lower() in user_skills_raw:
                continue
            # Use AI description if available, keep existing reason otherwise
            if name.lower() in desc_lookup:
                sk["reason"] = desc_lookup[name.lower()]
            unified.append(sk)
            seen_skills.add(name.lower())

        # Add O*NET hot technologies not already present
        for ht in onet_requirements.get("hot_technologies", []):
            name = ht.get("technology", "").strip()
            if not name or name.lower() in seen_skills or name.lower() in user_skills_raw:
                continue
            if name.lower() in self._GENERIC_SKILLS:
                continue
            reason = desc_lookup.get(name.lower(), f"High-demand technology for {name} professionals")
            unified.append({
                "skill": name,
                "priority": "critical",
                "reason": reason,
            })
            seen_skills.add(name.lower())

        # Add ML recommendations not already present
        if ml_recommendations:
            for rec in ml_recommendations:
                name = rec.get("skill", "").strip()
                if not name or name.lower() in seen_skills or name.lower() in user_skills_raw:
                    continue
                if name.lower() in self._GENERIC_SKILLS:
                    continue
                confidence = rec.get("confidence", 0)
                priority = "high" if confidence >= 0.15 else "medium"
                reason = desc_lookup.get(name.lower(), f"Strongly correlated with success in this role")
                unified.append({
                    "skill": name,
                    "priority": priority,
                    "reason": reason,
                    "confidence": confidence,
                })
                seen_skills.add(name.lower())

        # Sort: critical first, then high, then medium; within same priority by confidence desc
        priority_order = {"critical": 0, "high": 1, "medium": 2}
        unified.sort(key=lambda x: (priority_order.get(x.get("priority", "medium"), 2), -(x.get("confidence", 0.5))))

        # Cap at 12 items
        unified = unified[:12]

        # Update the plan
        skill_analysis["priority_skills"] = unified
        skill_analysis["total_gaps"] = len(unified)
        learning_plan["skill_analysis"] = skill_analysis

    def _transform_gemini_plan(self, gemini_plan: Dict[str, Any], career_title: str, occupation_code: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Gemini plan to match our frontend expectations"""
        skill_analysis = gemini_plan.get("skill_analysis", {})
        roadmap_data = gemini_plan.get("learning_roadmap", {})
        
        # Transform skill gaps
        skill_gaps = {
            "missing_core_skills": [],
            "missing_technical_skills": [],
            "missing_hot_technologies": skill_analysis.get("critical_missing_skills", []),
            "skill_level_gaps": skill_analysis.get("recommended_improvements", []),
            "strengths": skill_analysis.get("current_strengths", [])
        }
        
        # Transform roadmap phases
        phases = []
        for phase_key in ["phase_1", "phase_2", "phase_3"]:
            phase_data = roadmap_data.get(phase_key, {})
            if phase_data:
                # Transform learning resources to match expected format
                resources = []
                for resource in phase_data.get("learning_resources", []):
                    resources.append({
                        "title": resource.get("title", ""),
                        "provider": resource.get("provider", ""),
                        "platform": resource.get("provider", ""),
                        "duration": resource.get("duration", ""),
                        "type": resource.get("type", "course"),
                        "difficulty": resource.get("difficulty", "intermediate"),
                        "url": resource.get("url", "")
                    })
                
                # Add projects as resources
                for project in phase_data.get("projects", []):
                    resources.append({
                        "title": project.get("title", ""),
                        "provider": "Personal Project",
                        "platform": "Self-guided",
                        "duration": "2-4 weeks",  
                        "type": "project",
                        "description": project.get("description", ""),
                        "skills_practiced": project.get("skills_practiced", [])
                    })
                
                phase = {
                    "phase_number": len(phases) + 1,
                    "title": phase_data.get("title", f"Phase {len(phases) + 1}"),
                    "duration": phase_data.get("duration", "3 months"),
                    "description": phase_data.get("description", ""),
                    "skills_to_learn": [{"skill": skill} for skill in phase_data.get("skills_focus", [])],
                    "learning_resources": resources,
                    "milestones": phase_data.get("milestones", [])
                }
                phases.append(phase)
        
        # Create final learning plan
        learning_plan = {
            "career_info": {
                "title": career_title,
                "occupation_code": occupation_code
            },
            "skill_analysis": {
                "total_gaps": len(skill_gaps.get("missing_hot_technologies", [])) + len(skill_gaps.get("skill_level_gaps", [])),
                "strengths_count": len(skill_gaps.get("strengths", [])),
                "priority_skills": skill_gaps.get("missing_hot_technologies", [])[:6]
            },
            "skill_gaps": skill_gaps,
            "learning_roadmap": {
                "phases": phases,
                "total_duration": gemini_plan.get("estimated_timeline", "12 months"),
                "estimated_hours_per_week": gemini_plan.get("weekly_commitment", "10-15 hours per week")
            },
            "generated_at": datetime.utcnow().isoformat(),
            "estimated_completion": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "ai_generated": True
        }
        
        return learning_plan
    
    def _create_original_format_plan(self, career_title: str, occupation_code: str, skill_gaps: Dict[str, Any], roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """Create learning plan in original format for fallback"""
        return {
            "career_info": {
                "title": career_title,
                "occupation_code": occupation_code
            },
            "skill_analysis": {
                "total_gaps": len(skill_gaps.get("missing_core_skills", [])) + 
                            len(skill_gaps.get("missing_technical_skills", [])) + 
                            len(skill_gaps.get("missing_hot_technologies", [])),
                "strengths_count": len(skill_gaps.get("strengths", [])),
                "priority_skills": (skill_gaps.get("missing_hot_technologies", [])[:3] + 
                                  skill_gaps.get("missing_core_skills", [])[:3])
            },
            "skill_gaps": skill_gaps,
            "learning_roadmap": roadmap,
            "generated_at": datetime.utcnow().isoformat(),
            "estimated_completion": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "ai_generated": False
        }
