import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Users, Loader2, ArrowLeft, Plus, X } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import LimitReachedModal from "@/components/LimitReachedModal";

const MultiBenchConsensus = () => {
  const [opinions, setOpinions] = useState([{ judge: 'Judge 1', opinion: '' }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consensus, setConsensus] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const addOpinion = () => {
    setOpinions([...opinions, { judge: `Judge ${opinions.length + 1}`, opinion: '' }]);
  };

  const removeOpinion = (index: number) => {
    if (opinions.length > 1) {
      setOpinions(opinions.filter((_, i) => i !== index));
    }
  };

  const updateOpinion = (index: number, value: string) => {
    const updated = [...opinions];
    updated[index].opinion = value;
    setOpinions(updated);
  };

  const handleGenerate = async () => {
    if (opinions.some(o => !o.opinion.trim())) {
      alert('Please fill all opinions');
      return;
    }

    setIsProcessing(true);
    setConsensus(null);

    try {
      const response = await fetch('${API_BASE}/api/judge/multi-bench-consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opinions }),
      });

      if (response.status === 429) {
        setShowLimitModal(true);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setConsensus(result);
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
              <Button variant="ghost" className="text-gray-400 hover:text-white mb-4" onClick={() => window.location.href = '/judge-dashboard'}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
              </Button>
              <GlassmorphismCard className="inline-flex items-center px-4 py-2 mb-4" variant="subtle">
                <Users className="h-5 w-5 text-amber-400 mr-2" />
                <span className="text-sm font-medium text-amber-400">Multi-Bench Consensus Builder</span>
              </GlassmorphismCard>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Build Multi-Bench Consensus</h1>
              <p className="text-gray-400">Facilitate consensus for division/constitutional benches</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  {opinions.map((opinion, index) => (
                    <Card key={index} className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-sm">{opinion.judge}</CardTitle>
                        {opinions.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeOpinion(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder={`Enter ${opinion.judge}'s opinion...`}
                          value={opinion.opinion}
                          onChange={(e) => updateOpinion(index, e.target.value)}
                          className="min-h-[150px] bg-slate-900/50 border-slate-600 text-white"
                        />
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={addOpinion} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />Add Another Judge Opinion
                  </Button>
                  <Button onClick={handleGenerate} disabled={isProcessing} className="w-full bg-amber-600 hover:bg-amber-700">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Users className="mr-2 h-4 w-4" />Build Consensus</>}
                  </Button>
                </div>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader><CardTitle className="text-white">Consensus Analysis</CardTitle></CardHeader>
                  <CardContent>
                    {!consensus && !isProcessing && <div className="text-center py-12 text-gray-500"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Analysis will appear here</p></div>}
                    {isProcessing && <div className="text-center py-12"><Loader2 className="h-12 w-12 mx-auto mb-4 text-amber-400 animate-spin" /><p className="text-gray-400">Building consensus...</p></div>}
                    {consensus && <div className="max-h-[600px] overflow-y-auto"><div className="bg-slate-900/50 rounded-lg p-4"><pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{JSON.stringify(consensus.consensus_analysis, null, 2)}</pre></div></div>}
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

export default MultiBenchConsensus;
