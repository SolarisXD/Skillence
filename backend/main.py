from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, profile, resume, job_trends, career_path, chatbot, ml_predictions, placement_cell, student_placement, skills
from app.database import connect_to_mongo, close_mongo_connection, get_connection_status
import os
from dotenv import load_dotenv
import logging

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)


def _parse_allowed_origins() -> list:
    origins_from_env = os.getenv("CORS_ORIGINS", "")
    parsed = [origin.strip() for origin in origins_from_env.split(",") if origin.strip()]

    if not parsed:
        parsed = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

    return parsed

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

# Configure basic logging so info/debug from services print to terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(title="Skillence API", version="1.0.0", lifespan=lifespan)

allowed_origins = _parse_allowed_origins()
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(career_path.router, prefix="/api/career-path", tags=["career-path"])
app.include_router(job_trends.router, prefix="/api/job-trends", tags=["job-trends"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(ml_predictions.router, prefix="/api/ml", tags=["ml-predictions"])
app.include_router(placement_cell.router, prefix="/api", tags=["placement-cell"])
app.include_router(student_placement.router, prefix="/api", tags=["student-placement"])
app.include_router(skills.router, prefix="/api/skills", tags=["skills"])

@app.get("/")
async def root():
    return {"message": "Skillence API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint that reports service status."""
    db_status = get_connection_status()
    if not db_status["connected"]:
        raise HTTPException(
            status_code=503,
            detail=f"Service Unavailable: {db_status['error']}"
        )
    return {
        "status": "healthy",
        "message": "Skillence API is running with database connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")