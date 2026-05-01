import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Download, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { generatePDF } from "@/utils/pdfGenerator";

const DOC_TYPES = [
  { value: 'pleading', label: 'Pleading' },
  { value: 'brief',    label: 'Legal Brief' },
  { value: 'motion',   label: 'Motion' },
  { value: 'contract', label: 'Contract' },
  { value: 'petition', label: 'Petition' },
  { value: 'affidavit',label: 'Affidavit' },
];
const JURISDICTIONS = [
  { value: 'supreme-court',  label: 'Supreme Court of India' },
  { value: 'high-court',     label: 'High Court' },
  { value: 'district-court', label: 'District Court' },
  { value: 'tribunal',       label: 'Tribunal' },
];

const LegalDraftingAid = () => {
  const [documentType, setDocumentType] = useState('pleading');
  const [facts, setFacts] = useState('');
  const [jurisdiction, setJurisdiction] = useState('supreme-court');
  const [citations, setCitations] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!facts.trim()) { setError('Please provide case facts.'); return; }
    if (facts.trim().length < 50) { setError('Please provide more detail (at least 50 characters).'); return; }
    setError(''); setIsProcessing(true); setDraft(null);
    try {
      const response = await fetch('${API_BASE}/api/lawyer/legal-drafting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: documentType, facts, jurisdiction, citations }),
      });
      if (response.ok) setDraft(await response.json());
      else { const e = await response.json(); setError(e.detail || 'Failed to generate draft.'); }
    } catch { setError('Network error. Please ensure the backend is running.'); }
    finally { setIsProcessing(false); }
  };

  const downloadDraft = () => {
    if (!draft) return;
    const label = DOC_TYPES.find(d => d.value === documentType)?.label || documentType;
    generatePDF({ title: `Legal ${label}`, content: draft.draft, modelUsed: draft.model_used, filename: `legal-draft-${documentType}-${Date.now()}.pdf` });
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
                  <span className="badge-purple"><FileText className="h-3.5 w-3.5" /> Lawyer Tool</span>
                </div>
                <h1 className="page-title mb-2">Legal Drafting Aid</h1>
                <p className="page-subtitle">Generate structured legal documents with proper citations, formatting, and Indian court standards.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="tool-card p-6 flex flex-col gap-5">
                  <h2 className="text-base font-semibold text-slate-200">Document Configuration</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400">Document Type</label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger className="bg-slate-900/60 border-slate-700 text-slate-200 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {DOC_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value} className="text-slate-200 hover:bg-slate-700 text-sm">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400">Jurisdiction</label>
                      <Select value={jurisdiction} onValueChange={setJurisdiction}>
                        <SelectTrigger className="bg-slate-900/60 border-slate-700 text-slate-200 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {JURISDICTIONS.map(j => (
                            <SelectItem key={j.value} value={j.value} className="text-slate-200 hover:bg-slate-700 text-sm">{j.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400">Case Facts <span className="text-red-400">*</span></label>
                    <Textarea placeholder="Provide detailed case facts, parties involved, legal issues…" value={facts}
                      onChange={(e) => setFacts(e.target.value)}
                      className="min-h-[220px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                    <p className="text-xs text-slate-600">{facts.length} chars (min 50)</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400">Citations <span className="text-slate-600 font-normal">(optional)</span></label>
                    <Textarea placeholder="Relevant case citations, statutes, or legal provisions…" value={citations}
                      onChange={(e) => setCitations(e.target.value)}
                      className="min-h-[90px] bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none text-sm" />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
                    </div>
                  )}

                  <Button onClick={handleGenerate} disabled={isProcessing || !facts.trim()}
                    className="btn-primary w-full h-11 text-sm font-semibold">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Draft…</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Draft</>}
                  </Button>
                </div>

                <div className="tool-card p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-200 mb-0.5">Generated Draft</h2>
                      <p className="text-xs text-slate-500">Structured legal document</p>
                    </div>
                    {draft && (
                      <Button onClick={downloadDraft} variant="outline" size="sm"
                        className="border-purple-600/60 text-purple-400 hover:bg-purple-600 hover:text-white text-xs h-8 px-3">
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download PDF
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 min-h-[460px]">
                    {!draft && !isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                          <FileText className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="text-sm">Legal draft will appear here</p>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-blue-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-300 font-medium">Drafting legal document…</p>
                          <p className="text-xs text-slate-500 mt-1">This may take 15–30 seconds</p>
                        </div>
                      </div>
                    )}
                    {draft && (
                      <div className="flex flex-col gap-3 h-full">
                        <div className="result-box flex-1 max-h-[460px] overflow-y-auto scrollbar-hide font-mono text-xs leading-relaxed">{draft.draft}</div>
                        <div className="flex gap-3">
                          <div className="stat-card flex-1 !p-3 !text-left">
                            <p className="text-xs text-slate-500 mb-0.5">Model</p>
                            <p className="text-xs text-slate-300 font-medium truncate">{draft.model_used}</p>
                          </div>
                          <div className="stat-card flex-1 !p-3 !text-left">
                            <p className="text-xs text-slate-500 mb-0.5">Time</p>
                            <p className="text-xs text-slate-300 font-medium">{draft.processing_time}s</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="disclaimer-box mt-8">
                <strong>Professional Responsibility Notice:</strong> This AI draft is a starting point only. Lawyers must review, verify citations, and ensure compliance with all applicable rules before filing.
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </SignedIn>
    </>
  );
};
export default LegalDraftingAid;
