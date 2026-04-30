"""
Google Gemini AI Integration - Best Free Tier
ONLY for AI Tools (Judge Dashboard, Lawyer Dashboard)

Gemini offers 1500 requests/day FREE - most generous free tier
Fast, reliable, and handles long documents
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Use Gemini 1.5 Flash - fast and free
MODEL = "gemini-1.5-flash"

def generate_response(prompt: str, max_tokens: int = 2000) -> str:
    """Generate response using Gemini"""
    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.7,
            )
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


def clean_markdown_formatting(text: str) -> str:
    """Clean up markdown formatting"""
    import re
    text = text.replace('**', '')
    text = text.replace('__', '')
    text = text.replace('*', '')
    text = text.replace('_', '')
    text = text.replace('\\n', '\n')
    text = text.replace('###', '\n')
    text = text.replace('##', '\n')
    text = text.replace('#', '')
    text = re.sub(r'\n\n\n+', '\n\n', text)
    return text.strip()


# ==================== JUDGE TOOLS ====================

def generate_bench_memo_ai(case_file: str) -> dict:
    """Generate bench memo using Gemini"""
    prompt = f"""You are a senior judicial law clerk drafting bench memos for Indian courts.
Apply these rules strictly:
- Base the entire memo on the FINAL judgment of the highest court. Do NOT rely on lower court findings.
- Do NOT hallucinate facts, arguments, orders, or precedents not present in the case file.
- Maintain a professional, neutral, and legally accurate tone throughout.
- Use bullet points for issues, arguments, and questions. Avoid long paragraphs.
- Key Legal Issues: frame as precise legal questions. Do NOT imply incorrect legal rights.
- Relevant Precedents: cite ONLY precedents directly relevant to the issues. If unsure, state the general principle instead. NEVER include unrelated case law.
- Analysis: apply law to facts, crisp and issue-wise. No storytelling.
- Suggested Disposition: use definitive outcome-aligned language ('The Court upheld...', 'The Court dismissed...'). Do NOT use predictive phrases. Do NOT include orders not explicitly in the judgment.

Case File:
{case_file}

Write a bench memo covering:
1. Case Summary & Parties (full Case Title: Appellant vs. Respondent)
2. Key Legal Issues (as bullet-point legal questions)
3. Relevant Precedents & Statutes (only directly applicable)
4. Analysis of Each Issue (crisp, issue-wise)
5. Recommended Questions for Hearing (test weak points of both sides)
6. Suggested Disposition (aligned strictly with the final judgment)"""

    try:
        response = generate_response(prompt, max_tokens=1500)
        cleaned_response = clean_markdown_formatting(response)
        return {
            "success": True,
            "bench_memo": cleaned_response,
            "model_used": "Google Gemini 1.5 Flash"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "bench_memo": f"Error: {str(e)}"
        }


def prepare_hearing_ai(case_file: str) -> dict:
    """Prepare for hearing using Gemini"""
    prompt = f"""You are a judicial assistant helping a judge prepare for an upcoming hearing in an Indian court.
Apply these rules:
- Base the brief on the FINAL judgment of the highest court.
- Do NOT hallucinate facts or precedents not present in the case file.
- Questions must test the weak points of both parties — avoid generic phrasing.
- Do NOT repeat the case summary. Focus on hearing-specific preparation.
- Use bullet points for questions and procedural points.

Case File:
{case_file}

Write a hearing preparation brief covering:
1. Case Overview (3-4 lines only)
2. Issues to Resolve at This Hearing
3. Questions for Petitioner / Appellant (legally precise, test weak points)
4. Questions for Respondent (legally precise, test weak points)
5. Procedural Points to Address
6. Time Allocation Suggestions
7. Directly Relevant Precedents (only if clearly applicable)"""

    try:
        response = generate_response(prompt, max_tokens=1500)
        cleaned_response = clean_markdown_formatting(response)
        return {
            "success": True,
            "hearing_brief": cleaned_response,
            "model_used": "Google Gemini 1.5 Flash"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "hearing_brief": f"Error: {str(e)}"
        }


def draft_judgment_ai(case_details: str, issue: str = "") -> dict:
    """Draft judgment using Gemini"""
    
    if not case_details or len(case_details.strip()) < 50:
        return {
            "success": False,
            "error": "Insufficient case details provided.",
            "judgment_draft": ""
        }
    
    prompt = f"""You are an Indian judicial officer drafting a formal court judgment.
Apply these rules strictly:
- Use formal judicial language appropriate for Indian courts throughout.
- Do NOT hallucinate facts, arguments, orders, or precedents not present in the case details.
- Apply law to facts in the Analysis section — avoid emotional language.
- The Order must be precise, structured, and legally sound — include only what is legally warranted.
- Reflect the court's actual reasoning. Do NOT add findings not supported by the facts.
- Maintain consistency: Findings and Order must align with the Analysis.

CASE DETAILS:
{case_details}

{f"SPECIFIC ISSUE: {issue}" if issue.strip() else ""}

