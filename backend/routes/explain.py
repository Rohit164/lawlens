from fastapi import APIRouter, HTTPException, Depends
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

class ExplainRequest(BaseModel):
    text: str
    document_id: Optional[int] = None
    explanation_type: str = "keyword"

class WordImportance(BaseModel):
    word: str
    importance: float
    position: int

class ExplanationResult(BaseModel):
    method: str
    word_importances: List[WordImportance]
    overall_score: float
    confidence: float

class ExplainResponse(BaseModel):
    document_id: Optional[int]
    text_length: int
    explanations: List[ExplanationResult]
    processing_time: float
    model_info: Dict[str, Any]

LEGAL_KEYWORDS = {
    "allowed": 0.9, "granted": 0.8, "upheld": 0.8, "accepted": 0.7,
    "dismissed": -0.9, "rejected": -0.8, "denied": -0.7, "failed": -0.6,
    "fundamental": 0.5, "rights": 0.4, "constitution": 0.5,
    "evidence": 0.3, "proved": 0.6, "liable": -0.4,
}

def keyword_explain(text: str) -> ExplanationResult:
    words = text.lower().split()
    importances = []
    for i, word in enumerate(words[:100]):  # limit to first 100 words
        clean = word.strip(".,;:()")
        score = LEGAL_KEYWORDS.get(clean, 0.0)
        if score != 0.0:
            importances.append(WordImportance(word=clean, importance=score, position=i))

    overall = sum(w.importance for w in importances) / max(len(importances), 1)
    confidence = min(0.95, abs(overall) + 0.3)
    return ExplanationResult(method="keyword", word_importances=importances, overall_score=overall, confidence=confidence)

@router.post("/explain", response_model=ExplainResponse)
async def explain_prediction(
    request: ExplainRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None),
):
    start_time = datetime.now()
    result = keyword_explain(request.text)

    if request.document_id and current_user:
        doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
        if doc:
            db.add(Classification(
                document_id=request.document_id,
                task_type="explainability",
                predicted_label="explained",
                confidence_score=result.confidence,
                model_name="keyword_based",
                explanation_data={"method": result.method},
            ))
            db.commit()

    return ExplainResponse(
        document_id=request.document_id,
        text_length=len(request.text),
        explanations=[result],
        processing_time=(datetime.now() - start_time).total_seconds(),
        model_info={"model": "keyword_based", "note": "Lightweight explainability for production"},
    )

@router.get("/methods")
async def get_methods():
    return {"available_methods": [{"name": "keyword", "description": "Legal keyword importance scoring", "available": True}]}
