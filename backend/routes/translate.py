from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from datetime import datetime
import logging
import re

from db.database import get_db
from db.models import User, Document, Translation
from routes.auth import get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Use Gemini by default
USE_GEMINI = True

# Language mappings
LANGUAGE_CODES = {
    "hindi": "hi",
    "marathi": "mr", 
    "tamil": "ta",
    "bengali": "bn",
    "gujarati": "gu",
    "kannada": "kn",
    "malayalam": "ml",
    "punjabi": "pa",
    "telugu": "te",
    "urdu": "ur"
}

LANGUAGE_NAMES = {v: k for k, v in LANGUAGE_CODES.items()}

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
    confidence_score: Optional[float] = None
    processing_time: float

class SupportedLanguagesResponse(BaseModel):
    supported_languages: List[dict]
    model_info: dict

def load_translation_model(model_name: str = "ai4bharat/indictrans2-en-indic-1B"):
    """Load IndicTrans2 translation model"""
    global translation_models
    
    try:
        logger.info(f"Loading translation model: {model_name}")
        
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        model.to(device)
        model.eval()
        
        translation_models[model_name] = {
            "tokenizer": tokenizer,
            "model": model
        }
        
        logger.info(f"Translation model loaded successfully on {device}")
        return True
        
    except Exception as e:
        logger.error(f"Error loading translation model: {str(e)}")
        # Try loading a simpler model as fallback
        try:
            logger.info("Trying fallback translation model...")
            # Use Helsinki-NLP models as fallback
            fallback_models = {
                "hi": "Helsinki-NLP/opus-mt-en-hi",
                "mr": "Helsinki-NLP/opus-mt-en-mr", 
                "ta": "Helsinki-NLP/opus-mt-en-ta"
            }
            
            for lang_code, model_name in fallback_models.items():
                try:
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                    model.to(device)
                    model.eval()
                    
                    translation_models[f"fallback_{lang_code}"] = {
                        "tokenizer": tokenizer,
                        "model": model,
                        "target_lang": lang_code
                    }
                    logger.info(f"Loaded fallback model for {lang_code}")
                except Exception as fallback_error:
                    logger.warning(f"Failed to load fallback model for {lang_code}: {fallback_error}")
            
            return len(translation_models) > 0
            
        except Exception as e2:
            logger.error(f"Error loading fallback models: {str(e2)}")
            return False

# Initialize model on startup
@router.on_event("startup")
async def startup_event():
    load_translation_model()

