#!/usr/bin/env python3
import asyncio
import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

from app.database import connect_to_mongo, close_mongo_connection, get_database

async def test_database_connection():
    """Test basic database operations"""
    print("🔍 Testing Database Connection...")
    
    try:
        # Connect to database
        await connect_to_mongo()
        db = get_database()
        
        if db is None:
            print("❌ Database connection failed")
            return False
            
        print("✅ Database connected successfully")
        
        # Test collections
        collections = await db.list_collection_names()
        print(f"📁 Available collections: {collections}")
        
        # Test users collection
        users_count = await db.users.count_documents({})
        print(f"👥 Users collection count: {users_count}")
        
        # Test resumes collection  
        resumes_count = await db.resumes.count_documents({})
        print(f"📄 Resumes collection count: {resumes_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False
    
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    result = asyncio.run(test_database_connection())
    sys.exit(0 if result else 1)
