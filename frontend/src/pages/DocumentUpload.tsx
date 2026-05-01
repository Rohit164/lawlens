import { useState, useRef } from 'react';
import Navbar from "@/components/Navbar";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Languages } from 'lucide-react';
import API_BASE from '@/lib/api';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' }, { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' }, { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' }, { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' }, { code: 'pa', name: 'Punjabi' },
  { code: 'te', name: 'Telugu' },
];

const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [targetLang, setTargetLang] = useState('hi');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [step, setStep] = useState<'upload' | 'extracting' | 'summarizing' | 'done'>('upload');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setError('');
    setStep('extracting');

    const formData = new FormData();
    formData.append('file', f);

    try {
      const res = await fetch(`${API_BASE}/api/ocr/extract`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setExtractedText(data.extracted_text);
      await summarize(data.extracted_text);
    } catch (e: any) {
      setError(`Extraction failed: ${e.message}`);
      setStep('upload');
    }
  };

  const summarize = async (text: string) => {
    setStep('summarizing');
    try {
      const res = await fetch(`${API_BASE}/api/summarize/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, summary_length: summaryLength, extract_metadata: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummary(data.summary);
      setKeyPoints(data.key_points || []);
      setStep('done');
    } catch (e: any) {
      setError(`Summarization failed: ${e.message}`);
      setStep('upload');
    }
  };

  const handleTranslate = async () => {
    if (!summary) return;
    try {
      const res = await fetch(`${API_BASE}/api/translate/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, target_language: targetLang }),
      });
      const data = await res.json();
      setTranslatedSummary(data.translated_text);
    } catch (e: any) {
      setError(`Translation failed: ${e.message}`);
    }
  };

  const reset = () => {
    setFile(null); setExtractedText(''); setSummary('');
    setKeyPoints([]); setTranslatedSummary(''); setError(''); setStep('upload');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d0d' }}>
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 mt-16">

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500/40 rounded-lg flex items-center gap-2 text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {step === 'upload' && (
          <div
            className="border-2 border-dashed border-purple-500/40 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500/70 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-slate-200 text-lg font-medium">Drop your legal document here</p>
            <p className="text-slate-500 text-sm mt-1">Supports PDF, DOCX, TXT</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <select
                value={summaryLength}
                onChange={e => setSummaryLength(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="bg-slate-800 text-slate-300 text-sm rounded px-2 py-1 border border-slate-600"
              >
                <option value="short">Short summary</option>
                <option value="medium">Medium summary</option>
                <option value="detailed">Detailed summary</option>
              </select>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>
        )}

        {(step === 'extracting' || step === 'summarizing') && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
            <p className="text-slate-300">{step === 'extracting' ? 'Extracting text...' : 'Generating summary with AI...'}</p>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{file?.name}</span>
              </div>
              <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Upload another</button>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
              <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-purple-400" /> Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
            </div>

            {keyPoints.length > 0 && (
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
                <h3 className="text-slate-200 font-semibold mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {keyPoints.map((pt, i) => (
                    <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-purple-400 shrink-0">•</span>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
              <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2"><Languages className="h-4 w-4 text-purple-400" /> Translate Summary</h3>
              <div className="flex gap-3">
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="bg-slate-800 text-slate-300 text-sm rounded px-3 py-2 border border-slate-600 flex-1">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <button onClick={handleTranslate} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">Translate</button>
              </div>
              {translatedSummary && <p className="mt-3 text-slate-300 text-sm leading-relaxed">{translatedSummary}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
