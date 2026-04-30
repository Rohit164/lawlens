
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AnimatedBackground from "@/components/AnimatedBackground";
import InteractiveParticles from "@/components/InteractiveParticles";

const Index = () => {
  return (
    <div className="min-h-screen relative page-transition">
      <AnimatedBackground />
      <InteractiveParticles />
      <Navbar />
      <Hero />
      <Features />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
