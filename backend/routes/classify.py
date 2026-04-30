from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModel
import numpy as np
from datetime import datetime
import logging

from db.database import get_db
from db.models import User, Document, Classification
from routes.auth import get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Use Gemini by default
USE_GEMINI = True

# Global model variables (loaded once)
inlegal_tokenizer = None
inlegal_model = None
classification_tokenizer = None
classification_model = None
label_mapping = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Pydantic models
class ClassificationRequest(BaseModel):
    text: str
    document_id: Optional[int] = None
    tasks: List[str] = ["outcome_prediction", "statute_classification", "semantic_similarity"]

class ClassificationResult(BaseModel):
    task: str
    label: str
    confidence: float
    explanation: Optional[Dict[str, Any]] = None

class ClassificationResponse(BaseModel):
    document_id: Optional[int]
    results: List[ClassificationResult]
    processing_time: float

# Load InLegalBERT model
def load_inlegal_model():
    global inlegal_tokenizer, inlegal_model, classification_tokenizer, classification_model, label_mapping
    try:
        # Try to load custom trained classification model first
        custom_model_path = "models/lawlens_classification"
        import os
        import json
        
        if os.path.exists(custom_model_path):
            logger.info(f"Loading custom trained classification model from {custom_model_path}")
            classification_tokenizer = AutoTokenizer.from_pretrained(custom_model_path)
            classification_model = AutoModelForSequenceClassification.from_pretrained(custom_model_path)
            classification_model.to(device)
            classification_model.eval()
            
            # Load label mapping
            with open(f"{custom_model_path}/label_mapping.json", 'r') as f:
                label_mapping = json.load(f)
            
            logger.info(f"✅ Custom trained classification model loaded successfully on {device}")
            logger.info(f"   Labels: {list(label_mapping.values())}")
            return True
        else:
            logger.info("Custom model not found, loading InLegalBERT base model...")
            model_name = "law-ai/InLegalBERT"
            
            inlegal_tokenizer = AutoTokenizer.from_pretrained(model_name)
            # Use AutoModel for embeddings, can be fine-tuned for specific tasks
            inlegal_model = AutoModel.from_pretrained(model_name)
            inlegal_model.to(device)
            inlegal_model.eval()
            
            logger.info(f"InLegalBERT model loaded successfully on {device}")
            return True
    except Exception as e:
        logger.error(f"Error loading classification model: {str(e)}")
        return False

# Initialize model on startup
@router.on_event("startup")
async def startup_event():
    load_inlegal_model()

def get_text_embeddings(text: str) -> np.ndarray:
    """Get embeddings from InLegalBERT for the input text"""
    global inlegal_tokenizer, inlegal_model
    
    if inlegal_tokenizer is None or inlegal_model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="InLegalBERT model not loaded"
        )
    
    try:
        # Tokenize input
        inputs = inlegal_tokenizer(
            text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(device)
        
        # Get embeddings
        with torch.no_grad():
            outputs = inlegal_model(**inputs)
            # Use [CLS] token embedding (first token)
            embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
        
        return embeddings[0]
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing text: {str(e)}"
        )

