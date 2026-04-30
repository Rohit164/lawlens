import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import SummarizeWithClerk from "./pages/SummarizeWithClerk";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import RoleSelector from "./pages/RoleSelector";
import JudgeDashboard from "./pages/JudgeDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DocumentUpload from "./pages/DocumentUpload";
import BenchMemoGenerator from "./pages/judge/BenchMemoGenerator";
import HearingPreparation from "./pages/judge/HearingPreparation";
import JudgmentDrafting from "./pages/judge/JudgmentDrafting";
import MultiBenchConsensus from "./pages/judge/MultiBenchConsensus";
import CauseListOptimizer from "./pages/judge/CauseListOptimizer";
import AdversarialSimulator from "./pages/lawyer/AdversarialSimulator";
import LitigationForecasting from "./pages/lawyer/LitigationForecasting";
import JudgeAnalytics from "./pages/lawyer/JudgeAnalytics";
import RealTimeAssistant from "./pages/lawyer/RealTimeAssistant";
import LegalDraftingAid from "./pages/lawyer/LegalDraftingAid";
import ComplianceScanner from "./pages/lawyer/ComplianceScanner";
import CounterfactualAnalysis from "./pages/analytics/CounterfactualAnalysis";
import PrecedentTracker from "./pages/analytics/PrecedentTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/summarize" element={<SummarizeWithClerk />} />
            <Route path="/upload-document" element={<DocumentUpload />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Advanced Features */}
            <Route path="/role-selector" element={<RoleSelector />} />
            <Route path="/judge-dashboard" element={<JudgeDashboard />} />
            <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
            <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
            
            {/* Judge Features - ALL 5 */}
            <Route path="/judge/bench-memo" element={<BenchMemoGenerator />} />
            <Route path="/judge/hearing-prep" element={<HearingPreparation />} />
            <Route path="/judge/judgment-draft" element={<JudgmentDrafting />} />
            <Route path="/judge/multi-bench" element={<MultiBenchConsensus />} />
            <Route path="/judge/cause-list" element={<CauseListOptimizer />} />
            
            {/* Lawyer Features - ALL 6 */}
            <Route path="/lawyer/adversarial" element={<AdversarialSimulator />} />
            <Route path="/lawyer/legal-drafting" element={<LegalDraftingAid />} />
            <Route path="/lawyer/forecasting" element={<LitigationForecasting />} />
            <Route path="/lawyer/analytics" element={<JudgeAnalytics />} />
            <Route path="/lawyer/real-time" element={<RealTimeAssistant />} />
            <Route path="/lawyer/compliance" element={<ComplianceScanner />} />
            
            {/* Analytics Features - 4 */}
            <Route path="/analytics/forecasting" element={<LitigationForecasting />} />
            <Route path="/analytics/compliance" element={<ComplianceScanner />} />
            <Route path="/analytics/counterfactual" element={<CounterfactualAnalysis />} />
            <Route path="/analytics/precedent" element={<PrecedentTracker />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
