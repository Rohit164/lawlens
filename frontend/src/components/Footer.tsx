
import { Scale, Twitter, Linkedin, Github, Mail, Sparkles, ArrowUp, Heart, ExternalLink } from 'lucide-react';
import GlassmorphismCard from '@/components/GlassmorphismCard';
import TiltCard from '@/components/TiltCard';
import MorphingIcon from '@/components/MorphingIcon';
import MagneticButton from '@/components/MagneticButton';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { ref: footerRef, isVisible: footerVisible } = useScrollAnimation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative pt-16 pb-8 border-t border-border/50">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={footerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8">
          {/* Brand Section */}
          <div className={`lg:col-span-2 transition-all duration-1000 ${footerVisible ? 'animate-fade-in-left opacity-100' : 'opacity-0'}`}>
            <TiltCard className="mb-6" tiltStrength={5}>
              <div className="flex items-center space-x-2 mb-4 group cursor-pointer" onClick={scrollToTop}>
                <MorphingIcon 
                  primaryIcon={Scale} 
                  secondaryIcon={Sparkles} 
                  size={32} 
                  className="text-primary group-hover:animate-wiggle" 
                />
                <h2 className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300">
                  Law<span className="text-gradient dark:text-gradient-dark bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Lens</span>
                </h2>
              </div>
            </TiltCard>
            
            <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
              AI-powered legal document simplification platform. Making Indian law accessible to everyone through advanced AI technology.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {[
                { icon: Twitter, href: "#!", label: "Twitter", color: "hover:text-blue-500" },
                { icon: Linkedin, href: "#!", label: "LinkedIn", color: "hover:text-blue-600" },
                { icon: Github, href: "#!", label: "GitHub", color: "hover:text-gray-600" },
                { icon: Mail, href: "mailto:support@lawlens.ai", label: "Email", color: "hover:text-primary" }
              ].map((social, index) => (
                <TiltCard key={index} tiltStrength={8}>
                  <GlassmorphismCard className="p-2 cursor-pointer group" variant="subtle" hover>
                    <a href={social.href} className={`text-muted-foreground ${social.color} transition-all duration-300 group-hover:scale-110 block`}>
                      <social.icon className="h-5 w-5" />
                      <span className="sr-only">{social.label}</span>
                    </a>
                  </GlassmorphismCard>
                </TiltCard>
              ))}
            </div>
          </div>
          
          {/* Features Section */}
          <div className={`transition-all duration-1000 ${footerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <h3 className="text-foreground font-semibold mb-4 flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-glow"></div>
              Features
            </h3>
            <ul className="space-y-3">
              {[
                "AI Summarization",
                "Translation", 
                "Classification",
                "OCR Processing",
                "API Access"
              ].map((item, index) => (
                <li key={index} className="stagger-item">
                  <a href="#!" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <ExternalLink className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources Section */}
          <div className={`transition-all duration-1000 ${footerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <h3 className="text-foreground font-semibold mb-4 flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-glow"></div>
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                "Documentation",
                "API Guide",
                "Legal Database", 
                "Tutorials",
                "Help Center"
              ].map((item, index) => (
                <li key={index} className="stagger-item">
                  <a href="#!" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <ExternalLink className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Section */}
          <div className={`transition-all duration-1000 ${footerVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <h3 className="text-foreground font-semibold mb-4 flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-glow"></div>
              Company
            </h3>
            <ul className="space-y-3">
              {[
                "About",
                "Careers",
                "Blog",
                "Privacy Policy", 
                "Contact Us"
              ].map((item, index) => (
                <li key={index} className="stagger-item">
                  <a href="#!" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <ExternalLink className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-border/50 pt-8">
          <GlassmorphismCard className="p-6" variant="subtle">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className={`flex items-center mb-4 md:mb-0 transition-all duration-1000 ${footerVisible ? 'animate-fade-in-right opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <p className="text-muted-foreground text-sm flex items-center">
                  &copy; {currentYear} LawLens. All rights reserved. 
                  <span className="mx-2">⚖️</span>
                  <span className="text-primary font-medium">Simplifying Law. Empowering Justice.</span>
                  <Heart className="h-4 w-4 text-red-500 ml-2 animate-pulse" />
                </p>
              </div>
              
              <div className={`flex items-center space-x-6 transition-all duration-1000 ${footerVisible ? 'animate-fade-in-left opacity-100' : 'opacity-0'}`} style={{ animationDelay: '1.0s' }}>
                <div className="flex space-x-4">
                  {[
                    "Terms of Service",
                    "Privacy Policy", 
                    "Cookie Policy"
                  ].map((item, index) => (
                    <a key={index} href="#!" className="text-muted-foreground hover:text-primary text-sm transition-all duration-300 hover:scale-105">
                      {item}
                    </a>
                  ))}
                </div>
                
                {/* Back to Top Button */}
                <MagneticButton
                  onClick={scrollToTop}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/50"
                  magneticStrength={0.15}
                >
                  <ArrowUp className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-8 right-8 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-8 left-8 w-1 h-1 bg-primary/20 rounded-full animate-pulse"></div>
      </div>
    </footer>
  );
};

export default Footer;
