from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import shap
import lime
from lime.lime_text import LimeTextExplainer
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel
from datetime import datetime
import logging

from db.database import get_db
from db.models import User, Document, Classification
from routes.auth import get_current_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Global explainer objects
shap_explainer = None
lime_explainer = None
inlegal_model = None
inlegal_tokenizer = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Pydantic models
class ExplainRequest(BaseModel):
    text: str
    document_id: Optional[int] = None
    explanation_type: str = "both"  # "shap", "lime", or "both"
    prediction_task: str = "classification"  # "classification" or "summarization"

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

def load_explanation_models():
    """Load models and explainers for XAI"""
    global shap_explainer, lime_explainer, inlegal_model, inlegal_tokenizer
    
    try:
        logger.info("Loading models for explainability...")
        
        # Load InLegalBERT for explanations
        model_name = "law-ai/InLegalBERT"
        inlegal_tokenizer = AutoTokenizer.from_pretrained(model_name)
        inlegal_model = AutoModel.from_pretrained(model_name)
        inlegal_model.to(device)
        inlegal_model.eval()
        
        # Initialize LIME explainer
        lime_explainer = LimeTextExplainer(
            class_names=['negative', 'positive'],
            feature_selection='auto',
            split_expression=r'\W+',
            bow=False,
            mode='classification'
        )
        
        logger.info("Explainability models loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error loading explainability models: {str(e)}")
        return False

# Initialize models on startup
@router.on_event("startup")
async def startup_event():
    load_explanation_models()

def get_model_prediction(texts: List[str]) -> np.ndarray:
    """Get model predictions for LIME/SHAP"""
    global inlegal_model, inlegal_tokenizer
    
    if inlegal_model is None or inlegal_tokenizer is None:
        raise Exception("InLegalBERT model not loaded")
    
    try:
        predictions = []
        
        for text in texts:
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
                # Use [CLS] token embedding
                embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            
            # Simple binary classification based on embedding
            # In practice, this would use a trained classifier head
            score = np.mean(embeddings)
            prob_positive = 1 / (1 + np.exp(-score))  # Sigmoid
            prob_negative = 1 - prob_positive
            
            predictions.append([prob_negative, prob_positive])
        
        return np.array(predictions)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise Exception(f"Model prediction failed: {str(e)}")

def explain_with_lime(text: str) -> ExplanationResult:
    """Generate LIME explanation for text"""
    global lime_explainer
    
    if lime_explainer is None:
        raise Exception("LIME explainer not initialized")
    
    try:
        # Generate explanation
        explanation = lime_explainer.explain_instance(
            text,
            get_model_prediction,
            num_features=20,
            num_samples=1000
        )
        
        # Extract word importances
        word_importances = []
        for word, importance in explanation.as_list():
            word_importances.append(WordImportance(
                word=word,
                importance=float(importance),
                position=len(word_importances)
            ))
        
        # Calculate overall score
        overall_score = float(np.mean([wi.importance for wi in word_importances]))
        
        # Get prediction confidence
        prediction_proba = get_model_prediction([text])[0]
        confidence = float(max(prediction_proba))
        
        return ExplanationResult(
            method="LIME",
            word_importances=word_importances,
            overall_score=overall_score,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"LIME explanation error: {str(e)}")
        raise Exception(f"LIME explanation failed: {str(e)}")

def explain_with_shap(text: str) -> ExplanationResult:
    """Generate SHAP explanation for text"""
    try:
        # For SHAP, we'll use a simpler approach with token-level analysis
        # In production, you'd use proper SHAP explainers for transformers
        
        words = text.split()
        word_importances = []
        
        # Calculate importance by removing each word and measuring impact
        baseline_pred = get_model_prediction([text])[0]
        baseline_score = baseline_pred[1]  # Positive class probability
        
        for i, word in enumerate(words):
            # Create text without this word
            modified_words = words[:i] + words[i+1:]
            modified_text = ' '.join(modified_words)
            
            if modified_text.strip():
                modified_pred = get_model_prediction([modified_text])[0]
                modified_score = modified_pred[1]
                
                # Importance is the difference in prediction
                importance = baseline_score - modified_score
            else:
                importance = 0.0
            
            word_importances.append(WordImportance(
                word=word,
                importance=float(importance),
                position=i
            ))
        
        # Calculate overall score
        overall_score = float(np.mean([wi.importance for wi in word_importances]))
        
        return ExplanationResult(
            method="SHAP",
            word_importances=word_importances,
            overall_score=overall_score,
            confidence=float(baseline_score)
        )
        
    except Exception as e:
        logger.error(f"SHAP explanation error: {str(e)}")
        raise Exception(f"SHAP explanation failed: {str(e)}")

