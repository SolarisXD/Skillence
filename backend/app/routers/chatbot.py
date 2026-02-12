from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import logging
import asyncio
from datetime import datetime
import os
import re
import google.generativeai as genai

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API"))

router = APIRouter()

# History item for context (sent from frontend)
class HistoryItem(BaseModel):
    role: str  # "user" or "bot"
    content: str

# User info from frontend (fetched from profile, sent with messages)
class UserInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    skills: Optional[List[str]] = None  # Technical skills
    soft_skills: Optional[List[str]] = None  # Soft skills
    education: Optional[str] = None  # Degree and institution
    cgpa: Optional[str] = None  # GPA/CGPA
    experience: Optional[str] = None  # Latest job title
    projects: Optional[List[str]] = None  # Project names/descriptions
    certifications: Optional[List[str]] = None  # Certification names
    achievements: Optional[List[str]] = None  # Achievement titles

class ChatMessage(BaseModel):
    message: str
    session_id: str
    timestamp: Optional[str] = None
    history: Optional[List[HistoryItem]] = None  # Frontend sends recent history for context
    user_info: Optional[UserInfo] = None  # User profile info for personalization

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    status: str = "success"

class ChatService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API")
        gemini_endpoint = os.getenv("GEMINI_ENDPOINT")
        logger.info(f"Initializing ChatService with API key: {'***' + api_key[-4:] if api_key else 'NOT_FOUND'} and endpoint: {gemini_endpoint or 'NOT_SET'}")
        # Extract model id from GEMINI_ENDPOINT if provided, e.g. "/models/gemini-2.5-flash:generateContent"
        model_id = 'gemini-2.5-flash'
        if gemini_endpoint:
            m = re.search(r'/models/([^:]+)', gemini_endpoint)
            if m:
                model_id = m.group(1)
        logger.info(f"Using Gemini model: {model_id}")
        self.model = genai.GenerativeModel(model_id)
    
    def get_career_prompt(self, conversation_context: str = "", user_context: str = ""):
        base_prompt = """You are Skillence, an AI-powered career guidance assistant integrated into the Skillence platform. You have complete knowledge of the platform's features and can guide users step-by-step.

IMPORTANT: When suggesting features, ALWAYS include the direct navigation link so users can click and go there directly.

=== ABOUT SKILLENCE PLATFORM ===
Skillence is an AI-powered career intelligence platform that helps professionals make informed career decisions through intelligent resume analysis, personalized career path recommendations, and real-time job market insights.

=== PLATFORM FEATURES WITH NAVIGATION LINKS ===

1. RESUME UPLOAD & PARSING
   Link: /dashboard/resume
   What it does: Upload your resume (PDF or DOCX) and our AI powered by Azure Document Intelligence + Gemini AI will automatically extract and structure your information.
   How to use:
   - Go to Resume Dashboard: /dashboard/resume
   - Click "Upload Resume" and select your PDF or DOCX file (max 10MB)
   - Wait for AI to parse your resume (may take 10-30 seconds)
   - Review the extracted information and edit if needed
   - Click "Save to Profile" to save your data

2. PROFILE PAGE
   Link: /profile
   What it does: View and edit your complete professional profile including contact info, education, experience, skills, projects, certifications, and achievements.
   How to use:
   - Go to Profile Page: /profile
   - Click "Edit Profile" to make changes
   - You can add/edit: Contact Information, Education, Work Experience, Skills (Technical, Soft, Languages), Projects, Certifications, Achievements
   - Click "Save Changes" when done

3. CAREER PATH RECOMMENDATION
   Link: /career-path-recommendation
   What it does: Get AI-powered career recommendations based on your profile using O*NET occupation database with 900+ careers.
   How to use:
   - Go to Career Path Recommendation: /career-path-recommendation
   - Click "Analyze My Profile" button
   - Wait for AI to analyze your skills and match them with careers
   - View your top 10 recommended career paths with match scores
   - Each recommendation shows:
     * Match percentage and scoring breakdown
     * Hot technology matches (in-demand skills you have)
     * Required skills for the role
   - Click "Select This Career" on any recommendation to save it as your career goal

4. LEARNING ROADMAP (After selecting a Career Path)
   Link: /career-path-recommendation (after selecting a career)
   What it does: Generates a personalized learning plan with 3 phases to help you reach your career goal.
   How to use:
   - First, go to Career Path Recommendation: /career-path-recommendation
   - Select a career path from recommendations
   - Click "Start Learning Roadmap" or navigate to the Learning Plan section
   - View your personalized roadmap with:
     * Phase 1: Foundation (basics and fundamentals)
     * Phase 2: Technical Development (core skills building)  
     * Phase 3: Specialization & Mastery (advanced skills)
   - Each phase shows: Skills to learn, Tasks to complete, Resources, Milestones
   - Track your progress by checking off completed items

5. JOB TRENDS DASHBOARD
   Link: /job-trends
   What it does: Real-time job market analysis with interactive charts, salary insights, and skill demand data.
   How to use:
   - Go to Job Trends Dashboard: /job-trends
   - Select a job role from the dropdown menu
   - Choose a time range (3 months, 6 months, 1 year, or all time)
   - Use Advanced Filters to narrow by:
     * Location, Industry, Experience Level
     * Company Size, Employment Type
     * Salary Range, Years of Experience
   - View charts: Trend Analysis, Skill Demand, Experience Distribution
   - Export data as CSV or JSON using the Export button

6. JOB OFFER EVALUATOR
   Link: /job-offer-evaluator
   What it does: Compare and evaluate job offers using real market data from Adzuna API.
   How to use:
   - Go to Job Offer Evaluator: /job-offer-evaluator
   - Enter job details (title, company, salary, benefits)
   - Add multiple offers to compare side-by-side
   - View salary benchmarks against market rates
   - Get recommendations on which offer provides better value

7. AUTHENTICATION & ACCOUNT
   - Home Page: / (click Login button)
   - Register: Click "Login" on navbar > "Create Account" > Fill name, email, password
   - Login: Click "Login" on navbar > Enter email and password
   - Logout: Click your profile icon > "Logout"

=== QUICK NAVIGATION LINKS ===
• Home Page: /
• Resume Dashboard: /dashboard/resume
• My Profile: /profile
• Career Path Recommendation: /career-path-recommendation
• Job Trends: /job-trends
• Job Offer Evaluator: /job-offer-evaluator

=== RESPONSE GUIDELINES ===
• ALWAYS include the link when mentioning a feature (format: Feature Name → /path)
• Example: "You can upload your resume at the Resume Dashboard → /dashboard/resume"
• Guide users through any feature step-by-step
• Answer questions about career planning, skills, and job market
• Be supportive, professional, and concise
• Format responses in plain text without markdown symbols like **, *, #, or backticks
• Links should be on their own line or clearly separated"""

        # Add user context if available
        if user_context:
            base_prompt += f"""

=== CURRENT USER INFO ===
{user_context}

Use this information to personalize your responses. Address the user by name when appropriate."""

        if conversation_context:
            base_prompt += f"""

=== CONVERSATION HISTORY ===
{conversation_context}

Continue the conversation naturally, remembering what was discussed before."""
        
        return base_prompt

    def get_reflection_coach_prompt(self, conversation_context: str = "", user_context: str = "") -> str:
        base_prompt = """You are Reflection Engine, an AI Interview Coach.

ROLE AND SCOPE
- You only provide interview-focused coaching.
- Allowed topics: interview reflection, technical interview preparation, behavioral interview preparation, communication, confidence, mock interview strategy, and interview-specific action plans.
- If the user asks about unrelated topics, politely redirect to interview coaching and ask one interview-focused follow-up question.

STYLE REQUIREMENTS
- Sound natural, conversational, and empathetic.
- Do not use rigid templates or repetitive fixed phrasing.
- Keep answers practical and personalized to the user's latest message.
- Ask at most one short follow-up question when useful.

FORMAT RULES
- Plain text only.
- No markdown symbols (no **, *, #, backticks, numbered markdown headings).
- No emojis.
- Use short paragraphs and clear sentences.
"""

        if user_context:
            base_prompt += f"""

USER CONTEXT
{user_context}

Use this only to personalize interview coaching. Do not switch to unrelated topics.
"""

        if conversation_context:
            base_prompt += f"""

CONVERSATION HISTORY
{conversation_context}

Continue naturally from this history and stay fully within interview coaching scope.
"""

        return base_prompt

    def sanitize_response(self, text: str, remove_emojis: bool = False) -> str:
        """Clean and format the AI response by removing markdown and ensuring professional presentation"""
        # Remove markdown bold (**text**)
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        
        # Remove markdown italic (*text*)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        
        # Remove markdown headers (# ## ###)
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        
        # Convert markdown lists to clean bullet points
        text = re.sub(r'^\s*[-*+]\s*', '• ', text, flags=re.MULTILINE)
        
        # Clean up numbered lists
        text = re.sub(r'^\s*\d+\.\s*', '• ', text, flags=re.MULTILINE)
        
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        
        # Clean up any remaining markdown characters
        text = re.sub(r'[`~]', '', text)

        if remove_emojis:
            text = re.sub(r'[\U0001F300-\U0001FAFF\U00002700-\U000027BF\U000024C2-\U0001F251]', '', text)
        
        # Ensure proper spacing around bullet points
        text = re.sub(r'\n•', '\n\n•', text)
        text = re.sub(r'^\n+', '', text)  # Remove leading newlines
        text = re.sub(r'\n+$', '', text)  # Remove trailing newlines
        
        return text.strip()

    def format_conversation_context(self, history: List[HistoryItem]) -> str:
        """Format conversation history for the prompt (from frontend localStorage)"""
        if not history:
            return ""
        
        context_parts = []
        for msg in history:
            role_label = "User" if msg.role == "user" else "Skillence"
            context_parts.append(f"{role_label}: {msg.content}")
        
        return "\n".join(context_parts)

    def format_user_context(self, user_info: UserInfo) -> str:
        """Format user info for personalized responses"""
        if not user_info:
            return ""
        
        parts = []
        if user_info.name:
            parts.append(f"Name: {user_info.name}")
        if user_info.email:
            parts.append(f"Email: {user_info.email}")
        if user_info.skills:
            parts.append(f"Technical Skills: {', '.join(user_info.skills[:10])}")
        if user_info.soft_skills:
            parts.append(f"Soft Skills: {', '.join(user_info.soft_skills[:5])}")
        if user_info.education:
            edu_str = user_info.education
            if user_info.cgpa:
                edu_str += f" (CGPA/GPA: {user_info.cgpa})"
            parts.append(f"Education: {edu_str}")
        if user_info.experience:
            parts.append(f"Current/Recent Role: {user_info.experience}")
        if user_info.projects:
            parts.append(f"Projects: {', '.join(user_info.projects[:5])}")
        if user_info.certifications:
            parts.append(f"Certifications: {', '.join(user_info.certifications[:5])}")
        if user_info.achievements:
            parts.append(f"Achievements: {', '.join(user_info.achievements[:3])}")
        
        return "\n".join(parts) if parts else ""

    async def process_message(self, message: str, session_id: str, history: List[HistoryItem] = None, user_info: UserInfo = None) -> str:
        try:
            logger.info(f"Processing message for session {session_id}: {message[:50]}...")
            
            # Format history from frontend (localStorage) for context
            conversation_context = self.format_conversation_context(history or [])
            
            # Format user info for personalization
            user_context = self.format_user_context(user_info)
            
            # Create prompt with context for direct generation
            full_prompt = f"""{self.get_career_prompt(conversation_context, user_context)}

User Question: {message}

Please provide a helpful response as Skillence, the career guidance assistant."""

            logger.info("Sending message to Gemini...")
            
            # Use direct generation instead of chat sessions to avoid hanging
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                self.model.generate_content, 
                full_prompt
            )
            
            logger.info(f"Received response from Gemini: {response.text[:100]}...")
            
            # Sanitize the response to remove markdown and ensure professional formatting
            sanitized_response = self.sanitize_response(response.text)
            
            return sanitized_response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment."

    async def process_reflection_message(self, message: str, session_id: str, history: List[HistoryItem] = None, user_info: UserInfo = None) -> str:
        try:
            logger.info(f"Processing reflection message for session {session_id}: {message[:50]}...")

            conversation_context = self.format_conversation_context(history or [])
            user_context = self.format_user_context(user_info)
            full_prompt = f"""{self.get_reflection_coach_prompt(conversation_context, user_context)}

User Message: {message}

Respond as Reflection Engine interview coach using plain text only."""

            response = await asyncio.get_event_loop().run_in_executor(
                None,
                self.model.generate_content,
                full_prompt
            )

            raw_text = getattr(response, "text", "") if response else ""
            if not raw_text:
                return "I can help with interview coaching. Please share what happened in your latest interview and where you felt stuck."

            sanitized_response = self.sanitize_response(raw_text, remove_emojis=True)
            return sanitized_response

        except Exception as e:
            logger.error(f"Error processing reflection message: {str(e)}")
            return "I can help with interview coaching. Please try again and share your interview experience in a bit more detail."

