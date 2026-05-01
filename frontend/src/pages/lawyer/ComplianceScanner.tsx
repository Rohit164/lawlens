import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import LimitReachedModal from "@/components/LimitReachedModal";
import FormattedOutput from "@/components/FormattedOutput";

const ComplianceScanner = () => {
  const [filing, setFiling] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleScan = async () => {
    if (!filing.trim()) return;
    setIsProcessing(true);
    setScanResults(null);
    try {
      const response = await fetch('${API_BASE}/api/lawyer/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filing_text: filing }),
      });
      if (response.status === 429) { setShowLimitModal(true); return; }
      if (response.ok) setScanResults(await response.json());
      else alert('Failed to scan document. Please try again.');
    } catch { alert('An error occurred. Please try again.'); }
    finally { setIsProcessing(false); }
  };

  const resultText = scanResults?.compliance_report
    ?? (typeof scanResults?.compliance_scan === 'string'
      ? scanResults.compliance_scan
      : scanResults ? JSON.stringify(scanResults, null, 2) : '');

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
                  <span className="badge-purple"><Shield className="h-3.5 w-3.5" /> Lawyer Tool</span>
                </div>
                <h1 className="page-title mb-2">Compliance Scanner</h1>
                <p className="page-subtitle">Detect procedural gaps, missing disclosures, and compliance risks in your filing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="tool-card p-6 flex flex-col gap-5">
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-1">Filing Document</h2>
                    <p className="text-xs text-slate-500">Paste your court filing or legal document.</p>
                  </div>
                  <Textarea placeholder="Paste your filing document here…" value={filing}
                    onChange={(e) => setFiling(e.target.value)}
                    className="flex-1 min-h-[380px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  <Button onClick={handleScan} disabled={isProcessing || !filing.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold">
                    {isProcessing
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning…</>
                      : <><Shield className="mr-2 h-4 w-4" />Scan for Compliance</>}
                  </Button>
                </div>

                <div className="tool-card p-6 flex flex-col gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-0.5">Scan Results</h2>
                    <p className="text-xs text-slate-500">Compliance issues & recommendations</p>
                  </div>
                  <div className="flex-1 min-h-[420px]">
                    {!scanResults && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <Shield className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Results will appear here</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Scanning for compliance issues…</p>
                      </div>
                    )}
                    {scanResults && (
                      <div className="result-box max-h-[480px] overflow-y-auto scrollbar-hide p-4">
                        <FormattedOutput content={resultText} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="disclaimer-box mt-8">
                <strong>Notice:</strong> This compliance scan is AI-generated for preparation purposes only.
                Always verify with a qualified legal professional before filing.
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

export default ComplianceScanner;
