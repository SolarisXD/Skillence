"""
ML Predictions Router — exposes the Skill Recommender Autoencoder as REST endpoints.

Endpoints:
    POST /api/ml/recommend-skills   — get ML-ranked skill recommendations
    GET  /api/ml/health             — model health / readiness check
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional
import logging

from app.utils.security import verify_token

router = APIRouter()

def _get_recommender():
    """Lazy import to avoid loading torch at server startup."""
    from app.ml.inference.skill_recommender import get_skill_recommender
    return get_skill_recommender()
security = HTTPBearer()
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Auth helper (same pattern as other routers)
# ---------------------------------------------------------------------------
def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    try:
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID missing")
        return user_id
    except Exception as e:
        logger.error(f"Token error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class SkillRecommendationRequest(BaseModel):
    current_skills: List[str] = Field(..., description="Skills the user already knows")
    target_occupation_code: Optional[str] = Field(
        None, description="O*NET SOC code for the target career"
    )
    top_k: int = Field(15, ge=1, le=50, description="Number of recommendations")


class RecommendedSkill(BaseModel):
    skill: str
    confidence: float
    source: str
    is_known: bool = False


class SkillRecommendationResponse(BaseModel):
    success: bool
    recommendations: List[RecommendedSkill]
    matched_input_skills: List[str]
    vocab_size: int
    message: str


class HealthResponse(BaseModel):
    is_model_loaded: bool
    vocab_size: int
    checkpoint: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/recommend-skills", response_model=SkillRecommendationResponse)
async def recommend_skills(
    request: SkillRecommendationRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Return ML-ranked skill recommendations for the authenticated user."""
    recommender = _get_recommender()

    if not recommender.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Skill recommender model is not available. Please try again later.",
        )

    try:
        recommendations = recommender.recommend(
            current_skills=request.current_skills,
            target_occupation_code=request.target_occupation_code,
            top_k=request.top_k,
        )
        matched = recommender.get_known_skill_matches(request.current_skills)

        return SkillRecommendationResponse(
            success=True,
            recommendations=[RecommendedSkill(**r) for r in recommendations],
            matched_input_skills=matched,
            vocab_size=recommender.get_vocab_size(),
            message=f"Generated {len(recommendations)} recommendations from {len(matched)} matched input skills.",
        )

    except Exception as e:
        logger.error(f"Recommendation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")


@router.get("/health", response_model=HealthResponse)
async def ml_health():
    """Check whether the ML model is loaded and ready."""
    recommender = _get_recommender()
    return HealthResponse(
        is_model_loaded=recommender.is_loaded,
        vocab_size=recommender.get_vocab_size() if recommender.is_loaded else 0,
        checkpoint="skill_autoencoder_numpy.npz",
    )
