import motor.motor_asyncio
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

# Load .env from root directory
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")

# Async MongoDB client for FastAPI
client = None
database = None
connection_status = {"connected": False, "error": None}

async def connect_to_mongo():
    global client, database, connection_status
    if not MONGODB_URI:
        error_msg = "MONGODB_URI not found in environment variables"
        logger.error(error_msg)
        connection_status = {"connected": False, "error": error_msg}
        print(f"⚠️  {error_msg}")
        return  # Don't raise, allow app to start for diagnostics
    
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(
            MONGODB_URI,
            tlsAllowInvalidCertificates=True,
            retryWrites=True,
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        database = client.skillence_db
        
        # Test the connection
        await client.admin.command('ping')
        connection_status = {"connected": True, "error": None}
        logger.info("✅ Connected to MongoDB Atlas successfully")
        print("✅ Connected to MongoDB Atlas successfully")
    except Exception as e:
        error_msg = f"Failed to connect to MongoDB: {str(e)}"
        logger.error(error_msg)
        connection_status = {"connected": False, "error": error_msg}
        print(f"⚠️  {error_msg}")
        # Don't raise - allow app to start so we can diagnose the issue in logs

async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("Disconnected from MongoDB")
        print("Disconnected from MongoDB")

def get_database():
    if not connection_status["connected"]:
        logger.warning(f"Database access attempted but not connected: {connection_status['error']}")
    return database

def is_database_connected():
    """Check if database is currently connected."""
    return connection_status["connected"]

def get_connection_status():
    """Get current database connection status for health checks."""
    return connection_status