"""
Translation route using Google Translate (fallback)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging

from db.database import get_db
from db.models import User, Document, Translation
from routes.auth import get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class TranslateRequest(BaseModel):
    text: str
    target_language: str  # Language code (hi, mr, ta, etc.)
    document_id: Optional[int] = None
    source_language: str = "en"

class TranslateResponse(BaseModel):
    document_id: Optional[int]
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    confidence_score: float
    processing_time: float

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    request: TranslateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)  # Make auth optional
):
    """Translate text to Indian languages using Google Gemini AI"""
    start_time = datetime.now()
    
    # Supported languages
    supported_langs = ['hi', 'mr', 'ta', 'bn', 'gu', 'kn', 'ml', 'pa', 'te', 'ur']
    
    if request.target_language not in supported_langs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language {request.target_language} not supported. Supported: {', '.join(supported_langs)}"
        )
    
    try:
        logger.info(f"🌍 Translating to {request.target_language} using Gemini...")
        
        # Use Gemini for translation
        gemini_result = translate_with_gemini(request.text, request.target_language)
        
        translated_text = gemini_result.get('translated_text', '')
        confidence = gemini_result.get('confidence', 85) / 100.0
        
        # Save to database if user is authenticated
        if request.document_id and current_user:
            document = db.query(Document).filter(
                Document.id == request.document_id,
                Document.user_id == current_user.id
            ).first()
            
            if document:
                translation = Translation(
                    document_id=request.document_id,
                    language_code=request.target_language,
                    translated_text=translated_text,
                    translation_model="gemini-pro",
                    confidence_score=confidence
                )
                db.add(translation)
                db.commit()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Translation complete in {processing_time:.2f}s")
        
        return TranslateResponse(
            document_id=request.document_id,
            source_language=request.source_language,
            target_language=request.target_language,
            original_text=request.text[:500] + "..." if len(request.text) > 500 else request.text,
            translated_text=translated_text,
            confidence_score=confidence,
            processing_time=processing_time
        )
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Translation error: {error_msg}")
        
        # Check if it's a quota error
        if "429" in error_msg or "quota" in error_msg.lower() or "ResourceExhausted" in error_msg:
            logger.warning("⚠️ Gemini API quota exceeded for translation")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="FREE_TIER_LIMIT_REACHED"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages for translation"""
    return {
        "supported_languages": [
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी"},
            {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
            {"code": "bn", "name": "Bengali", "native_name": "বাংলা"},
            {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી"},
            {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ"},
            {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം"},
            {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"},
            {"code": "ur", "name": "Urdu", "native_name": "اردو"}
        ],
        "model": "Google Gemini Pro",
        "note": "High-quality AI-powered translation for Indian languages"
    }
