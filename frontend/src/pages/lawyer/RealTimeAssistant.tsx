import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Zap, Loader2, ArrowLeft } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import LimitReachedModal from "@/components/LimitReachedModal";

const RealTimeAssistant = () => {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistance, setAssistance] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleAsk = async () => {
    if (!query.trim()) {
      alert('Please enter a query');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:8000/api/lawyer/real-time-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context }),
      });

      if (response.status === 429) {
        setShowLimitModal(true);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setAssistance(result);
        setHistory([...history, { query, result: result.assistance }]);
        setQuery('');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn>
        <div className="min-h-screen relative">
          <AnimatedBackground />
          <Navbar />
          <div className="pt-24 pb-16 relative z-10">
            <div className="container mx-auto px-4 max-w-6xl">
              <Button variant="ghost" className="text-gray-400 hover:text-white mb-4" onClick={() => window.location.href = '/lawyer-dashboard'}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
              </Button>
              <GlassmorphismCard className="inline-flex items-center px-4 py-2 mb-4" variant="subtle">
                <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-400">Real-Time Court Assistant</span>
              </GlassmorphismCard>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Real-Time Legal Assistance</h1>
              <p className="text-gray-400">Instant help during court proceedings</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="space-y-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Context (Optional)</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea placeholder="Provide case context for better assistance..." value={context} onChange={(e) => setContext(e.target.value)} className="min-h-[100px] bg-slate-900/50 border-slate-600 text-white" />
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Your Query</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <Input placeholder="Ask your legal question..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAsk()} className="bg-slate-900/50 border-slate-600 text-white" />
                      <Button onClick={handleAsk} disabled={isProcessing || !query.trim()} className="w-full bg-yellow-600 hover:bg-yellow-700">
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Getting Answer...</> : <><Zap className="mr-2 h-4 w-4" />Get Instant Answer</>}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader><CardTitle className="text-white">Assistance</CardTitle></CardHeader>
                  <CardContent>
                    {history.length === 0 && !isProcessing && <div className="text-center py-12 text-gray-500"><Zap className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Ask a question to get instant assistance</p></div>}
                    {isProcessing && <div className="text-center py-12"><Loader2 className="h-12 w-12 mx-auto mb-4 text-yellow-400 animate-spin" /><p className="text-gray-400">Getting answer...</p></div>}
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {history.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                            <p className="text-blue-400 text-sm font-semibold">Q: {item.query}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{JSON.stringify(item.result, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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

export default RealTimeAssistant;
