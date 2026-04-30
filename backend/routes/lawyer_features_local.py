"""
Lawyer-Focused Trial Strategy API Routes - LOCAL AI VERSION
Uses local Mistral 7B model instead of Gemini
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
from ai_tools_local import (
    adversarial_simulation_ai,
    litigation_forecasting_ai,
    legal_drafting_ai
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class AdversarialSimRequest(BaseModel):
    case_brief: str
    user_arguments: str
    case_id: Optional[str] = None

class LitigationForecastRequest(BaseModel):
    case_details: str
    case_id: Optional[str] = None

class LegalDraftingRequest(BaseModel):
    document_type: str  # pleading, brief, motion, contract, petition, affidavit
    facts: str
    jurisdiction: str = "indian-law"
    citations: Optional[str] = ""
    case_id: Optional[str] = None


@router.post("/adversarial-simulation")
async def run_adversarial_simulation(
    request: AdversarialSimRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Devil's Advocate mode - predict opponent's strategy using local AI"""
    start_time = datetime.now()
    
    try:
        logger.info("⚔️ Running adversarial simulation with local AI...")
        
        result = adversarial_simulation_ai(
            request.case_brief,
            request.user_arguments
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Adversarial simulation completed in {processing_time:.2f}s")
        
        return {
            "success": result["success"],
            "simulation": result["simulation"],
            "model_used": result["model_used"],
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Adversarial simulation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Adversarial simulation failed: {str(e)}"
        )


@router.post("/litigation-forecasting")
async def forecast_litigation(
    request: LitigationForecastRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Forecast litigation outcome using local AI"""
    start_time = datetime.now()
    
    try:
        logger.info("📊 Generating litigation forecast with local AI...")
        
        result = litigation_forecasting_ai(request.case_details)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Litigation forecast generated in {processing_time:.2f}s")
        
        return {
            "success": result["success"],
            "forecast": result["forecast"],
            "model_used": result["model_used"],
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Litigation forecasting error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Litigation forecasting failed: {str(e)}"
        )


@router.post("/legal-drafting")
async def draft_legal_document(
    request: LegalDraftingRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Generate legal document draft using local AI"""
    start_time = datetime.now()
    
    try:
        logger.info(f"📝 Drafting {request.document_type} with local AI...")
        
        result = legal_drafting_ai(
            request.document_type,
            request.facts,
            request.jurisdiction,
            request.citations
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Legal draft generated in {processing_time:.2f}s")
        
        return {
            "success": result["success"],
            "draft": result["draft"],
            "model_used": result["model_used"],
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Legal drafting error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Legal drafting failed: {str(e)}"
        )


@router.get("/features-info")
async def get_lawyer_features_info():
    """Get information about lawyer-focused features"""
    return {
        "features": [
            {
                "name": "Adversarial Simulation",
                "endpoint": "/adversarial-simulation",
                "description": "Devil's Advocate mode to predict opponent's strategy"
            },
            {
                "name": "Litigation Forecasting",
                "endpoint": "/litigation-forecasting",
                "description": "Forecast case outcomes and strategic recommendations"
            },
            {
                "name": "Legal Document Drafting",
                "endpoint": "/legal-drafting",
                "description": "Generate professional legal documents (pleadings, briefs, motions, etc.)"
            }
        ],
        "model": "Mistral 7B Instruct (Local)",
        "note": "All features run locally. No API costs. For preparation and research only."
    }
