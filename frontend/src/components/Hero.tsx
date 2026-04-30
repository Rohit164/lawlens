
import { ArrowRight, Upload, Scale, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '@/components/AnimatedCounter';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import MagneticButton from '@/components/MagneticButton';
import TiltCard from '@/components/TiltCard';
import AdvancedTypingAnimation from '@/components/AdvancedTypingAnimation';
import MorphingIcon from '@/components/MorphingIcon';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-transparent rounded-full filter blur-3xl animate-spin-slow"></div>

        {/* Floating particles - smooth only */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-1/4 w-1 h-1 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-primary/20 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-primary/35 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 animate-fade-in-left">
            <GlassmorphismCard className="inline-flex items-center px-4 py-1.5 mb-6 animate-fade-in-down" variant="subtle">
              <MorphingIcon
                primaryIcon={Scale}
                secondaryIcon={Sparkles}
                size={16}
                className="text-primary mr-2"
              />
              <span className="text-xs font-medium text-primary mr-2">AI-Powered</span>
              <AdvancedTypingAnimation
                texts={["Legal Document Simplification", "Multilingual Translation", "Smart Legal Analysis"]}
                className="text-xs text-muted-foreground"
                speed={80}
                deleteSpeed={40}
                pauseDuration={1500}
              />
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
            </GlassmorphismCard>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              <span className="text-gradient dark:text-gradient-dark inline-block animate-gradient-shift bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] bg-clip-text text-transparent">⚖️ Simplifying Law.</span>
              <br />
              <span className="text-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>Empowering Justice.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              Transform complex Indian legal judgments into plain English summaries. Get multilingual translations and AI-powered legal insights in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <MagneticButton
                size="lg"
                onClick={() => navigate('/upload-document')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 shadow-lg shadow-primary/25"
                magneticStrength={0.2}
              >
                <MorphingIcon
                  primaryIcon={Upload}
                  secondaryIcon={Zap}
                  size={20}
                  className="mr-2"
                />
                Upload Document
              </MagneticButton>
              <MagneticButton
                size="lg"
                onClick={() => navigate('/role-selector')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 shadow-lg shadow-purple-500/25"
                magneticStrength={0.2}
              >
                <Scale className="mr-2 h-5 w-5" />
                Advanced AI Tools
                <Sparkles className="ml-2 h-4 w-4" />
              </MagneticButton>
              <MagneticButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="border-border text-foreground hover:bg-accent py-6"
                magneticStrength={0.15}
              >
                View Pricing
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </MagneticButton>
            </div>
            <div className="mt-8 flex items-center space-x-6 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <div className="group cursor-pointer">
                <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  <AnimatedCounter end={10} suffix="K+" className="animate-scale-in" />
                </p>
                <p className="text-sm text-muted-foreground">Documents Processed</p>
              </div>
              <div className="h-12 w-px bg-border animate-fade-in"></div>
              <div className="group cursor-pointer">
                <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  <AnimatedCounter end={5} suffix="+" className="animate-scale-in" />
                </p>
                <p className="text-sm text-muted-foreground">Indian Languages</p>
              </div>
              <div className="h-12 w-px bg-border animate-fade-in"></div>
              <div className="group cursor-pointer">
                <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  <AnimatedCounter end={99} suffix="%" className="animate-scale-in" />
                </p>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 mt-12 lg:mt-0 animate-fade-in-right">
            <TiltCard className="relative max-w-md mx-auto" tiltStrength={8}>
              <GlassmorphismCard className="p-6 shadow-2xl" variant="intense" glow>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">Legal Document Analysis</h3>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-ping-slow"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full w-3/4 animate-shimmer relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Processing: Supreme Court Judgment</div>
                    <div className="flex space-x-2">
                      <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded animate-fade-in hover:bg-primary/30 transition-colors duration-300 cursor-pointer">Classification</div>
                      <div className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded animate-fade-in hover:bg-secondary/70 transition-colors duration-300 cursor-pointer" style={{ animationDelay: '0.2s' }}>Summarization</div>
                      <div className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded animate-fade-in hover:bg-green-500/30 transition-colors duration-300 cursor-pointer" style={{ animationDelay: '0.4s' }}>Translation</div>
                    </div>
                  </div>
                </div>
              </GlassmorphismCard>
            </TiltCard>

            {/* Floating cards */}
            <div className="absolute -right-6 -bottom-6 animate-slide-in-right" style={{ animationDelay: '1.2s' }}>
              <TiltCard tiltStrength={8}>
                <GlassmorphismCard className="p-4 cursor-pointer" variant="intense" hover glow>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300 animate-pulse-glow">
                      <Scale className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <p className="text-lg font-bold text-green-500">98.5%</p>
                    </div>
                  </div>
                </GlassmorphismCard>
              </TiltCard>
            </div>

            <div className="absolute -right-12 top-8 animate-slide-in-left" style={{ animationDelay: '1.0s' }}>
              <TiltCard tiltStrength={8}>
                <GlassmorphismCard className="p-4 cursor-pointer" variant="intense" hover glow>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300 animate-pulse-glow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Time</p>
                      <p className="text-lg font-bold text-foreground">&lt; 30s</p>
                    </div>
                  </div>
                </GlassmorphismCard>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
