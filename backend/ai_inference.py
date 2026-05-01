"""
LawLens AI Inference Module
============================
Production-ready inference for trained models
"""

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForSequenceClassification, pipeline
import json
import os
from typing import Dict, List, Optional
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

try:
    from lime.lime_text import LimeTextExplainer
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False

class LawLensAI:
    """Main AI inference class for LawLens"""
    
    def __init__(self, models_dir='models'):
        self.models_dir = models_dir
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Model placeholders
        self.summarization_model = None
        self.summarization_tokenizer = None
        self.classification_model = None
        self.classification_tokenizer = None
        self.label_mapping = None
        
        print(f"🤖 LawLens AI initialized on {self.device}")
    
    def load_summarization_model(self):
        """Load the fine-tuned summarization model from Hugging Face Hub"""
        if self.summarization_model is None:
            local_path = f"{self.models_dir}/lawlens_summarization"
            hf_model_id = os.getenv("SUMMARIZATION_MODEL", "Rohit171717/lawlens-summarization")

            # Prefer local if available (dev), otherwise load from HF Hub (production)
            model_source = local_path if os.path.exists(local_path) else hf_model_id
            print(f"📝 Loading summarization model from: {model_source}")

            self.summarization_tokenizer = AutoTokenizer.from_pretrained(model_source)
            self.summarization_model = AutoModelForSeq2SeqLM.from_pretrained(model_source)
            self.summarization_model.to(self.device)
            print("✅ Summarization model loaded!")
    
    def load_classification_model(self):
        """Load the fine-tuned classification model from Hugging Face Hub"""
        if self.classification_model is None:
            local_path = f"{self.models_dir}/lawlens_classification"
            hf_model_id = os.getenv("CLASSIFICATION_MODEL", "Rohit171717/lawlens-classification")

            # Prefer local if available (dev), otherwise load from HF Hub (production)
            model_source = local_path if os.path.exists(local_path) else hf_model_id
            print(f"⚖️  Loading classification model from: {model_source}")

            self.classification_tokenizer = AutoTokenizer.from_pretrained(model_source)
            self.classification_model = AutoModelForSequenceClassification.from_pretrained(model_source)
            self.classification_model.to(self.device)

            # Load label mapping — local file or bundled fallback
            label_mapping_path = f"{local_path}/label_mapping.json"
            if os.path.exists(label_mapping_path):
                with open(label_mapping_path, 'r') as f:
                    self.label_mapping = json.load(f)
            else:
                self.label_mapping = {"0": "allowed", "1": "dismissed", "2": "partial"}

            print("✅ Classification model loaded!")
    
    def summarize(self, text: str, length: str = "medium") -> Dict:
        """
        Summarize legal document
        
        Args:
            text: Legal document text
            length: Summary length (short, medium, detailed)
        
        Returns:
            Dict with summary and metadata
        """
        self.load_summarization_model()
        
        # Length configurations
        length_config = {
            "short": {"max_length": 100, "min_length": 30},
            "medium": {"max_length": 150, "min_length": 50},
            "detailed": {"max_length": 250, "min_length": 100}
        }
        
        config = length_config.get(length, length_config["medium"])
        
        # Tokenize input
        inputs = self.summarization_tokenizer(
            text[:2048],  # Limit input length
            max_length=512,
            truncation=True,
            return_tensors="pt"
        ).to(self.device)
        
        # Generate summary
        with torch.no_grad():
            summary_ids = self.summarization_model.generate(
                inputs['input_ids'],
                max_length=config['max_length'],
                min_length=config['min_length'],
                num_beams=4,
                length_penalty=2.0,
                early_stopping=True
            )
        
        summary = self.summarization_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        return {
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "compression_ratio": len(summary) / len(text)
        }
    
    def predict_outcome(self, text: str) -> Dict:
        """
        Predict case outcome
        
        Args:
            text: Legal document text
        
        Returns:
            Dict with prediction and confidence
        """
        self.load_classification_model()
        
        # Tokenize input
        inputs = self.classification_tokenizer(
            text[:512],
            max_length=512,
            truncation=True,
            return_tensors="pt"
        ).to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.classification_model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class = torch.argmax(predictions, dim=-1).item()
            confidence = predictions[0][predicted_class].item()
        
        predicted_outcome = self.label_mapping[str(predicted_class)]
        
        # Get all probabilities
        all_probs = {
            self.label_mapping[str(i)]: predictions[0][i].item()
            for i in range(len(self.label_mapping))
        }
        
        return {
            "predicted_outcome": predicted_outcome,
            "confidence": confidence,
            "all_probabilities": all_probs
        }
    
    def explain_prediction(self, text: str, method: str = "lime") -> Dict:
        """
        Generate explainable AI insights
        
        Args:
            text: Legal document text
            method: Explanation method (lime or shap)
        
        Returns:
            Dict with explanation data
        """
        self.load_classification_model()
        
        if method == "lime":
            return self._explain_with_lime(text)
        elif method == "shap":
            return self._explain_with_shap(text)
        else:
            return {"error": "Invalid explanation method"}
    
    def _explain_with_lime(self, text: str) -> Dict:
        """Generate LIME explanation"""
        if not LIME_AVAILABLE:
            return {"method": "LIME", "error": "LIME not available in this environment", "prediction": self.predict_outcome(text)}

        def predict_proba(texts):
            """Prediction function for LIME"""
            inputs = self.classification_tokenizer(
                list(texts),
                max_length=512,
                truncation=True,
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.classification_model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            return probs.cpu().numpy()
        
        # Create LIME explainer
        explainer = LimeTextExplainer(class_names=list(self.label_mapping.values()))
        
        # Generate explanation
        exp = explainer.explain_instance(
            text[:512],
            predict_proba,
            num_features=10,
            num_samples=100
        )
        
        # Extract important words
        important_words = exp.as_list()
        
        return {
            "method": "LIME",
            "important_features": [
                {"word": word, "importance": float(importance)}
                for word, importance in important_words
            ],
            "prediction": self.predict_outcome(text)
        }
    
    def _explain_with_shap(self, text: str) -> Dict:
        """Generate SHAP explanation"""
        # Note: SHAP for transformers is computationally expensive
        # This is a simplified version
        
        return {
            "method": "SHAP",
            "message": "SHAP explanation requires more computational resources. Use LIME for faster results.",
            "prediction": self.predict_outcome(text)
        }
    
    def translate_to_indian_language(self, text: str, target_lang: str) -> Dict:
        """
        Translate text to Indian languages
        
        Args:
            text: Text to translate
            target_lang: Target language code (hi, mr, ta, etc.)
        
        Returns:
            Dict with translated text
        """
        # This would use IndicTrans2 model
        # For now, return a placeholder
        
        supported_languages = {
            'hi': 'Hindi',
            'mr': 'Marathi',
            'ta': 'Tamil',
            'bn': 'Bengali',
            'gu': 'Gujarati',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'pa': 'Punjabi',
            'te': 'Telugu'
        }
        
        if target_lang not in supported_languages:
            return {"error": f"Language {target_lang} not supported"}
        
        # Placeholder - would use IndicTrans2 model
        return {
            "original_text": text[:200] + "...",
            "translated_text": f"[Translation to {supported_languages[target_lang]} would appear here]",
            "target_language": supported_languages[target_lang],
            "language_code": target_lang,
            "note": "IndicTrans2 model integration pending"
        }

# Global instance
lawlens_ai = LawLensAI()

# Convenience functions
def summarize_document(text: str, length: str = "medium") -> Dict:
    """Summarize legal document"""
    return lawlens_ai.summarize(text, length)

def predict_case_outcome(text: str) -> Dict:
    """Predict case outcome"""
    return lawlens_ai.predict_outcome(text)

def explain_prediction(text: str, method: str = "lime") -> Dict:
    """Explain AI prediction"""
    return lawlens_ai.explain_prediction(text, method)

def translate_text(text: str, target_lang: str) -> Dict:
    """Translate to Indian language"""
    return lawlens_ai.translate_to_indian_language(text, target_lang)
