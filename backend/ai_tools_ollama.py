"""
AI Tools - Powered by Groq (replaces Ollama)
Used by Judge Dashboard, Lawyer Dashboard, Analytics Dashboard
"""

import os
import re
from groq import Groq

_API_KEY = os.getenv("GROQ_API_KEY")
if not _API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")
_client = Groq(api_key=_API_KEY)
MODEL = "llama-3.3-70b-versatile"


def _ask(system: str, user: str, max_tokens: int = 1500) -> str:
    """Single helper for all Groq calls."""
    resp = _client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        temperature=0.4,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content.strip()


# ── JUDGE TOOLS ────────────────────────────────────────────────────────────────

def generate_bench_memo_ai(case_file: str) -> dict:
    system = (
        "You are a senior judicial law clerk drafting bench memos for Indian courts. "
        "Write in formal, concise judicial English. Apply these rules strictly:\n\n"
        "GENERAL:\n"
        "- Base the entire memo on the FINAL judgment of the highest court. Do NOT rely on lower court findings.\n"
        "- Do NOT hallucinate facts, arguments, orders, or precedents not present in the case file.\n"
        "- Maintain a professional, neutral, and legally accurate tone throughout.\n"
        "- Use bullet points for issues, arguments, and questions. Avoid long paragraphs.\n\n"
        "CASE SUMMARY:\n"
        "- Always include full Case Title (Appellant vs. Respondent).\n"
        "- Keep facts concise and chronological.\n"
        "- Frame issues as clear legal questions.\n"
        "- Present arguments from both sides neutrally.\n\n"
        "KEY LEGAL ISSUES:\n"
        "- Frame as precise legal questions (e.g., 'Whether the petitioner is entitled to equitable "
        "consideration' — NOT 'whether the petitioner has an absolute right').\n"
        "- Do NOT imply incorrect legal rights (e.g., loan restructuring is NOT an enforceable right).\n\n"
        "RELEVANT PRECEDENTS & STATUTES:\n"
        "- Cite ONLY precedents directly relevant to the issues in this case.\n"
        "- If unsure of relevance, state the general legal principle instead of citing a case.\n"
        "- NEVER include unrelated case law.\n\n"
        "ANALYSIS OF EACH ISSUE:\n"
        "- Apply law to facts. Be crisp and issue-wise. No storytelling.\n"
        "- Where applicable, state that commercial discretion (e.g., loan restructuring) vests in the "
        "lender and is NOT an enforceable right of the borrower.\n\n"
        "SUGGESTED DISPOSITION:\n"
        "- Use definitive, outcome-aligned language based on the final appellate decision.\n"
        "- Use: 'The Court upheld...', 'The Court dismissed...', 'The Court partly allowed...'.\n"
        "- Do NOT use predictive phrases like 'The Court may consider'.\n"
        "- Do NOT include any orders or directions not explicitly present in the judgment.\n"
        "- Clearly reflect: what was upheld, what was set aside, and whether liability remains."
    )
    user = f"""Analyze the following case file and produce a bench memo covering:
1. Case Summary & Parties
2. Key Legal Issues (as bullet-point legal questions)
3. Relevant Precedents & Statutes (only directly applicable ones)
4. Analysis of Each Issue (crisp, issue-wise)
5. Recommended Questions for Hearing (to test weak points of both sides)
6. Suggested Disposition (aligned strictly with the final judgment)

Case File:
{case_file}"""
    try:
        memo = _ask(system, user)
        return {"success": True, "bench_memo": memo, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "bench_memo": f"Error: {e}"}


