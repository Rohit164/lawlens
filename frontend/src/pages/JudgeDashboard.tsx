import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, FileText, Gavel, Users, Calendar, Crown } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import LimitReachedModal from "@/components/LimitReachedModal";

const JudgeDashboard = () => {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'summarization' | 'translation'>('summarization');

  const features = [
    {
      id: 'bench-memo',
      title: 'Bench Memo Generator',
      description: 'Generate comprehensive bench memos with issue framing, balanced arguments, and precedent analysis',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      path: '/judge/bench-memo'
    },
    {
      id: 'hearing-prep',
      title: 'Hearing Preparation',
      description: 'Prepare for hearings with similar matters, unresolved questions, and time allocation',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      path: '/judge/hearing-prep'
    },
    {
      id: 'judgment-draft',
      title: 'Judgment Drafting Aid',
      description: 'Assist with judgment drafting with templates, precedent application, and suggested language',
      icon: Gavel,
      color: 'from-green-500 to-emerald-500',
      path: '/judge/judgment-draft'
    }
  ];

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen relative">
          <AnimatedBackground />
          <Navbar />

          <div className="pt-24 pb-16 relative z-10">
            <div className="container mx-auto px-4">
              {/* Header */}
              <div className="text-center mb-12">
                <GlassmorphismCard className="inline-flex items-center px-4 py-2 mb-6" variant="subtle">
                  <Crown className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-sm font-medium text-purple-400">Judicial Decision Support</span>
                </GlassmorphismCard>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Judge <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
                </h1>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  AI-powered decision support tools for judicial workflows
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className="feature-card p-6"
                      onClick={() => window.location.href = feature.path}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-base mb-2 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-purple-400 text-xs font-medium">
                        <span>Open tool</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card"><div className="text-3xl font-bold text-purple-400 mb-1">3</div><div className="text-sm text-slate-400">AI Tools Available</div></div>
                <div className="stat-card"><div className="text-3xl font-bold text-blue-400 mb-1">100%</div><div className="text-sm text-slate-400">Explainable AI</div></div>
                <div className="stat-card"><div className="text-3xl font-bold text-green-400 mb-1">10+</div><div className="text-sm text-slate-400">Languages Supported</div></div>
              </div>

              {/* Disclaimer */}
              <div className="mt-10">
                <div className="disclaimer-box flex items-start gap-3">
                  <Scale className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-400 mb-1">Judicial Independence Notice</p>
                    <p className="text-slate-300 text-sm leading-relaxed">All AI features provide assistance and suggestions only. Final decisions rest entirely with the presiding judge. AI outputs are explainable, non-deterministic, and subject to judicial override.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />

          {/* Limit Reached Modal */}
          <LimitReachedModal
            isOpen={showLimitModal}
            onClose={() => setShowLimitModal(false)}
            type={limitModalType}
          />
        </div>
      </SignedIn>
    </>
  );
};

export default JudgeDashboard;
