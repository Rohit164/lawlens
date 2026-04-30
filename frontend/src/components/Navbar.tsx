import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-md py-3 shadow-lg border-b border-border/50 animate-fade-in-down' : 'py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Law<span className="text-primary">Lens</span>
          </h1>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden lg:flex items-center space-x-8">
          <li>
            <button 
              onClick={() => {
                if (window.location.pathname !== '/') {
                  window.location.href = '/#features';
                } else {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Features
            </button>
          </li>
          <li>
            <Link to="/role-selector" className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              AI Tools
            </Link>
          </li>
          <li>
            <Link to="/upload-document" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
              Upload Document
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
              Pricing
            </Link>
          </li>
          <li>
            <button 
              onClick={() => {
                if (window.location.pathname !== '/') {
                  window.location.href = '/#faq';
                } else {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              FAQ
            </button>
          </li>
        </ul>

        <div className="hidden lg:flex items-center space-x-4 animate-fade-in-right">
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300"
              >
                Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 animate-pulse-glow"
              >
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: {
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.75rem",
                    border: "2px solid rgba(147, 51, 234, 0.3)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#9333ea",
                      transform: "scale(1.05)",
                    }
                  },
                  userButtonPopoverCard: {
                    backgroundColor: "rgba(30, 41, 59, 0.95)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "1rem",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  },
                  userButtonPopoverText: {
                    color: "#f1f5f9"
                  },
                  userButtonPopoverActionButton: {
                    color: "#f1f5f9",
                    "&:hover": {
                      backgroundColor: "rgba(147, 51, 234, 0.1)",
                      color: "#9333ea"
                    }
                  },
                  userButtonPopoverActionButtonText: {
                    color: "#f1f5f9"
                  },
                  userButtonPopoverFooter: {
                    backgroundColor: "rgba(15, 23, 42, 0.5)",
                    borderTop: "1px solid rgba(71, 85, 105, 0.3)"
                  }
                }
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-lg absolute top-full left-0 w-full py-4 shadow-lg border-b border-border/50">
          <div className="container mx-auto px-4">
            <ul className="flex flex-col space-y-4">
              <li>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (window.location.pathname !== '/') {
                      window.location.href = '/#features';
                    } else {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors block py-2 w-full text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <Link 
                  to="/role-selector" 
                  className="text-muted-foreground hover:text-foreground transition-colors block py-2 flex items-center gap-2" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Scale className="h-4 w-4" />
                  AI Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/upload-document"
                  className="text-muted-foreground hover:text-foreground transition-colors block py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Upload Document
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="text-muted-foreground hover:text-foreground transition-colors block py-2" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (window.location.pathname !== '/') {
                      window.location.href = '/#faq';
                    } else {
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors block py-2 w-full text-left"
                >
                  FAQ
                </button>
              </li>
              <li className="pt-4 flex flex-col space-y-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-foreground w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-between w-full">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: {
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "0.75rem",
                            border: "2px solid rgba(147, 51, 234, 0.3)",
                          },
                          userButtonPopoverCard: {
                            backgroundColor: "rgba(30, 41, 59, 0.95)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: "1rem",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                          },
                          userButtonPopoverText: {
                            color: "#f1f5f9"
                          },
                          userButtonPopoverActionButton: {
                            color: "#f1f5f9",
                            "&:hover": {
                              backgroundColor: "rgba(147, 51, 234, 0.1)",
                              color: "#9333ea"
                            }
                          }
                        }
                      }}
                    />
                    <span className="text-muted-foreground">Account</span>
                  </div>
                </SignedIn>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
