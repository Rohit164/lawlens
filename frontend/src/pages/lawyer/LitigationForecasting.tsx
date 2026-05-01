import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import LimitReachedModal from "@/components/LimitReachedModal";
import FormattedOutput from "@/components/FormattedOutput";

const LitigationForecasting = () => {
  const [caseDetails, setCaseDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [forecast, setForecast] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleForecast = async () => {
    if (!caseDetails.trim()) return;
    setIsProcessing(true); setForecast(null);
    try {
      const response = await fetch('${API_BASE}/api/lawyer/forecasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_details: caseDetails }),
      });
      if (response.status === 429) { setShowLimitModal(true); return; }
      if (response.ok) setForecast(await response.json());
      else alert('Failed to generate forecast. Please try again.');
    } catch { alert('An error occurred. Please try again.'); }
    finally { setIsProcessing(false); }
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
                  <span className="badge-purple"><Target className="h-3.5 w-3.5" /> Lawyer Tool</span>
                </div>
                <h1 className="page-title mb-2">Litigation Forecasting</h1>
                <p className="page-subtitle">Non-binding AI insights on win probability, settlement windows, and strategic risk assessment.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="tool-card p-6 flex flex-col gap-5">
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-1">Case Details</h2>
                    <p className="text-xs text-slate-500">Include facts, arguments, and all relevant circumstances.</p>
                  </div>
                  <Textarea placeholder="Enter comprehensive case details…" value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    className="flex-1 min-h-[380px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  <Button onClick={handleForecast} disabled={isProcessing || !caseDetails.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Forecast…</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Litigation Forecast</>}
                  </Button>
                </div>

                <div className="tool-card p-6 flex flex-col gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-0.5">Forecast Analysis</h2>
                    <p className="text-xs text-slate-500">Win probability, risks & strategy</p>
                  </div>
                  <div className="flex-1 min-h-[420px]">
                    {!forecast && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <Target className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Forecast will appear here</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-green-500/20 border-t-green-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-green-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Analysing litigation landscape…</p>
                      </div>
                    )}
                    {forecast && (
                      <div className="flex flex-col gap-3 h-full">
                        <div className="result-box flex-1 max-h-[480px] overflow-y-auto scrollbar-hide p-4">
                          <FormattedOutput content={forecast.forecast} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="disclaimer-box mt-8">
                <strong>Non-Binding Notice:</strong> This forecast is AI-generated for informational purposes only. It does not constitute legal advice or guarantee any case outcome.
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
export default LitigationForecasting;
