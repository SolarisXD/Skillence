from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import logging
import asyncio
from datetime import datetime
import os
import re
import google.generativeai as genai

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    session_id: str
    timestamp: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    status: str = "success"

class ChatService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        logger.info(f"Initializing ChatService with API key: {'***' + api_key[-4:] if api_key else 'NOT_FOUND'}")
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.chat_sessions = {}
    
    def get_career_prompt(self):
        return """You are Skillence, an AI-powered career guidance assistant. You specialize in:

• Career planning and guidance
• Skill development recommendations
• Industry insights and trends
• Interview preparation
• Resume and portfolio advice
• Professional development strategies
• Job market analysis
• Career transition support

Provide helpful, professional, and actionable career advice. Keep responses concise but informative. 
Always maintain a supportive and encouraging tone while being practical and realistic.
Format your responses in plain text without markdown symbols like **, *, or other formatting characters."""

    def sanitize_response(self, text: str) -> str:
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
        
        # Ensure proper spacing around bullet points
        text = re.sub(r'\n•', '\n\n•', text)
        text = re.sub(r'^\n+', '', text)  # Remove leading newlines
        text = re.sub(r'\n+$', '', text)  # Remove trailing newlines
        
        return text.strip()

    async def process_message(self, message: str, session_id: str) -> str:
        try:
            logger.info(f"Processing message for session {session_id}: {message[:50]}...")
            
            # Create prompt with context for direct generation
            full_prompt = f"""{self.get_career_prompt()}

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

# Initialize service
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    """Handle chat messages from the frontend"""
    try:
        logger.info(f"Received message from session {chat_message.session_id}: {chat_message.message[:50]}...")
        
        # Process the message
        response_text = await chat_service.process_message(
            chat_message.message, 
            chat_message.session_id
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
    """Get chat history for a session (placeholder for future implementation)"""
    return {
        "session_id": session_id,
        "messages": [],
        "message": "Chat history feature coming soon"
    }
