from typing import Optional, Dict, Any
from fastapi import UploadFile, HTTPException
import logging
from app.models.resume import ResumeData, Resume
from app.services.azure_resume_parser import AzureResumeParser
from app.database import get_database
from datetime import datetime
import hashlib

class ResumeService:
    def __init__(self):
        """Initialize resume service with database connection and Azure-based parser."""
        try:
            self.parser = AzureResumeParser()
            self.logger = logging.getLogger(__name__)
            self.logger.info("Resume service initialized with Azure Document Intelligence parser")
        except Exception as e:
            self.logger.error(f"Failed to initialize Azure parser: {e}")
            # Fallback to basic parser if Azure is not available
            from app.services.resume_parser import AdvancedResumeParser
            self.parser = AdvancedResumeParser()
            self.logger.warning("Falling back to basic NLP parser")
        
        self._db = None
        self._collection = None
    
    @property
    def db(self):
        """Get database instance."""
        if self._db is None:
            self._db = get_database()
        return self._db
    
    @property 
    def collection(self):
        """Get collection instance."""
        if self._collection is None:
            db = self.db
            self._collection = db.resumes
            # Create unique index on user_id to prevent duplicate resumes per user
            try:
                # This will be executed when the collection is first accessed
                pass  # Index creation will be handled in the route initialization
            except Exception as e:
                self.logger.info(f"Index creation info: {e}")
        return self._collection
    
    async def parse_and_save_resume(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """
        Parse uploaded resume file and save to database with duplicate prevention.
        """
        try:
            # Get database collection
            db = get_database()
            if db is None:
                self.logger.error("Database connection is None - database not initialized")
                return {
                    "success": False,
                    "message": "Database connection failed",
                    "data": None
                }
            
            collection = db.resumes
            
            # Read file content
            file_content = await file.read()
            
            # Calculate file hash for duplicate detection
            file_hash = self.parser.calculate_file_hash(file_content)
            
            # Check if this exact file has been uploaded before by the same user
            existing_by_hash = await collection.find_one({"file_hash": file_hash, "user_id": user_id})
            if existing_by_hash:
                # Same file by same user - allow update by continuing with parsing
                self.logger.info(f"Same file re-uploaded by user {user_id}, will update existing record")
            
            # Check if different user uploaded the same file (optional security check)
            existing_by_other_user = await collection.find_one({"file_hash": file_hash, "user_id": {"$ne": user_id}})
            if existing_by_other_user:
                self.logger.warning(f"File with same hash uploaded by different user - continuing with processing")
            
            # Extract text based on file type
            if file.filename.lower().endswith('.pdf'):
                text = self.parser.extract_text_from_pdf(file_content)
            elif file.filename.lower().endswith(('.docx', '.doc')):
                text = self.parser.extract_text_from_docx(file_content)
            else:
                return {
                    "success": False,
                    "message": "Unsupported file format. Please upload PDF or DOCX files.",
                    "data": None
                }
            
            if not text.strip():
                return await self._handle_parsing_failure(file, user_id, file_hash)
            
            # Parse resume using Azure Document Intelligence + Gemini AI
            parsed_data = self.parser.parse_resume(text)
            
            # Create ResumeData object from parsed data
            resume_data = ResumeData(**parsed_data)

            # Print a brief summary to terminal for visibility
            try:
                print("=== PARSED RESUME SUMMARY ===")
                ci = resume_data.contact_info.dict() if hasattr(resume_data.contact_info, 'dict') else (resume_data.contact_info or {})
                print({
                    "name": ci.get("name"),
                    "email": ci.get("email"),
                    "work_experience_count": len(resume_data.work_experience or []),
                    "education_count": len(resume_data.education or []),
                    "skills_count": sum(len(s.skills or []) for s in (resume_data.skills or [])),
                    "parsing_confidence": parsed_data.get('parsing_confidence', 0)
                })
            except Exception:
                pass
            
            # Create Resume document
            resume_doc = Resume(
                user_id=user_id,
                resume_data=resume_data,
                file_hash=file_hash,
                original_filename=file.filename,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Save to database (upsert based on user_id)
            result = await collection.replace_one(
                {"user_id": user_id},
                resume_doc.dict(),
                upsert=True
            )
            
            return {
                "success": True,
                "message": "Resume parsed and saved successfully with Azure + Gemini AI",
                "data": resume_data.dict(),
                "parsing_confidence": parsed_data.get('parsing_confidence', 0),
                "is_new": result.upserted_id is not None
            }
            
        except Exception as e:
            self.logger.error(f"Error processing resume: {e}")
            return await self._handle_parsing_failure(file, user_id, None)
    
    async def _handle_parsing_failure(self, file: UploadFile, user_id: str, file_hash: Optional[str]) -> Dict[str, Any]:
        """
        Handle parsing failures with fallback mechanisms.
        """
        try:
            # Get database collection
            db = get_database()
            if db is None:
                self.logger.error("Database connection is None in fallback handler")
                return {
                    "success": False,
                    "message": "Database connection failed",
                    "data": None
                }
            
            collection = db.resumes
            
            # Create empty resume structure for manual filling
            empty_resume_data = ResumeData(
                parsing_confidence=0.0,
                parsed_at=datetime.utcnow(),
                manual_edits=True
            )
            
            resume_doc = Resume(
                user_id=user_id,
                resume_data=empty_resume_data,
                file_hash=file_hash,
                original_filename=file.filename,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Save empty structure for manual editing
            await collection.replace_one(
                {"user_id": user_id},
                resume_doc.dict(),
                upsert=True
            )
            
            return {
                "success": True,
                "message": "Parsing failed, but empty resume template created for manual editing",
                "data": empty_resume_data.dict(),
                "parsing_confidence": 0.0,
                "requires_manual_input": True
            }
            
        except Exception as e:
            self.logger.error(f"Error in fallback handling: {e}")
            return {
                "success": False,
                "message": "Resume processing failed",
                "data": None
            }

    async def get_resume_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch resume data for a specific user."""
        try:
            db = get_database()
            if db is None:
                self.logger.error("Database connection is None in get_resume_by_user_id")
                return None
            
            collection = db.resumes
            resume_doc = await collection.find_one({"user_id": user_id})
            if resume_doc:
                # Remove MongoDB _id for JSON serialization
                resume_doc.pop('_id', None)
                return resume_doc
            return None
        except Exception as e:
            self.logger.error(f"Error fetching resume: {e}")
            return None

    async def update_resume_data(self, user_id: str, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update resume data for a user with manual edits tracking.
        """
        try:
            db = get_database()
            if db is None:
                self.logger.error("Database connection is None in update_resume_data")
                return {
                    "success": False,
                    "message": "Database connection failed"
                }
            
            collection = db.resumes
            
            # Get existing resume
            existing = await collection.find_one({"user_id": user_id})
            if not existing:
                return {
                    "success": False,
                    "message": "Resume not found for user"
                }
            
            # Update resume data
            update_data = {
                "resume_data": resume_data,
                "updated_at": datetime.utcnow(),
                "resume_data.manual_edits": True
            }
            
            result = await collection.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return {
                    "success": True,
                    "message": "Resume updated successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "No changes made to resume"
                }
                
        except Exception as e:
            self.logger.error(f"Error updating resume: {e}")
            return {
                "success": False,
                "message": "Failed to update resume"
            }
    
    async def add_work_experience(self, user_id: str, experience_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new work experience entry."""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$push": {"resume_data.work_experience": experience_data},
                    "$set": {
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Work experience added successfully" if result.modified_count > 0 else "Failed to add work experience"
            }
        except Exception as e:
            self.logger.error(f"Error adding work experience: {e}")
            return {"success": False, "message": "Failed to add work experience"}
    
    async def update_work_experience(self, user_id: str, index: int, experience_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update specific work experience entry."""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        f"resume_data.work_experience.{index}": experience_data,
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Work experience updated successfully" if result.modified_count > 0 else "Failed to update work experience"
            }
        except Exception as e:
            self.logger.error(f"Error updating work experience: {e}")
            return {"success": False, "message": "Failed to update work experience"}
    
    async def delete_work_experience(self, user_id: str, index: int) -> Dict[str, Any]:
        """Delete specific work experience entry."""
        try:
            # First, get the current array
            resume = await self.collection.find_one({"user_id": user_id})
            if not resume or not resume.get("resume_data", {}).get("work_experience"):
                return {"success": False, "message": "Work experience not found"}
            
            work_experiences = resume["resume_data"]["work_experience"]
            if index < 0 or index >= len(work_experiences):
                return {"success": False, "message": "Invalid work experience index"}
            
            # Remove the item at the specified index
            work_experiences.pop(index)
            
            # Update the entire array
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "resume_data.work_experience": work_experiences,
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Work experience deleted successfully" if result.modified_count > 0 else "Failed to delete work experience"
            }
        except Exception as e:
            self.logger.error(f"Error deleting work experience: {e}")
            return {"success": False, "message": "Failed to delete work experience"}
    
    async def add_project(self, user_id: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new project entry."""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$push": {"resume_data.projects": project_data},
                    "$set": {
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Project added successfully" if result.modified_count > 0 else "Failed to add project"
            }
        except Exception as e:
            self.logger.error(f"Error adding project: {e}")
            return {"success": False, "message": "Failed to add project"}
    
    async def add_certification(self, user_id: str, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new certification entry."""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$push": {"resume_data.certifications": cert_data},
                    "$set": {
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Certification added successfully" if result.modified_count > 0 else "Failed to add certification"
            }
        except Exception as e:
            self.logger.error(f"Error adding certification: {e}")
            return {"success": False, "message": "Failed to add certification"}
    
    async def add_course(self, user_id: str, course_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new course entry."""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$push": {"resume_data.courses": course_data},
                    "$set": {
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": "Course added successfully" if result.modified_count > 0 else "Failed to add course"
            }
        except Exception as e:
            self.logger.error(f"Error adding course: {e}")
            return {"success": False, "message": "Failed to add course"}
    
    async def add_custom_section(self, user_id: str, section_name: str, section_data: Any) -> Dict[str, Any]:
        """Add custom section to resume."""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        f"resume_data.custom_sections.{section_name}": section_data,
                        "updated_at": datetime.utcnow(),
                        "resume_data.manual_edits": True
                    }
                }
            )
            
            return {
                "success": result.modified_count > 0,
                "message": f"Custom section '{section_name}' added successfully" if result.modified_count > 0 else "Failed to add custom section"
            }
        except Exception as e:
            self.logger.error(f"Error adding custom section: {e}")
            return {"success": False, "message": "Failed to add custom section"}