import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, FileCheck, GitBranch, Target, ArrowLeft } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'forecasting',
      title: 'Litigation Forecasting',
      description: 'Predict case outcomes using AI analysis of historical data and precedents',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      path: '/analytics/forecasting',
      status: 'Available'
    },
    {
      id: 'compliance',
      title: 'Compliance Scanner',
      description: 'Scan legal documents for compliance issues and procedural gaps',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      path: '/analytics/compliance',
      status: 'Available'
    },
    {
      id: 'counterfactual',
      title: 'Counterfactual Analysis',
      description: 'Explore "what-if" scenarios and alternative legal outcomes',
      icon: GitBranch,
      color: 'from-purple-500 to-pink-500',
      path: '/analytics/counterfactual',
      status: 'Available'
    },
    {
      id: 'precedent',
      title: 'Precedent Impact Tracker',
      description: 'Track the impact and citation patterns of legal precedents',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      path: '/analytics/precedent',
      status: 'Available'
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
              <div className="mb-8">
                <button
                  onClick={() => navigate('/role-selector')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Role Selection</span>
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">Research & Analytics</h1>
                    <p className="text-gray-400">Advanced legal analytics and forecasting tools</p>
                  </div>
                </div>

                <GlassmorphismCard className="inline-block px-4 py-2" variant="subtle">
                  <p className="text-sm text-gray-300">
                    {features.length} AI-powered analytics tools available
                  </p>
                </GlassmorphismCard>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.id}
                      className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:scale-105"
                      onClick={() => navigate(feature.path)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-xl group-hover:text-purple-400 transition-colors">
                                {feature.title}
                              </CardTitle>
                              <span className="text-xs text-green-400">{feature.status}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-end text-purple-400 group-hover:text-purple-300 transition-colors">
                          <span className="text-sm font-medium">Launch Tool →</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Info Section */}
              <div className="mt-12 max-w-5xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Advanced Analytics Capabilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-purple-400 font-medium mb-2">Data-Driven Insights</h4>
                        <p className="text-gray-400 text-sm">
                          Leverage AI to analyze patterns, predict outcomes, and identify trends in legal data
                        </p>
                      </div>
                      <div>
                        <h4 className="text-blue-400 font-medium mb-2">Scenario Analysis</h4>
                        <p className="text-gray-400 text-sm">
                          Explore alternative outcomes and test hypotheses with counterfactual analysis
                        </p>
                      </div>
                      <div>
                        <h4 className="text-green-400 font-medium mb-2">Compliance Monitoring</h4>
                        <p className="text-gray-400 text-sm">
                          Automatically detect compliance issues and procedural gaps in legal documents
                        </p>
                      </div>
                      <div>
                        <h4 className="text-orange-400 font-medium mb-2">Precedent Tracking</h4>
                        <p className="text-gray-400 text-sm">
                          Monitor the impact and evolution of legal precedents over time
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ethical Notice */}
              <div className="mt-8 max-w-5xl mx-auto">
                <Card className="bg-purple-900/20 border-purple-700/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-purple-400 font-semibold mb-2">Research & Analytics Ethics</h3>
                        <p className="text-gray-300 text-sm">
                          All analytics are provided for research and informational purposes. Predictions and forecasts 
                          are probabilistic and should not be the sole basis for legal decisions. Human judgment and 
                          professional expertise remain essential.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </SignedIn>
    </>
  );
};

export default AnalyticsDashboard;
