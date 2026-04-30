import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'intense' | 'subtle';
  hover?: boolean;
  glow?: boolean;
}

const GlassmorphismCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glow = false
}: GlassmorphismCardProps) => {
  const variants = {
    default: 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10',
    intense: 'bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20',
    subtle: 'bg-white/5 dark:bg-white/2 backdrop-blur-sm border border-white/10 dark:border-white/5'
  };

  const hoverEffects = hover ? 'hover:bg-white/15 dark:hover:bg-white/8 hover:border-white/30 dark:hover:border-white/15 hover:scale-[1.02] hover:shadow-2xl' : '';
  const glowEffect = glow ? 'shadow-lg shadow-primary/10 hover:shadow-primary/20' : '';

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl transition-all duration-500',
      variants[variant],
      hoverEffects,
      glowEffect,
      className
    )}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
    </div>
  );
};

export default GlassmorphismCard;