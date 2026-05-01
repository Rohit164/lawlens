import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Scale, Loader2, ArrowLeft, Plus, X } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import LimitReachedModal from "@/components/LimitReachedModal";

const CauseListOptimizer = () => {
  const [cases, setCases] = useState([{ title: '', type: '', estimated_time: '30' }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimization, setOptimization] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const addCase = () => setCases([...cases, { title: '', type: '', estimated_time: '30' }]);
  const removeCase = (index: number) => { if (cases.length > 1) setCases(cases.filter((_, i) => i !== index)); };
  const updateCase = (index: number, field: string, value: string) => {
    const updated = [...cases];
    updated[index] = { ...updated[index], [field]: value };
    setCases(updated);
  };

  const handleOptimize = async () => {
    if (cases.some(c => !c.title.trim())) {
      alert('Please fill all case titles');
      return;
    }

    setIsProcessing(true);
    setOptimization(null);

    try {
      const response = await fetch('${API_BASE}/api/judge/optimize-cause-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cases }),
      });

      if (response.status === 429) {
        setShowLimitModal(true);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setOptimization(result);
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
                <Scale className="h-5 w-5 text-indigo-400 mr-2" />
                <span className="text-sm font-medium text-indigo-400">Cause List Optimizer</span>
              </GlassmorphismCard>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Optimize Court Docket</h1>
              <p className="text-gray-400">AI-assisted docket management with grouping and time optimization</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  {cases.map((caseItem, index) => (
                    <Card key={index} className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-white text-sm">Case {index + 1}</CardTitle>
                        {cases.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeCase(index)}><X className="h-4 w-4" /></Button>}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input placeholder="Case title" value={caseItem.title} onChange={(e) => updateCase(index, 'title', e.target.value)} className="bg-slate-900/50 border-slate-600 text-white" />
                        <Input placeholder="Case type" value={caseItem.type} onChange={(e) => updateCase(index, 'type', e.target.value)} className="bg-slate-900/50 border-slate-600 text-white" />
                        <Input placeholder="Est. time (min)" type="number" value={caseItem.estimated_time} onChange={(e) => updateCase(index, 'estimated_time', e.target.value)} className="bg-slate-900/50 border-slate-600 text-white" />
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={addCase} variant="outline" className="w-full"><Plus className="h-4 w-4 mr-2" />Add Another Case</Button>
                  <Button onClick={handleOptimize} disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Optimizing...</> : <><Scale className="mr-2 h-4 w-4" />Optimize Cause List</>}
                  </Button>
                </div>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader><CardTitle className="text-white">Optimization Results</CardTitle></CardHeader>
                  <CardContent>
                    {!optimization && !isProcessing && <div className="text-center py-12 text-gray-500"><Scale className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Results will appear here</p></div>}
                    {isProcessing && <div className="text-center py-12"><Loader2 className="h-12 w-12 mx-auto mb-4 text-indigo-400 animate-spin" /><p className="text-gray-400">Optimizing cause list...</p></div>}
                    {optimization && <div className="max-h-[600px] overflow-y-auto"><div className="bg-slate-900/50 rounded-lg p-4"><pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{JSON.stringify(optimization.optimization, null, 2)}</pre></div></div>}
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

export default CauseListOptimizer;
