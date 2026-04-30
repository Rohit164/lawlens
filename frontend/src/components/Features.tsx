
import { Scale, FileText, Globe, Brain, Zap, Shield, Sparkles } from 'lucide-react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import TiltCard from '@/components/TiltCard';
import MorphingIcon from '@/components/MorphingIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const lawLensFeatures = [
  {
    icon: <Scale className="h-6 w-6" />,
    title: "AI Summarization",
    description: "Transform complex legal judgments into plain English summaries using advanced AI models."
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Multilingual Support",
    description: "Translate legal documents into Hindi, Marathi, Tamil, and 7+ other Indian languages."
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "InLegalBERT Classification",
    description: "Classify legal documents and predict case outcomes using state-of-the-art legal AI."
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "OCR Processing",
    description: "Extract text from scanned PDFs and images with high accuracy OCR technology."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Explainable AI",
    description: "Understand AI decisions with SHAP and LIME explanations for transparency."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with data protection and user privacy compliance."
  }
];

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div ref={headerRef} className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <span className="text-gradient dark:text-gradient-dark inline-block animate-gradient-shift bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] bg-clip-text text-transparent">
              Powerful AI Features
            </span>
          </h2>
          <p className={`text-muted-foreground max-w-2xl mx-auto transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            LawLens combines cutting-edge AI technology with legal expertise to make law accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {lawLensFeatures.map((feature, index) => (
            <TiltCard key={index} className="h-full" tiltStrength={8}>
              <GlassmorphismCard 
                className="p-6 h-full animate-fade-in-up hover-lift group"
                variant="default"
                hover
                glow
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-5">
                  <div className="bg-primary/20 rounded-lg w-12 h-12 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-all duration-300 group-hover:scale-110">
                    <MorphingIcon 
                      primaryIcon={feature.icon.type} 
                      secondaryIcon={Sparkles} 
                      size={24}
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Animated border */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/60 group-hover:w-full transition-all duration-500"></div>
                
                {/* Floating particles */}
                <div className="absolute top-4 right-4 h-1 w-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
              </GlassmorphismCard>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
