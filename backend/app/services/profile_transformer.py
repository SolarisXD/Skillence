from typing import Dict, Any, List, Union
import logging

class ProfileTransformer:
    """
    Service to transform profile data between different formats.
    Handles conversion between frontend form data and database storage format.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def normalize_contact_info(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize contact information data.
        """
        return {
            "name": contact_data.get("name", "").strip(),
            "email": contact_data.get("email", "").strip().lower(),
            "phone": contact_data.get("phone", "").strip(),
            "location": contact_data.get("location", "").strip(),
            "linkedin": contact_data.get("linkedin", "").strip(),
            "website": contact_data.get("website", "").strip()
        }
    
    def normalize_experience(self, experience_data: Union[List[Dict], List[str]]) -> List[Dict[str, Any]]:
        """
        Normalize work experience data.
        """
        if not experience_data:
            return []
        
        normalized = []
        for exp in experience_data:
            if isinstance(exp, dict):
                normalized_exp = {
                    "title": exp.get("title", "").strip(),
                    "company": exp.get("company", "").strip(),
                    "duration": exp.get("duration", "").strip(),
                    "location": exp.get("location", "").strip(),
                    "responsibilities": self._normalize_list_field(exp.get("responsibilities", []))
                }
                # Only add if at least title and company are provided
                if normalized_exp["title"] and normalized_exp["company"]:
                    normalized.append(normalized_exp)
            elif isinstance(exp, str) and exp.strip():
                # Handle string format (legacy or manual entry)
                normalized.append({"description": exp.strip()})
        
        return normalized
    
    def normalize_education(self, education_data: Union[List[Dict], List[str]]) -> List[Dict[str, Any]]:
        """
        Normalize education data.
        """
        if not education_data:
            return []
        
        normalized = []
        for edu in education_data:
            if isinstance(edu, dict):
                normalized_edu = {
                    "degree": edu.get("degree", "").strip(),
                    "institution": edu.get("institution", "").strip(),
                    "year": edu.get("year", "").strip(),
                    "gpa": edu.get("gpa", "").strip(),
                    "location": edu.get("location", "").strip(),
                    "details": edu.get("details", "").strip()
                }
                # Only add if at least degree and institution are provided
                if normalized_edu["degree"] and normalized_edu["institution"]:
                    normalized.append(normalized_edu)
            elif isinstance(edu, str) and edu.strip():
                # Handle string format
                normalized.append({"description": edu.strip()})
        
        return normalized
    
    def normalize_skills(self, skills_data: Union[List[str], List[Dict], str]) -> List[str]:
        """
        Normalize skills data.
        """
        if not skills_data:
            return []
        
        if isinstance(skills_data, str):
            # Handle comma-separated or newline-separated string
            skills = []
            for delimiter in ['\n', ',', ';']:
                if delimiter in skills_data:
                    skills = [skill.strip() for skill in skills_data.split(delimiter)]
                    break
            if not skills:
                skills = [skills_data.strip()]
            return [skill for skill in skills if skill]
        
        elif isinstance(skills_data, list):
            normalized_skills = []
            for skill in skills_data:
                if isinstance(skill, str):
                    normalized_skills.append(skill.strip())
                elif isinstance(skill, dict):
                    # Handle object format (e.g., {name: "Python", level: "Expert"})
                    skill_name = skill.get("name", skill.get("skill", "")).strip()
                    if skill_name:
                        normalized_skills.append(skill_name)
            return [skill for skill in normalized_skills if skill]
        
        return []
    
    def normalize_projects(self, projects_data: Union[List[Dict], List[str]]) -> List[Dict[str, Any]]:
        """
        Normalize projects data.
        """
        if not projects_data:
            return []
        
        normalized = []
        for project in projects_data:
            if isinstance(project, dict):
                normalized_project = {
                    "name": project.get("name", "").strip(),
                    "description": project.get("description", "").strip(),
                    "technologies": self._normalize_list_field(project.get("technologies", [])),
                    "link": project.get("link", "").strip(),
                    "duration": project.get("duration", "").strip(),
                    "role": project.get("role", "").strip()
                }
                # Only add if at least name is provided
                if normalized_project["name"]:
                    normalized.append(normalized_project)
            elif isinstance(project, str) and project.strip():
                normalized.append({"description": project.strip()})
        
        return normalized
    
    def normalize_certifications(self, certifications_data: Union[List[Dict], List[str]]) -> List[Dict[str, Any]]:
        """
        Normalize certifications data.
        """
        if not certifications_data:
            return []
        
        normalized = []
        for cert in certifications_data:
            if isinstance(cert, dict):
                normalized_cert = {
                    "name": cert.get("name", "").strip(),
                    "issuer": cert.get("issuer", "").strip(),
                    "date": cert.get("date", "").strip(),
                    "id": cert.get("id", "").strip(),
                    "link": cert.get("link", "").strip(),
                    "expiry": cert.get("expiry", "").strip()
                }
                # Only add if at least name is provided
                if normalized_cert["name"]:
                    normalized.append(normalized_cert)
            elif isinstance(cert, str) and cert.strip():
                normalized.append({"name": cert.strip()})
        
        return normalized
    
    def normalize_achievements(self, achievements_data: Union[List[Dict], List[str]]) -> List[Dict[str, Any]]:
        """
        Normalize achievements data.
        """
        if not achievements_data:
            return []
        
        normalized = []
        for achievement in achievements_data:
            if isinstance(achievement, dict):
                normalized_achievement = {
                    "title": achievement.get("title", "").strip(),
                    "description": achievement.get("description", "").strip(),
                    "date": achievement.get("date", "").strip(),
                    "organization": achievement.get("organization", "").strip()
                }
                # Only add if at least title is provided
                if normalized_achievement["title"]:
                    normalized.append(normalized_achievement)
            elif isinstance(achievement, str) and achievement.strip():
                normalized.append({"title": achievement.strip()})
        
        return normalized
    
    def _normalize_list_field(self, field_data: Union[List, str]) -> List[str]:
        """
        Helper method to normalize list fields (like responsibilities, technologies).
        """
        if not field_data:
            return []
        
        if isinstance(field_data, str):
            # Handle comma-separated or newline-separated string
            items = []
            for delimiter in ['\n', ',', ';']:
                if delimiter in field_data:
                    items = [item.strip() for item in field_data.split(delimiter)]
                    break
            if not items:
                items = [field_data.strip()]
            return [item for item in items if item]
        
        elif isinstance(field_data, list):
            return [str(item).strip() for item in field_data if str(item).strip()]
        
        return []
    
    def transform_profile_data(self, raw_profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform raw profile data from frontend into normalized format for database storage.
        """
        try:
            transformed = {}
            
            # Transform each section
            for section_name, section_data in raw_profile_data.items():
                if section_name == "contact_info":
                    transformed[section_name] = self.normalize_contact_info(section_data)
                elif section_name == "experience":
                    transformed[section_name] = self.normalize_experience(section_data)
                elif section_name == "education":
                    transformed[section_name] = self.normalize_education(section_data)
                elif section_name == "skills":
                    transformed[section_name] = self.normalize_skills(section_data)
                elif section_name == "projects":
                    transformed[section_name] = self.normalize_projects(section_data)
                elif section_name == "certifications":
                    transformed[section_name] = self.normalize_certifications(section_data)
                elif section_name == "achievements":
                    transformed[section_name] = self.normalize_achievements(section_data)
                else:
                    # Handle custom sections or unknown fields
                    if isinstance(section_data, str):
                        transformed[section_name] = section_data.strip()
                    else:
                        transformed[section_name] = section_data
            
            self.logger.info(f"Successfully transformed profile data with {len(transformed)} sections")
            return transformed
            
        except Exception as e:
            self.logger.error(f"Error transforming profile data: {e}")
            # Return original data if transformation fails
            return raw_profile_data
    
    def create_empty_profile(self) -> Dict[str, Any]:
        """
        Create an empty profile structure with all sections.
        """
        return {
            "contact_info": {
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "website": ""
            },
            "experience": [],
            "education": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "achievements": []
        }
