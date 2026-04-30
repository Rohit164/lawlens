"""
Judge-Focused Decision Support API Routes - LOCAL AI VERSION
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
    generate_bench_memo_ai,
    prepare_hearing_ai,
    draft_judgment_ai
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class BenchMemoRequest(BaseModel):
    case_file: str
    case_id: Optional[str] = None

class HearingPrepRequest(BaseModel):
    case_file: str
    case_id: Optional[str] = None

class JudgmentDraftRequest(BaseModel):
    case_details: str
    issue: Optional[str] = ""
    case_id: Optional[str] = None


@router.post("/bench-memo")
async def create_bench_memo(
    request: BenchMemoRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Generate comprehensive bench memo using local AI"""
    start_time = datetime.now()
    
    try:
        logger.info("🧾 Generating bench memo with local AI...")
        
        result = generate_bench_memo_ai(request.case_file)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Bench memo generated in {processing_time:.2f}s")
        
        return {
            "success": result["success"],
            "bench_memo": result["bench_memo"],
            "model_used": result["model_used"],
            "generated_at": datetime.now().isoformat(),
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Bench memo error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bench memo generation failed: {str(e)}"
        )


@router.post("/hearing-preparation")
async def create_hearing_preparation(
    request: HearingPrepRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Generate hearing preparation brief using local AI"""
    start_time = datetime.now()
    
    try:
        logger.info("🧠 Generating hearing preparation with local AI...")
        
        result = prepare_hearing_ai(request.case_file)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Hearing preparation generated in {processing_time:.2f}s")
        
        return {
            "success": result["success"],
            "hearing_brief": result["hearing_brief"],
            "model_used": result["model_used"],
            "generated_at": datetime.now().isoformat(),
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Hearing preparation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hearing preparation failed: {str(e)}"
        )


@router.post("/judgment-drafting")
async def assist_with_judgment_drafting(
    request: JudgmentDraftRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Assist with judgment drafting using local AI"""
    start_time = datetime.now()
    
    try:
        logger.info("✍️ Generating judgment draft with local AI...")
        
        result = draft_judgment_ai(request.case_details, request.issue)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Judgment draft generated in {processing_time:.2f}s")
        
        return {
            "success": result["success"],
            "judgment_draft": result["judgment_draft"],
            "model_used": result["model_used"],
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Judgment drafting error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Judgment drafting failed: {str(e)}"
        )


@router.get("/features-info")
async def get_judge_features_info():
    """Get information about judge-focused features"""
    return {
        "features": [
            {
                "name": "Bench Memo Generator",
                "endpoint": "/bench-memo",
                "description": "Generate comprehensive bench memos with local AI"
            },
            {
                "name": "Hearing Preparation Assistant",
                "endpoint": "/hearing-preparation",
                "description": "Prepare for hearings with local AI"
            },
            {
                "name": "Judgment Drafting Aid",
                "endpoint": "/judgment-drafting",
                "description": "Assist with judgment drafting using local AI"
            }
        ],
        "model": "Mistral 7B Instruct (Local)",
        "note": "All features run locally. No API costs. Maintains judicial independence."
    }