def predict_case_outcome(text: str) -> Dict[str, Any]:
    """Predict case outcome using trained classification model"""
    global classification_tokenizer, classification_model, label_mapping
    
    try:
        # Use custom trained model if available
        if classification_model is not None and classification_tokenizer is not None:
            logger.info("Using custom trained model for prediction")
            
            # Tokenize input
            inputs = classification_tokenizer(
                text[:512],
                max_length=512,
                truncation=True,
                padding=True,
                return_tensors="pt"
            ).to(device)
            
            # Predict
            with torch.no_grad():
                outputs = classification_model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = torch.argmax(predictions, dim=-1).item()
                confidence = predictions[0][predicted_class].item()
            
            predicted_outcome = label_mapping[str(predicted_class)]
            
            # Get all probabilities
            all_probs = {
                label_mapping[str(i)]: predictions[0][i].item()
                for i in range(len(label_mapping))
            }
            
            return {
                "label": predicted_outcome.capitalize(),
                "confidence": confidence,
                "explanation": {
                    "all_probabilities": all_probs,
                    "model": "custom_trained"
                }
            }
        else:
            # Fallback to rule-based
            logger.info("Using rule-based prediction (custom model not loaded)")
            embeddings = get_text_embeddings(text)
            
            keywords_favorable = ["allowed", "granted", "accepted", "in favor", "succeeded"]
            keywords_unfavorable = ["dismissed", "rejected", "denied", "against", "failed"]
            
            text_lower = text.lower()
            favorable_score = sum(1 for kw in keywords_favorable if kw in text_lower)
            unfavorable_score = sum(1 for kw in keywords_unfavorable if kw in text_lower)
            
            if favorable_score > unfavorable_score:
                label = "Favorable"
                confidence = min(0.95, 0.6 + (favorable_score * 0.1))
            elif unfavorable_score > favorable_score:
                label = "Unfavorable"
                confidence = min(0.95, 0.6 + (unfavorable_score * 0.1))
            else:
                label = "Neutral"
                confidence = 0.5
            
            return {
                "label": label,
                "confidence": confidence,
                "explanation": {
                    "favorable_keywords": favorable_score,
                    "unfavorable_keywords": unfavorable_score,
                    "model": "rule_based"
                }
            }
    except Exception as e:
        logger.error(f"Error in outcome prediction: {str(e)}")
        return {"label": "Unknown", "confidence": 0.0, "explanation": {"error": str(e)}}

def classify_statute(text: str) -> Dict[str, Any]:
    """Classify the type of statute/law using InLegalBERT"""
    try:
        embeddings = get_text_embeddings(text)
        
        # Rule-based classification for different law types
        law_types = {
            "Criminal Law": ["criminal", "penal", "murder", "theft", "assault", "ipc", "crpc"],
            "Civil Law": ["civil", "contract", "property", "tort", "damages", "cpc"],
            "Constitutional Law": ["constitutional", "fundamental rights", "article", "constitution"],
            "Corporate Law": ["company", "corporate", "securities", "merger", "acquisition"],
            "Family Law": ["marriage", "divorce", "custody", "maintenance", "family"],
            "Labor Law": ["employment", "labor", "worker", "industrial", "wages"],
            "Tax Law": ["tax", "income", "gst", "customs", "excise"],
            "Environmental Law": ["environment", "pollution", "forest", "wildlife"]
        }
        
        text_lower = text.lower()
        scores = {}
        
        for law_type, keywords in law_types.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            scores[law_type] = score
        
        # Find the law type with highest score
        best_match = max(scores, key=scores.get)
        max_score = scores[best_match]
        
        if max_score > 0:
            confidence = min(0.95, 0.5 + (max_score * 0.1))
            label = best_match
        else:
            label = "General Law"
            confidence = 0.3
        
        return {
            "label": label,
            "confidence": confidence,
            "explanation": {
                "keyword_scores": scores,
                "embedding_shape": embeddings.shape
            }
        }
    except Exception as e:
        logger.error(f"Error in statute classification: {str(e)}")
        return {"label": "Unknown", "confidence": 0.0, "explanation": {"error": str(e)}}

def compute_semantic_similarity(text: str, reference_texts: List[str] = None) -> Dict[str, Any]:
    """Compute semantic similarity with reference legal texts"""
    try:
        embeddings = get_text_embeddings(text)
        
        # Default reference cases for similarity
        if reference_texts is None:
            reference_texts = [
                "The Supreme Court held that fundamental rights are inviolable.",
                "The contract was found to be void due to lack of consideration.",
                "The accused was found guilty beyond reasonable doubt."
            ]
        
        similarities = []
        for ref_text in reference_texts:
            ref_embeddings = get_text_embeddings(ref_text)
            # Cosine similarity
            similarity = np.dot(embeddings, ref_embeddings) / (
                np.linalg.norm(embeddings) * np.linalg.norm(ref_embeddings)
            )
            similarities.append(float(similarity))
        
        max_similarity = max(similarities) if similarities else 0.0
        
        return {
            "label": f"Similarity Score: {max_similarity:.3f}",
            "confidence": max_similarity,
            "explanation": {
                "similarities": similarities,
                "reference_count": len(reference_texts),
                "embedding_shape": embeddings.shape
            }
        }
    except Exception as e:
        logger.error(f"Error in semantic similarity: {str(e)}")
        return {"label": "Unknown", "confidence": 0.0, "explanation": {"error": str(e)}}

