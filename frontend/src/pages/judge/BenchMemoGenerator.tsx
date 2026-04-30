import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import LimitReachedModal from "@/components/LimitReachedModal";
import { generatePDF } from "@/utils/pdfGenerator";
import FormattedOutput from "@/components/FormattedOutput";

const BenchMemoGenerator = () => {
  const [caseFile, setCaseFile] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [benchMemo, setBenchMemo] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleGenerate = async () => {
    if (!caseFile.trim()) return;
    setIsProcessing(true);
    setBenchMemo(null);
    try {
      const response = await fetch('http://localhost:8000/api/judge/bench-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_file: caseFile }),
      });
      if (response.status === 429) { setShowLimitModal(true); return; }
      if (response.ok) setBenchMemo(await response.json());
      else alert('Failed to generate bench memo. Please try again.');
    } catch { alert('An error occurred. Please try again.'); }
    finally { setIsProcessing(false); }
  };

  const downloadMemo = () => {
    if (!benchMemo) return;
    generatePDF({ title: 'Bench Memo', content: benchMemo.bench_memo, modelUsed: benchMemo.model_used, filename: `bench-memo-${Date.now()}.pdf` });
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

              {/* ── Header ── */}
              <div className="mb-10">
                <button
                  onClick={() => window.location.href = '/judge-dashboard'}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <span className="badge-purple"><FileText className="h-3.5 w-3.5" /> Judge Tool</span>
                </div>
                <h1 className="page-title mb-2">Bench Memo Generator</h1>
                <p className="page-subtitle">AI-powered analysis with issue framing, balanced arguments, and precedent mapping.</p>
              </div>

              {/* ── Main grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Input */}
                <div className="tool-card p-6 flex flex-col gap-5">
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-1">Case File Input</h2>
                    <p className="text-xs text-slate-500">Paste facts, arguments, and relevant documents.</p>
                  </div>
                  <Textarea
                    placeholder="Paste case file details here…"
                    value={caseFile}
                    onChange={(e) => setCaseFile(e.target.value)}
                    className="flex-1 min-h-[380px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm leading-relaxed focus:border-purple-500"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={isProcessing || !caseFile.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold"
                  >
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Bench Memo…</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Generate Bench Memo</>
                    )}
                  </Button>
                </div>

                {/* Output */}
                <div className="tool-card p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-0.5">Bench Memo</h2>
                      <p className="text-xs text-slate-500">AI-generated judicial analysis</p>
                    </div>
                    {benchMemo && (
                      <Button onClick={downloadMemo} variant="outline" size="sm"
                        className="border-purple-600/60 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 text-xs h-8 px-3">
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download PDF
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 min-h-[380px]">
                    {!benchMemo && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <FileText className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Bench memo will appear here</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-purple-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-300 font-medium">Analyzing case file…</p>
                          <p className="text-xs text-slate-500 mt-1">AI Legal Analysis Engine</p>
                        </div>
                      </div>
                    )}
                    {benchMemo && (
                      <div className="flex flex-col gap-3 h-full">
                        <div className="result-box flex-1 max-h-[440px] overflow-y-auto scrollbar-hide p-4">
                          <FormattedOutput content={benchMemo.bench_memo} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="disclaimer-box mt-8">
                <strong>Judicial Notice:</strong> This bench memo is AI-generated for assistance only.
                All suggestions are subject to judicial review. The presiding judge retains full authority over all decisions.
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

export default BenchMemoGenerator;