def prepare_hearing_ai(case_file: str) -> dict:
    system = (
        "You are a judicial assistant helping a judge prepare for an upcoming hearing in an Indian court. "
        "Apply these rules strictly:\n"
        "- Base the brief on the FINAL judgment of the highest court. Do NOT rely on lower court findings.\n"
        "- Do NOT hallucinate facts, arguments, or precedents not present in the case file.\n"
        "- Focus on key questions that test the weak points of both parties — avoid generic phrasing.\n"
        "- Questions must be legally relevant and procedurally precise.\n"
        "- Do NOT repeat the case summary. Focus on hearing-specific preparation.\n"
        "- Use bullet points for questions and procedural points. Keep it concise and practical.\n"
        "- Maintain a neutral, formal judicial tone throughout."
    )
    user = f"""Prepare a hearing brief for the following case:
1. Case Overview (brief — 3-4 lines only)
2. Issues to Resolve at This Hearing
3. Questions for Petitioner / Appellant (test weak points, legally precise)
4. Questions for Respondent (test weak points, legally precise)
5. Procedural Points to Address
6. Time Allocation Suggestions
7. Directly Relevant Precedents (only if clearly applicable)

Case File:
{case_file}"""
    try:
        brief = _ask(system, user)
        return {"success": True, "hearing_brief": brief, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "hearing_brief": f"Error: {e}"}


def draft_judgment_ai(case_details: str, issue: str = "") -> dict:
    if not case_details or len(case_details.strip()) < 50:
        return {"success": False, "error": "Insufficient case details.", "judgment_draft": ""}
    system = (
        "You are an Indian judicial officer drafting a formal court judgment. "
        "Apply these rules strictly:\n"
        "- Use formal judicial language appropriate for Indian courts throughout.\n"
        "- Do NOT hallucinate facts, arguments, orders, or precedents not present in the case details.\n"
        "- Apply law to facts in the Analysis section — avoid emotional language.\n"
        "- The Order must be precise, structured, and legally sound — include only what is legally warranted.\n"
        "- Reflect the court's actual reasoning. Do NOT add findings not supported by the facts.\n"
        "- Maintain consistency: the Findings and Order must align with the Analysis.\n"
        "- Structure: Introduction → Facts → Issues → Arguments → Legal Analysis → Findings → Order."
    )
    user = f"""Draft a formal judgment for the following case.

Case Details:
{case_details}
{f"Specific Issue: {issue}" if issue.strip() else ""}

Use this structure:
HEADING (Court, Case No., Parties)
INTRODUCTION (brief overview)
FACTS (chronological statement of facts)
ISSUES (legal questions to determine)
ARGUMENTS (both parties' submissions, neutrally stated)
LEGAL ANALYSIS (apply law to facts, cite relevant principles)
FINDINGS (court's conclusions on each issue)
ORDER (precise relief granted or denied)"""
    try:
        draft = _ask(system, user, max_tokens=2000)
        if len(draft.strip()) < 100:
            return {"success": False, "error": "Draft too short.", "judgment_draft": draft}
        return {"success": True, "judgment_draft": draft, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "judgment_draft": ""}


# ── LAWYER TOOLS ───────────────────────────────────────────────────────────────

def adversarial_simulation_ai(case_brief: str, user_arguments: str) -> dict:
    system = (
        "You are simulating opposing counsel in an Indian court. "
        "Apply these rules strictly:\n"
        "- Evaluate arguments based on legal strength, evidence, and precedent support — NOT sympathy.\n"
        "- Identify specific weaknesses: lack of proof, wrong law applied, missing arguments, procedural gaps.\n"
        "- Counter-arguments must be legally grounded — avoid vague criticism or unsupported claims.\n"
        "- Do NOT hallucinate precedents. If citing a case, it must be directly relevant.\n"
        "- Be critical, precise, and legally accurate. Avoid generic or speculative observations.\n"
        "- Use bullet points for counter-arguments and weaknesses. Keep the tone professional and neutral."
    )
    user = f"""Analyze the lawyer's arguments and simulate the opposition.

Case Brief:
{case_brief}

Lawyer's Arguments:
{user_arguments}

Provide:
1. Strength Assessment (1–10 with specific legal reasoning)
2. Counter-Arguments (3–5 legally grounded points)
3. Weaknesses Identified (lack of proof, wrong law, missing arguments)
4. Missing Arguments the Lawyer Should Address
5. Relevant Precedents to Counter (only directly applicable ones)
6. Hearing Preparation Tips"""
    try:
        sim = _ask(system, user)
        return {"success": True, "simulation": sim, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "simulation": f"Error: {e}"}


