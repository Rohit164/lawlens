from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from db.database import get_db
from db.models import User, Document, Classification
from routes.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

class ClassificationRequest(BaseModel):
    text: str
    document_id: Optional[int] = None
    tasks: List[str] = ["outcome_prediction", "statute_classification"]

class ClassificationResult(BaseModel):
    task: str
    label: str
    confidence: float
    explanation: Optional[Dict[str, Any]] = None

class ClassificationResponse(BaseModel):
    document_id: Optional[int]
    results: List[ClassificationResult]
    processing_time: float

def classify_statute(text: str) -> Dict[str, Any]:
    law_types = {
        "Criminal Law": ["criminal", "penal", "murder", "theft", "ipc", "crpc"],
        "Civil Law": ["civil", "contract", "property", "tort", "cpc"],
        "Constitutional Law": ["constitutional", "fundamental rights", "article", "constitution"],
        "Corporate Law": ["company", "corporate", "securities", "merger"],
        "Family Law": ["marriage", "divorce", "custody", "maintenance"],
        "Labor Law": ["employment", "labor", "worker", "wages"],
        "Tax Law": ["tax", "income", "gst", "customs"],
        "Environmental Law": ["environment", "pollution", "forest", "wildlife"],
    }
    text_lower = text.lower()
    scores = {k: sum(1 for kw in v if kw in text_lower) for k, v in law_types.items()}
    best = max(scores, key=scores.get)
    score = scores[best]
    return {
        "label": best if score > 0 else "General Law",
        "confidence": min(0.95, 0.5 + score * 0.1) if score > 0 else 0.3,
        "explanation": {"keyword_scores": scores},
    }

def predict_outcome_simple(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    favorable = sum(1 for kw in ["allowed", "granted", "accepted", "in favor", "succeeded"] if kw in text_lower)
    unfavorable = sum(1 for kw in ["dismissed", "rejected", "denied", "against", "failed"] if kw in text_lower)
    if favorable > unfavorable:
        return {"label": "Favorable", "confidence": min(0.95, 0.6 + favorable * 0.1)}
    elif unfavorable > favorable:
        return {"label": "Unfavorable", "confidence": min(0.95, 0.6 + unfavorable * 0.1)}
    return {"label": "Neutral", "confidence": 0.5}

@router.post("/classify", response_model=ClassificationResponse)
async def classify_text(
    request: ClassificationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None),
):
    start_time = datetime.now()
    results = []

    if "outcome_prediction" in request.tasks:
        r = predict_outcome_simple(request.text)
        results.append(ClassificationResult(task="outcome_prediction", label=r["label"], confidence=r["confidence"]))

    if "statute_classification" in request.tasks:
        r = classify_statute(request.text)
        results.append(ClassificationResult(task="statute_classification", label=r["label"], confidence=r["confidence"], explanation=r["explanation"]))

    if request.document_id and current_user:
        doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
        if doc:
            for res in results:
                db.add(Classification(
                    document_id=request.document_id,
                    task_type=res.task,
                    predicted_label=res.label,
                    confidence_score=res.confidence,
                    model_name="rule_based",
                ))
            db.commit()

    return ClassificationResponse(
        document_id=request.document_id,
        results=results,
        processing_time=(datetime.now() - start_time).total_seconds(),
    )

@router.get("/model-info")
async def get_model_info():
    return {"status": "ready", "model": "rule_based", "supported_tasks": ["outcome_prediction", "statute_classification"]}
