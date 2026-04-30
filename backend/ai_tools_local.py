"""
Local AI Integration using Hugging Face Transformers
ONLY for AI Tools (Judge Dashboard, Lawyer Dashboard)

Uses Mistral 7B - Self-hosted, no API costs
"""

import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Model configuration
# Option 1: Llama 3.1 8B (gated - requires HF authentication) - BEST QUALITY
# Requires 16GB+ VRAM
# MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"

# Option 2: Mistral 7B Instruct v0.3 (ungated, no auth needed, excellent quality)
# Requires 14GB+ VRAM (too large for 4GB GPU)
# MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.3"

# Option 3: Phi-3 Mini (3.8B - PERFECT for 4GB GPU, fast, good quality)
MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# 4-bit quantization config for faster inference
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

# Global variables for model and tokenizer (loaded once)
_model = None
_tokenizer = None

def load_model():
    """Load the model and tokenizer (called once at startup)"""
    global _model, _tokenizer
    
    if _model is None:
        print(f"Loading {MODEL_NAME} on {DEVICE} with 4-bit quantization...")
        
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        
        # Load with 4-bit quantization for faster inference
        if DEVICE == "cuda":
            _model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                quantization_config=quantization_config,
                device_map="auto",
                low_cpu_mem_usage=True
            )
        else:
            # CPU fallback without quantization
            _model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True
            )
            _model = _model.to(DEVICE)
        
        print(f"✅ Model loaded successfully on {DEVICE}")
    
    return _tokenizer, _model

def summarize_long_text(text: str, max_length: int = 3000) -> str:
    """Summarize text if it's too long for the model context"""
    tokenizer, _ = load_model()
    
    # Count tokens
    tokens = tokenizer.encode(text)
    
    if len(tokens) <= max_length:
        return text
    
    # If too long, extract key sections
    print(f"⚠️ Text too long ({len(tokens)} tokens). Extracting key sections...")
    
    # Split into chunks and take important parts
    lines = text.split('\n')
    
    # Prioritize: beginning, end, and lines with keywords
    keywords = ['plaintiff', 'defendant', 'court', 'judgment', 'order', 'section', 
                'act', 'case', 'appeal', 'petition', 'relief', 'prayer', 'facts']
    
    important_lines = []
    
    # Always include first 20% and last 10%
    total_lines = len(lines)
    important_lines.extend(lines[:int(total_lines * 0.2)])
    important_lines.extend(lines[int(total_lines * 0.9):])
    
    # Add lines with keywords
    for line in lines:
        if any(keyword in line.lower() for keyword in keywords):
            if line not in important_lines:
                important_lines.append(line)
    
    # Join and check length again
    summarized = '\n'.join(important_lines)
    summarized_tokens = tokenizer.encode(summarized)
    
    # If still too long, truncate
    if len(summarized_tokens) > max_length:
        decoded = tokenizer.decode(summarized_tokens[:max_length])
        return decoded + "\n\n[... case file truncated for length ...]"
    
    return summarized


