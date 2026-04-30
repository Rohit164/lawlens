import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Swords, BarChart3, Zap, Shield, Target, FileText } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import LimitReachedModal from "@/components/LimitReachedModal";

const LawyerDashboard = () => {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'summarization' | 'translation'>('summarization');

  const features = [
    {
      id: 'adversarial',
      title: 'Adversarial Simulation',
      description: "Devil's Advocate mode to predict opponent's strategy and identify weaknesses in your case",
      icon: Swords,
      color: 'from-red-500 to-rose-500',
      path: '/lawyer/adversarial'
    },
    {
      id: 'drafting',
      title: 'Legal Drafting Aid',
      description: 'AI-powered legal document drafting with proper structure, citations, and formatting',
      icon: FileText,
      color: 'from-indigo-500 to-purple-500',
      path: '/lawyer/legal-drafting'
    },
    {
      id: 'forecasting',
      title: 'Litigation Forecasting',
      description: 'Non-binding insights on win probability, settlement windows, and risk assessment',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      path: '/lawyer/forecasting'
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
                  <Briefcase className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-400">Trial Strategy Toolkit</span>
                </GlassmorphismCard>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Lawyer <span className="text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dashboard</span>
                </h1>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  AI-powered trial strategy and case preparation tools
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="feature-card p-6" onClick={() => window.location.href = feature.path}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-base mb-2 leading-snug">{feature.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                      <div className="mt-4 flex items-center gap-1.5 text-blue-400 text-xs font-medium">
                        <span>Open tool</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card"><div className="text-3xl font-bold text-blue-400 mb-1">3</div><div className="text-sm text-slate-400">Strategy Tools</div></div>
                <div className="stat-card"><div className="text-3xl font-bold text-green-400 mb-1">AI-Powered</div><div className="text-sm text-slate-400">Case Analysis</div></div>
                <div className="stat-card"><div className="text-3xl font-bold text-purple-400 mb-1">100%</div><div className="text-sm text-slate-400">Explainable AI</div></div>
              </div>

              {/* Disclaimer */}
              <div className="mt-10">
                <div className="disclaimer-box flex items-start gap-3">
                  <Shield className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-400 mb-1">Professional Responsibility Notice</p>
                    <p className="text-slate-300 text-sm leading-relaxed">All AI features are for research and preparation purposes only. Lawyers maintain full professional responsibility for case strategy and client representation.</p>
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

export default LawyerDashboard;
