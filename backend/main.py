from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, resume, profile
from app.database import connect_to_mongo, close_mongo_connection
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

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

@app.get("/")
async def root():
    return {"message": "Skillence API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)