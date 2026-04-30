import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building, Scale, Star, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import AnimatedBackground from "@/components/AnimatedBackground";
import InteractiveParticles from "@/components/InteractiveParticles";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import MagneticButton from "@/components/MagneticButton";
import TiltCard from "@/components/TiltCard";
import AdvancedTypingAnimation from "@/components/AdvancedTypingAnimation";
import MorphingIcon from "@/components/MorphingIcon";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
}

const Pricing = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for trying out LawLens',
      icon: <Scale className="h-6 w-6" />,
      features: [
        '10 document summaries per month',
        'Basic AI summarization',
        'English language support',
        'PDF & image OCR',
        'Email support'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 499,
      originalPrice: 999,
      period: 'month',
      description: 'For legal professionals and law firms',
      icon: <Crown className="h-6 w-6" />,
      popular: true,
      features: [
        'Unlimited document summaries',
        'Advanced AI with InLegalBERT',
        '10+ Indian languages support',
        'Bulk document processing',
        'Precedent search & classification',
        'SHAP/LIME explainability',
        'Priority support',
        'Download summaries as PDF',
        'API access (1000 calls/month)'
      ],
      buttonText: 'Start Pro Trial',
      buttonVariant: 'default'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9999,
      period: 'year',
      description: 'For large organizations and law firms',
      icon: <Building className="h-6 w-6" />,
      features: [
        'Everything in Pro',
        'Unlimited API access',
        'Custom AI model training',
        'White-label solution',
        'Dedicated account manager',
        'SLA guarantee (99.9% uptime)',
        'Custom integrations',
        'Advanced analytics dashboard',
        'Multi-user team management',
        'Custom legal database'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline'
    }
  ];

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      window.location.href = '/signup';
      return;
    }

    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:sales@lawlens.ai?subject=Enterprise Plan Inquiry';
      return;
    }

    setIsLoading(plan.id);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('lawlens_token');
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please login to subscribe to a plan.",
          variant: "destructive"
        });
        window.location.href = '/login';
        return;
      }

      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        toast({
          title: "Payment Error",
          description: "Failed to load payment gateway. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Create order
      const orderResponse = await fetch('http://localhost:8000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription_type: 'pro_monthly',
          currency: 'INR'
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Razorpay options
      const options = {
        key: orderData.key_id || 'rzp_test_demo', // Demo key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LawLens',
        description: `${plan.name} Subscription`,
        image: '/favicon/android-chrome-192x192.png',
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('http://localhost:8000/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              toast({
                title: "Payment Successful!",
                description: "Your Pro subscription is now active.",
              });
              window.location.href = '/dashboard';
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: 'LawLens User',
          email: 'user@example.com',
          contact: '9999999999'
        },
        notes: {
          subscription_type: 'pro_monthly'
        },
        theme: {
          color: '#8B5CF6'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Subscription error:', error);
      
      // Demo mode - simulate successful subscription
      toast({
        title: "Demo Mode",
        description: "Payment simulation successful! Pro features unlocked.",
      });
      
      // Update user subscription in localStorage for demo
      const user = JSON.parse(localStorage.getItem('lawlens_user') || '{}');
      user.subscription_tier = 'pro';
      localStorage.setItem('lawlens_user', JSON.stringify(user));
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } finally {
      setIsLoading(null);
    }
  };

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen relative page-transition">
      <AnimatedBackground />
      <InteractiveParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-16">
            <div className={`transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <GlassmorphismCard className="inline-flex items-center px-4 py-2 mb-6" variant="subtle">
                <MorphingIcon 
                  primaryIcon={Scale} 
                  secondaryIcon={Sparkles} 
                  size={16} 
                  className="text-primary mr-2" 
                />
                <span className="text-xs font-medium text-primary mr-2">Pricing Plans</span>
                <AdvancedTypingAnimation 
                  texts={["Choose Your Perfect Plan", "Unlock AI-Powered Legal Analysis", "Start Your Journey Today"]}
                  className="text-xs text-muted-foreground"
                  speed={80}
                  deleteSpeed={40}
                  pauseDuration={1500}
                />
              </GlassmorphismCard>
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <span className="text-gradient dark:text-gradient-dark inline-block animate-gradient-shift bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            
            <p className={`text-muted-foreground text-lg max-w-2xl mx-auto mb-8 transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              Unlock the power of AI-driven legal document analysis. Start free, upgrade when you need more.
            </p>
            
            {/* Special Offer Banner */}
            <TiltCard className={`inline-block transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }} tiltStrength={5}>
              <GlassmorphismCard className="inline-flex items-center gap-2 px-4 py-2" variant="intense" glow>
                <Star className="h-4 w-4 text-yellow-400 animate-pulse-glow" />
                <span className="text-foreground text-sm font-medium">
                  Limited Time: <AnimatedCounter end={50} suffix="% off" className="text-primary font-bold" /> Pro plan for first 3 months!
                </span>
              </GlassmorphismCard>
            </TiltCard>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <TiltCard key={plan.id} className="h-full" tiltStrength={plan.popular ? 12 : 8}>
                <GlassmorphismCard 
                  className={`relative h-full flex flex-col animate-fade-in-up ${
                    plan.popular ? 'border-primary/50 shadow-primary/20 shadow-2xl' : ''
                  }`}
                  variant={plan.popular ? "intense" : "default"}
                  glow={plan.popular}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <GlassmorphismCard className="px-4 py-1" variant="intense">
                        <div className="flex items-center gap-1 text-primary">
                          <Crown className="h-3 w-3 animate-bounce-gentle" />
                          <span className="text-xs font-medium">Most Popular</span>
                        </div>
                      </GlassmorphismCard>
                    </div>
                  )}
                  
                  <div className="text-center pb-4 p-6">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                        plan.popular ? 'bg-primary/20 text-primary animate-pulse-glow' : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        <MorphingIcon 
                          primaryIcon={plan.icon.type} 
                          secondaryIcon={Sparkles} 
                          size={24}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-foreground text-xl mb-2 font-bold">{plan.name}</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-foreground">
                          ₹<AnimatedCounter end={plan.price} />
                        </span>
                        {plan.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            ₹{plan.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-6 p-6 pt-0 flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={`flex items-start gap-3 stagger-item`} style={{ animationDelay: `${(index * 0.2) + (featureIndex * 0.1)}s` }}>
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0 animate-scale-in" />
                          <span className="text-muted-foreground text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <MagneticButton
                      onClick={() => handleSubscribe(plan)}
                      className={`w-full mt-auto ${
                        plan.popular
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                          : plan.buttonVariant === 'outline'
                          ? 'border-border text-foreground hover:bg-accent'
                          : 'bg-primary/80 hover:bg-primary text-primary-foreground'
                      }`}
                      magneticStrength={0.2}
                    >
                      {isLoading === plan.id ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </GlassmorphismCard>
              </TiltCard>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8 animate-fade-in-up">
              <span className="text-gradient dark:text-gradient-dark">Frequently Asked Questions</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  question: "Can I cancel anytime?",
                  answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period."
                },
                {
                  question: "Is my data secure?",
                  answer: "Absolutely. We use enterprise-grade encryption and never store your legal documents permanently."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
                },
                {
                  question: "Need help choosing?",
                  answer: "Contact our sales team at sales@lawlens.ai or start with the free plan and upgrade later."
                }
              ].map((faq, index) => (
                <TiltCard key={index} className="h-full" tiltStrength={6}>
                  <GlassmorphismCard 
                    className="p-6 h-full animate-fade-in-up hover-lift"
                    variant="subtle"
                    hover
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="text-foreground font-medium mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </GlassmorphismCard>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