@router.post("/classify", response_model=ClassificationResponse)
async def classify_text(
    request: ClassificationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)  # Make auth optional
):
    """Classify legal text using Google Gemini AI"""
    start_time = datetime.now()
    
    try:
        results = []
        
        # Use Gemini AI for classification
        if USE_GEMINI and "outcome_prediction" in request.tasks:
            try:
                logger.info("🤖 Using Google Gemini AI for prediction...")
                gemini_result = predict_with_gemini(request.text)
                
                outcome = gemini_result.get('predicted_outcome', 'unknown').capitalize()
                confidence = gemini_result.get('confidence', 50) / 100.0
                
                results.append(ClassificationResult(
                    task="outcome_prediction",
                    label=outcome,
                    confidence=confidence,
                    explanation={
                        "key_factors": gemini_result.get('key_factors', []),
                        "reasoning": gemini_result.get('reasoning', ''),
                        "precedents": gemini_result.get('precedents', []),
                        "model": "gemini-pro"
                    }
                ))
                
                logger.info(f"✅ Gemini prediction: {outcome} ({confidence*100:.1f}%)")
                
            except Exception as e:
                logger.error(f"Gemini failed: {str(e)}, falling back to local model...")
                # Fallback to local model
                result = predict_case_outcome(request.text)
                results.append(ClassificationResult(
                    task="outcome_prediction",
                    label=result["label"],
                    confidence=result["confidence"],
                    explanation=result["explanation"]
                ))
        
        # Process other tasks with existing methods
        for task in request.tasks:
            if task == "statute_classification":
                result = classify_statute(request.text)
                results.append(ClassificationResult(
                    task=task,
                    label=result["label"],
                    confidence=result["confidence"],
                    explanation=result["explanation"]
                ))
            
            elif task == "semantic_similarity":
                result = compute_semantic_similarity(request.text)
                results.append(ClassificationResult(
                    task=task,
                    label=result["label"],
                    confidence=result["confidence"],
                    explanation=result["explanation"]
                ))
        
        # Save to database if user is authenticated
        if request.document_id and current_user:
            document = db.query(Document).filter(
                Document.id == request.document_id,
                Document.user_id == current_user.id
            ).first()
            
            if document:
                for result in results:
                    classification = Classification(
                        document_id=request.document_id,
                        task_type=result.task,
                        predicted_label=result.label,
                        confidence_score=result.confidence,
                        model_name="gemini-pro" if USE_GEMINI else "local",
                        explanation_data=result.explanation
                    )
                    db.add(classification)
                
                db.commit()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ClassificationResponse(
            document_id=request.document_id,
            results=results,
            processing_time=processing_time
        )
    
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(e)}"
        )

@router.get("/model-info")
async def get_model_info():
    """Get information about the loaded InLegalBERT model"""
    global inlegal_model, inlegal_tokenizer
    
    if inlegal_model is None or inlegal_tokenizer is None:
        return {"status": "not_loaded", "message": "InLegalBERT model not loaded"}
    
    return {
        "status": "loaded",
        "model_name": "law-ai/InLegalBERT",
        "device": str(device),
        "vocab_size": inlegal_tokenizer.vocab_size,
        "max_length": inlegal_tokenizer.model_max_length,
        "supported_tasks": [
            "outcome_prediction",
            "statute_classification", 
            "semantic_similarity"
        ]
    }
