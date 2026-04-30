import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, ArrowLeft, Loader2 } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { toast } from "sonner";

const PrecedentTracker = () => {
  const navigate = useNavigate();
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrack = async () => {
    if (!citation) {
      toast.error('Please enter a case citation');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/analytics/precedent-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_citation: citation })
      });

      const data = await response.json();
      setResult(data);
      toast.success('Precedent impact tracked!');
    } catch (error) {
      toast.error('Failed to track precedent');
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
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Precedent Impact Tracker</h1>
                  <p className="text-gray-400">Track citation patterns and impact</p>
                </div>
              </div>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Enter Case Citation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="e.g., Kesavananda Bharati v. State of Kerala (1973)"
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Button onClick={handleTrack} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tracking...</> : 'Track Precedent Impact'}
                  </Button>
                </CardContent>
              </Card>

              {result && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Impact Analysis</CardTitle>
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

export default PrecedentTracker;
