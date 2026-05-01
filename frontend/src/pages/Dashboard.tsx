import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Download, 
  Crown, 
  Scale, 
  Globe, 
  Brain,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from "@/components/AnimatedBackground";
import InteractiveParticles from "@/components/InteractiveParticles";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import MagneticButton from "@/components/MagneticButton";
import TiltCard from "@/components/TiltCard";
import AdvancedTypingAnimation from "@/components/AdvancedTypingAnimation";
import MorphingIcon from "@/components/MorphingIcon";
import AnimatedCounter from "@/components/AnimatedCounter";
import AdvancedProgress from "@/components/AdvancedProgress";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface UserStats {
  documentsProcessed: number;
  monthlyLimit: number;
  translationsUsed: number;
  apiCallsUsed: number;
  subscriptionTier: string;
  subscriptionEnd?: string;
}

interface RecentDocument {
  id: number;
  filename: string;
  processedAt: string;
  status: 'completed' | 'processing' | 'failed';
  summary: string;
  originalLength: number;
  summaryLength: number;
}

const Dashboard = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    documentsProcessed: 0,
    monthlyLimit: -1,
    translationsUsed: 0,
    apiCallsUsed: 0,
    subscriptionTier: 'pro'
  });
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('lawlens_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Load user stats
      const statsResponse = await fetch('${API_BASE}/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const userData = await statsResponse.json();
        setUserStats({
          documentsProcessed: userData.documents_processed || 47,
          monthlyLimit: userData.subscription_tier === 'free' ? 10 : -1,
          translationsUsed: 23,
          apiCallsUsed: 156,
          subscriptionTier: userData.subscription_tier || 'pro',
          subscriptionEnd: '2024-11-01'
        });
      } else {
        // Demo data fallback
        setUserStats({
          documentsProcessed: 47,
          monthlyLimit: -1,
          translationsUsed: 23,
          apiCallsUsed: 156,
          subscriptionTier: 'pro',
          subscriptionEnd: '2024-11-01'
        });
      }

      // Load recent documents (demo data)
      setRecentDocuments([
        {
          id: 1,
          filename: 'Supreme Court Judgment - ABC vs XYZ.pdf',
          processedAt: '2024-01-15T10:30:00Z',
          status: 'completed',
          summary: 'The Supreme Court ruled in favor of the petitioner, establishing important precedent for contract law...',
          originalLength: 15420,
          summaryLength: 342
        },
        {
          id: 2,
          filename: 'High Court Order - Property Dispute.pdf',
          processedAt: '2024-01-14T16:45:00Z',
          status: 'completed',
          summary: 'The High Court directed the parties to resolve the property dispute through mediation...',
          originalLength: 8930,
          summaryLength: 198
        },
        {
          id: 3,
          filename: 'Consumer Court Judgment.pdf',
          processedAt: '2024-01-14T09:15:00Z',
          status: 'completed',
          summary: 'The consumer court awarded compensation to the complainant for defective goods...',
          originalLength: 5670,
          summaryLength: 156
        },
        {
          id: 4,
          filename: 'Labor Court Decision.pdf',
          processedAt: '2024-01-13T14:20:00Z',
          status: 'processing',
          summary: '',
          originalLength: 12340,
          summaryLength: 0
        }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lawlens_token');
    localStorage.removeItem('lawlens_user');
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsagePercentage = () => {
    if (userStats.monthlyLimit === -1) return 0; // Unlimited
    return (userStats.documentsProcessed / userStats.monthlyLimit) * 100;
  };

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center page-transition">
        <AnimatedBackground />
        <InteractiveParticles />
        <GlassmorphismCard className="p-8" variant="intense" glow>
          <div className="flex items-center space-x-4">
            <div className="animate-spin-slow">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">Loading Dashboard</h3>
              <AdvancedTypingAnimation 
                texts={["Fetching your data...", "Preparing analytics...", "Almost ready..."]}
                className="text-muted-foreground text-sm"
                speed={60}
              />
            </div>
          </div>
        </GlassmorphismCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative page-transition">
      <AnimatedBackground />
      <InteractiveParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className={`transition-all duration-1000 ${headerVisible ? 'animate-fade-in-left opacity-100' : 'opacity-0'}`}>
              <GlassmorphismCard className="inline-flex items-center px-4 py-2 mb-4" variant="subtle">
                <MorphingIcon 
                  primaryIcon={Scale} 
                  secondaryIcon={Sparkles} 
                  size={16} 
                  className="text-primary mr-2" 
                />
                <span className="text-xs font-medium text-primary mr-2">Dashboard</span>
                <AdvancedTypingAnimation 
                  texts={["Your Legal AI Hub", "Document Analytics", "AI-Powered Insights"]}
                  className="text-xs text-muted-foreground"
                  speed={80}
                  deleteSpeed={40}
                  pauseDuration={1500}
                />
              </GlassmorphismCard>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                <span className="text-gradient dark:text-gradient-dark">Welcome back! 👋</span>
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your legal documents today.
              </p>
            </div>
            
            <div className={`flex items-center gap-4 mt-4 md:mt-0 transition-all duration-1000 ${headerVisible ? 'animate-fade-in-right opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <TiltCard tiltStrength={5}>
                <GlassmorphismCard className="px-4 py-2" variant="intense" glow>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary animate-pulse-glow" />
                    <span className="text-primary font-medium">{userStats.subscriptionTier.toUpperCase()} Plan</span>
                  </div>
                </GlassmorphismCard>
              </TiltCard>
              
              <MagneticButton
                onClick={handleLogout}
                variant="outline"
                className="border-border text-muted-foreground hover:bg-accent"
                magneticStrength={0.15}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </MagneticButton>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Documents Processed",
                value: userStats.documentsProcessed,
                icon: FileText,
                color: "text-primary",
                showProgress: userStats.monthlyLimit !== -1,
                progressValue: getUsagePercentage(),
                subtitle: userStats.monthlyLimit !== -1 ? `${userStats.documentsProcessed} of ${userStats.monthlyLimit} used` : "Unlimited processing"
              },
              {
                title: "Translations",
                value: userStats.translationsUsed,
                icon: Globe,
                color: "text-blue-500",
                subtitle: "Across 5 languages"
              },
              {
                title: "API Calls",
                value: userStats.apiCallsUsed,
                icon: BarChart3,
                color: "text-green-500",
                subtitle: userStats.subscriptionTier === 'pro' ? '844 remaining' : 'Unlimited'
              },
              {
                title: "Subscription",
                value: "Active",
                icon: Calendar,
                color: "text-yellow-500",
                subtitle: "Renews Nov 1, 2024",
                isText: true
              }
            ].map((stat, index) => (
              <TiltCard key={index} className="h-full" tiltStrength={8}>
                <GlassmorphismCard 
                  className="p-6 h-full animate-fade-in-up hover-lift"
                  variant="default"
                  hover
                  glow
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </h3>
                    <MorphingIcon 
                      primaryIcon={stat.icon} 
                      secondaryIcon={Sparkles} 
                      size={16} 
                      className={stat.color}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.isText ? stat.value : <AnimatedCounter end={typeof stat.value === 'number' ? stat.value : 0} />}
                    </div>
                    {stat.showProgress && (
                      <AdvancedProgress 
                        value={stat.progressValue || 0}
                        showPercentage={false}
                        animated
                        gradient
                        glowing
                        size="sm"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  </div>
                </GlassmorphismCard>
              </TiltCard>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="documents" className="space-y-6">
            <GlassmorphismCard className="p-1" variant="subtle">
              <TabsList className="bg-transparent border-0 w-full">
                <TabsTrigger 
                  value="documents" 
                  className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 transition-all duration-300 hover:scale-105"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 transition-all duration-300 hover:scale-105"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 transition-all duration-300 hover:scale-105"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </GlassmorphismCard>

            <TabsContent value="documents" className="space-y-6">
              <div className="flex justify-between items-center animate-fade-in-up">
                <h2 className="text-xl font-semibold text-foreground">
                  <span className="text-gradient dark:text-gradient-dark">Recent Documents</span>
                </h2>
                <MagneticButton 
                  onClick={() => navigate('/summarize')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                  magneticStrength={0.2}
                >
                  <MorphingIcon 
                    primaryIcon={FileText} 
                    secondaryIcon={Zap} 
                    size={16} 
                    className="mr-2" 
                  />
                  Process New Document
                </MagneticButton>
              </div>

              <div className="grid gap-4">
                {recentDocuments.map((doc, index) => (
                  <TiltCard key={doc.id} className="w-full" tiltStrength={6}>
                    <GlassmorphismCard 
                      className="animate-fade-in-up hover-lift"
                      variant="default"
                      hover
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-foreground text-lg font-semibold mb-2">
                              {doc.filename}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Processed on {formatDate(doc.processedAt)}
                            </p>
                          </div>
                          <GlassmorphismCard 
                            className={`px-3 py-1 ${
                              doc.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              doc.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}
                            variant="subtle"
                          >
                            <span className="text-xs font-medium capitalize">{doc.status}</span>
                          </GlassmorphismCard>
                        </div>
                        
                        {doc.status === 'completed' && (
                          <div className="space-y-4">
                            <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                              {doc.summary}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Reduced from <AnimatedCounter end={doc.originalLength} /> to <AnimatedCounter end={doc.summaryLength} /> characters
                              </span>
                              <MagneticButton 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-primary/80"
                                magneticStrength={0.1}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </MagneticButton>
                            </div>
                          </div>
                        )}
                        
                        {doc.status === 'processing' && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin-slow">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <AdvancedTypingAnimation 
                              texts={["Processing document...", "Analyzing content...", "Generating summary..."]}
                              className="text-muted-foreground text-sm"
                              speed={60}
                            />
                          </div>
                        )}
                      </div>
                    </GlassmorphismCard>
                  </TiltCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Usage Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Processing Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">This Month</span>
                        <span className="text-white font-semibold">47 documents</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Last Month</span>
                        <span className="text-white font-semibold">32 documents</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Growth</span>
                        <span className="text-green-400 font-semibold">+46.9%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Language Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">English</span>
                        <span className="text-white font-semibold">78%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Hindi</span>
                        <span className="text-white font-semibold">12%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Marathi</span>
                        <span className="text-white font-semibold">6%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Tamil</span>
                        <span className="text-white font-semibold">4%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Account Settings</h2>
              
              <div className="grid gap-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Subscription Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Current Plan</span>
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Next Billing</span>
                      <span className="text-white">November 1, 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Amount</span>
                      <span className="text-white">₹499/month</span>
                    </div>
                    <Button 
                      onClick={() => navigate('/pricing')}
                      variant="outline" 
                      className="w-full border-purple-500 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">API Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">API Key</span>
                      <code className="text-white bg-white/10 px-2 py-1 rounded text-sm">
                        ll_••••••••••••••••••••••••••••••••
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Calls Used</span>
                      <span className="text-white">156 / 1000</span>
                    </div>
                    <Button variant="outline" className="w-full border-blue-500 text-blue-300 hover:bg-blue-500/10">
                      View API Documentation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
