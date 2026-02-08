from app.database import get_database
from app.models.user import UserCreate, UserLogin
from app.utils.security import get_password_hash, verify_password, create_access_token, verify_token, create_reset_token
from app.utils.email import send_password_reset_email
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from bson import ObjectId
import os
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class AuthService:
    def __init__(self):
        self.db = None
        self.users_collection = None
    
    def _get_collection(self):
        if self.db is None:
            self.db = get_database()
            self.users_collection = self.db.users
        return self.users_collection
    
    async def register_user(self, user_data: UserCreate):
        users_collection = self._get_collection()
        
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "password": hashed_password,
            "created_at": datetime.utcnow(),
            "is_verified": False
        }
        
        # Insert user
        result = await users_collection.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user_data.email, "user_id": str(result.inserted_id)}
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    async def login_user(self, login_data: UserLogin):
        users_collection = self._get_collection()
        
        # Find user
        user = await users_collection.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"], "user_id": str(user["_id"])}
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    async def verify_token(self, token: str):
        """Verify JWT token and return user data"""
        users_collection = self._get_collection()
        
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        email = payload.get("sub")
        user_id = payload.get("user_id")
        if not email or not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return {
            "userId": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"],
            "is_verified": user["is_verified"]
        }

    async def get_current_user(self, token: str):
        users_collection = self._get_collection()
        
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"],
            "is_verified": user["is_verified"]
        }
    
    async def request_password_reset(self, email: str):
        users_collection = self._get_collection()
        
        # Check if user exists
        user = await users_collection.find_one({"email": email})
        if not user:
            # Don't reveal if email exists or not
            return {"message": "If the email exists, a reset link has been sent"}
        
        # Create reset token
        reset_token = create_reset_token(email)
        
        # Send email
        email_sent = await send_password_reset_email(email, reset_token)
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reset email"
            )
        
        return {"message": "If the email exists, a reset link has been sent"}
    
    async def reset_password(self, token: str, new_password: str):
        users_collection = self._get_collection()
        
        # Verify reset token
        payload = verify_token(token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        email = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        # Find user
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash new password
        hashed_password = get_password_hash(new_password)
        
        # Update user password
        await users_collection.update_one(
            {"email": email},
            {"$set": {"password": hashed_password}}
        )

    async def google_login(self, token: str):
        """Authenticate a user via Google OAuth2 ID token (Gmail accounts only)"""
        users_collection = self._get_collection()

        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not google_client_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google Client ID not configured on server"
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                google_client_id
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google token verification failed: {str(e)}"
            )

        email = idinfo.get("email", "")
        name = idinfo.get("name", "")

        # Enforce Gmail-only
        if not email.endswith("@gmail.com"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only @gmail.com accounts are allowed"
            )

        # Check if user exists
        user = await users_collection.find_one({"email": email})

        if not user:
            # Auto sign-up
            random_password = secrets.token_urlsafe(32)
            hashed_password = get_password_hash(random_password)
            user_doc = {
                "email": email,
                "name": name,
                "password": hashed_password,
                "created_at": datetime.utcnow(),
                "is_verified": True,
                "auth_provider": "google"
            }
            result = await users_collection.insert_one(user_doc)
            user_id = str(result.inserted_id)
        else:
            user_id = str(user["_id"])
            name = user.get("name", name)

        # Create JWT access token
        access_token = create_access_token(
            data={"sub": email, "user_id": user_id}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "name": name
            }
        }
        
        return {"message": "Password reset successfully"}