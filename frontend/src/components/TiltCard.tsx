import { ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  glareEffect?: boolean;
}

const TiltCard = ({ 
  children, 
  className = '', 
  tiltStrength = 15,
  glareEffect = true 
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = ((e.clientY - centerY) / rect.height) * -tiltStrength;
    const rotateY = ((e.clientX - centerX) / rect.width) * tiltStrength;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glareEffect && glareRef.current) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 50%)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative transition-transform duration-300 ease-out transform-gpu',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      
      {glareEffect && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 rounded-xl"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
    </div>
  );
};

export default TiltCard;