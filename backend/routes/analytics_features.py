"""
Analytics & Forecasting API Routes
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
    litigation_forecasting,
    compliance_scanner,
    counterfactual_analysis,
    precedent_impact_tracker
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class LitigationForecastRequest(BaseModel):
    case_details: str
    case_id: Optional[str] = None

class LitigationForecastResponse(BaseModel):
    forecasting: Dict
    disclaimer: str
    confidence: str
    processing_time: float

class ComplianceScanRequest(BaseModel):
    filing: str
    document_type: Optional[str] = None

class ComplianceScanResponse(BaseModel):
    compliance_scan: Dict
    processing_time: float

class CounterfactualRequest(BaseModel):
    case_details: str
    what_if_scenario: str

class CounterfactualResponse(BaseModel):
    counterfactual: Dict
    processing_time: float

class PrecedentImpactRequest(BaseModel):
    case_citation: str

class PrecedentImpactResponse(BaseModel):
    impact_analysis: Dict
    processing_time: float


@router.post("/litigation-forecasting", response_model=LitigationForecastResponse)
async def forecast_litigation(
    request: LitigationForecastRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Provide non-binding litigation insights"""
    start_time = datetime.now()
    
    try:
        logger.info("🔮 Generating litigation forecast...")
        
        result = litigation_forecasting(request.case_details)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Litigation forecast generated in {processing_time:.2f}s")
        
        return LitigationForecastResponse(
            forecasting=result,
            disclaimer=result.get('disclaimer', 'Non-binding insights for planning purposes only'),
            confidence=result.get('confidence', 'analytical_estimate'),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Litigation forecasting error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Litigation forecasting failed: {str(e)}"
        )


@router.post("/compliance-scanner", response_model=ComplianceScanResponse)
async def scan_compliance(
    request: ComplianceScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Scan filings for compliance issues"""
    start_time = datetime.now()
    
    try:
        logger.info("📜 Scanning for compliance issues...")
        
        result = compliance_scanner(request.filing)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Compliance scan completed in {processing_time:.2f}s")
        
        return ComplianceScanResponse(
            compliance_scan=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Compliance scanner error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Compliance scanner failed: {str(e)}"
        )


@router.post("/counterfactual-analysis", response_model=CounterfactualResponse)
async def analyze_counterfactual(
    request: CounterfactualRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """What-if analysis for legal scenarios"""
    start_time = datetime.now()
    
    try:
        logger.info("🔁 Performing counterfactual analysis...")
        
        result = counterfactual_analysis(
            request.case_details,
            request.what_if_scenario
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Counterfactual analysis completed in {processing_time:.2f}s")
        
        return CounterfactualResponse(
            counterfactual=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Counterfactual analysis error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Counterfactual analysis failed: {str(e)}"
        )


@router.post("/precedent-impact-tracker", response_model=PrecedentImpactResponse)
async def track_precedent_impact(
    request: PrecedentImpactRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Track how judgments are cited and their impact"""
    start_time = datetime.now()
    
    try:
        logger.info("📚 Tracking precedent impact...")
        
        result = precedent_impact_tracker(request.case_citation)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Precedent impact tracked in {processing_time:.2f}s")
        
        return PrecedentImpactResponse(
            impact_analysis=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Precedent impact tracker error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Precedent impact tracker failed: {str(e)}"
        )


@router.get("/features-info")
async def get_analytics_features_info():
    """Get information about analytics features"""
    return {
        "features": [
            {
                "name": "Litigation Forecasting",
                "endpoint": "/litigation-forecasting",
                "description": "Non-binding insights on win probability, settlement windows, and risk assessment"
            },
            {
                "name": "Compliance Scanner",
                "endpoint": "/compliance-scanner",
                "description": "Scan filings for procedural gaps, missing disclosures, and compliance risks"
            },
            {
                "name": "Counterfactual Analysis",
                "endpoint": "/counterfactual-analysis",
                "description": "What-if analysis for legal scenarios and alternate outcomes"
            },
            {
                "name": "Precedent Impact Tracker",
                "endpoint": "/precedent-impact-tracker",
                "description": "Track how judgments are cited and their doctrinal impact"
            }
        ],
        "model": "Google Gemini 2.5 Flash",
        "note": "All analytics are for planning and research. Not deterministic predictions."
    }