def preprocess_text_for_translation(text: str) -> str:
    """Preprocess text for better translation"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Handle legal abbreviations
    legal_abbrevs = {
        "Hon'ble": "Honorable",
        "J.": "Justice",
        "CJ": "Chief Justice",
        "v.": "versus",
        "vs.": "versus",
        "etc.": "etcetera",
        "i.e.": "that is",
        "e.g.": "for example"
    }
    
    for abbrev, full_form in legal_abbrevs.items():
        text = text.replace(abbrev, full_form)
    
    return text.strip()

def translate_with_indictrans(text: str, target_lang: str) -> tuple[str, float]:
    """Translate text using IndicTrans2 model"""
    global translation_models
    
    try:
        # Check if main model is available
        main_model_key = "ai4bharat/indictrans2-en-indic-1B"
        if main_model_key in translation_models:
            model_info = translation_models[main_model_key]
            tokenizer = model_info["tokenizer"]
            model = model_info["model"]
            
            # Prepare input with language prefix for IndicTrans2
            input_text = f"<2{target_lang}> {text}"
            
            # Tokenize
            inputs = tokenizer(
                input_text,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding=True
            ).to(device)
            
            # Generate translation
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=4,
                    early_stopping=True,
                    do_sample=False
                )
            
            # Decode translation
            translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove language prefix if present
            if translated_text.startswith(f"<2{target_lang}>"):
                translated_text = translated_text[len(f"<2{target_lang}>"):].strip()
            
            return translated_text, 0.85  # Default confidence
        
        # Try fallback model
        fallback_key = f"fallback_{target_lang}"
        if fallback_key in translation_models:
            model_info = translation_models[fallback_key]
            tokenizer = model_info["tokenizer"]
            model = model_info["model"]
            
            # Tokenize
            inputs = tokenizer(
                text,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding=True
            ).to(device)
            
            # Generate translation
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=4,
                    early_stopping=True
                )
            
            # Decode translation
            translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return translated_text, 0.75  # Lower confidence for fallback
        
        # No model available
        raise Exception(f"No translation model available for language: {target_lang}")
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )

def split_text_for_translation(text: str, max_length: int = 400) -> List[str]:
    """Split long text into chunks for translation"""
    sentences = re.split(r'[.!?]+', text)
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        if current_length + len(sentence) > max_length and current_chunk:
            chunks.append('. '.join(current_chunk) + '.')
            current_chunk = [sentence]
            current_length = len(sentence)
        else:
            current_chunk.append(sentence)
            current_length += len(sentence)
    
    if current_chunk:
        chunks.append('. '.join(current_chunk) + '.')
    
    return chunks

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    request: TranslateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Translate text to specified Indian language"""
    start_time = datetime.now()
    
    # Validate target language
    if request.target_language not in LANGUAGE_CODES.values():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported target language: {request.target_language}. Supported: {list(LANGUAGE_CODES.values())}"
        )
    
    try:
        # Preprocess text
        processed_text = preprocess_text_for_translation(request.text)
        
        # Check if text is too short
        if len(processed_text.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text too short for translation"
            )
        
        # Split text into chunks if too long
        text_chunks = split_text_for_translation(processed_text)
        
        # Translate each chunk
        translated_chunks = []
        confidences = []
        
        for chunk in text_chunks:
            translated_chunk, confidence = translate_with_indictrans(chunk, request.target_language)
            translated_chunks.append(translated_chunk)
            confidences.append(confidence)
        
        # Combine translated chunks
        final_translation = ' '.join(translated_chunks)
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        # Save translation to database if document_id provided
        if request.document_id:
            document = db.query(Document).filter(
                Document.id == request.document_id,
                Document.user_id == current_user.id
            ).first()
            
            if document:
                translation = Translation(
                    document_id=request.document_id,
                    language_code=request.target_language,
                    translated_text=final_translation,
                    translation_model="IndicTrans2",
                    confidence_score=avg_confidence
                )
                db.add(translation)
                db.commit()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return TranslateResponse(
            document_id=request.document_id,
            source_language=request.source_language,
            target_language=request.target_language,
            original_text=request.text,
            translated_text=final_translation,
            confidence_score=avg_confidence,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )

@router.get("/supported-languages", response_model=SupportedLanguagesResponse)
async def get_supported_languages():
    """Get list of supported languages for translation"""
    languages = []
    for name, code in LANGUAGE_CODES.items():
        languages.append({
            "name": name.title(),
            "code": code,
            "native_name": {
                "hi": "हिंदी",
                "mr": "मराठी", 
                "ta": "தமிழ்",
                "bn": "বাংলা",
                "gu": "ગુજરાતી",
                "kn": "ಕನ್ನಡ",
                "ml": "മലയാളം",
                "pa": "ਪੰਜਾਬੀ",
                "te": "తెలుగు",
                "ur": "اردو"
            }.get(code, name.title())
        })
    
    return SupportedLanguagesResponse(
        supported_languages=languages,
        model_info={
            "primary_model": "IndicTrans2",
            "fallback_models": "Helsinki-NLP OPUS",
            "device": str(device),
            "max_input_length": 512,
            "models_loaded": len(translation_models)
        }
    )

@router.get("/model-status")
async def get_translation_model_status():
    """Get translation model status"""
    return {
        "models_loaded": len(translation_models),
        "available_models": list(translation_models.keys()),
        "device": str(device),
        "status": "ready" if translation_models else "not_loaded"
    }
