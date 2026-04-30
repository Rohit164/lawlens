
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Sparkles, HelpCircle } from 'lucide-react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import TiltCard from '@/components/TiltCard';
import MorphingIcon from '@/components/MorphingIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { faqItems } from '../data/faqData';

const FAQ = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div ref={headerRef} className="text-center mb-16">
          <GlassmorphismCard className={`inline-flex items-center px-4 py-2 mb-6 transition-all duration-1000 ${headerVisible ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`} variant="subtle">
            <MorphingIcon 
              primaryIcon={HelpCircle} 
              secondaryIcon={Sparkles} 
              size={16} 
              className="text-primary mr-2" 
            />
            <span className="text-xs font-medium text-primary mr-2">FAQ</span>
            <span className="text-xs text-muted-foreground">Your Questions Answered</span>
          </GlassmorphismCard>
          
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <span className="text-gradient dark:text-gradient-dark inline-block animate-gradient-shift bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          
          <p className={`text-muted-foreground max-w-2xl mx-auto transition-all duration-1000 ${headerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            Got questions about LawLens? We've got answers. If you don't see what you're looking for, reach out to our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <TiltCard key={index} className="w-full" tiltStrength={6}>
                <GlassmorphismCard 
                  className={`overflow-hidden animate-fade-in-up hover-lift`}
                  variant="default"
                  hover
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="border-0"
                  >
                    <AccordionTrigger className="px-6 py-4 text-foreground hover:text-primary hover:no-underline text-left transition-colors duration-300 group">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:animate-pulse-glow"></div>
                        <span className="font-medium">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-muted-foreground leading-relaxed">
                      <div className="pl-5 border-l-2 border-primary/20">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </GlassmorphismCard>
              </TiltCard>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
