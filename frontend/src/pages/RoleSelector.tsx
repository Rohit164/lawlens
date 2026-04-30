import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Briefcase, BarChart3, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassmorphismCard from "@/components/GlassmorphismCard";

const RoleSelector = () => {
  const roles = [
    {
      id: 'judge',
      title: 'Judge',
      description: 'Access judicial decision support tools including bench memos, hearing preparation, and judgment drafting assistance',
      icon: Scale,
      color: 'from-purple-500 to-pink-500',
      path: '/judge-dashboard',
      features: ['Bench Memo Generator', 'Hearing Preparation', 'Judgment Drafting']
    },
    {
      id: 'lawyer',
      title: 'Lawyer / Advocate',
      description: 'Access trial strategy tools including adversarial simulation, legal drafting, and litigation forecasting',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      path: '/lawyer-dashboard',
      features: ['Adversarial Simulation', 'Legal Drafting Aid', 'Litigation Forecasting']
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
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Welcome to <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">LawLens AI</span>
                </h1>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                  India's first AI judicial co-pilot for judges, lawyers, and legal professionals
                </p>

                <GlassmorphismCard className="inline-block px-6 py-3" variant="subtle">
                  <p className="text-sm text-gray-300">
                    Select your role to access specialized AI tools
                  </p>
                </GlassmorphismCard>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Card
                      key={role.id}
                      className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:scale-105"
                      onClick={() => {
                        window.location.href = role.path;
                      }}
                    >
                      <CardHeader>
                        <div className="flex flex-col items-center text-center mb-4">
                          <div className={`p-4 rounded-full bg-gradient-to-br ${role.color} mb-4`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-white text-xl group-hover:text-purple-400 transition-colors">
                            {role.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-6 text-center">
                          {role.description}
                        </p>

                        <div className="space-y-2 mb-6">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Key Features:</p>
                          {role.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                          <span className="text-sm font-medium mr-2">
                            Access Dashboard
                          </span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Features Overview */}
              <div className="mt-16 max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-white mb-4 text-center">
                      Powered by Advanced AI
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                        <div className="text-sm text-gray-400">Explainable AI</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-400 mb-2">10+</div>
                        <div className="text-sm text-gray-400">Indian Languages</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-400 mb-2">6+</div>
                        <div className="text-sm text-gray-400">AI Features</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ethical AI Notice */}
              <div className="mt-12 max-w-4xl mx-auto">
                <Card className="bg-purple-900/20 border-purple-700/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-purple-400 font-semibold mb-2">Ethical AI & Human Oversight</h3>
                        <p className="text-gray-300 text-sm">
                          LawLens AI provides assistance and insights, not decisions. All features maintain human oversight,
                          judicial independence, and professional responsibility. AI outputs are explainable, non-deterministic,
                          and subject to human override. Built with fairness audits and ethical safeguards.
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

export default RoleSelector;
