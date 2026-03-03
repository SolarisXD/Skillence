from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, profile, resume, job_trends, career_path, chatbot, ml_predictions, placement_cell, student_placement
from app.database import connect_to_mongo, close_mongo_connection
import os
from dotenv import load_dotenv
import logging

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

@app.get("/")
async def root():
    return {"message": "Skillence API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")