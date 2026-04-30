import { useState, useEffect } from 'react';

interface AdvancedTypingAnimationProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursor?: boolean;
  loop?: boolean;
}

const AdvancedTypingAnimation = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
  className = '',
  cursor = true,
  loop = true
}: AdvancedTypingAnimationProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const targetText = texts[currentTextIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      
      return () => clearTimeout(pauseTimer);
    }

    const timer = setTimeout(() => {
      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => {
            const next = prev + 1;
            return next >= texts.length ? (loop ? 0 : prev) : next;
          });
        }
      } else {
        if (currentText.length < targetText.length) {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, speed, deleteSpeed, pauseDuration, loop]);

  return (
    <span className={className}>
      {currentText}
      {cursor && (
        <span className="animate-blink border-r-2 border-current ml-1"></span>
      )}
    </span>
  );
};

export default AdvancedTypingAnimation;