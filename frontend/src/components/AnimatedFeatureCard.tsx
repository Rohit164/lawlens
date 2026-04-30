import { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  gradient?: string;
}

const AnimatedFeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  gradient = "from-primary/10 to-primary/5"
}: AnimatedFeatureCardProps) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="relative z-10">
        {/* Animated icon container */}
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary group-hover:animate-bounce-gentle" />
        </div>
        
        {/* Title with gradient text on hover */}
        <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground group-hover:text-card-foreground transition-colors duration-300">
          {description}
        </p>
        
        {/* Animated border */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/60 group-hover:w-full transition-all duration-500"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-4 right-4 h-1 w-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
      <div className="absolute bottom-4 left-4 h-1.5 w-1.5 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

export default AnimatedFeatureCard;