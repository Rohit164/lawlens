from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import io
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class OCRResponse(BaseModel):
    filename: str
    extracted_text: str
    text_length: int
    method: str


@router.post("/extract", response_model=OCRResponse)
async def extract_text(file: UploadFile = File(...)):
    """Extract text from uploaded file"""
    content = await file.read()
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()

    extracted = ""
    method = "none"

    try:
        if ext == ".txt":
            extracted = content.decode("utf-8", errors="ignore")
            method = "plain_text"

        elif ext == ".pdf":
            try:
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                extracted = "\n".join(page.extract_text() or "" for page in reader.pages)
                method = "pypdf2"
            except ImportError:
                raise HTTPException(status_code=501, detail="PDF extraction not available in this environment")

        elif ext in [".docx", ".doc"]:
            try:
                import docx
                doc = docx.Document(io.BytesIO(content))
                extracted = "\n".join(p.text for p in doc.paragraphs)
                method = "python_docx"
            except ImportError:
                raise HTTPException(status_code=501, detail="DOCX extraction not available in this environment")

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Supported: .txt, .pdf, .docx")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    if not extracted.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from the file")

    return OCRResponse(filename=filename, extracted_text=extracted, text_length=len(extracted), method=method)


@router.get("/status")
async def ocr_status():
    return {"status": "ready", "supported_formats": [".txt", ".pdf", ".docx"], "note": "Image OCR not available on free tier"}
