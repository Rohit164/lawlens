from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from datetime import datetime
import logging
import re

from db.database import get_db
from db.models import User, Document
from routes.auth import get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Global model variables (fallback)
summarizer_pipeline = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Use local models (no Gemini)
USE_GEMINI = False

# Pydantic models
class SummarizeRequest(BaseModel):
    text: str
    document_id: Optional[int] = None
    summary_length: str = "medium"  # short, medium, detailed
    extract_metadata: bool = True
    translate_to: Optional[str] = None  # Language code for translation (hi, mr, ta, etc.)

class DocumentMetadata(BaseModel):
    court_name: Optional[str] = None
    case_number: Optional[str] = None
    date: Optional[str] = None
    parties: Optional[Dict[str, str]] = None
    judges: Optional[str] = None
    citation: Optional[str] = None

class SummarizeResponse(BaseModel):
    document_id: Optional[int]
    original_length: int
    summary_length: int
    summary: str
    key_points: list
    metadata: Optional[DocumentMetadata] = None
    processing_time: float
    translated_summary: Optional[str] = None  # Translated summary if requested
    translation_language: Optional[str] = None  # Language of translation

# Load summarization model
def load_summarizer_model():
    global summarizer_pipeline
    try:
        logger.info("Loading summarization model...")
        
        # Try to load custom trained model first
        custom_model_path = "models/lawlens_summarization"
        import os
        
        if os.path.exists(custom_model_path):
            logger.info(f"Loading custom trained model from {custom_model_path}")
            tokenizer = AutoTokenizer.from_pretrained(custom_model_path)
            model = AutoModelForSeq2SeqLM.from_pretrained(custom_model_path)
            model.to(device)
            
            summarizer_pipeline = pipeline(
                "summarization",
                model=model,
                tokenizer=tokenizer,
                device=0 if torch.cuda.is_available() else -1,
                framework="pt"
            )
            logger.info(f"✅ Custom trained model loaded successfully on {device}")
            return True
        else:
            logger.info("Custom model not found, loading base model...")
            model_name = "facebook/bart-large-cnn"
            
            # Create summarization pipeline
            summarizer_pipeline = pipeline(
                "summarization",
                model=model_name,
                tokenizer=model_name,
                device=0 if torch.cuda.is_available() else -1,
                framework="pt"
            )
            
            logger.info(f"Base summarization model loaded successfully on {device}")
            return True
    except Exception as e:
        logger.error(f"Error loading summarization model: {str(e)}")
        # Fallback to a smaller model if BART fails
        try:
            logger.info("Trying fallback model...")
            summarizer_pipeline = pipeline(
                "summarization",
                model="sshleifer/distilbart-cnn-12-6",
                device=0 if torch.cuda.is_available() else -1,
                framework="pt"
            )
            logger.info("Fallback summarization model loaded successfully")
            return True
        except Exception as e2:
            logger.error(f"Error loading fallback model: {str(e2)}")
            return False

# Initialize model on startup
@router.on_event("startup")
async def startup_event():
    load_summarizer_model()

