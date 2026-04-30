import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Gavel, Loader2, ArrowLeft, Download, Sparkles, AlertCircle } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { generatePDF } from "@/utils/pdfGenerator";

const JudgmentDrafting = () => {
  const [caseDetails, setCaseDetails] = useState('');
  const [issue, setIssue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [judgment, setJudgment] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!caseDetails.trim()) { setError('Please provide case details.'); return; }
    if (caseDetails.trim().length < 50) { setError('Please provide more detail (at least 50 characters).'); return; }
    setError(''); setIsProcessing(true); setJudgment(null);
    try {
      const response = await fetch('http://localhost:8000/api/judge/judgment-drafting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_details: caseDetails, issue }),
      });
      if (response.ok) setJudgment(await response.json());
      else { const e = await response.json(); setError(e.detail || 'Failed to generate judgment.'); }
    } catch { setError('Network error. Please ensure the backend is running.'); }
    finally { setIsProcessing(false); }
  };

  const downloadJudgment = () => {
    if (!judgment) return;
    generatePDF({ title: 'Judgment Draft', content: judgment.judgment_draft, modelUsed: judgment.model_used, filename: `judgment-draft-${Date.now()}.pdf` });
  };

  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn>
        <div className="min-h-screen relative page-transition">
          <AnimatedBackground />
          <Navbar />
          <div className="pt-24 pb-20 relative z-10">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="mb-10">
                <button onClick={() => window.location.href = '/judge-dashboard'}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors duration-200">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge-purple"><Gavel className="h-3.5 w-3.5" /> Judge Tool</span>
                </div>
                <h1 className="page-title mb-2">Judgment Drafting Aid</h1>
                <p className="page-subtitle">AI-assisted drafting with templates, precedent application, and structured legal reasoning.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="tool-card p-6 flex flex-col gap-5">
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-1">Case Details</h2>
                    <p className="text-xs text-slate-500">Include facts, arguments, evidence, and legal issues.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Textarea placeholder="Enter comprehensive case analysis…" value={caseDetails}
                      onChange={(e) => setCaseDetails(e.target.value)}
                      className="min-h-[260px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                    <p className="text-xs text-slate-600">{caseDetails.length} chars (min 50)</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-400">Specific Issue <span className="text-slate-600 font-normal">(optional)</span></label>
                    <Textarea placeholder="Enter the specific legal question to address…" value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      className="min-h-[100px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  </div>
                  {error && (
                    <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
                    </div>
                  )}
                  <Button onClick={handleGenerate} disabled={isProcessing || !caseDetails.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Drafting Judgment…</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Judgment Draft</>}
                  </Button>
                </div>

                <div className="tool-card p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-0.5">Judgment Draft</h2>
                      <p className="text-xs text-slate-500">Structured judicial document</p>
                    </div>
                    {judgment && (
                      <Button onClick={downloadJudgment} variant="outline" size="sm"
                        className="border-purple-600/60 text-purple-400 hover:bg-purple-600 hover:text-white text-xs h-8 px-3">
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download PDF
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 min-h-[420px]">
                    {!judgment && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <Gavel className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Judgment draft will appear here</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-green-500/20 border-t-green-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-green-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-300 font-medium">Drafting judgment…</p>
                          <p className="text-xs text-slate-500 mt-1">This may take 15–30 seconds</p>
                        </div>
                      </div>
                    )}
                    {judgment && (
                      <div className="flex flex-col gap-3 h-full">
                        <div className="result-box flex-1 max-h-[460px] overflow-y-auto scrollbar-hide font-mono text-xs leading-relaxed">
                          {judgment.judgment_draft}
                        </div>
                        <div className="flex gap-3">
                          <div className="stat-card flex-1 !p-3 !text-left">
                            <p className="text-xs text-slate-500 mb-0.5">Model</p>
                            <p className="text-xs text-slate-300 font-medium truncate">{judgment.model_used}</p>
                          </div>
                          <div className="stat-card flex-1 !p-3 !text-left">
                            <p className="text-xs text-slate-500 mb-0.5">Time</p>
                            <p className="text-xs text-slate-300 font-medium">{judgment.processing_time}s</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="disclaimer-box mt-8">
                <strong>Judicial Independence Notice:</strong> This draft is AI-generated for reference only. Judges must independently review all reasoning, verify citations, and maintain full judicial authority over the final judgment.
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </SignedIn>
    </>
  );
};
export default JudgmentDrafting;