# Initialize service
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    """Handle chat messages from the frontend"""
    try:
        logger.info(f"Received message from session {chat_message.session_id}: {chat_message.message[:50]}...")
        
        # Process the message with history and user info from frontend
        response_text = await chat_service.process_message(
            chat_message.message, 
            chat_message.session_id,
            chat_message.history,  # History from frontend localStorage
            chat_message.user_info  # User profile info for personalization
        )
        
        return ChatResponse(
            response=response_text,
            session_id=chat_message.session_id,
            timestamp=datetime.now().isoformat(),
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to process chat message"
        )

@router.post("/reflection-coach", response_model=ChatResponse)
async def reflection_coach_endpoint(chat_message: ChatMessage):
    """Handle Reflection Engine interview coach messages via Gemini"""
    try:
        logger.info(f"Received reflection coach message from session {chat_message.session_id}: {chat_message.message[:50]}...")

        response_text = await chat_service.process_reflection_message(
            chat_message.message,
            chat_message.session_id,
            chat_message.history,
            chat_message.user_info,
        )

        return ChatResponse(
            response=response_text,
            session_id=chat_message.session_id,
            timestamp=datetime.now().isoformat(),
            status="success"
        )

    except Exception as e:
        logger.error(f"Reflection coach endpoint error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process reflection coach message"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for the chatbot service"""
    return {
        "status": "healthy",
        "service": "skillence-chatbot",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history - localStorage only (no database storage)"""
    # History is stored in browser localStorage, not server
    # This endpoint exists for API compatibility but returns empty
    return {
        "session_id": session_id,
        "messages": [],
        "status": "success",
        "note": "Chat history is stored locally in your browser"
    }

@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history - localStorage only (no database storage)"""
    # History is stored in browser localStorage, not server
    # This endpoint exists for API compatibility
    return {
        "status": "success",
        "session_id": session_id,
        "note": "Clear your browser localStorage to remove chat history"
    }
