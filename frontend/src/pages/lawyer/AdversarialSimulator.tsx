import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Swords, Loader2, ArrowLeft, Download, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import LimitReachedModal from "@/components/LimitReachedModal";
import { generatePDF } from "@/utils/pdfGenerator";
import FormattedOutput from "@/components/FormattedOutput";

const AdversarialSimulator = () => {
  const [caseBrief, setCaseBrief] = useState('');
  const [userArguments, setUserArguments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleSimulate = async () => {
    if (!caseBrief.trim() || !userArguments.trim()) return;
    setIsProcessing(true); setAnalysis(null);
    try {
      const response = await fetch('${API_BASE}/api/lawyer/adversarial-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_brief: caseBrief, user_arguments: userArguments }),
      });
      if (response.status === 429) { setShowLimitModal(true); return; }
      if (response.ok) setAnalysis(await response.json());
      else alert('Failed to run simulation. Please try again.');
    } catch { alert('An error occurred. Please try again.'); }
    finally { setIsProcessing(false); }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    generatePDF({ title: 'Adversarial Analysis', content: analysis.simulation, modelUsed: analysis.model_used, filename: `adversarial-analysis-${Date.now()}.pdf` });
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
                <button onClick={() => window.location.href = '/lawyer-dashboard'}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors duration-200">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge-purple"><Swords className="h-3.5 w-3.5" /> Lawyer Tool</span>
                </div>
                <h1 className="page-title mb-2">Devil's Advocate Mode</h1>
                <p className="page-subtitle">Predict opponent's strategy and identify weaknesses in your case before the hearing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-5">
                  <div className="tool-card p-6 flex flex-col gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-1">Case Brief</h2>
                      <p className="text-xs text-slate-500">Facts, background, and context of the case.</p>
                    </div>
                    <Textarea placeholder="Enter case brief with facts and background…" value={caseBrief}
                      onChange={(e) => setCaseBrief(e.target.value)}
                      className="min-h-[200px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  </div>
                  <div className="tool-card p-6 flex flex-col gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-1">Your Arguments</h2>
                      <p className="text-xs text-slate-500">The arguments you plan to present in court.</p>
                    </div>
                    <Textarea placeholder="Enter your planned arguments…" value={userArguments}
                      onChange={(e) => setUserArguments(e.target.value)}
                      className="min-h-[200px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  </div>
                  <Button onClick={handleSimulate} disabled={isProcessing || !caseBrief.trim() || !userArguments.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running Simulation…</> : <><Swords className="mr-2 h-4 w-4" />Run Adversarial Simulation</>}
                  </Button>
                </div>

                <div className="tool-card p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-0.5">Adversarial Analysis</h2>
                      <p className="text-xs text-slate-500">Opposition strategy & weaknesses</p>
                    </div>
                    {analysis && (
                      <Button onClick={downloadAnalysis} variant="outline" size="sm"
                        className="border-purple-600/60 text-purple-400 hover:bg-purple-600 hover:text-white text-xs h-8 px-3">
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download PDF
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 min-h-[460px]">
                    {!analysis && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <Swords className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Analysis will appear here</p>
                        <p className="text-xs text-slate-700">Fill both fields above to enable simulation</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-red-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Simulating opposition strategy…</p>
                      </div>
                    )}
                    {analysis && (
                      <div className="flex flex-col gap-3 h-full">
                        <div className="result-box flex-1 max-h-[480px] overflow-y-auto scrollbar-hide p-4">
                          <FormattedOutput content={analysis.simulation} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="disclaimer-box mt-8">
                <strong>Preparation Notice:</strong> This simulation is for strategic preparation only. Actual opponent strategies may differ. Not a substitute for professional legal judgment.
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
export default AdversarialSimulator;
