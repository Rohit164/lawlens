import { Scale } from "lucide-react";

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const AnimatedLoader = ({ size = "md", text = "Processing..." }: AnimatedLoaderProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full animate-spin`}></div>
        
        {/* Inner pulsing icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Scale className="h-4 w-4 text-primary animate-pulse-glow" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-1 -right-1 w-1 h-1 bg-primary rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-primary/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {text && (
        <div className={`${textSizeClasses[size]} text-muted-foreground animate-pulse`}>
          {text}
        </div>
      )}
      
      {/* Progress dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default AnimatedLoader;