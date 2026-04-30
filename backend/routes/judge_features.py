"""
Judge-Focused Decision Support API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import logging

from db.database import get_db
from db.models import User
from routes.auth import get_current_user
from gemini_ai_advanced import (
    generate_bench_memo,
    generate_hearing_preparation,
    assist_judgment_drafting,
    multi_bench_consensus,
    optimize_cause_list
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class BenchMemoRequest(BaseModel):
    case_file: str
    case_id: Optional[str] = None

class BenchMemoResponse(BaseModel):
    bench_memo: Dict
    generated_at: str
    processing_time: float

class HearingPrepRequest(BaseModel):
    case_file: str
    hearing_history: Optional[str] = None
    case_id: Optional[str] = None

class HearingPrepResponse(BaseModel):
    hearing_brief: Dict
    generated_at: str
    processing_time: float

class JudgmentDraftRequest(BaseModel):
    case_analysis: str
    issue: str
    case_id: Optional[str] = None

class JudgmentDraftResponse(BaseModel):
    drafting_assistance: Dict
    override_log: List
    confidence_level: str
    processing_time: float

class MultiBenchRequest(BaseModel):
    opinions: List[Dict]
    case_id: Optional[str] = None

class MultiBenchResponse(BaseModel):
    consensus_analysis: Dict
    processing_time: float

class CauseListRequest(BaseModel):
    cases: List[Dict]
    court_id: Optional[str] = None

class CauseListResponse(BaseModel):
    optimization: Dict
    processing_time: float


@router.post("/bench-memo", response_model=BenchMemoResponse)
async def create_bench_memo(
    request: BenchMemoRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Generate comprehensive bench memo for judges"""
    start_time = datetime.now()
    
    try:
        logger.info("🧾 Generating bench memo...")
        
        result = generate_bench_memo(request.case_file)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Bench memo generated in {processing_time:.2f}s")
        
        return BenchMemoResponse(
            bench_memo=result,
            generated_at=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Bench memo error: {str(e)}")
        
        # Check for quota error
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bench memo generation failed: {str(e)}"
        )


@router.post("/hearing-preparation", response_model=HearingPrepResponse)
async def create_hearing_preparation(
    request: HearingPrepRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Generate hearing preparation brief"""
    start_time = datetime.now()
    
    try:
        logger.info("🧠 Generating hearing preparation...")
        
        result = generate_hearing_preparation(
            request.case_file,
            request.hearing_history
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Hearing preparation generated in {processing_time:.2f}s")
        
        return HearingPrepResponse(
            hearing_brief=result,
            generated_at=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Hearing preparation error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hearing preparation failed: {str(e)}"
        )


@router.post("/judgment-drafting", response_model=JudgmentDraftResponse)
async def assist_with_judgment_drafting(
    request: JudgmentDraftRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Assist with judgment drafting"""
    start_time = datetime.now()
    
    try:
        logger.info("✍️ Generating judgment drafting assistance...")
        
        result = assist_judgment_drafting(
            request.case_analysis,
            request.issue
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Judgment drafting assistance generated in {processing_time:.2f}s")
        
        return JudgmentDraftResponse(
            drafting_assistance=result,
            override_log=result.get('override_log', []),
            confidence_level=result.get('confidence_level', 'suggestive'),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Judgment drafting error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Judgment drafting failed: {str(e)}"
        )


@router.post("/multi-bench-consensus", response_model=MultiBenchResponse)
async def build_multi_bench_consensus(
    request: MultiBenchRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """Assist with multi-bench consensus building"""
    start_time = datetime.now()
    
    try:
        logger.info("🤝 Generating multi-bench consensus analysis...")
        
        result = multi_bench_consensus(request.opinions)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Consensus analysis generated in {processing_time:.2f}s")
        
        return MultiBenchResponse(
            consensus_analysis=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Multi-bench consensus error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-bench consensus failed: {str(e)}"
        )


@router.post("/optimize-cause-list", response_model=CauseListResponse)
async def optimize_court_cause_list(
    request: CauseListRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)
):
    """AI-assisted docket management"""
    start_time = datetime.now()
    
    try:
        logger.info("🗂️ Optimizing cause list...")
        
        result = optimize_cause_list(request.cases)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Cause list optimized in {processing_time:.2f}s")
        
        return CauseListResponse(
            optimization=result,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Cause list optimization error: {str(e)}")
        
        if "429" in str(e) or "quota" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cause list optimization failed: {str(e)}"
        )


@router.get("/features-info")
async def get_judge_features_info():
    """Get information about judge-focused features"""
    return {
        "features": [
            {
                "name": "Bench Memo Generator",
                "endpoint": "/bench-memo",
                "description": "Generate comprehensive bench memos with issue framing, balanced arguments, and precedent analysis"
            },
            {
                "name": "Hearing Preparation Assistant",
                "endpoint": "/hearing-preparation",
                "description": "Prepare for hearings with similar matters, unresolved questions, and time allocation"
            },
            {
                "name": "Judgment Drafting Aid",
                "endpoint": "/judgment-drafting",
                "description": "Assist with judgment drafting with templates, precedent application, and suggested language"
            },
            {
                "name": "Multi-Bench Consensus Builder",
                "endpoint": "/multi-bench-consensus",
                "description": "Facilitate consensus building for division/constitutional benches"
            },
            {
                "name": "Cause List Optimizer",
                "endpoint": "/optimize-cause-list",
                "description": "AI-assisted docket management with grouping and time optimization"
            }
        ],
        "model": "Google Gemini 2.5 Flash",
        "note": "All features maintain judicial independence. AI provides assistance, not decisions."
    }
