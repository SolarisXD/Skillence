from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import UserCreate, UserLogin, UserResponse, Token, PasswordReset, PasswordResetConfirm
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

def get_auth_service():
    return AuthService()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.register_user(user_data)

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.login_user(login_data)

@router.get("/verify", response_model=UserResponse)
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security), auth_service: AuthService = Depends(get_auth_service)):
    token = credentials.credentials
    user = await auth_service.get_current_user(token)
    return user

@router.post("/forgot-password")
async def forgot_password(password_reset: PasswordReset, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.request_password_reset(password_reset.email)

@router.post("/reset-password")
async def reset_password(reset_data: PasswordResetConfirm, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.reset_password(reset_data.token, reset_data.new_password)

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), auth_service: AuthService = Depends(get_auth_service)):
    token = credentials.credentials
    return await auth_service.get_current_user(token)