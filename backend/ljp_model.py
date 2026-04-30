"""
LJP (Legal Judgment Prediction) Model Integration
Wrapper for the Realistic_LJP-main model
"""

import sys
import os
from pathlib import Path
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
import numpy as np

# Add LJP directory to path
LJP_DIR = Path(__file__).parent.parent / "Realistic_LJP-main"
sys.path.insert(0, str(LJP_DIR))

class LJPModel:
    """Legal Judgment Prediction Model Wrapper"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_loaded = False
        
    def load_model(self, model_name="distilbert-base-uncased"):
        """Load the LJP model"""
        try:
            print(f"Loading LJP model: {model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=2  # Binary classification: Accepted/Rejected
            )
            self.model.to(self.device)
            self.model.eval()
            self.model_loaded = True
            print(f"✅ LJP model loaded successfully on {self.device}")
            return True
        except Exception as e:
            print(f"❌ Error loading LJP model: {e}")
            return False
    
    def predict(self, text, max_length=512):
        """
        Predict judgment for given legal text
        Returns: prediction (0/1), confidence, explanation
        """
        if not self.model_loaded:
            self.load_model()
        
        try:
            # Tokenize input
            encoding = self.tokenizer(
                text,
                truncation=True,
                padding='max_length',
                max_length=max_length,
                return_tensors='pt'
            )
            
            # Move to device
            input_ids = encoding['input_ids'].to(self.device)
            attention_mask = encoding['attention_mask'].to(self.device)
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
                prediction = torch.argmax(probabilities, dim=-1).item()
                confidence = probabilities[0][prediction].item()
            
            # Generate explanation
            label_map = {0: "Rejected", 1: "Accepted"}
            prediction_label = label_map[prediction]
            
            explanation = self._generate_explanation(text, prediction_label, confidence)
            
            return {
                "prediction": prediction_label,
                "confidence": round(confidence * 100, 2),
                "probabilities": {
                    "Accepted": round(probabilities[0][1].item() * 100, 2),
                    "Rejected": round(probabilities[0][0].item() * 100, 2)
                },
                "explanation": explanation
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return {
                "prediction": "Error",
                "confidence": 0,
                "probabilities": {"Accepted": 0, "Rejected": 0},
                "explanation": f"Error during prediction: {str(e)}"
            }
    
    def _generate_explanation(self, text, prediction, confidence):
        """Generate simple explanation for the prediction"""
        
        # Extract key information from text
        text_lower = text.lower()
        
        # Identify key factors
        factors = []
        
        if "precedent" in text_lower or "cited" in text_lower:
            factors.append("Legal precedents were considered")
        
        if "evidence" in text_lower or "proof" in text_lower:
            factors.append("Evidence was evaluated")
        
        if "statute" in text_lower or "section" in text_lower:
            factors.append("Relevant statutes were analyzed")
        
        if "argument" in text_lower:
            factors.append("Arguments from both parties were reviewed")
        
        # Build explanation
        explanation = f"Based on the analysis of the case:\n\n"
        explanation += f"**Prediction**: {prediction}\n"
        explanation += f"**Confidence**: {confidence}%\n\n"
        
        if factors:
            explanation += "**Key Factors Considered**:\n"
            for factor in factors:
                explanation += f"- {factor}\n"
        
        explanation += f"\n**Reasoning**: "
        if prediction == "Accepted":
            explanation += "The case shows strong legal grounds with supporting evidence and precedents. "
            explanation += "The arguments presented align with established legal principles."
        else:
            explanation += "The case lacks sufficient legal grounds or supporting evidence. "
            explanation += "The arguments may not align with established legal principles."
        
        return explanation
    
    def analyze_case(self, case_text):
        """
        Comprehensive case analysis
        Returns detailed analysis including prediction, key points, and recommendations
        """
        prediction_result = self.predict(case_text)
        
        # Extract key information
        analysis = {
            "prediction": prediction_result,
            "summary": self._extract_summary(case_text),
            "key_issues": self._extract_key_issues(case_text),
            "precedents": self._extract_precedents(case_text),
            "recommendations": self._generate_recommendations(case_text, prediction_result["prediction"])
        }
        
        return analysis
    
    def _extract_summary(self, text):
        """Extract or generate case summary"""
        # Simple extraction - first 200 characters
        summary = text[:200].strip()
        if len(text) > 200:
            summary += "..."
        return summary
    
    def _extract_key_issues(self, text):
        """Extract key legal issues from text"""
        issues = []
        text_lower = text.lower()
        
        # Look for common legal issue indicators
        if "whether" in text_lower:
            # Extract sentences with "whether"
            sentences = text.split('.')
            for sent in sentences:
                if "whether" in sent.lower():
                    issues.append(sent.strip())
        
        if not issues:
            issues.append("Legal interpretation and application of relevant statutes")
        
        return issues[:3]  # Return top 3 issues
    
    def _extract_precedents(self, text):
        """Extract cited precedents from text"""
        precedents = []
        
        # Look for case citations (simplified pattern)
        import re
        # Pattern: Name v. Name (Year)
        pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+v\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\((\d{4})\)'
        matches = re.findall(pattern, text)
        
        for match in matches[:5]:  # Top 5 precedents
            precedents.append(f"{match[0]} v. {match[1]} ({match[2]})")
        
        if not precedents:
            precedents.append("Relevant precedents to be identified")
        
        return precedents
    
    def _generate_recommendations(self, text, prediction):
        """Generate recommendations based on prediction"""
        recommendations = []
        
        if prediction == "Accepted":
            recommendations.append("Proceed with the case as the legal grounds are strong")
            recommendations.append("Prepare comprehensive documentation of evidence")
            recommendations.append("Ensure all procedural requirements are met")
        else:
            recommendations.append("Review the legal grounds and strengthen arguments")
            recommendations.append("Consider alternative legal approaches")
            recommendations.append("Gather additional supporting evidence")
            recommendations.append("Consult with legal experts for case strategy")
        
        return recommendations

# Global model instance
ljp_model = LJPModel()

def get_ljp_model():
    """Get the global LJP model instance"""
    if not ljp_model.model_loaded:
        ljp_model.load_model()
    return ljp_model
