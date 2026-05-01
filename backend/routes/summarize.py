from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
import re

from db.database import get_db
from db.models import User, Document
from routes.auth import get_current_user
from ai_tools_gemini import generate_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter()


class SummarizeRequest(BaseModel):
    text: str
    document_id: Optional[int] = None
    summary_length: str = "medium"
    extract_metadata: bool = True
    translate_to: Optional[str] = None


class DocumentMetadata(BaseModel):
    court_name: Optional[str] = None
    case_number: Optional[str] = None
    date: Optional[str] = None
    parties: Optional[Dict[str, str]] = None
    judges: Optional[str] = None


class SummarizeResponse(BaseModel):
    document_id: Optional[int]
    original_length: int
    summary_length: int
    summary: str
    key_points: List[str]
    metadata: Optional[DocumentMetadata] = None
    processing_time: float
    translated_summary: Optional[str] = None
    translation_language: Optional[str] = None


def extract_metadata(text: str) -> DocumentMetadata:
    meta = DocumentMetadata()
    court = re.search(r'IN THE (.+?) COURT', text, re.IGNORECASE)
    if court:
        meta.court_name = court.group(1).strip()
    case = re.search(r'(?:CASE NO|NO)\.?\s*([A-Z0-9\/\-\s]+\d{4})', text, re.IGNORECASE)
    if case:
        meta.case_number = case.group(1).strip()
    date = re.search(r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})', text)
    if date:
        meta.date = date.group(1)
    vs = re.search(r'([A-Z][A-Z\s\.]+)\s+(?:VS?\.?|VERSUS)\s+([A-Z][A-Z\s\.]+)', text)
    if vs:
        meta.parties = {"petitioner": vs.group(1).strip(), "respondent": vs.group(2).strip()}
    return meta


def extract_key_points(text: str, summary: str) -> List[str]:
    held = re.findall(r'(?:HELD|held|It is held)[:\s]*([^\.]+\.)', text)
    if held:
        return [h.strip() for h in held[:5]]
    sentences = [s.strip() + '.' for s in summary.split('.') if len(s.strip()) > 20]
    return sentences[:5]


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(
    request: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None),
):
    start_time = datetime.now()
    text = re.sub(r'\s+', ' ', request.text).strip()

    if len(text) < 100:
        raise HTTPException(status_code=400, detail="Text too short (minimum 100 characters)")

    length_map = {"short": 150, "medium": 300, "detailed": 500}
    max_tokens = length_map.get(request.summary_length, 300)

    prompt = (
        f"You are a legal document summarizer. Summarize the following legal document in {request.summary_length} length "
        f"(max {max_tokens} words). Be concise and accurate. Return only the summary.\n\n{text[:4000]}"
    )

    try:
        summary = generate_response(prompt, max_tokens=max_tokens)
    except Exception as e:
        logger.error(f"Gemini summarization failed: {e}")
        # Fallback: return first few sentences
        sentences = text.split('.')
        summary = '. '.join(sentences[:5]) + '.'

    key_points = extract_key_points(text, summary)
    metadata = extract_metadata(text) if request.extract_metadata else None

    translated_summary = None
    translation_language = None
    if request.translate_to and request.translate_to != 'en':
        try:
            lang_map = {'hi': 'Hindi', 'mr': 'Marathi', 'ta': 'Tamil', 'bn': 'Bengali',
                        'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'te': 'Telugu'}
            lang_name = lang_map.get(request.translate_to, request.translate_to)
            t_prompt = f"Translate this to {lang_name}. Return only the translation.\n\n{summary}"
            translated_summary = generate_response(t_prompt, max_tokens=max_tokens)
            translation_language = lang_name
        except Exception as e:
            logger.warning(f"Translation failed: {e}")

    if request.document_id and current_user:
        doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
        if doc:
            doc.simplified_text = summary
            doc.processing_status = "completed"
            db.commit()

    if current_user:
        current_user.documents_processed += 1
        db.commit()

    return SummarizeResponse(
        document_id=request.document_id,
        original_length=len(text),
        summary_length=len(summary),
        summary=summary,
        key_points=key_points,
        metadata=metadata,
        processing_time=(datetime.now() - start_time).total_seconds(),
        translated_summary=translated_summary,
        translation_language=translation_language,
    )


@router.post("/test-summarize")
async def test_summarize(request: SummarizeRequest):
    return await summarize_document(request, db=next(get_db()), current_user=None)


@router.get("/model-info")
async def model_info():
    return {"status": "ready", "model": "Google Gemini 1.5 Flash", "supported_lengths": ["short", "medium", "detailed"]}