def generate_response(prompt: str, max_tokens: int = 800) -> str:
    """Generate response using local Llama model"""
    try:
        tokenizer, model = load_model()
        
        # Format prompt for Llama 3.1 Instruct
        messages = [
            {
                "role": "system",
                "content": "You are an expert legal AI assistant. Provide detailed, professional legal analysis."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        # Apply chat template
        formatted_prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # Tokenize
        inputs = tokenizer(formatted_prompt, return_tensors="pt").to(DEVICE)
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant's response (remove prompt)
        # Try multiple extraction methods
        if "<|assistant|>" in response:
            response = response.split("<|assistant|>")[-1]
        elif "<|end|>" in response:
            parts = response.split("<|end|>")
            if len(parts) > 1:
                response = parts[-1]
        elif "assistant\n\n" in response:
            response = response.split("assistant\n\n")[-1]
        
        # Remove the original prompt if it's still there
        if formatted_prompt in response:
            response = response.replace(formatted_prompt, "")
        
        # Clean up any remaining system/user tags
        response = response.replace("<|system|>", "")
        response = response.replace("<|user|>", "")
        response = response.replace("<|end|>", "")
        
        return response.strip()
        
    except Exception as e:
        return f"Error: {str(e)}"

def clean_markdown_formatting(text: str) -> str:
    """Clean up markdown formatting for display"""
    import re
    # Remove markdown bold/italic
    text = text.replace('**', '')
    text = text.replace('__', '')
    text = text.replace('*', '')
    text = text.replace('_', '')
    
    # Replace escaped newlines with actual newlines
    text = text.replace('\\n', '\n')
    
    # Replace ### headers with proper formatting
    text = text.replace('###', '\n')
    text = text.replace('##', '\n')
    text = text.replace('#', '')
    
    # Clean up multiple newlines
    text = re.sub(r'\n\n\n+', '\n\n', text)
    
    return text.strip()

# ==================== JUDGE TOOLS ====================

def generate_bench_memo_ai(case_file: str) -> dict:
    """Generate bench memo using local AI"""
    
    # Summarize if too long
    case_file = summarize_long_text(case_file, max_length=2500)
    
    prompt = f"""You are a legal AI assistant helping a judge. Analyze this case and write a comprehensive bench memo in a flowing narrative format.

Case File:
{case_file}

Write a professional bench memo that covers:
- A brief summary of the case and parties involved
- The key legal issues that need to be determined
- Relevant precedents and case law that apply
- Your legal analysis of the issues
- Recommendations for the judge's consideration
- Important questions to ask during the hearing

Write this as a continuous narrative memo without section headings or labels. Make it read like a professional legal memorandum that flows naturally from one point to the next. Do not use labels like "Case Summary:", "Key Issues:", etc. Just write the content directly."""

    try:
        response = generate_response(prompt)
        cleaned_response = clean_markdown_formatting(response)
        return {
            "success": True,
            "bench_memo": cleaned_response,
            "model_used": "Llama 3.1 8B (Local)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "bench_memo": f"Error generating bench memo: {str(e)}"
        }

def prepare_hearing_ai(case_file: str) -> dict:
    """Prepare for hearing using local AI"""
    
    # Summarize if too long
    case_file = summarize_long_text(case_file, max_length=2500)
    
    prompt = f"""You are a legal AI assistant helping a judge prepare for a hearing. Write a comprehensive hearing preparation brief in narrative format.

Case File:
{case_file}

Write a flowing narrative that covers:
- Overview of the case and what will be discussed
- The main issues that need to be addressed during the hearing
- Specific questions to ask each party
- Time management suggestions
- Similar cases or matters to keep in mind
- Important procedural points

Write this as a continuous narrative without section labels. Make it read like a professional briefing document that flows naturally. Do not use headings like "Case Summary:", "Questions:", etc. Just write the content directly as a cohesive memo."""

    try:
        response = generate_response(prompt)
        cleaned_response = clean_markdown_formatting(response)
        return {
            "success": True,
            "hearing_brief": cleaned_response,
            "model_used": "Llama 3.1 8B (Local)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "hearing_brief": f"Error preparing hearing brief: {str(e)}"
        }

def draft_judgment_ai(case_details: str, issue: str = "") -> dict:
    """Draft judgment using local AI with proper judicial structure"""
    
    # Validate inputs
    if not case_details or len(case_details.strip()) < 50:
        return {
            "success": False,
            "error": "Insufficient case details provided. Please provide at least 50 characters.",
            "judgment_draft": ""
        }
    
    prompt = f"""You are an expert Indian judicial officer drafting a formal court judgment. Generate a complete, structured judgment following Indian judicial standards.

CASE DETAILS:
{case_details}

{f"SPECIFIC ISSUE TO ADDRESS:\\n{issue}" if issue.strip() else ""}

INSTRUCTIONS:
1. Create a formal judgment with the following structure:
   - HEADING: Court name, case number, parties
   - INTRODUCTION: Brief overview of the case
   - FACTS: Detailed statement of facts as presented
   - ISSUES FOR DETERMINATION: Clear enumeration of legal issues
   - ARGUMENTS: Summary of arguments by both parties
   - LEGAL ANALYSIS: Detailed reasoning with legal principles
   - PRECEDENTS: Reference relevant case law (only if you can cite accurately)
   - FINDINGS: Court's findings on each issue
   - CONCLUSION: Final determination
   - ORDER: Specific relief granted or denied

2. Use formal judicial language appropriate for Indian courts
3. Structure with numbered paragraphs for clarity
4. Apply relevant legal principles and constitutional provisions
5. If citing cases, use proper format: [Case Name] [Year] [Court] [Citation]
6. Do NOT invent case citations - use general principles if specific cases unknown
7. Ensure logical flow and legal soundness
8. Include proper reasoning for each finding
9. End with formal order and signature block

Generate a complete, professionally drafted judgment that maintains judicial independence and legal rigor."""

    try:
        response = generate_response(prompt, max_tokens=2000)
        
        # Validate response
        if not response or len(response.strip()) < 100:
            return {
                "success": False,
                "error": "Generated judgment was too short. Please try again with more detailed case information.",
                "judgment_draft": response
            }
        
        return {
            "success": True,
            "judgment_draft": response,
            "model_used": "Llama 3.1 8B (Local)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error generating judgment: {str(e)}",
            "judgment_draft": ""
        }

# ==================== LAWYER TOOLS ====================

def adversarial_simulation_ai(case_brief: str, user_arguments: str) -> dict:
    """Simulate adversarial arguments using local AI"""
    
    # Summarize if too long
    case_brief = summarize_long_text(case_brief, max_length=2000)
    user_arguments = summarize_long_text(user_arguments, max_length=1000)
    
    prompt = f"""You are a legal AI assistant helping a lawyer prepare for trial by simulating opposing counsel.

Case Brief:
{case_brief}

Lawyer's Arguments:
{user_arguments}

Provide:
1. Strength Assessment (rate 1-10 with explanation)
2. Counter-Arguments (3-5 strong counter-arguments the opposing side might make)
3. Weaknesses in the Arguments (identify gaps and vulnerabilities)
4. Suggestions for Improvement
5. Precedents to Consider
6. Preparation Tips

Be critical and thorough to help the lawyer prepare better."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "simulation": response,
            "model_used": "Llama 3.1 8B (Local)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "simulation": f"Error in adversarial simulation: {str(e)}"
        }

def litigation_forecasting_ai(case_details: str) -> dict:
    """Forecast litigation outcome using local AI"""
    prompt = f"""You are a legal AI assistant providing litigation forecasting analysis.

Case Details:
{case_details}

Provide a comprehensive forecast with:
1. Win Probability Estimate (with reasoning)
2. Key Success Factors
3. Risk Factors and Challenges
4. Settlement Recommendation (with rationale)
5. Timeline Estimate (pre-trial, trial, appeals)
6. Cost-Benefit Analysis considerations
7. Strategic Recommendations

Be realistic and data-driven in your analysis."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "forecast": response,
            "model_used": "Llama 3.1 8B (Local)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "forecast": f"Error in forecasting: {str(e)}"
        }

def legal_drafting_ai(document_type: str, facts: str, jurisdiction: str, citations: str = "") -> dict:
    """Generate legal document draft using local AI"""
    
    # Validate inputs
    if not facts or len(facts.strip()) < 50:
        return {
            "success": False,
            "error": "Insufficient facts provided. Please provide at least 50 characters of case details.",
            "draft": ""
        }
    
    # Map document types to proper legal formats
    doc_formats = {
        "pleading": "a formal pleading with proper sections: Caption, Parties, Jurisdiction, Statement of Facts, Causes of Action, Prayer for Relief",
        "brief": "a legal brief with: Table of Contents, Statement of Facts, Issues Presented, Argument with headings, Conclusion",
        "motion": "a motion with: Caption, Notice of Motion, Memorandum of Law, Supporting Facts, Legal Argument, Prayer for Relief",
        "contract": "a contract with: Title, Parties, Recitals, Definitions, Terms and Conditions, Representations and Warranties, Termination, Signatures",
        "petition": "a petition with: Caption, Parties, Jurisdiction, Grounds, Facts, Legal Basis, Prayer",
        "affidavit": "an affidavit with: Caption, Affiant Information, Statement of Facts (numbered paragraphs), Verification, Signature block"
    }
    
    format_instruction = doc_formats.get(document_type, "a structured legal document")
    
    prompt = f"""You are an expert Indian legal drafter. Generate {format_instruction} based on the following:

DOCUMENT TYPE: {document_type.upper()}
JURISDICTION: {jurisdiction.replace('-', ' ').title()}

CASE FACTS:
{facts}

{f"RELEVANT CITATIONS TO REFERENCE:\\n{citations}" if citations.strip() else ""}

INSTRUCTIONS:
1. Create a professionally formatted {document_type} following Indian legal drafting standards
2. Use proper legal language and terminology appropriate for {jurisdiction.replace('-', ' ')}
3. Structure the document with clear sections and numbered paragraphs where appropriate
4. If citing cases, use proper citation format: [Case Name] [Year] [Court] [Citation]
5. Include only verified legal principles - do NOT hallucinate case citations
6. If specific citations are not provided, use general legal principles without inventing cases
7. Ensure all sections are complete and legally sound
8. Use formal legal language but remain clear and precise
9. Include appropriate legal boilerplate where necessary
10. End with proper signature blocks and verification as applicable

Generate a complete, ready-to-review draft that a lawyer can refine and file."""

    try:
        response = generate_response(prompt, max_tokens=2000)
        
        # Validate response
        if not response or len(response.strip()) < 100:
            return {
                "success": False,
                "error": "Generated draft was too short. Please try again with more detailed facts.",
                "draft": response
            }
        
        return {
            "success": True,
            "draft": response,
            "model_used": "Llama 3.1 8B (Local)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error generating draft: {str(e)}",
            "draft": ""
        }

# Pre-load model at startup to avoid first-request delays
# Only load if this file is run directly or explicitly called
if __name__ == "__main__":
    print("🔄 Pre-loading model...")
    load_model()
    print("✅ Model ready for inference")
else:
    # Lazy loading - model loads on first request
    print("ℹ️ Model will load on first request (lazy loading)")
