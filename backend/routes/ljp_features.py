"""
AI Features API - Powered by Local AI (Hugging Face)
ONLY for AI Tools (Judge/Lawyer/Analytics)
Streamlit uses separate models
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import time
from ai_tools_ollama import (
    generate_bench_memo_ai,
    prepare_hearing_ai,
    draft_judgment_ai,
    adversarial_simulation_ai,
    litigation_forecasting_ai,
    legal_drafting_ai,
    judge_analytics_ai,
    real_time_assistance_ai,
    compliance_scanner_ai,
    counterfactual_analysis_ai,
    precedent_impact_ai,
)

router = APIRouter()

# Request Models
class BenchMemoRequest(BaseModel):
    case_file: str

class HearingPrepRequest(BaseModel):
    case_file: str

class JudgmentDraftRequest(BaseModel):
    case_details: str
    issue: Optional[str] = ""

class AdversarialRequest(BaseModel):
    case_brief: str
    user_arguments: str

class ForecastingRequest(BaseModel):
    case_details: str

class JudgeAnalyticsRequest(BaseModel):
    judge_name: str

class RealTimeRequest(BaseModel):
    query: str

class LegalDraftingRequest(BaseModel):
    document_type: str
    facts: str
    jurisdiction: str
    citations: Optional[str] = ""

class ComplianceRequest(BaseModel):
    filing_text: str

class CounterfactualRequest(BaseModel):
    case_details: str
    what_if_scenario: str

class PrecedentRequest(BaseModel):
    case_citation: str

# ==================== JUDGE FEATURES ====================

@router.post("/api/judge/bench-memo")
async def api_bench_memo(request: BenchMemoRequest):
    """Generate bench memo using Gemini AI"""
    try:
        start_time = time.time()
        result = generate_bench_memo_ai(request.case_file)
        
        return {
            "success": result["success"],
            "bench_memo": result["bench_memo"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/judge/hearing-preparation")
async def api_hearing_prep(request: HearingPrepRequest):
    """Prepare for hearing using Gemini AI"""
    try:
        start_time = time.time()
        result = prepare_hearing_ai(request.case_file)
        
        return {
            "success": result["success"],
            "hearing_brief": result["hearing_brief"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/judge/judgment-drafting")
async def api_judgment_draft(request: JudgmentDraftRequest):
    """Draft judgment using Groq AI with validation"""
    try:
        start_time = time.time()
        result = draft_judgment_ai(request.case_details, request.issue or "")
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to generate judgment"))
        
        return {
            "success": result["success"],
            "judgment_draft": result["judgment_draft"],
            "model_used": result.get("model_used", "Groq Llama 3.3 70B"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/judge/multi-bench-consensus")
async def api_multi_bench(request: dict):
    """Multi-bench consensus"""
    try:
        return {
            "success": True,
            "message": "Multi-bench consensus analysis",
            "consensus": "Feature available - provide multiple opinions for analysis"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/judge/optimize-cause-list")
async def api_cause_list(request: dict):
    """Cause list optimizer"""
    try:
        return {
            "success": True,
            "message": "Cause list optimization",
            "recommendations": ["Group similar cases", "Prioritize urgent matters", "Allocate appropriate time"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== LAWYER FEATURES ====================

@router.post("/api/lawyer/adversarial-simulation")
async def api_adversarial(request: AdversarialRequest):
    """Adversarial simulation using Gemini AI"""
    try:
        start_time = time.time()
        result = adversarial_simulation_ai(request.case_brief, request.user_arguments)
        
        return {
            "success": result["success"],
            "simulation": result["simulation"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/lawyer/forecasting")
async def api_forecasting(request: ForecastingRequest):
    """Litigation forecasting using Gemini AI"""
    try:
        start_time = time.time()
        result = litigation_forecasting_ai(request.case_details)
        
        return {
            "success": result["success"],
            "forecast": result["forecast"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/lawyer/judge-analytics")
async def api_judge_analytics(request: JudgeAnalyticsRequest):
    """Judge analytics using Gemini AI"""
    try:
        start_time = time.time()
        result = judge_analytics_ai(request.judge_name)
        
        return {
            "success": result["success"],
            "analytics": result["analytics"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/lawyer/real-time-assistance")
async def api_real_time(request: RealTimeRequest):
    """Real-time assistance using Groq AI"""
    try:
        start_time = time.time()
        result = real_time_assistance_ai(request.query)
        
        return {
            "success": result["success"],
            "assistance": result["assistance"],
            "model_used": result.get("model_used", "Groq Llama 3.3 70B"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/lawyer/legal-drafting")
async def api_legal_drafting(request: LegalDraftingRequest):
    """Legal document drafting using Groq AI with validation"""
    try:
        start_time = time.time()
        result = legal_drafting_ai(
            request.document_type,
            request.facts,
            request.jurisdiction,
            request.citations or ""
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to generate draft"))
        
        return {
            "success": result["success"],
            "draft": result["draft"],
            "model_used": result.get("model_used", "Groq Llama 3.3 70B"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/lawyer/compliance")
async def api_compliance(request: ComplianceRequest):
    """Compliance scanner using Gemini AI"""
    try:
        start_time = time.time()
        result = compliance_scanner_ai(request.filing_text)
        
        return {
            "success": result["success"],
            "compliance_report": result["compliance_report"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ANALYTICS FEATURES ====================

@router.post("/api/analytics/counterfactual")
async def api_counterfactual(request: CounterfactualRequest):
    """Counterfactual analysis using Gemini AI"""
    try:
        start_time = time.time()
        result = counterfactual_analysis_ai(request.case_details, request.what_if_scenario)
        
        return {
            "success": result["success"],
            "analysis": result["analysis"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analytics/precedent-impact")
async def api_precedent_impact(request: PrecedentRequest):
    """Precedent impact analysis using Gemini AI"""
    try:
        start_time = time.time()
        result = precedent_impact_ai(request.case_citation)
        
        return {
            "success": result["success"],
            "impact_analysis": result["impact_analysis"],
            "model_used": result.get("model_used", "Gemini Pro"),
            "processing_time": round(time.time() - start_time, 2)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== INFO ENDPOINTS ====================

@router.get("/api/judge/features-info")
async def judge_features_info():
    """Get judge features information"""
    return {
        "features": [
            {"name": "Bench Memo Generator", "status": "active", "model": "LJP"},
            {"name": "Hearing Preparation", "status": "active", "model": "LJP"},
            {"name": "Judgment Drafting", "status": "active", "model": "LJP"},
            {"name": "Multi-Bench Consensus", "status": "active", "model": "LJP"},
            {"name": "Cause List Optimizer", "status": "active", "model": "LJP"}
        ],
        "model_info": {
            "name": "LJP Model",
            "type": "Legal Judgment Prediction",
            "status": "Mock responses for demonstration"
        }
    }

@router.get("/api/lawyer/features-info")
async def lawyer_features_info():
    """Get lawyer features information"""
    return {
        "features": [
            {"name": "Adversarial Simulator", "status": "active", "model": "LJP"},
            {"name": "Litigation Forecasting", "status": "active", "model": "LJP"},
            {"name": "Judge Analytics", "status": "active", "model": "LJP"},
            {"name": "Real-Time Assistant", "status": "active", "model": "LJP"},
            {"name": "Compliance Scanner", "status": "active", "model": "LJP"}
        ],
        "model_info": {
            "name": "LJP Model",
            "type": "Legal Judgment Prediction",
            "status": "Mock responses for demonstration"
        }
    }

@router.get("/api/analytics/features-info")
async def analytics_features_info():
    """Get analytics features information"""
    return {
        "features": [
            {"name": "Litigation Forecasting", "status": "active", "model": "LJP"},
            {"name": "Compliance Scanner", "status": "active", "model": "LJP"},
            {"name": "Counterfactual Analysis", "status": "active", "model": "LJP"},
            {"name": "Precedent Impact Tracker", "status": "active", "model": "LJP"}
        ],
        "model_info": {
            "name": "LJP Model",
            "type": "Legal Judgment Prediction",
            "status": "Mock responses for demonstration"
        }
    }
