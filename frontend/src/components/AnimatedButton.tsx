import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  animation?: 'pulse' | 'bounce' | 'glow' | 'slide' | 'scale';
}

const AnimatedButton = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  animation = 'scale'
}: AnimatedButtonProps) => {
  const animationClasses = {
    pulse: 'hover:animate-pulse-glow',
    bounce: 'hover:animate-bounce-gentle',
    glow: 'hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300',
    slide: 'relative overflow-hidden group',
    scale: 'hover:scale-105 transition-transform duration-300'
  };

  const slideEffect = animation === 'slide' && (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
  );

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'relative transition-all duration-300',
        animationClasses[animation],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {slideEffect}
      <span className="relative z-10">{children}</span>
    </Button>
  );
};

export default AnimatedButton;