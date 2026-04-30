"""
Groq AI Integration with API Key Rotation
ONLY for AI Tools (Judge Dashboard, Lawyer Dashboard, Analytics Dashboard)

Supports multiple API keys to handle rate limits
Automatically rotates to next key when limit is hit
"""

import os
from groq import Groq
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv()

# Support multiple Groq API keys (add more in .env file)
API_KEYS = [
    os.getenv("GROQ_API_KEY", ""),
    os.getenv("GROQ_API_KEY_2", ""),
    os.getenv("GROQ_API_KEY_3", ""),
]

# Filter out empty keys
API_KEYS = [key for key in API_KEYS if key]

# Current key index
current_key_index = 0

def get_groq_client():
    """Get Groq client with current API key"""
    global current_key_index
    return Groq(api_key=API_KEYS[current_key_index])

def rotate_api_key():
    """Rotate to next API key"""
    global current_key_index
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"🔄 Rotated to API key {current_key_index + 1}/{len(API_KEYS)}")

# Use Llama 3.3 70B - latest and best model for legal analysis
MODEL = "llama-3.3-70b-versatile"

def generate_response(prompt: str, max_retries: int = 3) -> str:
    """Generate response using Groq"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert legal AI assistant. Provide detailed, professional legal analysis."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=MODEL,
            temperature=0.7,
            max_tokens=2000,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

# ==================== JUDGE TOOLS ====================

def clean_markdown_formatting(text: str) -> str:
    """Clean up markdown formatting for display"""
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
    import re
    text = re.sub(r'\n\n\n+', '\n\n', text)
    
    return text.strip()

def generate_bench_memo_ai(case_file: str) -> dict:
    """Generate bench memo using Groq AI"""
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
        # Clean up any markdown formatting
        cleaned_response = clean_markdown_formatting(response)
        return {
            "success": True,
            "bench_memo": cleaned_response,
            "model_used": "Groq Llama 3.3 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "bench_memo": f"Error generating bench memo: {str(e)}"
        }

def prepare_hearing_ai(case_file: str) -> dict:
    """Prepare for hearing using Groq AI"""
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
        # Clean up any markdown formatting
        cleaned_response = clean_markdown_formatting(response)
        return {
            "success": True,
            "hearing_brief": cleaned_response,
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "hearing_brief": f"Error preparing hearing brief: {str(e)}"
        }

def draft_judgment_ai(case_details: str, issue: str = "") -> dict:
    """Draft judgment using Groq AI with proper judicial structure"""
    
    # Validate inputs
    if not case_details or len(case_details.strip()) < 50:
        return {
            "success": False,
            "error": "Insufficient case details provided. Please provide at least 50 characters.",
            "judgment_draft": ""
        }
    
    # Build comprehensive prompt for judgment drafting
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
        response = generate_response(prompt)
        
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
            "model_used": "Groq Llama 3.3 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error generating judgment: {str(e)}",
            "judgment_draft": ""
        }

# ==================== LAWYER TOOLS ====================

def adversarial_simulation_ai(case_brief: str, user_arguments: str) -> dict:
    """Simulate adversarial arguments using Groq AI"""
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
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "simulation": f"Error in adversarial simulation: {str(e)}"
        }

def litigation_forecasting_ai(case_details: str) -> dict:
    """Forecast litigation outcome using Groq AI"""
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
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "forecast": f"Error in forecasting: {str(e)}"
        }

def judge_analytics_ai(judge_name: str) -> dict:
    """Analyze judicial patterns using Groq AI"""
    prompt = f"""You are a legal AI assistant providing general insights about judicial decision-making.

Context: Lawyer wants to understand judicial patterns for: {judge_name}

Provide general guidance on:
1. Common Judicial Decision-Making Patterns
2. Key Factors Judges Typically Consider
3. Procedural Preferences in Courts
4. Best Practices for Court Appearances
5. How to Present Arguments Effectively
6. Documentation and Evidence Standards

Note: Provide general professional guidance, not specific judge profiling.
Focus on best practices that work across judicial settings."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "analytics": response,
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "analytics": f"Error in analytics: {str(e)}"
        }

def real_time_assistance_ai(query: str) -> dict:
    """Provide real-time legal assistance using Groq AI"""
    prompt = f"""You are a legal AI assistant providing real-time court assistance.

Query: {query}

Provide a quick, actionable response with:
1. Direct Answer to the Query
2. Relevant Legal Provisions/Statutes
3. Key Precedents (if applicable)
4. Practical Suggestions
5. Points to Emphasize

Keep it concise and immediately useful."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "assistance": response,
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "assistance": f"Error providing assistance: {str(e)}"
        }

def legal_drafting_ai(document_type: str, facts: str, jurisdiction: str, citations: str = "") -> dict:
    """Generate legal document draft using Groq AI with proper structure and citations"""
    
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
    
    # Build comprehensive prompt
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
        response = generate_response(prompt)
        
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
            "model_used": "Groq Llama 3.3 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error generating draft: {str(e)}",
            "draft": ""
        }

def compliance_scanner_ai(filing_text: str) -> dict:
    """Scan document for compliance issues using Groq AI"""
    prompt = f"""You are a legal AI assistant scanning a legal document for compliance issues.

Document:
{filing_text}

Analyze and provide:
1. Compliance Status (Overall assessment)
2. Missing Required Elements (list with severity: High/Medium/Low)
3. Procedural Compliance Issues
4. Format and Structure Problems
5. Recommendations for Improvement
6. Checklist of Items to Verify

Be thorough and specific."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "compliance_report": response,
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "compliance_report": f"Error in compliance scan: {str(e)}"
        }

# ==================== ANALYTICS TOOLS ====================

def counterfactual_analysis_ai(case_details: str, what_if_scenario: str) -> dict:
    """Perform counterfactual analysis using Groq AI"""
    prompt = f"""You are a legal AI assistant performing counterfactual analysis.

Original Case:
{case_details}

What-If Scenario:
{what_if_scenario}

Analyze and provide:
1. How the Outcome Would Change (detailed analysis)
2. Impact on Legal Reasoning
3. Different Precedents That Would Apply
4. Procedural Implications
5. Practical Consequences
6. Probability of Different Outcome (with reasoning)

Provide a thorough comparative analysis."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "analysis": response,
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "analysis": f"Error in counterfactual analysis: {str(e)}"
        }

def precedent_impact_ai(case_citation: str) -> dict:
    """Analyze precedent impact using Groq AI"""
    prompt = f"""You are a legal AI assistant analyzing the impact of a legal precedent.

Case Citation: {case_citation}

Provide analysis on:
1. Significance of the Precedent
2. Key Legal Principles Established
3. How It's Been Cited (general patterns)
4. Impact on Legal Doctrine
5. Practical Applications in Current Cases
6. Evolution of the Principle Over Time

Provide comprehensive precedent analysis."""

    try:
        response = generate_response(prompt)
        return {
            "success": True,
            "impact_analysis": response,
            "model_used": "Groq Llama 3.1 70B"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "impact_analysis": f"Error in precedent analysis: {str(e)}"
        }