def litigation_forecasting_ai(case_details: str) -> dict:
    system = (
        "You are a senior legal analyst providing non-binding litigation forecasts for Indian courts. "
        "Apply these rules strictly:\n\n"
        "OUTCOME ANALYSIS:\n"
        "- Base the entire forecast on the FINAL judgment of the highest court.\n"
        "- Analyze the ACTUAL result — do NOT rely only on keywords like 'partly allowed'.\n"
        "- Determine the real outcome:\n"
        "  a) If main relief was granted → WIN (70–90%)\n"
        "  b) If main relief was rejected / liability remains → LOSE (70–90%)\n"
        "  c) If partial:\n"
        "     - Core liability remains → 'LOSE (with partial relief)' — 30–45%\n"
        "     - Liability removed but minor conditions remain → 'WIN (with limited conditions)' — 60–70%\n"
        "  d) Only mark UNCERTAIN if the outcome is truly balanced — 45–55%\n"
        "- NEVER assign 0% or 100%.\n"
        "- Always explain: what was granted, what was rejected, whether liability remains.\n\n"
        "WIN PROBABILITY SCALE:\n"
        "- Strong outcome → 80–90%\n"
        "- Partial outcome → 60–70%\n"
        "- Unclear outcome → 50–60%\n\n"
        "KEY SUCCESS FACTORS:\n"
        "- Include only realistic, legally possible strategies focused on evidence, procedure, and law.\n"
        "- Do NOT suggest strategies that contradict the final judgment.\n\n"
        "RISK FACTORS:\n"
        "- Include practical, legally grounded risks: enforcement actions, penalties, delay, financial impact.\n"
        "- Avoid speculative or unrealistic risks.\n\n"
        "SETTLEMENT RECOMMENDATION:\n"
        "- Suggest practical resolutions: settlement, compliance, negotiation, ADR.\n"
        "- Do NOT suggest relief already rejected by the court.\n"
        "- Keep it realistic and legally feasible.\n\n"
        "TIMELINE:\n"
        "- Avoid fixed or unrealistic timelines.\n"
        "- Use conditional phrasing: 'timeline depends on compliance, enforcement, or further litigation'.\n\n"
        "COST-BENEFIT:\n"
        "- Clearly compare cost of litigation vs expected benefit and risk vs outcome.\n\n"
        "STRATEGIC RECOMMENDATIONS:\n"
        "- Align strictly with the legal position after the final judgment.\n"
        "- Provide actionable, practical, legally sound advice only.\n"
        "- Do NOT contradict the final judgment."
    )
    user = f"""Provide a litigation forecast for the following case:

{case_details}

Cover:
1. Win Probability Estimate (with detailed reasoning — what was granted, rejected, whether liability remains)
2. Key Success Factors (realistic, legally grounded)
3. Risk Factors & Challenges (practical, legally grounded)
4. Settlement Recommendation (realistic and legally feasible)
5. Estimated Timeline (conditional, not fixed)
6. Cost-Benefit Considerations
7. Strategic Recommendations (aligned with final judgment)"""
    try:
        forecast = _ask(system, user)
        return {"success": True, "forecast": forecast, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "forecast": f"Error: {e}"}


def judge_analytics_ai(judge_name: str) -> dict:
    system = (
        "You are a legal analytics assistant providing publicly available insights "
        "about judicial patterns in Indian courts. Do not fabricate specific statistics."
    )
    user = f"""Provide an analytical profile for Judge: {judge_name}

Cover (based on general judicial patterns — note if specific data unavailable):
1. Typical Case Types Handled
2. Known Judicial Philosophy / Approach
3. Average Disposal Time (general estimate)
4. Notable Judgments (if publicly known)
5. Preferred Arguments Style
6. Tips for Appearing Before This Judge"""
    try:
        analytics = _ask(system, user)
        return {"success": True, "analytics": analytics, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "analytics": f"Error: {e}"}


def real_time_assistance_ai(query: str) -> dict:
    system = (
        "You are a real-time legal assistant for Indian lawyers. "
        "Provide concise, accurate, and actionable legal guidance."
    )
    user = query
    try:
        assistance = _ask(system, user, max_tokens=1000)
        return {"success": True, "assistance": assistance, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "assistance": f"Error: {e}"}