Draft a formal judgment with this structure:
HEADING (Court name, case number, parties)
INTRODUCTION (brief overview)
FACTS (chronological statement of facts)
ISSUES (legal questions to determine)
ARGUMENTS (both parties' submissions, neutrally stated)
LEGAL ANALYSIS (apply law to facts, cite relevant principles)
FINDINGS (court's conclusions on each issue)
ORDER (precise relief granted or denied)"""

    try:
        response = generate_response(prompt, max_tokens=2000)
        
        if not response or len(response.strip()) < 100:
            return {
                "success": False,
                "error": "Generated judgment was too short.",
                "judgment_draft": response
            }
        
        return {
            "success": True,
            "judgment_draft": response,
            "model_used": "Google Gemini 1.5 Flash"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error: {str(e)}",
            "judgment_draft": ""
        }


# ==================== LAWYER TOOLS ====================

def adversarial_simulation_ai(case_brief: str, user_arguments: str) -> dict:
    """Simulate adversarial arguments using Gemini"""
    prompt = f"""You are simulating opposing counsel in an Indian court.
Apply these rules:
- Evaluate arguments based on legal strength, evidence, and precedent support — NOT sympathy.
- Identify specific weaknesses: lack of proof, wrong law applied, missing arguments, procedural gaps.
- Counter-arguments must be legally grounded — avoid vague criticism or unsupported claims.
- Do NOT hallucinate precedents. If citing a case, it must be directly relevant.
- Use bullet points for counter-arguments and weaknesses.

Case Brief:
{case_brief}

Lawyer's Arguments:
{user_arguments}

Provide:
1. Strength Assessment (1-10 with specific legal reasoning)
2. Counter-Arguments (3-5 legally grounded points)
3. Weaknesses Identified (lack of proof, wrong law, missing arguments)
4. Missing Arguments the Lawyer Should Address
5. Relevant Precedents to Counter (only directly applicable)
6. Hearing Preparation Tips"""

    try:
        response = generate_response(prompt, max_tokens=1500)
        return {
            "success": True,
            "simulation": response,
            "model_used": "Google Gemini 1.5 Flash"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "simulation": f"Error: {str(e)}"
        }


def litigation_forecasting_ai(case_details: str) -> dict:
    """Forecast litigation outcome using Gemini"""
    prompt = f"""You are a senior legal analyst providing non-binding litigation forecasts for Indian courts.
Apply these rules strictly:

OUTCOME ANALYSIS:
- Base the entire forecast on the FINAL judgment of the highest court.
- Analyze the ACTUAL result — do NOT rely only on keywords like 'partly allowed'.
- Win Probability:
  a) Main relief granted, liability removed → WIN 70–90%
  b) Main relief rejected, liability remains → LOSE 70–90%
  c) Partly allowed, core liability remains → LOSE (with partial relief) 30–45%
  d) Partly allowed, liability removed with minor conditions → WIN (with limited conditions) 60–70%
  e) Truly balanced/ambiguous → UNCERTAIN 45–55%
- NEVER assign 0% or 100%.
- Always explain: what was granted, what was rejected, whether liability remains.

RULES:
- Do NOT suggest strategies that contradict the final judgment.
- Settlement: suggest only realistic, legally feasible options. Do NOT suggest relief already rejected.
- Timeline: use conditional phrasing, not fixed dates.
- Strategic Recommendations: align strictly with the legal position after the final judgment.

Case Details:
{case_details}

Provide a comprehensive forecast with:
1. Win Probability Estimate (with detailed reasoning)
2. Key Success Factors (realistic, legally grounded)
3. Risk Factors & Challenges (practical, legally grounded)
4. Settlement Recommendation (realistic and legally feasible)
5. Estimated Timeline (conditional, not fixed)
6. Cost-Benefit Analysis
7. Strategic Recommendations (aligned with final judgment)"""

    try:
        response = generate_response(prompt, max_tokens=1500)
        return {
            "success": True,
            "forecast": response,
            "model_used": "Google Gemini 1.5 Flash"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "forecast": f"Error: {str(e)}"
        }


def legal_drafting_ai(document_type: str, facts: str, jurisdiction: str, citations: str = "") -> dict:
    """Generate legal document draft using Gemini"""
    
    if not facts or len(facts.strip()) < 50:
        return {
            "success": False,
            "error": "Insufficient facts provided.",
            "draft": ""
        }
    
    doc_formats = {
        "pleading": "a formal pleading with Caption, Parties, Jurisdiction, Facts, Causes of Action, Prayer",
        "brief": "a legal brief with Table of Contents, Facts, Issues, Argument, Conclusion",
        "motion": "a motion with Caption, Notice, Memorandum of Law, Facts, Argument, Prayer",
        "contract": "a contract with Title, Parties, Recitals, Terms, Warranties, Termination, Signatures",
        "petition": "a petition with Caption, Parties, Jurisdiction, Grounds, Facts, Legal Basis, Prayer",
        "affidavit": "an affidavit with Caption, Affiant Info, Facts (numbered), Verification, Signature"
    }
    
    format_instruction = doc_formats.get(document_type, "a structured legal document")
    
    prompt = f"""You are an Indian legal drafter. Generate {format_instruction}.

DOCUMENT TYPE: {document_type.upper()}
JURISDICTION: {jurisdiction.replace('-', ' ').title()}

FACTS:
{facts}

{f"CITATIONS: {citations}" if citations.strip() else ""}

Create a professionally formatted {document_type} following Indian legal standards.
Use proper legal language and structure with clear sections."""

    try:
        response = generate_response(prompt, max_tokens=2000)
        
        if not response or len(response.strip()) < 100:
            return {
                "success": False,
                "error": "Generated draft was too short.",
                "draft": response
            }
        
        return {
            "success": True,
            "draft": response,
            "model_used": "Google Gemini 1.5 Flash"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error: {str(e)}",
            "draft": ""
        }
