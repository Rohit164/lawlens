import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import LimitReachedModal from "@/components/LimitReachedModal";
import { generatePDF } from "@/utils/pdfGenerator";
import FormattedOutput from "@/components/FormattedOutput";

const HearingPreparation = () => {
  const [caseFile, setCaseFile] = useState('');
  const [hearingHistory, setHearingHistory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hearingBrief, setHearingBrief] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleGenerate = async () => {
    if (!caseFile.trim()) return;
    setIsProcessing(true); setHearingBrief(null);
    try {
      const response = await fetch('${API_BASE}/api/judge/hearing-preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_file: caseFile, hearing_history: hearingHistory || null }),
      });
      if (response.status === 429) { setShowLimitModal(true); return; }
      if (response.ok) setHearingBrief(await response.json());
      else alert('Failed to generate hearing brief. Please try again.');
    } catch { alert('An error occurred. Please try again.'); }
    finally { setIsProcessing(false); }
  };

  const downloadBrief = () => {
    if (!hearingBrief) return;
    generatePDF({ title: 'Hearing Preparation Brief', content: hearingBrief.hearing_brief, modelUsed: hearingBrief.model_used, filename: `hearing-brief-${Date.now()}.pdf` });
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
                  <span className="badge-purple"><Calendar className="h-3.5 w-3.5" /> Judge Tool</span>
                </div>
                <h1 className="page-title mb-2">Hearing Preparation</h1>
                <p className="page-subtitle">AI-powered hearing brief with questions, time allocation, and similar matters.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-5">
                  <div className="tool-card p-6 flex flex-col gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-1">Case File</h2>
                      <p className="text-xs text-slate-500">Enter case facts and background.</p>
                    </div>
                    <Textarea placeholder="Enter case file details…" value={caseFile}
                      onChange={(e) => setCaseFile(e.target.value)}
                      className="min-h-[220px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  </div>
                  <div className="tool-card p-6 flex flex-col gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-1">Previous Hearing Notes <span className="text-slate-500 font-normal text-xs">(optional)</span></h2>
                    </div>
                    <Textarea placeholder="Enter previous hearing notes if available…" value={hearingHistory}
                      onChange={(e) => setHearingHistory(e.target.value)}
                      className="min-h-[140px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  </div>
                  <Button onClick={handleGenerate} disabled={isProcessing || !caseFile.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing Brief…</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Hearing Brief</>}
                  </Button>
                </div>

                <div className="tool-card p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-0.5">Hearing Brief</h2>
                      <p className="text-xs text-slate-500">AI-generated preparation guide</p>
                    </div>
                    {hearingBrief && (
                      <Button onClick={downloadBrief} variant="outline" size="sm"
                        className="border-purple-600/60 text-purple-400 hover:bg-purple-600 hover:text-white text-xs h-8 px-3">
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download PDF
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 min-h-[420px]">
                    {!hearingBrief && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <Calendar className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Hearing brief will appear here</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Preparing hearing brief…</p>
                      </div>
                    )}
                    {hearingBrief && (
                      <div className="flex flex-col gap-3 h-full">
                        <div className="result-box flex-1 max-h-[480px] overflow-y-auto scrollbar-hide p-4">
                          <FormattedOutput content={hearingBrief.hearing_brief} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="disclaimer-box mt-8">
                <strong>Judicial Notice:</strong> This hearing brief is AI-generated for preparation assistance only. All content is subject to judicial review and override.
              </div>
            </div>
          </div>
          <Footer />
          <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} type="summarization" />
        </div>
      </SignedIn>
    </>
  );
};
export default HearingPreparation;
