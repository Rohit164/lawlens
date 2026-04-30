import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Scale, Home, ArrowLeft, Sparkles } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import InteractiveParticles from "@/components/InteractiveParticles";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import MagneticButton from "@/components/MagneticButton";
import TiltCard from "@/components/TiltCard";
import AdvancedTypingAnimation from "@/components/AdvancedTypingAnimation";
import MorphingIcon from "@/components/MorphingIcon";
import AnimatedCounter from "@/components/AnimatedCounter";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative flex items-center justify-center page-transition">
      <AnimatedBackground />
      <InteractiveParticles />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        <TiltCard className="mb-8" tiltStrength={10}>
          <GlassmorphismCard className="p-8" variant="intense" glow>
            {/* Animated 404 */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <MorphingIcon 
                  primaryIcon={Scale} 
                  secondaryIcon={Sparkles} 
                  size={64} 
                  className="text-primary animate-pulse-glow" 
                />
              </div>
              
              <h1 className="text-8xl font-bold text-gradient dark:text-gradient-dark mb-4 animate-bounce-gentle">
                <AnimatedCounter end={404} />
              </h1>
              
              <div className="text-2xl text-foreground font-semibold mb-2">
                Oops! Page Not Found
              </div>
              
              <div className="text-muted-foreground mb-6">
                <AdvancedTypingAnimation 
                  texts={[
                    "The page you're looking for doesn't exist.",
                    "It might have been moved or deleted.",
                    "Let's get you back on track!"
                  ]}
                  speed={60}
                  deleteSpeed={30}
                  pauseDuration={2000}
                />
              </div>
              
              <div className="text-sm text-muted-foreground mb-8 font-mono bg-muted/20 rounded-lg p-3">
                Requested path: <span className="text-primary">{location.pathname}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton
                onClick={() => navigate('/')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                magneticStrength={0.2}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </MagneticButton>
              
              <MagneticButton
                onClick={() => navigate(-1)}
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
                magneticStrength={0.15}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </MagneticButton>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/30 rounded-full animate-pulse"></div>
          </GlassmorphismCard>
        </TiltCard>
        
        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Scale, title: "Legal AI", desc: "Document Analysis" },
            { icon: Sparkles, title: "Smart Search", desc: "Find What You Need" },
            { icon: Home, title: "Dashboard", desc: "Your Legal Hub" }
          ].map((item, index) => (
            <TiltCard key={index} tiltStrength={6}>
              <GlassmorphismCard 
                className="p-4 cursor-pointer animate-fade-in-up hover-lift"
                variant="subtle"
                hover
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate('/')}
              >
                <item.icon className="h-8 w-8 text-primary mx-auto mb-2 animate-float" />
                <h3 className="text-foreground font-medium text-sm">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </GlassmorphismCard>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
