import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdvancedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
  gradient?: boolean;
  glowing?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AdvancedProgress = ({
  value,
  max = 100,
  className = '',
  showPercentage = true,
  animated = true,
  gradient = true,
  glowing = false,
  size = 'md'
}: AdvancedProgressProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const progressBarClasses = cn(
    'relative overflow-hidden rounded-full bg-muted',
    sizeClasses[size],
    glowing && 'shadow-lg shadow-primary/20',
    className
  );

  const fillClasses = cn(
    'h-full rounded-full transition-all duration-1000 ease-out relative',
    gradient 
      ? 'bg-gradient-to-r from-primary via-primary/80 to-primary' 
      : 'bg-primary'
  );

  return (
    <div className="space-y-2">
      {showPercentage && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
      
      <div className={progressBarClasses}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Progress fill */}
        <div
          className={fillClasses}
          style={{ width: `${displayValue}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          
          {/* Pulse effect */}
          {animated && (
            <div className="absolute right-0 top-0 h-full w-2 bg-white/50 animate-pulse"></div>
          )}
        </div>
        
        {/* Glow effect */}
        {glowing && (
          <div 
            className="absolute top-0 h-full bg-primary/30 blur-sm transition-all duration-1000"
            style={{ width: `${displayValue}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedProgress;