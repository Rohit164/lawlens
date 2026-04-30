from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import PyPDF2
import docx
import pytesseract
import easyocr
from PIL import Image
import pdf2image
import io
import os
from datetime import datetime
import logging

from db.database import get_db
from db.models import User, Document
from routes.auth import get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize EasyOCR reader
ocr_reader = None

# Pydantic models
class OCRResponse(BaseModel):
    document_id: Optional[int] = None
    filename: str
    extracted_text: str
    confidence: Optional[float] = None
    processing_time: float
    file_size: int
    extraction_method: str

def initialize_ocr():
    """Initialize OCR readers"""
    global ocr_reader
    try:
        # Initialize EasyOCR with English and Hindi support
        ocr_reader = easyocr.Reader(['en', 'hi'])
        logger.info("EasyOCR initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing OCR: {str(e)}")
        return False

# Initialize OCR on startup
@router.on_event("startup")
async def startup_event():
    initialize_ocr()

def extract_text_from_image(image_bytes: bytes) -> tuple[str, float]:
    """Extract text from image using OCR"""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Use EasyOCR if available, fallback to Tesseract
        if ocr_reader is not None:
            try:
                results = ocr_reader.readtext(image_bytes)
                text_parts = []
                confidences = []
                
                for (bbox, text, confidence) in results:
                    text_parts.append(text)
                    confidences.append(confidence)
                
                extracted_text = ' '.join(text_parts)
                avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
                
                return extracted_text, avg_confidence
            except Exception as e:
                logger.warning(f"EasyOCR failed, falling back to Tesseract: {str(e)}")
        
        # Fallback to Tesseract
        extracted_text = pytesseract.image_to_string(image, lang='eng+hin')
        return extracted_text, 0.8  # Default confidence for Tesseract
        
    except Exception as e:
        logger.error(f"OCR extraction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )

def extract_text_from_pdf_direct(pdf_bytes: bytes) -> tuple[str, str]:
    """Extract text directly from PDF (faster, for text-based PDFs)"""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        all_text = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text.strip():
                all_text.append(text)
        
        full_text = '\n\n'.join(all_text)
        
        # If we got substantial text, return it
        if len(full_text.strip()) > 100:
            return full_text, "direct_extraction"
        else:
            # PDF might be scanned, need OCR
            return "", "needs_ocr"
            
    except Exception as e:
        logger.warning(f"Direct PDF extraction failed: {str(e)}")
        return "", "needs_ocr"

def extract_text_from_docx(docx_bytes: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc_file = io.BytesIO(docx_bytes)
        doc = docx.Document(doc_file)
        
        all_text = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                all_text.append(paragraph.text)
        
        return '\n\n'.join(all_text)
        
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DOCX processing failed: {str(e)}"
        )
    """Extract text from PDF using OCR"""
    try:
        # Convert PDF to images
        images = pdf2image.convert_from_bytes(pdf_bytes)
        
        all_text = []
        all_confidences = []
        
        for i, image in enumerate(images):
            logger.info(f"Processing page {i+1}/{len(images)}")
            
            # Convert PIL image to bytes for EasyOCR
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_bytes = img_byte_arr.getvalue()
            
            # Extract text from this page
            page_text, page_confidence = extract_text_from_image(img_bytes)
            all_text.append(page_text)
            all_confidences.append(page_confidence)
        
        # Combine all pages
        full_text = '\n\n'.join(all_text)
        avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0
        
        return full_text, avg_confidence
        
    except Exception as e:
        logger.error(f"PDF OCR error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF OCR processing failed: {str(e)}"
        )

@router.post("/extract", response_model=OCRResponse)
async def extract_text_from_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)  # Make auth optional
):
    """Extract text from uploaded PDF, DOCX, or image file"""
    start_time = datetime.now()
    
    # Validate file type
    allowed_types = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'image/jpeg': 'image',
        'image/jpg': 'image', 
        'image/png': 'image',
        'image/tiff': 'image',
        'image/bmp': 'image'
    }
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Supported: PDF, DOCX, Images"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        logger.info(f"Processing file: {file.filename} ({file_size} bytes)")
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 50MB."
            )
        
        # Create document record if user is authenticated
        document_id = None
        if current_user:
            document = Document(
                user_id=current_user.id,
                filename=file.filename,
                file_size=file_size,
                processing_status="processing"
            )
            db.add(document)
            db.commit()
            db.refresh(document)
            document_id = document.id
        
        # Extract text based on file type
        file_type = allowed_types[file.content_type]
        extraction_method = "unknown"
        
        if file_type == 'pdf':
            logger.info("Attempting direct PDF text extraction...")
            extracted_text, method = extract_text_from_pdf_direct(file_content)
            
            if method == "needs_ocr":
                logger.info("Direct extraction failed, using OCR...")
                extracted_text, confidence = extract_text_from_pdf(file_content)
                extraction_method = "ocr"
            else:
                extraction_method = "direct"
                confidence = 1.0
                
        elif file_type == 'docx':
            logger.info("Extracting text from DOCX...")
            extracted_text = extract_text_from_docx(file_content)
            extraction_method = "direct"
            confidence = 1.0
            
        else:  # image
            logger.info("Extracting text from image using OCR...")
            extracted_text, confidence = extract_text_from_image(file_content)
            extraction_method = "ocr"
        
        logger.info(f"Extracted {len(extracted_text)} characters using {extraction_method}")
        
        # Update document with extracted text if user is authenticated
        if current_user and document_id:
            document.original_text = extracted_text
            document.processing_status = "completed"
            db.commit()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return OCRResponse(
            document_id=document_id,
            filename=file.filename,
            extracted_text=extracted_text,
            confidence=confidence if extraction_method == "ocr" else 1.0,
            processing_time=processing_time,
            file_size=file_size,
            extraction_method=extraction_method
        )
        
    except HTTPException:
        # Update document status to failed
        if current_user and 'document' in locals():
            document.processing_status = "failed"
            db.commit()
        raise
    except Exception as e:
        # Update document status to failed
        if current_user and 'document' in locals():
            document.processing_status = "failed"
            db.commit()
        
        logger.error(f"Text extraction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text extraction failed: {str(e)}"
        )

@router.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported file formats for text extraction"""
    return {
        "supported_formats": [
            {
                "type": "PDF",
                "mime_types": ["application/pdf"],
                "extensions": [".pdf"],
                "extraction_methods": ["Direct text extraction", "OCR for scanned PDFs"]
            },
            {
                "type": "DOCX",
                "mime_types": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
                "extensions": [".docx"],
                "extraction_methods": ["Direct text extraction"]
            },
            {
                "type": "Images", 
                "mime_types": [
                    "image/jpeg", "image/jpg", "image/png", 
                    "image/tiff", "image/bmp"
                ],
                "extensions": [".jpg", ".jpeg", ".png", ".tiff", ".bmp"],
                "extraction_methods": ["OCR"]
            }
        ],
        "max_file_size": "50MB",
        "supported_languages": ["English", "Hindi"],
        "ocr_engines": ["EasyOCR", "Tesseract"],
        "note": "PDF and DOCX files are extracted directly (faster). Scanned PDFs and images use OCR."
    }

@router.get("/status")
async def get_ocr_status():
    """Get OCR service status"""
    return {
        "status": "active" if ocr_reader is not None else "limited",
        "easyocr_available": ocr_reader is not None,
        "tesseract_available": True,  # Assume Tesseract is always available
        "supported_languages": ["en", "hi"]
    }
