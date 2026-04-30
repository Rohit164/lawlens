"""
Lawyer-Focused Trial Strategy API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import logging

from db.database import get_db
from db.models import User
from routes.auth import get_current_user
from gemini_ai_advanced import (
    adversarial_simulation,
    judge_analytics,
    real_time_court_assistance
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class AdversarialSimRequest(BaseModel):
    case_brief: str
    user_arguments: str
    case_id: Optional[str] = None

class AdversarialSimResponse(BaseModel):
    adversarial_analysis: Dict
    processing_time: float

class JudgeAnalyticsRequest(BaseModel):
    judge_name: Optional[str] = None
    court: Optional[str] = None

class JudgeAnalyticsResponse(BaseModel):
    analytics: Dict
    disclaimer: str
    anonymized: bool
    processing_time: float

class RealTimeAssistRequest(BaseModel):
    query: str
    context: str

class RealTimeAssistResponse(BaseModel):
    assistance: Dict
    processing_time: float


@router.post("/adversarial-simulation", response_model=AdversarialSimResponse)
async def run_adversarial_simulation(
    request: AdversarialSimRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Devil's Advocate mode - predict opponent's strategy"""
    start_time = datetime.now()
    
    try:
        logger.info("⚔️ Running adversarial simulation...")
        
        result = adversarial_simulation(
            request.case_brief,
            request.user_arguments
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Adversarial simulation completed in {processing_time:.2f}s")
        
        return AdversarialSimResponse(
            adversarial_analysis=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Adversarial simulation error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Adversarial simulation failed: {str(e)}"
        )


@router.post("/judge-analytics", response_model=JudgeAnalyticsResponse)
async def get_judge_analytics(
    request: JudgeAnalyticsRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Provide anonymized judge analytics for research"""
    start_time = datetime.now()
    
    try:
        logger.info("📊 Generating judge analytics...")
        
        result = judge_analytics(
            request.judge_name,
            request.court
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Judge analytics generated in {processing_time:.2f}s")
        
        return JudgeAnalyticsResponse(
            analytics=result,
            disclaimer=result.get('disclaimer', 'For research purposes only'),
            anonymized=result.get('anonymized', True),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Judge analytics error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Judge analytics failed: {str(e)}"
        )


@router.post("/real-time-assistance", response_model=RealTimeAssistResponse)
async def get_real_time_assistance(
    request: RealTimeAssistRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Real-time assistance during court proceedings"""
    start_time = datetime.now()
    
    try:
        logger.info("⚡ Providing real-time assistance...")
        
        result = real_time_court_assistance(
            request.query,
            request.context
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Real-time assistance provided in {processing_time:.2f}s")
        
        return RealTimeAssistResponse(
            assistance=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Real-time assistance error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Real-time assistance failed: {str(e)}"
        )


@router.get("/features-info")
async def get_lawyer_features_info():
    """Get information about lawyer-focused features"""
    return {
        "features": [
            {
                "name": "Adversarial Simulation",
                "endpoint": "/adversarial-simulation",
                "description": "Devil's Advocate mode to predict opponent's strategy and identify weaknesses"
            },
            {
                "name": "Judge Analytics",
                "endpoint": "/judge-analytics",
                "description": "Anonymized analytical insights for research and preparation"
            },
            {
                "name": "Real-Time Court Assistance",
                "endpoint": "/real-time-assistance",
                "description": "Instant legal assistance during court proceedings"
            }
        ],
        "model": "Google Gemini 2.5 Flash",
        "note": "All features are for preparation and research. Not for prediction certainty."
    }
