import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { Loader2, AlertCircle } from 'lucide-react';

const DocumentUpload = () => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setLoaded(true);
    setError(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d0d' }}>
      <Navbar />

      {/* Loading state */}
      {!loaded && (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4"
          style={{ paddingTop: '64px' }}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            <Loader2 className="absolute inset-0 m-auto h-5 w-5 text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium">Loading Document Analysis</p>
            <p className="text-slate-500 text-xs mt-1">Connecting to AI engine…</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ paddingTop: '64px' }}>
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div className="text-center">
            <p className="text-slate-200 text-base font-medium">Could not connect to Streamlit</p>
            <p className="text-slate-500 text-sm mt-1">Make sure the Streamlit app is running on port 8501</p>
            <code className="text-xs text-purple-400 mt-2 block">
              cd Realistic_LJP-main &amp;&amp; python -m streamlit run simple_language_app.py
            </code>
            <button
              onClick={() => { setLoaded(false); setError(false); }}
              className="mt-4 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Streamlit iframe */}
      {!error && (
        <iframe
          src="http://localhost:8501?embedded=true"
          title="Document Analysis"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            position: loaded ? 'static' : 'fixed',
            top: loaded ? 'auto' : '-9999px',
            left: loaded ? 'auto' : '-9999px',
            marginTop: '64px',
            width: '100%',
            height: 'calc(100vh - 64px)',
            border: 'none',
            display: 'block',
            background: '#0d0d0d',
          }}
          allow="camera; microphone; clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
};

export default DocumentUpload;
