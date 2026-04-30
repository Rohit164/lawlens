import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch, ArrowLeft, Loader2 } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { toast } from "sonner";

const CounterfactualAnalysis = () => {
  const navigate = useNavigate();
  const [caseDetails, setCaseDetails] = useState('');
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!caseDetails || !scenario) {
      toast.error('Please provide both case details and scenario');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/analytics/counterfactual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_details: caseDetails,
          what_if_scenario: scenario
        })
      });

      const data = await response.json();
      setResult(data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze scenario');
    } finally {
      setLoading(false);
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
            <div className="container mx-auto px-4 max-w-4xl">
              <button onClick={() => navigate('/analytics-dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Analytics Dashboard</span>
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <GitBranch className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Counterfactual Analysis</h1>
                  <p className="text-gray-400">Explore "what-if" scenarios</p>
                </div>
              </div>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter case details..."
                    value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    className="min-h-[150px] bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Textarea
                    placeholder="Enter what-if scenario..."
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="min-h-[100px] bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Analyze Scenario'}
                  </Button>
                </CardContent>
              </Card>

              {result && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </SignedIn>
    </>
  );
};

export default CounterfactualAnalysis;
