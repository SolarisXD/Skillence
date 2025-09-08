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
    
    def normalize_skills(self, skills_data: Union[List[str], List[Dict], Dict[str, Any], str]) -> Dict[str, List[str]]:
        """
        Normalize skills data without losing structure.
        - If a plain string is provided, return a list[str].
        - If a list[str] is provided, return a cleaned list[str].
        - If a list[dict] with category/skills or name fields is provided, return a categorized dict.
        - If a dict of categories is provided, return a cleaned categorized dict.
        Categories normalized to keys: technical, soft, languages.
        """
        if skills_data is None or skills_data == "":
            return {"technical": [], "soft": [], "languages": []}

        # Helper to clean list-like values into list[str]
        def _to_list_str(val: Union[str, List[Any]]) -> List[str]:
            if val is None:
                return []
            if isinstance(val, str):
                return [s for s in [v.strip() for d in ['\n', ',', ';'] for v in ([val] if d not in val else val.split(d))] if s] if any(d in val for d in ['\n', ',', ';']) else ([val.strip()] if val.strip() else [])
            if isinstance(val, list):
                out: List[str] = []
                for item in val:
                    if isinstance(item, str):
                        s = item.strip()
                        if s:
                            out.append(s)
                    elif isinstance(item, dict):
                        # object like { name: "Python" } or { skill: "Python" }
                        name = str(item.get("name", item.get("skill", ""))).strip()
                        if name:
                            out.append(name)
                    else:
                        s = str(item).strip()
                        if s:
                            out.append(s)
                return out
            # Fallback
            s = str(val).strip()
            return [s] if s else []

        # 1) String -> list[str]
        if isinstance(skills_data, str):
            return {"technical": _to_list_str(skills_data), "soft": [], "languages": []}

        # 2) Dict of categories -> dict[str, list[str]]
        if isinstance(skills_data, dict):
            category_map = {
                "technical": "technical",
                "technical skills": "technical",
                "tech": "technical",
                "tech skills": "technical",
                "hard": "technical",
                "hard skills": "technical",
                "hard_skills": "technical",
                "soft": "soft",
                "soft skills": "soft",
                "soft_skills": "soft",
                "languages": "languages",
                "language": "languages",
                "language skills": "languages"
            }
            out: Dict[str, List[str]] = {"technical": [], "soft": [], "languages": []}
            for key, val in skills_data.items():
                if val is None:
                    continue
                norm_key = category_map.get(str(key).strip().lower())
                if not norm_key:
                    # Unknown bucket: put into technical by default to avoid data loss
                    norm_key = "technical"
                out[norm_key].extend(_to_list_str(val))
            # de-duplicate while preserving order
            for k in out:
                seen = set()
                deduped = []
                for s in out[k]:
                    ls = s.strip()
                    if not ls:
                        continue
                    key_ = ls.lower()
                    if key_ not in seen:
                        seen.add(key_)
                        deduped.append(ls)
                out[k] = deduped
            return out

        # 3) List case
        if isinstance(skills_data, list):
            # If it's list of dicts with categories, convert to categorized dict
            if any(isinstance(x, dict) and ("category" in x or "skills" in x) for x in skills_data):
                categorized: Dict[str, List[str]] = {"technical": [], "soft": [], "languages": []}
                for item in skills_data:
                    if not isinstance(item, dict):
                        # treat bare strings in a mixed list as technical
                        categorized["technical"].extend(_to_list_str(item))
                        continue
                    cat_raw = item.get("category")
                    skills_list = item.get("skills")
                    if skills_list is None and ("name" in item or "skill" in item):
                        # object like { name: "Python" }
                        skills_list = [item.get("name") or item.get("skill")]
                    norm_cat = str(cat_raw).strip().lower() if cat_raw else "technical"
                    if norm_cat.startswith("tech") or norm_cat in ("hard", "hard skills", "hard_skills"):
                        norm_cat = "technical"
                    elif norm_cat.startswith("soft"):
                        norm_cat = "soft"
                    elif norm_cat.startswith("lang"):
                        norm_cat = "languages"
                    else:
                        norm_cat = "technical"
                    categorized[norm_cat].extend(_to_list_str(skills_list))
                # de-duplicate preserving order per bucket
                for k in categorized:
                    seen = set()
                    deduped = []
                    for s in categorized[k]:
                        ls = s.strip()
                        if not ls:
                            continue
                        key_ = ls.lower()
                        if key_ not in seen:
                            seen.add(key_)
                            deduped.append(ls)
                    categorized[k] = deduped
                return categorized

            # Otherwise treat as simple list[str] and return list[str]
            return {"technical": [s for s in _to_list_str(skills_data) if s], "soft": [], "languages": []}

        # Unknown type: stringify to avoid data loss
        s = str(skills_data).strip()
        return {"technical": ([s] if s else []), "soft": [], "languages": []}
    
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
            "skills": {"technical": [], "soft": [], "languages": []},
            "projects": [],
            "certifications": [],
            "achievements": []
        }