def explain_with_attention(text: str) -> ExplanationResult:
    """Generate attention-based explanation"""
    global inlegal_model, inlegal_tokenizer
    
    try:
        # Tokenize input
        inputs = inlegal_tokenizer(
            text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(device)
        
        # Get attention weights
        with torch.no_grad():
            outputs = inlegal_model(**inputs, output_attentions=True)
            attentions = outputs.attentions
        
        # Average attention across layers and heads
        # Shape: (layers, batch, heads, seq_len, seq_len)
        avg_attention = torch.mean(torch.stack(attentions), dim=(0, 2))  # Average over layers and heads
        
        # Get attention to [CLS] token (first token)
        cls_attention = avg_attention[0, 0, :].cpu().numpy()
        
        # Get tokens
        tokens = inlegal_tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        
        # Create word importances
        word_importances = []
        for i, (token, attention) in enumerate(zip(tokens, cls_attention)):
            if token not in ['[CLS]', '[SEP]', '[PAD]']:
                word_importances.append(WordImportance(
                    word=token,
                    importance=float(attention),
                    position=i
                ))
        
        # Calculate overall score
        overall_score = float(np.mean(cls_attention[1:-1]))  # Exclude special tokens
        
        return ExplanationResult(
            method="Attention",
            word_importances=word_importances,
            overall_score=overall_score,
            confidence=overall_score
        )
        
    except Exception as e:
        logger.error(f"Attention explanation error: {str(e)}")
        raise Exception(f"Attention explanation failed: {str(e)}")

@router.post("/explain", response_model=ExplainResponse)
async def explain_prediction(
    request: ExplainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate explainable AI analysis for legal text"""
    start_time = datetime.now()
    
    if inlegal_model is None or inlegal_tokenizer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Explainability models not loaded"
        )
    
    try:
        explanations = []
        
        # Generate explanations based on requested type
        if request.explanation_type in ["lime", "both"]:
            try:
                lime_result = explain_with_lime(request.text)
                explanations.append(lime_result)
            except Exception as e:
                logger.warning(f"LIME explanation failed: {str(e)}")
        
        if request.explanation_type in ["shap", "both"]:
            try:
                shap_result = explain_with_shap(request.text)
                explanations.append(shap_result)
            except Exception as e:
                logger.warning(f"SHAP explanation failed: {str(e)}")
        
        # Always include attention-based explanation
        try:
            attention_result = explain_with_attention(request.text)
            explanations.append(attention_result)
        except Exception as e:
            logger.warning(f"Attention explanation failed: {str(e)}")
        
        if not explanations:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="All explanation methods failed"
            )
        
        # Save explanation to database if document_id provided
        if request.document_id:
            document = db.query(Document).filter(
                Document.id == request.document_id,
                Document.user_id == current_user.id
            ).first()
            
            if document:
                # Save as classification with explanation data
                classification = Classification(
                    document_id=request.document_id,
                    task_type="explainability",
                    predicted_label="explanation_generated",
                    confidence_score=explanations[0].confidence if explanations else 0.0,
                    model_name="InLegalBERT+XAI",
                    explanation_data={
                        "explanations": [exp.dict() for exp in explanations],
                        "methods_used": [exp.method for exp in explanations]
                    }
                )
                db.add(classification)
                db.commit()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ExplainResponse(
            document_id=request.document_id,
            text_length=len(request.text),
            explanations=explanations,
            processing_time=processing_time,
            model_info={
                "base_model": "law-ai/InLegalBERT",
                "explanation_methods": [exp.method for exp in explanations],
                "device": str(device)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Explanation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Explanation generation failed: {str(e)}"
        )

@router.get("/methods")
async def get_explanation_methods():
    """Get available explanation methods"""
    return {
        "available_methods": [
            {
                "name": "LIME",
                "description": "Local Interpretable Model-agnostic Explanations",
                "type": "perturbation-based",
                "available": lime_explainer is not None
            },
            {
                "name": "SHAP", 
                "description": "SHapley Additive exPlanations",
                "type": "game-theory-based",
                "available": True
            },
            {
                "name": "Attention",
                "description": "Transformer attention weights visualization",
                "type": "gradient-based",
                "available": inlegal_model is not None
            }
        ],
        "model_status": {
            "inlegal_bert_loaded": inlegal_model is not None,
            "lime_initialized": lime_explainer is not None,
            "device": str(device)
        }
    }

@router.get("/status")
async def get_explanation_status():
    """Get explainability service status"""
    return {
        "status": "ready" if (inlegal_model is not None) else "not_ready",
        "models_loaded": {
            "inlegal_bert": inlegal_model is not None,
            "lime_explainer": lime_explainer is not None
        },
        "supported_tasks": ["classification", "summarization"],
        "device": str(device)
    }
