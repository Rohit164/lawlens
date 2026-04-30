import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Sparkles, X, ArrowRight, Zap } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'summarization' | 'translation';
}

const LimitReachedModal = ({ isOpen, onClose, type }: LimitReachedModalProps) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="relative max-w-md w-full bg-slate-900 border-purple-500/50 shadow-2xl shadow-purple-500/20 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full">
                <Crown className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Free Tier Limit Reached!
          </h2>

          {/* Message */}
          <p className="text-gray-300 mb-6">
            You've reached your free usage limit for AI {type === 'summarization' ? 'summarization' : 'translation'}.
          </p>

          {/* Benefits */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-purple-400 mb-3">Upgrade to Pro for:</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Unlimited summaries & translations</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Advanced AI with Google Gemini</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>10+ Indian languages support</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Priority support & faster processing</span>
              </li>
            </ul>
          </div>

          {/* Pricing highlight */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 mb-6">
            <p className="text-white font-semibold">
              Only <span className="text-2xl text-purple-400">₹99</span>/month
            </p>
            <p className="text-xs text-gray-400 line-through">Regular price: ₹499/month</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50"
            >
              Upgrade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LimitReachedModal;