def legal_drafting_ai(document_type: str, facts: str, jurisdiction: str, citations: str = "") -> dict:
    if not facts or len(facts.strip()) < 50:
        return {"success": False, "error": "Insufficient facts.", "draft": ""}
    doc_formats = {
        "pleading":  "a formal pleading (Caption, Parties, Jurisdiction, Facts, Causes of Action, Prayer)",
        "brief":     "a legal brief (Table of Contents, Facts, Issues, Argument, Conclusion)",
        "motion":    "a motion (Caption, Notice, Memorandum of Law, Facts, Argument, Prayer)",
        "contract":  "a contract (Title, Parties, Recitals, Terms, Warranties, Termination, Signatures)",
        "petition":  "a petition (Caption, Parties, Jurisdiction, Grounds, Facts, Legal Basis, Prayer)",
        "affidavit": "an affidavit (Caption, Affiant Info, Numbered Facts, Verification, Signature)",
    }
    fmt = doc_formats.get(document_type, "a structured legal document")
    system = "You are an expert Indian legal drafter. Use proper legal language and Indian court standards."
    user = f"""Draft {fmt}.

Document Type: {document_type.upper()}
Jurisdiction: {jurisdiction.replace('-', ' ').title()}

Facts:
{facts}
{f"Citations: {citations}" if citations.strip() else ""}"""
    try:
        draft = _ask(system, user, max_tokens=2000)
        if len(draft.strip()) < 100:
            return {"success": False, "error": "Draft too short.", "draft": draft}
        return {"success": True, "draft": draft, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "draft": ""}


def compliance_scanner_ai(filing_text: str) -> dict:
    system = (
        "You are a legal compliance expert specialising in Indian court filings. "
        "Apply these rules strictly:\n"
        "- Identify issues precisely with specific references to the filing text.\n"
        "- Suggest concrete, actionable corrections — not vague advice.\n"
        "- Do NOT hallucinate rules or requirements not applicable to the filing type.\n"
        "- Distinguish between mandatory defects (that can cause rejection) and minor issues.\n"
        "- Use bullet points for each issue. Keep the tone professional and neutral."
    )
    user = f"""Scan the following court filing for compliance issues:

{filing_text}

Report:
1. Formatting Compliance (court rules — flag mandatory vs minor issues)
2. Missing Mandatory Sections
3. Citation Format Issues (specific errors with corrections)
4. Procedural Defects (that could cause rejection)
5. Language / Clarity Issues
6. Recommended Corrections (specific and actionable)"""
    try:
        report = _ask(system, user)
        return {"success": True, "compliance_report": report, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "compliance_report": f"Error: {e}"}


def counterfactual_analysis_ai(case_details: str, what_if_scenario: str) -> dict:
    system = (
        "You are a legal analyst specialising in counterfactual case analysis for Indian courts."
    )
    user = f"""Perform a counterfactual analysis.

Case Details:
{case_details}

What-If Scenario:
{what_if_scenario}

Analyse:
1. How the Scenario Changes the Legal Landscape
2. Impact on Key Arguments
3. Likely Outcome Under the Scenario
4. Precedents That Would Apply
5. Strategic Implications"""
    try:
        analysis = _ask(system, user)
        return {"success": True, "analysis": analysis, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "analysis": f"Error: {e}"}


def precedent_impact_ai(case_citation: str) -> dict:
    system = (
        "You are a legal researcher analysing the precedential impact of Indian court judgments."
    )
    user = f"""Analyse the precedential impact of: {case_citation}

Cover:
1. Core Legal Principle Established
2. Courts / Jurisdictions It Binds
3. Cases That Have Cited It
4. Areas of Law Affected
5. Subsequent Modifications or Overruling
6. Current Relevance"""
    try:
        impact = _ask(system, user)
        return {"success": True, "impact_analysis": impact, "model_used": f"Groq {MODEL}"}
    except Exception as e:
        return {"success": False, "error": str(e), "impact_analysis": f"Error: {e}"}
