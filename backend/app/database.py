import motor.motor_asyncio
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load .env from root directory
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")

# Async MongoDB client for FastAPI
client = None
database = None

async def connect_to_mongo():
    global client, database
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI not found in environment variables")
    
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGODB_URI,
        tlsAllowInvalidCertificates=True,
        retryWrites=True
    )
    database = client.skillence_db
    
    # Test the connection
    try:
        await client.admin.command('ping')
        print("Connected to MongoDB Atlas successfully")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise
    
    print("Connected to MongoDB")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    return database