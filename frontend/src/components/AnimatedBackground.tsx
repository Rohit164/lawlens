const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted dark:from-slate-900 dark:via-purple-900 dark:to-slate-900"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-transparent rounded-full filter blur-3xl animate-spin-slow"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-1/4 w-4 h-4 border border-primary/20 rotate-45 animate-float"></div>
      <div className="absolute top-40 right-1/4 w-3 h-3 bg-primary/10 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-1/3 w-6 h-6 border border-primary/15 animate-float-slow"></div>
      <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-primary/20 animate-bounce-gentle" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50"></div>
    </div>
  );
};

export default AnimatedBackground;