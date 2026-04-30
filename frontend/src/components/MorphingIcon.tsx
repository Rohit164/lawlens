import { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MorphingIconProps {
  primaryIcon: LucideIcon;
  secondaryIcon: LucideIcon;
  size?: number;
  className?: string;
  trigger?: 'hover' | 'click';
  morphDuration?: number;
}

const MorphingIcon = ({
  primaryIcon: PrimaryIcon,
  secondaryIcon: SecondaryIcon,
  size = 24,
  className = '',
  trigger = 'hover',
  morphDuration = 300
}: MorphingIconProps) => {
  const [isTransformed, setIsTransformed] = useState(false);

  const handleInteraction = () => {
    if (trigger === 'click') {
      setIsTransformed(!isTransformed);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsTransformed(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsTransformed(false);
    }
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer',
        className
      )}
      onClick={handleInteraction}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: size, height: size }}
    >
      {/* Primary Icon */}
      <PrimaryIcon
        size={size}
        className={cn(
          'absolute transition-all ease-in-out',
          isTransformed 
            ? 'opacity-0 scale-0 rotate-180' 
            : 'opacity-100 scale-100 rotate-0'
        )}
        style={{ transitionDuration: `${morphDuration}ms` }}
      />
      
      {/* Secondary Icon */}
      <SecondaryIcon
        size={size}
        className={cn(
          'absolute transition-all ease-in-out',
          isTransformed 
            ? 'opacity-100 scale-100 rotate-0' 
            : 'opacity-0 scale-0 -rotate-180'
        )}
        style={{ transitionDuration: `${morphDuration}ms` }}
      />
    </div>
  );
};

export default MorphingIcon;