def preprocess_legal_text(text: str) -> str:
    """Preprocess legal text for better summarization"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove page numbers and citations in brackets
    text = re.sub(r'\[\d+\]', '', text)
    
    # Remove common legal document headers/footers
    text = re.sub(r'IN THE .* COURT.*?\n', '', text, flags=re.IGNORECASE)
    text = re.sub(r'CORAM:.*?\n', '', text, flags=re.IGNORECASE)
    
    # Clean up multiple periods
    text = re.sub(r'\.{3,}', '...', text)
    
    return text.strip()

def extract_metadata(text: str) -> DocumentMetadata:
    """Extract metadata from legal document"""
    metadata = DocumentMetadata()
    
    try:
        # Extract court name
        court_match = re.search(r'IN THE (.+?) COURT', text, re.IGNORECASE)
        if court_match:
            metadata.court_name = court_match.group(1).strip()
        
        # Extract case number
        case_patterns = [
            r'(?:CIVIL APPEAL|CRIMINAL APPEAL|WRIT PETITION|SPECIAL LEAVE PETITION).*?NO\.?\s*(\d+.*?\d+)',
            r'CASE NO\.?\s*([A-Z0-9\/\-\s]+)',
            r'NO\.?\s*(\d+.*?OF.*?\d{4})'
        ]
        
        for pattern in case_patterns:
            case_match = re.search(pattern, text, re.IGNORECASE)
            if case_match:
                metadata.case_number = case_match.group(1).strip()
                break
        
        # Extract date
        date_patterns = [
            r'DECIDED ON[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})',
            r'JUDGMENT DELIVERED ON[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})',
            r'(\d{1,2}(?:st|nd|rd|th)?\s+\w+,?\s+\d{4})'
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, text, re.IGNORECASE)
            if date_match:
                metadata.date = date_match.group(1).strip()
                break
        
        # Extract parties (simplified)
        vs_match = re.search(r'([A-Z\s\.]+)\s+(?:VS?\.?|VERSUS)\s+([A-Z\s\.]+)', text, re.IGNORECASE)
        if vs_match:
            metadata.parties = {
                "petitioner": vs_match.group(1).strip(),
                "respondent": vs_match.group(2).strip()
            }
        
        # Extract judges
        judge_patterns = [
            r'CORAM[:\s]*(.+?)(?:\n|JUDGMENT)',
            r'(?:HON\'BLE|HONOURABLE)\s+(.+?)(?:\n|,)',
            r'BEFORE[:\s]*(.+?)(?:\n|JUDGMENT)'
        ]
        
        for pattern in judge_patterns:
            judge_match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if judge_match:
                metadata.judges = judge_match.group(1).strip()
                break
    
    except Exception as e:
        logger.error(f"Error extracting metadata: {str(e)}")
    
    return metadata

def extract_key_points(text: str, summary: str) -> list:
    """Extract key legal points from the text"""
    key_points = []
    
    try:
        # Look for numbered points or holdings
        numbered_points = re.findall(r'(?:\d+\.|•|\*)\s*([^\.]+\.)', text)
        if numbered_points:
            key_points.extend([point.strip() for point in numbered_points[:5]])
        
        # Look for "held" statements
        held_matches = re.findall(r'(?:HELD|It is held|The court held)[:\s]*([^\.]+\.)', text, re.IGNORECASE)
        if held_matches:
            key_points.extend([match.strip() for match in held_matches[:3]])
        
        # Look for ratio/principle statements
        ratio_matches = re.findall(r'(?:ratio|principle|rule)[:\s]*([^\.]+\.)', text, re.IGNORECASE)
        if ratio_matches:
            key_points.extend([match.strip() for match in ratio_matches[:2]])
        
        # If no specific points found, extract from summary
        if not key_points:
            sentences = summary.split('.')
            key_points = [sent.strip() + '.' for sent in sentences if len(sent.strip()) > 20][:5]
    
    except Exception as e:
        logger.error(f"Error extracting key points: {str(e)}")
        # Fallback to summary sentences
        sentences = summary.split('.')
        key_points = [sent.strip() + '.' for sent in sentences if len(sent.strip()) > 20][:3]
    
    return key_points

def get_summary_params(length: str, text_length: int) -> Dict[str, int]:
    """Get summarization parameters based on requested length"""
    if length == "short":
        return {
            "max_length": min(150, text_length // 10),
            "min_length": min(50, text_length // 20)
        }
    elif length == "detailed":
        return {
            "max_length": min(500, text_length // 3),
            "min_length": min(200, text_length // 8)
        }
    else:  # medium
        return {
            "max_length": min(300, text_length // 5),
            "min_length": min(100, text_length // 12)
        }

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(
    request: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)  # Make auth optional
):
    """Summarize legal document text using Google Gemini AI"""
    start_time = datetime.now()
    
    try:
        processed_text = preprocess_legal_text(request.text)
        original_length = len(processed_text)
        
        logger.info(f"Processing document of length: {original_length} characters")
        
        if original_length < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text too short for summarization (minimum 100 characters)"
            )
        
        # Use Gemini AI for summarization
        if USE_GEMINI:
            try:
                logger.info("🤖 Using Google Gemini AI for summarization...")
                gemini_result = summarize_with_gemini(processed_text, request.summary_length)
                
                final_summary = gemini_result.get('summary', '')
                key_points = gemini_result.get('key_points', [])
                
                # Extract metadata using Gemini if requested
                metadata = None
                if request.extract_metadata:
                    logger.info("📋 Extracting metadata with Gemini...")
                    try:
                        metadata_dict = extract_metadata_with_gemini(processed_text)
                        if metadata_dict:
                            metadata = DocumentMetadata(
                                court_name=metadata_dict.get('court_name'),
                                case_number=metadata_dict.get('case_number'),
                                date=metadata_dict.get('date'),
                                parties={
                                    "petitioner": metadata_dict.get('petitioner', ''),
                                    "respondent": metadata_dict.get('respondent', '')
                                } if metadata_dict.get('petitioner') else None,
                                judges=', '.join(metadata_dict.get('judges', [])) if metadata_dict.get('judges') else None
                            )
                    except Exception as meta_error:
                        logger.warning(f"Metadata extraction failed: {str(meta_error)}")
                        metadata = None
                
                # Translate summary if requested
                translated_summary = None
                translation_language = None
                if request.translate_to and request.translate_to != 'en':
                    try:
                        logger.info(f"🌍 Translating summary to {request.translate_to}...")
                        translation_result = translate_with_gemini(final_summary, request.translate_to)
                        translated_summary = translation_result.get('translated_text', '')
                        translation_language = translation_result.get('language', request.translate_to)
                        logger.info(f"✅ Translation complete")
                    except Exception as trans_error:
                        logger.error(f"Translation failed: {str(trans_error)}")
                        # Continue without translation
                
                logger.info(f"✅ Gemini summarization complete")
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Gemini failed: {error_msg}")
                
                # Check if it's a quota error
                if "429" in error_msg or "quota" in error_msg.lower() or "ResourceExhausted" in error_msg:
                    logger.warning("⚠️ Gemini API quota exceeded")
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="FREE_TIER_LIMIT_REACHED"
                    )
                else:
                    # Other errors - try fallback
                    logger.info("Falling back to local model...")
                    final_summary, key_points, metadata = await summarize_with_local_model(
                        processed_text, request.summary_length, request.extract_metadata
                    )
                    translated_summary = None
                    translation_language = None
        else:
            # Use local model
            final_summary, key_points, metadata = await summarize_with_local_model(
                processed_text, request.summary_length, request.extract_metadata
            )
            translated_summary = None
            translation_language = None
        
        # Update database if user is authenticated
        if request.document_id and current_user:
            document = db.query(Document).filter(
                Document.id == request.document_id,
                Document.user_id == current_user.id
            ).first()
            
            if document:
                document.simplified_text = final_summary
                document.processing_status = "completed"
                if metadata:
                    document.metadata_json = metadata.dict()
                db.commit()
        
        if current_user:
            current_user.documents_processed += 1
            db.commit()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Summarization complete in {processing_time:.2f}s")
        
        return SummarizeResponse(
            document_id=request.document_id,
            original_length=original_length,
            summary_length=len(final_summary),
            summary=final_summary,
            key_points=key_points,
            metadata=metadata,
            processing_time=processing_time,
            translated_summary=translated_summary,
            translation_language=translation_language
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(e)}"
        )

async def summarize_with_local_model(text: str, length: str, extract_meta: bool):
    """Fallback to local trained model"""
    # Load model if not loaded
    if summarizer_pipeline is None:
        load_summarizer_model()
    
    # Get summary parameters
    summary_params = get_summary_params(length, len(text))
    
    # Generate summary (simplified version)
    final_summary = summarizer_pipeline(
        text[:1024],
        max_length=summary_params["max_length"],
        min_length=summary_params["min_length"],
        do_sample=False
    )[0]['summary_text']
    
    # Extract key points and metadata
    key_points = extract_key_points(text, final_summary)
    metadata = extract_metadata(text) if extract_meta else None
    
    return final_summary, key_points, metadata

@router.get("/model-info")
async def get_summarizer_info():
    """Get information about the loaded summarization model"""
    if summarizer_pipeline is None:
        # Try to load model
        load_summarizer_model()
    
    if summarizer_pipeline is None:
        return {"status": "not_loaded", "message": "Summarization model not loaded"}
    
    return {
        "status": "loaded",
        "model_name": "Google Gemini Pro (Primary) + Custom trained model (Fallback)",
        "device": str(device),
        "supported_lengths": ["short", "medium", "detailed"],
        "max_input_length": 8000,
        "capabilities": [
            "legal_document_summarization",
            "metadata_extraction",
            "key_points_extraction",
            "ai_powered_analysis"
        ]
    }

# Public test endpoint (no authentication required)
@router.post("/test-summarize")
async def test_summarize(request: SummarizeRequest):
    """Test summarization without authentication (for development only)"""
    start_time = datetime.now()
    
    # Load model if not loaded
    if summarizer_pipeline is None:
        logger.warning("Model not loaded, attempting to load now...")
        if not load_summarizer_model():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Summarization model not available. Please check server logs."
            )
    
    try:
        # Preprocess text
        processed_text = preprocess_legal_text(request.text)
        original_length = len(processed_text)
        
        logger.info(f"Processing document of length: {original_length} characters")
        
        # Check if text is too short
        if original_length < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text too short for summarization (minimum 100 characters)"
            )
        
        # Get summary parameters
        summary_params = get_summary_params(request.summary_length, original_length)
        
        # Generate summary
        try:
            # Split long texts into chunks if necessary
            max_chunk_length = 1024  # BART's max input length
            
            if len(processed_text) > max_chunk_length:
                logger.info(f"Text too long ({len(processed_text)} chars), splitting into chunks...")
                # Split into chunks
                chunks = []
                words = processed_text.split()
                current_chunk = []
                current_length = 0
                
                for word in words:
                    if current_length + len(word) > max_chunk_length:
                        chunks.append(' '.join(current_chunk))
                        current_chunk = [word]
                        current_length = len(word)
                    else:
                        current_chunk.append(word)
                        current_length += len(word) + 1
                
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                
                logger.info(f"Split into {len(chunks)} chunks")
                
                # Summarize each chunk
                chunk_summaries = []
                for i, chunk in enumerate(chunks):
                    logger.info(f"Summarizing chunk {i+1}/{len(chunks)}...")
                    chunk_summary = summarizer_pipeline(
                        chunk,
                        max_length=summary_params["max_length"] // len(chunks),
                        min_length=summary_params["min_length"] // len(chunks),
                        do_sample=False
                    )[0]['summary_text']
                    chunk_summaries.append(chunk_summary)
                
                # Combine chunk summaries
                combined_summary = ' '.join(chunk_summaries)
                
                # Final summarization if combined summary is still long
                if len(combined_summary) > summary_params["max_length"]:
                    logger.info("Final summarization of combined chunks...")
                    final_summary = summarizer_pipeline(
                        combined_summary,
                        max_length=summary_params["max_length"],
                        min_length=summary_params["min_length"],
                        do_sample=False
                    )[0]['summary_text']
                else:
                    final_summary = combined_summary
            else:
                # Single summarization for shorter texts
                logger.info("Summarizing in single pass...")
                final_summary = summarizer_pipeline(
                    processed_text,
                    max_length=summary_params["max_length"],
                    min_length=summary_params["min_length"],
                    do_sample=False
                )[0]['summary_text']
        
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Summarization failed: {str(e)}"
            )
        
        # Extract metadata if requested
        metadata = None
        if request.extract_metadata:
            metadata = extract_metadata(request.text)
        
        # Extract key points
        key_points = extract_key_points(request.text, final_summary)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Summarization complete in {processing_time:.2f}s")
        
        return SummarizeResponse(
            document_id=None,
            original_length=original_length,
            summary_length=len(final_summary),
            summary=final_summary,
            key_points=key_points,
            metadata=metadata,
            processing_time=processing_time
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(e)}"
        )
