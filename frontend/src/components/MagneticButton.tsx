import { ReactNode, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  magneticStrength?: number;
}

const MagneticButton = ({
  children,
  className = '',
  onClick,
  variant = 'default',
  size = 'default',
  magneticStrength = 0.3
}: MagneticButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;

    buttonRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    
    setIsHovered(false);
    buttonRef.current.style.transform = 'translate(0px, 0px) scale(1)';
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={cn(
        'relative transition-all duration-300 ease-out overflow-hidden group',
        className
      )}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Ripple effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isHovered ? 'animate-pulse' : ''}`}></div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </Button>
  );
};

export default MagneticButton;