import requests
import json
import re
import os
from typing import Dict, List, Any, Optional
import logging

class GeminiService:
    """
    Service to generate enhanced learning recommendations using Gemini API
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.api_key = os.getenv('GEMINI_API')
        self.endpoint = os.getenv('GEMINI_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')
        
        if not self.api_key:
            self.logger.error("GEMINI_API key not found in environment variables")
    
    def generate_learning_plan(self, career_title: str, user_profile: Dict[str, Any], onet_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an enhanced learning plan using Gemini API
        """
        try:
            # Extract user's current skills
            profile_data = user_profile.get('profile_data', {})
            user_skills = profile_data.get('skills', {})
            current_technical_skills = user_skills.get('technical', [])
            current_soft_skills = user_skills.get('soft', [])
            
            # Extract experience level from profile
            experience = profile_data.get('experience', [])
            experience_years = len(experience) if experience else 0
            
            # Create prompt for Gemini
            prompt = self._create_learning_plan_prompt(
                career_title, 
                current_technical_skills, 
                current_soft_skills, 
                experience_years,
                onet_data
            )
            
            # Call Gemini API
            response = self._call_gemini_api(prompt)
            
            if response:
                return self._parse_gemini_response(response)
            else:
                return self._create_fallback_plan(career_title, current_technical_skills)
                
        except Exception as e:
            self.logger.error(f"Error generating learning plan with Gemini: {e}")
            return self._create_fallback_plan(career_title, current_technical_skills)
    
    def _create_learning_plan_prompt(self, career_title: str, technical_skills: List[str], 
                                   soft_skills: List[str], experience_years: int, 
                                   onet_data: Dict[str, Any]) -> str:
        """
        Create a detailed prompt for Gemini to generate learning plan
        """
        # Collect skill names that need AI-generated descriptions
        skills_needing_descriptions = []
        for ht in onet_data.get("hot_technologies", []):
            name = ht.get("technology", "").strip()
            if name:
                skills_needing_descriptions.append(name)
        for rec in onet_data.get("ml_recommended_skills", []):
            name = rec.get("skill", "").strip()
            if name and name not in skills_needing_descriptions:
                skills_needing_descriptions.append(name)
        # Cap to avoid prompt bloat
        skills_needing_descriptions = skills_needing_descriptions[:20]

        skills_desc_section = ""
        skills_desc_schema = ""
        if skills_needing_descriptions:
            skills_list_str = ", ".join(skills_needing_descriptions)
            skills_desc_section = f"""
        **Additional Skills Context:**
        The following skills have been identified as important for the {career_title} role through industry data analysis: {skills_list_str}
        For each skill above, provide a brief professional reason (1 sentence, max 15 words) explaining why it matters for this role. Include these in the "skill_descriptions" field below.
        """
            skills_desc_schema = """
            "skill_descriptions": {{"skill_name": "Brief reason why this skill matters for the role"}},"""

        prompt = f"""
        You are a career development expert. Create a comprehensive, personalized learning plan for someone pursuing a {career_title} role.

        **Current Profile:**
        - Technical Skills: {', '.join(technical_skills) if technical_skills else 'None specified'}
        - Soft Skills: {', '.join(soft_skills) if soft_skills else 'None specified'}
        - Experience Level: {experience_years} years

        **Requirements:**
        1. Analyze the skill gaps for a modern {career_title} role
        2. Create a 3-phase learning roadmap (Foundation → Technical Development → Specialization)
        3. Focus on industry-relevant, high-demand skills for 2024-2025
        4. Provide specific, actionable learning resources
        5. Include realistic timelines and milestones
        {skills_desc_section}
        **Please respond in the following JSON format:**
        {{
            "skill_analysis": {{
                "critical_missing_skills": [
                    {{"skill": "skill_name", "priority": "critical|high|medium", "reason": "why this skill is important"}}
                ],
                "recommended_improvements": [
                    {{"skill": "existing_skill_to_improve", "current_level": "beginner|intermediate|advanced", "target_level": "intermediate|advanced|expert"}}
                ],
                "current_strengths": [
                    {{"skill": "strength_name", "relevance": "how this helps in the role"}}
                ]
            }},
            "learning_roadmap": {{
                "phase_1": {{
                    "title": "Foundation Phase",
                    "duration": "2-4 months",
                    "description": "Brief description",
                    "skills_focus": ["skill1", "skill2", "skill3"],
                    "learning_resources": [
                        {{"title": "Resource Title", "type": "course|book|certification|project", "provider": "Provider Name", "duration": "X weeks", "url": "optional_url", "difficulty": "beginner|intermediate|advanced"}}
                    ],
                    "projects": [
                        {{"title": "Project Name", "description": "What to build", "skills_practiced": ["skill1", "skill2"]}}
                    ],
                    "milestones": ["milestone1", "milestone2"]
                }},
                "phase_2": {{
                    "title": "Technical Development",
                    "duration": "3-6 months",
                    "description": "Brief description",
                    "skills_focus": ["skill1", "skill2", "skill3"],
                    "learning_resources": [
                        {{"title": "Resource Title", "type": "course|book|certification|project", "provider": "Provider Name", "duration": "X weeks", "url": "optional_url", "difficulty": "intermediate|advanced"}}
                    ],
                    "projects": [
                        {{"title": "Project Name", "description": "What to build", "skills_practiced": ["skill1", "skill2"]}}
                    ],
                    "milestones": ["milestone1", "milestone2"]
                }},
                "phase_3": {{
                    "title": "Specialization & Mastery",
                    "duration": "4-8 months",
                    "description": "Brief description",
                    "skills_focus": ["skill1", "skill2", "skill3"],
                    "learning_resources": [
                        {{"title": "Resource Title", "type": "course|book|certification|project", "provider": "Provider Name", "duration": "X weeks", "url": "optional_url", "difficulty": "advanced|expert"}}
                    ],
                    "projects": [
                        {{"title": "Project Name", "description": "What to build", "skills_practiced": ["skill1", "skill2"]}}
                    ],
                    "milestones": ["milestone1", "milestone2"]
                }}
            }},
            "estimated_timeline": "9-18 months",
            "weekly_commitment": "8-15 hours per week",{skills_desc_schema}
        }}

        Focus on modern, industry-relevant skills. For software development roles, prioritize current technologies like React, Node.js, Python, cloud platforms, etc. Avoid outdated or irrelevant tools.
        """
        
        return prompt
    
    def _call_gemini_api(self, prompt: str) -> Optional[str]:
        """
        Make API call to Gemini
        """
        try:
            headers = {
                'Content-Type': 'application/json',
            }
            
            # Construct URL with API key
            url = f"{self.endpoint}?key={self.api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 8192,
                    "responseMimeType": "application/json",
                }
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    return content
                else:
                    self.logger.error("No candidates in Gemini response")
                    return None
            else:
                self.logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error calling Gemini API: {e}")
            return None
    
    def _parse_gemini_response(self, response: str) -> Dict[str, Any]:
        """
        Parse Gemini's JSON response with multi-strategy error handling
        """
        # Strategy 1: Direct parse (works when responseMimeType=application/json)
        try:
            parsed = json.loads(response)
            return parsed
        except json.JSONDecodeError:
            pass

        # Strategy 2: Extract JSON block from markdown/text wrapper
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = response[start:end]
                parsed = json.loads(json_str)
                return parsed
        except json.JSONDecodeError:
            pass

        # Strategy 3: Clean common issues then parse
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                json_str = self._clean_json_string(json_str)
                parsed = json.loads(json_str)
                return parsed
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parsing Gemini JSON response: {e}")

        # Strategy 4: Try to repair truncated JSON by closing brackets
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = self._clean_json_string(response[start:end])
                json_str = self._repair_truncated_json(json_str)
                parsed = json.loads(json_str)
                return parsed
        except json.JSONDecodeError:
            pass

        self.logger.error("All JSON parsing strategies failed")
        self.logger.warning("Using fallback learning plan generation")
        return {}
    
    def _clean_json_string(self, json_str: str) -> str:
        """
        Clean common JSON formatting issues in Gemini responses
        """
        # Remove any non-JSON content at the beginning or end
        json_str = json_str.strip()
        
        # Remove markdown code blocks if present
        json_str = re.sub(r'^```json\s*', '', json_str)
        json_str = re.sub(r'\s*```$', '', json_str)
        
        # Remove single-line comments (// ...)
        json_str = re.sub(r'//[^\n]*', '', json_str)
        
        # Remove any trailing commas before closing brackets/braces
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix missing commas between array elements:  }  {  →  },  {
        json_str = re.sub(r'}\s*\n\s*{', r'},\n{', json_str)
        
        # Fix missing commas: ]  "key" → ],  "key"
        json_str = re.sub(r'(\])\s*\n(\s*")', r'\1,\n\2', json_str)
        
        # Fix missing commas: }  "key" → },  "key"
        json_str = re.sub(r'(})\s*\n(\s*")', r'\1,\n\2', json_str)
        
        # Remove duplicate commas
        json_str = re.sub(r',,+', r',', json_str)
        
        return json_str
    
    def _repair_truncated_json(self, json_str: str) -> str:
        """Attempt to close unclosed brackets/braces in truncated JSON."""
        open_braces = json_str.count('{') - json_str.count('}')
        open_brackets = json_str.count('[') - json_str.count(']')
        
        # Remove trailing comma
        json_str = json_str.rstrip()
        if json_str.endswith(','):
            json_str = json_str[:-1]
        
        # Close any unclosed strings
        in_string = False
        escape_next = False
        for ch in json_str:
            if escape_next:
                escape_next = False
                continue
            if ch == '\\':
                escape_next = True
                continue
            if ch == '"':
                in_string = not in_string
        if in_string:
            json_str += '"'
        
        json_str += ']' * max(0, open_brackets)
        json_str += '}' * max(0, open_braces)
        
        return json_str
    
    def _create_fallback_plan(self, career_title: str, current_skills: List[str]) -> Dict[str, Any]:
        """
        Create a basic fallback learning plan if Gemini fails
        """
        return {
            "skill_analysis": {
                "critical_missing_skills": [
                    {"skill": "Modern Programming Languages", "priority": "critical", "reason": "Core requirement for the role"},
                    {"skill": "System Design", "priority": "high", "reason": "Essential for senior roles"},
                    {"skill": "Cloud Technologies", "priority": "high", "reason": "Industry standard"}
                ],
                "current_strengths": [
                    {"technology": str(skill).strip(), "relevance": "Existing competency"} 
                    for skill in current_skills[:5] if skill and str(skill).strip()
                ]
            },
            "learning_roadmap": {
                "phase_1": {
                    "title": "Foundation Phase",
                    "duration": "2-4 months",
                    "description": "Build core programming and development skills",
                    "skills_focus": ["Programming Fundamentals", "Data Structures", "Algorithms"],
                    "learning_resources": [
                        {"title": "CS Fundamentals Course", "type": "course", "provider": "Online Platform", "duration": "8 weeks", "difficulty": "beginner"}
                    ],
                    "projects": [
                        {"title": "Basic Calculator App", "description": "Build a simple calculator", "skills_practiced": ["Programming", "Logic"]}
                    ],
                    "milestones": ["Complete fundamental concepts", "Build first project"]
                },
                "phase_2": {
                    "title": "Technical Development",
                    "duration": "3-6 months",
                    "description": "Develop practical development skills",
                    "skills_focus": ["Web Development", "Database Design", "API Development"],
                    "learning_resources": [
                        {"title": "Full Stack Development", "type": "course", "provider": "Online Platform", "duration": "12 weeks", "difficulty": "intermediate"}
                    ],
                    "projects": [
                        {"title": "Web Application", "description": "Build a full-stack web app", "skills_practiced": ["Frontend", "Backend", "Database"]}
                    ],
                    "milestones": ["Master web technologies", "Deploy applications"]
                },
                "phase_3": {
                    "title": "Specialization",
                    "duration": "4-8 months",
                    "description": "Advanced topics and specialization",
                    "skills_focus": ["Cloud Computing", "DevOps", "System Architecture"],
                    "learning_resources": [
                        {"title": "Cloud Certification", "type": "certification", "provider": "AWS/Azure", "duration": "6 weeks", "difficulty": "advanced"}
                    ],
                    "projects": [
                        {"title": "Scalable System", "description": "Design and build a scalable application", "skills_practiced": ["Architecture", "Scalability"]}
                    ],
                    "milestones": ["Obtain certifications", "Build portfolio"]
                }
            },
            "estimated_timeline": "9-18 months",
            "weekly_commitment": "10-15 hours per week",
            "fallback": True
        }
