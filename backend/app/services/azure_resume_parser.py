"""Azure Document Intelligence + Gemini AI Resume Parser.

Integrates Azure Document Intelligence for text extraction and Gemini AI for
intelligent resume structuring, replacing the basic NLP parser.
"""

from pathlib import Path
import os
import json
import re
import logging
import hashlib
from typing import Dict, List, Optional, Any, Union
import requests
from datetime import datetime

# Azure Document Intelligence imports
try:
    from azure.ai.documentintelligence import DocumentAnalysisClient
    from azure.core.credentials import AzureKeyCredential
    client_imported_from = "azure.ai.documentintelligence"
except Exception:
    try:
        from azure.ai.formrecognizer import DocumentAnalysisClient
        from azure.core.credentials import AzureKeyCredential
        client_imported_from = "azure.ai.formrecognizer"
    except Exception:
        DocumentAnalysisClient = None
        AzureKeyCredential = None
        client_imported_from = None

from app.models.resume import (
    ContactInfo, EducationEntry, WorkExperience, Project, 
    Certification, Achievement, SkillCategory, ResumeData
)


class AzureResumeParser:
    """Enhanced resume parser using Azure Document Intelligence and Gemini AI."""
    
    def __init__(self):
        """Initialize the Azure + Gemini resume parser."""
        self.logger = logging.getLogger(__name__)
        
        # Load configuration from environment variables
        self.api_key = os.getenv("DOC_INTEL_API") or os.getenv("DOCINTEL_API")
        self.endpoint = os.getenv("DOC_INTEL_ENDPOINT") or os.getenv("DOCINTEL_ENDPOINT")
        self.gemini_api = os.getenv("GEMINI_API")
        self.gemini_endpoint = os.getenv("GEMINI_ENDPOINT")
        
        # Validate Azure configuration
        if not self.api_key or not self.endpoint:
            self.logger.error("Azure Document Intelligence credentials not configured")
            raise ValueError("DOC_INTEL_API and DOC_INTEL_ENDPOINT must be set in environment variables")
        
        if not DocumentAnalysisClient or not AzureKeyCredential:
            self.logger.error("Azure SDK not available")
            raise ImportError("Azure Document Intelligence SDK not installed")
        
        # Initialize Azure client
        self.azure_client = DocumentAnalysisClient(
            endpoint=self.endpoint, 
            credential=AzureKeyCredential(self.api_key)
        )
        
        self.logger.info(f"Azure Resume Parser initialized with SDK: {client_imported_from}")
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        """Calculate SHA-256 hash of file content for duplicate detection."""
        return hashlib.sha256(file_content).hexdigest()
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF using Azure Document Intelligence."""
        try:
            return self._analyze_document_with_azure(file_content)
        except Exception as e:
            self.logger.error(f"Azure PDF text extraction failed: {e}")
            raise
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX using Azure Document Intelligence."""
        try:
            return self._analyze_document_with_azure(file_content)
        except Exception as e:
            self.logger.error(f"Azure DOCX text extraction failed: {e}")
            raise
    
    def _analyze_document_with_azure(self, file_content: bytes) -> str:
        """Analyze document using Azure Document Intelligence and return clean text."""
        try:
            # Use Azure Document Intelligence to extract text
            poller = self.azure_client.begin_analyze_document("prebuilt-document", document=file_content)
            result = poller.result()
            
            # Extract text using the same robust method from the original script
            return self._extract_clean_text(result)
            
        except Exception as e:
            self.logger.error(f"Azure document analysis failed: {e}")
            raise
    
    def _extract_clean_text(self, result) -> str:
        """Extract clean text from Azure Document Intelligence result."""
        # Noise filtering patterns (same as original)
        IGNORE_KEYS = {
            "bounding_box", "boundingBoxes", "confidence", "page", "row_count", "column_count",
            "width", "height", "unit", "kind", "angle", "polygon", "points", "label", "length"
        }
        
        def _is_noise_string(s: str) -> bool:
            s = s.strip()
            if not s:
                return True
            # if mostly numeric or punctuation, treat as noise (coordinates, metrics)
            digits = sum(c.isdigit() for c in s)
            if digits / max(1, len(s)) > 0.3:
                return True
            # sequences of comma/space-separated numbers (like "1 2 3 4" or "1,2,3")
            if re.match(r"^[0-9,\.\s-]+$", s):
                return True
            # very short tokens
            if len(s) <= 1:
                return True
            return False
        
        def _collect_strings(item, out, key_name=None):
            if item is None:
                return
            # prioritize strings only
            if isinstance(item, str):
                if not _is_noise_string(item):
                    out.append(item)
                return
            # skip raw numbers/booleans
            if isinstance(item, (int, float, bool)):
                return
            # dict: skip known metadata keys and only traverse values
            if isinstance(item, dict):
                for k, v in item.items():
                    if isinstance(k, str) and k.lower() in IGNORE_KEYS:
                        continue
                    _collect_strings(v, out, key_name=k)
                return
            # list: traverse
            if isinstance(item, list):
                for v in item:
                    _collect_strings(v, out)
                return

            # object: try common text attributes first
            for attr in ("content", "text", "value", "display_text", "name"):
                if hasattr(item, attr):
                    try:
                        _collect_strings(getattr(item, attr), out, key_name=attr)
                        return
                    except Exception:
                        pass

            # try to_dict() if available but filter by keys
            if hasattr(item, "to_dict"):
                try:
                    d = item.to_dict()
                    if isinstance(d, dict):
                        for k, v in d.items():
                            if isinstance(k, str) and k.lower() in IGNORE_KEYS:
                                continue
                            _collect_strings(v, out, key_name=k)
                        return
                except Exception:
                    pass

            # last resort: inspect attributes but only collect string attributes
            try:
                for k in dir(item):
                    if k.startswith("_"):
                        continue
                    try:
                        v = getattr(item, k)
                    except Exception:
                        continue
                    if callable(v):
                        continue
                    if isinstance(v, str):
                        _collect_strings(v, out, key_name=k)
                    else:
                        # don't aggressively stringify numbers or other primitives
                        _collect_strings(v, out, key_name=k)
            except Exception:
                pass

        collected = []

        # Prefer explicit content fields
        if getattr(result, "content", None):
            collected.append(getattr(result, "content"))

        # Try read_results / pages (older and newer SDKs differ)
        read_results = getattr(result, "read_results", None) or getattr(result, "pages", None)
        if read_results:
            if isinstance(read_results, list):
                for page in read_results:
                    # page may have lines
                    lines = getattr(page, "lines", None) or getattr(page, "content", None) or getattr(page, "text", None)
                    if lines:
                        if isinstance(lines, list):
                            for ln in lines:
                                _collect_strings(getattr(ln, "content", None) or getattr(ln, "text", None) or ln, collected)
                        else:
                            _collect_strings(lines, collected)

        # Key-value pairs and documents
        kvs = getattr(result, "key_value_pairs", None)
        if kvs:
            for kv in kvs:
                key = getattr(kv, "key", None)
                val = getattr(kv, "value", None)
                _collect_strings(getattr(key, "content", None) or getattr(key, "text", None) or key, collected)
                _collect_strings(getattr(val, "content", None) or getattr(val, "text", None) or val, collected)

        docs = getattr(result, "documents", None)
        if docs:
            for doc in docs:
                _collect_strings(doc, collected)

        # Fallback: traverse whole result via to_dict()
        try:
            if hasattr(result, "to_dict"):
                _collect_strings(result.to_dict(), collected)
        except Exception:
            pass

        # Clean, preserve order, remove duplicates
        texts = [t for t in (s.strip() for s in collected if isinstance(s, str) and s and s.strip())]
        # preserve order but remove duplicates
        return "\n".join(dict.fromkeys(texts))
    
    def _structure_with_gemini(self, resume_text: str) -> Optional[Dict[str, Any]]:
        """Use Gemini AI to structure the extracted resume text."""
        if not self.gemini_api:
            self.logger.warning("Gemini API not configured, skipping AI structuring")
            return None
        
        try:
            # Build the improved instruction prompt with detailed guidance
            instruction = f"""
You are an expert resume parser. Analyze the resume text carefully and extract information systematically. Think step by step and structure the data precisely.

IMPORTANT INSTRUCTIONS:
1. DO NOT include any Career Summary or Professional Summary section
2. Think carefully about each section before extracting
3. For skills, intelligently categorize them into Technical, Soft Skills, and Languages
4. For projects, extract clean names, descriptions, and separate any URLs
5. For education, parse degree, institution, dates, GPA, and location properly
6. Return ONLY valid JSON with no commentary

Extract and structure the following sections from the resume text:

**USER INFO**: Extract name, email, phone, and any social links
**EDUCATION**: For each education entry, think about:
- What is the degree/qualification?
- Which institution/university?
- What field of study?
- What are the dates (start/end or graduation year)?
- What is the GPA/CGPA if mentioned?
- What is the location?

**EXPERIENCE**: For each job, extract company, position, dates, location, and responsibilities

**PROJECTS**: For each project, think about:
- What is the project name?
- What does this project do? (combine bullet points into a coherent description)
- Are there any URLs, GitHub links, or demo links? (extract and separate by comma if multiple)

**SKILLS**: Intelligently categorize skills:
- Technical: Programming languages, frameworks, tools, technologies, databases
- Soft: Communication, leadership, teamwork, problem-solving, etc.
- Languages: Human languages (English, Spanish, etc.)

**CERTIFICATIONS**: Extract only the certification name (no issuer, dates, or other details)

**ACHIEVEMENTS**: Extract only the achievement title (no descriptions or details)

Return a JSON object with this EXACT structure:
{{
  "User Info": {{
    "Name": "Full Name",
    "Email": "email@domain.com",
    "Phone": "phone number",
    "LinkedIn": "linkedin url if found",
    "GitHub": "github url if found",
    "Website": "website url if found"
  }},
  "Education": [
    {{
      "Institution": "University/School Name",
      "Degree": "Degree Type (e.g., B.Tech, MBA, etc.)",
      "Field": "Field of Study",
      "Start Date": "start date if available",
      "End Date": "end date or graduation year",
      "GPA": "GPA/CGPA if mentioned",
      "Location": "city, state/country"
    }}
  ],
  "Experience": [
    {{
      "Company": "Company Name",
      "Position": "Job Title",
      "Start Date": "start date",
      "End Date": "end date or Present",
      "Location": "city, state",
      "Description": "job description and responsibilities"
    }}
  ],
  "Projects": [
    {{
      "Name": "Project Name",
      "Description": "Clear description of what the project does (summarize bullet points)",
      "Link": "URL1, URL2 if multiple links found"
    }}
  ],
  "Skills": {{
    "Technical": ["skill1", "skill2", "skill3"],
    "Soft": ["skill1", "skill2"],
    "Languages": ["language1", "language2"]
  }},
  "Certifications": [
    {{
      "Name": "Certification Name Only"
    }}
  ],
  "Achievements": [
    {{
      "Title": "Achievement Title Only"
    }}
  ]
}}

Now analyze this resume text and extract the information:
```{resume_text}```
"""
            
            # Determine endpoint: prefer explicit GEMINI_ENDPOINT, else use the correct default
            if self.gemini_endpoint:
                endpoint = self.gemini_endpoint
            else:
                # Use the standard v1beta endpoint for generateContent
                endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

            headers = {
                "Content-Type": "application/json",
            }

            params = None
            # Handle Google API keys in the query param
            if ("generativelanguage.googleapis.com" in endpoint) and self.gemini_api and " " not in self.gemini_api:
                params = {"key": self.gemini_api}
            else:
                headers["Authorization"] = f"Bearer {self.gemini_api}"

            # Combine the system instruction and user instruction into one prompt
            full_prompt = f"You are a JSON extractor.\n{instruction}"
            
            payload = {
                "contents": [{
                    "role": "user",
                    "parts": [{"text": full_prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.0
                }
            }

            response = requests.post(endpoint, headers=headers, params=params, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            # Log Gemini API response for debugging
            self.logger.info("=== GEMINI API RESPONSE ===")
            self.logger.info(f"Full response: {json.dumps(data, indent=2)}")

            # Extract text from Gemini response
            model_text = None
            try:
                # The actual JSON is in candidate -> content -> parts -> text
                model_text = data['candidates'][0]['content']['parts'][0]['text']
                self.logger.info(f"Extracted model text: {model_text}")
            except (KeyError, IndexError, TypeError) as e:
                self.logger.warning(f"Could not extract text from expected path in Gemini response: {e}")
                # Fallback to complex parser
                model_text = self._extract_text_from_response(data)

            if not model_text:
                model_text = self._extract_text_from_response(data)

            # Try to locate JSON in model_text
            structured = None
            if model_text:
                m = re.search(r"\{[\s\S]*\}", model_text)
                if m:
                    try:
                        # Log the extracted JSON for debugging
                        self.logger.info(f"=== EXTRACTED JSON FROM GEMINI ===")
                        self.logger.info(f"JSON string: {m.group(0)}")
                        
                        structured = json.loads(m.group(0))
                        
                        # Log the parsed structured data
                        self.logger.info(f"=== PARSED STRUCTURED DATA ===")
                        self.logger.info(f"Structured data: {json.dumps(structured, indent=2)}")
                    except Exception as e:
                        self.logger.error(f"Failed to parse JSON from Gemini regex match: {e}")
                        structured = None
                else:
                    try:
                        # Log the full model text as JSON
                        self.logger.info(f"=== FULL MODEL TEXT AS JSON ===")
                        self.logger.info(f"JSON string: {model_text}")
                        
                        structured = json.loads(model_text)
                        
                        # Log the parsed structured data
                        self.logger.info(f"=== PARSED STRUCTURED DATA ===")
                        self.logger.info(f"Structured data: {json.dumps(structured, indent=2)}")
                    except Exception as e:
                        self.logger.error(f"Failed to parse JSON from full model text: {e}")
                        structured = None

            if structured is None:
                self.logger.warning("Gemini response could not be parsed as JSON")
                return None
            
            return structured
            
        except Exception as e:
            self.logger.error(f"Error calling Gemini API: {e}")
            return None
    
    def _extract_text_from_response(self, x):
        """Fallback method to extract text from complex Gemini response structure."""
        if x is None: 
            return None
        if isinstance(x, str): 
            return x
        if isinstance(x, list):
            for it in x:
                t = self._extract_text_from_response(it)
                if t: 
                    return t
            return None
        if isinstance(x, dict):
            for k in ("content", "text", "message", "output_text", "response", "candidates"):
                if k in x:
                    t = self._extract_text_from_response(x[k])
                    if t: 
                        return t
            parts = []
            for v in x.values():
                t = self._extract_text_from_response(v)
                if t: 
                    parts.append(t)
            return "\n".join(parts) if parts else None
        return None
    
    def _convert_to_resume_data(self, structured_data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
        """Convert Gemini structured data to ResumeData format."""
        try:
            # Extract user info with improved structure
            user_info = structured_data.get("User Info", {})
            if isinstance(user_info, str):
                # If user_info is a string, try to parse basic info
                contact_info = self._parse_contact_string(user_info)
            else:
                contact_info = ContactInfo(
                    name=user_info.get("Name", ""),
                    email=user_info.get("Email", "") or user_info.get("Mail", ""),
                    phone=user_info.get("Phone", ""),
                    linkedin=user_info.get("LinkedIn", ""),
                    github=user_info.get("GitHub", ""),
                    website=user_info.get("Website", "")
                )
            
            # Extract education with improved parsing
            education_data = structured_data.get("Education", [])
            education = []
            if isinstance(education_data, str):
                education_data = [education_data] if education_data.strip() else []
            
            for edu_item in education_data:
                if isinstance(edu_item, str):
                    education.append(EducationEntry(
                        institution=self._extract_institution(edu_item),
                        degree=self._extract_degree(edu_item),
                        description=edu_item
                    ))
                else:
                    # Handle the new structured format
                    education.append(EducationEntry(
                        institution=edu_item.get("Institution", ""),
                        degree=edu_item.get("Degree", ""),
                        field_of_study=edu_item.get("Field", ""),
                        start_date=edu_item.get("Start Date", ""),
                        end_date=edu_item.get("End Date", ""),
                        gpa=edu_item.get("GPA", ""),
                        location=edu_item.get("Location", "")
                    ))
            
            # Extract experience with improved parsing
            experience_data = structured_data.get("Experience", [])
            experience = []
            if isinstance(experience_data, str):
                experience_data = [experience_data] if experience_data.strip() else []
            
            for exp_item in experience_data:
                if isinstance(exp_item, str):
                    experience.append(WorkExperience(
                        company=self._extract_company(exp_item),
                        position=self._extract_position(exp_item),
                        description=exp_item,
                        responsibilities=[exp_item]
                    ))
                else:
                    # Handle the new structured format
                    experience.append(WorkExperience(
                        company=exp_item.get("Company", ""),
                        position=exp_item.get("Position", ""),
                        start_date=exp_item.get("Start Date", ""),
                        end_date=exp_item.get("End Date", ""),
                        location=exp_item.get("Location", ""),
                        description=exp_item.get("Description", ""),
                        responsibilities=[exp_item.get("Description", "")] if exp_item.get("Description") else []
                    ))
            
            # Extract skills with intelligent categorization
            skills_data = structured_data.get("Skills", {})
            skills = []
            
            if isinstance(skills_data, str):
                # Fallback: put all in Technical category
                skills_list = [s.strip() for s in skills_data.split(',') if s.strip()]
                skills.append(SkillCategory(category="Technical", skills=skills_list))
            elif isinstance(skills_data, list):
                # Fallback: put all in Technical category
                skills.append(SkillCategory(category="Technical", skills=skills_data))
            elif isinstance(skills_data, dict):
                # Handle the new categorized format
                technical_skills = skills_data.get("Technical", [])
                soft_skills = skills_data.get("Soft", [])
                languages = skills_data.get("Languages", [])
                
                if technical_skills:
                    skills.append(SkillCategory(category="Technical", skills=technical_skills))
                if soft_skills:
                    skills.append(SkillCategory(category="Soft Skills", skills=soft_skills))
                if languages:
                    skills.append(SkillCategory(category="Languages", skills=languages))
            
            # Extract projects with improved format
            projects_data = structured_data.get("Projects", [])
            projects = []
            if isinstance(projects_data, str):
                projects_data = [projects_data] if projects_data.strip() else []
            
            for proj_item in projects_data:
                if isinstance(proj_item, str):
                    projects.append(Project(
                        name=self._extract_project_name(proj_item),
                        description=proj_item
                    ))
                else:
                    # Handle the new structured format
                    links = proj_item.get("Link", "")
                    url = ""
                    github_url = ""
                    
                    if links:
                        # Split multiple links and categorize them
                        link_list = [link.strip() for link in links.split(',')]
                        for link in link_list:
                            if 'github' in link.lower():
                                github_url = link
                            elif url == "":  # First non-github link becomes main URL
                                url = link
                    
                    projects.append(Project(
                        name=proj_item.get("Name", ""),
                        description=proj_item.get("Description", ""),
                        url=url,
                        github_url=github_url
                    ))
            
            # Extract certifications with only name
            cert_data = structured_data.get("Certifications", [])
            certifications = []
            if isinstance(cert_data, str):
                cert_data = [cert_data] if cert_data.strip() else []
            
            for cert_item in cert_data:
                if isinstance(cert_item, str):
                    certifications.append(Certification(
                        name=cert_item
                    ))
                else:
                    # Handle the new structured format
                    certifications.append(Certification(
                        name=cert_item.get("Name", "")
                    ))
            
            # Extract achievements with only title
            achievement_data = structured_data.get("Achievements", [])
            achievements = []
            if isinstance(achievement_data, str):
                achievement_data = [achievement_data] if achievement_data.strip() else []
            
            for achievement_item in achievement_data:
                if isinstance(achievement_item, str):
                    achievements.append(Achievement(
                        title=achievement_item
                    ))
                else:
                    # Handle the new structured format
                    achievements.append(Achievement(
                        title=achievement_item.get("Title", "")
                    ))
            
            # Create ResumeData WITHOUT career_summary
            resume_data = {
                "contact_info": contact_info.dict() if hasattr(contact_info, 'dict') else contact_info,
                # REMOVED: "career_summary": self._extract_summary_from_text(raw_text),
                "education": [edu.dict() if hasattr(edu, 'dict') else edu for edu in education],
                "work_experience": [exp.dict() if hasattr(exp, 'dict') else exp for exp in experience],
                "projects": [proj.dict() if hasattr(proj, 'dict') else proj for proj in projects],
                "skills": [skill.dict() if hasattr(skill, 'dict') else skill for skill in skills],
                "certifications": [cert.dict() if hasattr(cert, 'dict') else cert for cert in certifications],
                "achievements": [ach.dict() if hasattr(ach, 'dict') else ach for ach in achievements],
                "languages": [],
                "custom_sections": {},
                "parsing_confidence": 0.9,  # High confidence for Azure + Gemini
                "parsed_at": datetime.utcnow(),
                "manual_edits": False
            }
            
            return resume_data
            
        except Exception as e:
            self.logger.error(f"Error converting structured data to ResumeData: {e}")
            # Return basic structure with raw text WITHOUT career_summary
            return {
                "contact_info": {"name": "Unknown", "email": "", "phone": ""},
                # REMOVED: "career_summary": "",
                "education": [],
                "work_experience": [],
                "projects": [],
                "skills": [],
                "certifications": [],
                "achievements": [],
                "languages": [],
                "custom_sections": {},
                "parsing_confidence": 0.3,
                "parsed_at": datetime.utcnow(),
                "manual_edits": False
            }
    
    def parse_resume(self, text: str) -> Dict[str, Any]:
        """Main parsing method that combines Azure extraction with Gemini structuring."""
        try:
            # Use Gemini to structure the text
            structured_data = self._structure_with_gemini(text)
            
            if structured_data:
                # Convert structured data to ResumeData format
                result = self._convert_to_resume_data(structured_data, text)
                result["parsing_confidence"] = 0.9  # High confidence for AI parsing
                self.logger.info("Successfully parsed resume with Azure + Gemini")
                return result
            else:
                # Fallback to basic parsing if Gemini fails
                self.logger.warning("Gemini structuring failed, using basic parsing")
                return self._basic_parse_fallback(text)
                
        except Exception as e:
            self.logger.error(f"Resume parsing failed: {e}")
            return self._basic_parse_fallback(text)
    
    def _basic_parse_fallback(self, text: str) -> Dict[str, Any]:
        """Basic fallback parsing when AI methods fail."""
        return {
            "contact_info": {
                "name": self._extract_name_basic(text),
                "email": self._extract_email_basic(text),
                "phone": self._extract_phone_from_text(text)
            },
            # REMOVED: "career_summary": "",
            "education": [],
            "work_experience": [],
            "projects": [],
            "skills": [],
            "certifications": [],
            "achievements": [],
            "languages": [],
            "custom_sections": {},
            "parsing_confidence": 0.5,
            "parsed_at": datetime.utcnow(),
            "manual_edits": False
        }
    
    # Helper methods for extracting specific information
    def _parse_contact_string(self, contact_str: str) -> ContactInfo:
        """Parse contact information from a string."""
        return ContactInfo(
            name=self._extract_name_basic(contact_str),
            email=self._extract_email_basic(contact_str),
            phone=self._extract_phone_from_text(contact_str)
        )
    
    def _extract_name_basic(self, text: str) -> str:
        """Basic name extraction."""
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line.split()) >= 2 and len(line) < 50:
                return line
        return ""
    
    def _extract_email_basic(self, text: str) -> str:
        """Basic email extraction."""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else ""
    
    def _extract_phone_from_text(self, text: str) -> str:
        """Extract phone number from text."""
        phone_pattern = r'[\+]?[1-9]?[0-9]{7,15}'
        matches = re.findall(phone_pattern, text)
        return matches[0] if matches else ""
    
    def _extract_linkedin_from_text(self, text: str) -> str:
        """Extract LinkedIn URL from text."""
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        matches = re.findall(linkedin_pattern, text, re.IGNORECASE)
        return f"https://{matches[0]}" if matches else ""
    
    def _extract_github_from_text(self, text: str) -> str:
        """Extract GitHub URL from text."""
        github_pattern = r'github\.com/[\w-]+'
        matches = re.findall(github_pattern, text, re.IGNORECASE)
        return f"https://{matches[0]}" if matches else ""
    
    def _extract_website_from_text(self, text: str) -> str:
        """Extract website URL from text."""
        url_pattern = r'https?://[^\s]+'
        matches = re.findall(url_pattern, text)
        return matches[0] if matches else ""
    
    def _extract_institution(self, edu_text: str) -> str:
        """Extract institution name from education text."""
        # Simple heuristic: often the first capitalized words
        words = edu_text.split()
        institution_words = []
        for word in words:
            if word[0].isupper() and len(word) > 2:
                institution_words.append(word)
            if len(institution_words) >= 3:
                break
        return " ".join(institution_words)
    
    def _extract_degree(self, edu_text: str) -> str:
        """Extract degree from education text."""
        degree_keywords = ['bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate']
        for keyword in degree_keywords:
            if keyword.lower() in edu_text.lower():
                return edu_text
        return ""
    
    def _extract_company(self, exp_text: str) -> str:
        """Extract company name from experience text."""
        lines = exp_text.split('\n')
        for line in lines:
            if any(word in line.lower() for word in ['inc', 'ltd', 'corp', 'llc', 'company']):
                return line.strip()
        return lines[0].strip() if lines else ""
    
    def _extract_position(self, exp_text: str) -> str:
        """Extract position title from experience text."""
        lines = exp_text.split('\n')
        return lines[0].strip() if lines else ""
    
    def _extract_project_name(self, proj_text: str) -> str:
        """Extract project name from project text."""
        lines = proj_text.split('\n')
        return lines[0].strip() if lines else ""
    
    def _extract_issuer(self, cert_text: str) -> str:
        """Extract certification issuer."""
        if 'by' in cert_text.lower():
            parts = cert_text.lower().split('by')
            return parts[-1].strip() if len(parts) > 1 else ""
        return ""
    
    def _extract_achievement_title(self, ach_text: str) -> str:
        """Extract achievement title."""
        lines = ach_text.split('\n')
        return lines[0].strip() if lines else ""
    
    def _extract_summary_from_text(self, text: str) -> str:
        """Extract career summary from text."""
        lines = text.split('\n')
        summary_keywords = ['summary', 'objective', 'profile', 'about']
        
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in summary_keywords):
                # Get next few lines as summary
                summary_lines = lines[i+1:i+4]
                return ' '.join(summary_lines).strip()
        
        return ""
