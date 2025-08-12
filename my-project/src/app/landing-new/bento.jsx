import React, { useEffect, useRef, useState } from "react";
import { Sparkles, GraduationCap, Clock, Shield, Code, Users, TrendingUp, Zap, BookOpen, Trophy } from "lucide-react";

// Intersection Observer hook for animations
const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

// Floating animation component
const FloatingIcon = ({ icon: Icon, delay = 0 }) => {
  return (
    <div 
      className="absolute opacity-20 animate-pulse"
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      <Icon size={16} />
    </div>
  );
};

export const Bento = () => {
  const [containerRef, containerInView] = useInView(0.1);

  return (
    <section id="overview" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10">
          <FloatingIcon icon={Code} delay={0} />
        </div>
        <div className="absolute top-32 right-20">
          <FloatingIcon icon={BookOpen} delay={1} />
        </div>
        <div className="absolute bottom-20 left-1/4">
          <FloatingIcon icon={Trophy} delay={2} />
        </div>
        <div className="absolute bottom-32 right-10">
          <FloatingIcon icon={Users} delay={0.5} />
        </div>
      </div>

      <div className="container mx-auto px-6" ref={containerRef}>
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-700 transform ${
          containerInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why educators choose{" "}
            <span className="bg-[linear-gradient(var(--gradient-brand))] bg-clip-text text-transparent">
              Code Sprout
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built specifically for educators, by educators. See how we're transforming coding education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Main Feature Card */}
          <article className={`group card-glass md:col-span-4 flex flex-col justify-between min-h-[280px] relative overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl transform ${
            containerInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ animationDelay: '0.1s' }}>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Sparkles className="text-primary group-hover:scale-110 transition-transform duration-300" size={24} />
                </div>
                <h3 className="font-heading text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                  AI that coaches, not replaces
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our intelligent teaching assistant provides instant hints and explanations, 
                helping students learn programming concepts while you focus on what matters most - teaching.
              </p>
              
              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-xs text-muted-foreground">Faster feedback</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">Available support</div>
                </div>
              </div>
            </div>
          </article>

          {/* Time Saving Card */}
          <article className={`group card-glass md:col-span-2 min-h-[280px] relative overflow-hidden hover:scale-[1.02] transition-all duration-700 transform ${
            containerInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Clock className="text-blue-500 group-hover:scale-110 transition-transform duration-300" size={20} />
                </div>
                <h3 className="font-heading text-lg font-semibold group-hover:text-blue-500 transition-colors duration-300">
                  Save hours weekly
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Automated grading and instant feedback reduce manual work by up to 75%.
              </p>
              
              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time saved</span>
                  <span className="text-blue-500 font-medium">15hrs/week</span>
                </div>
                <div className="h-2 bg-content2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 group-hover:w-full" 
                       style={{ width: containerInView ? '75%' : '0%' }} />
                </div>
              </div>
            </div>
          </article>

          {/* Classroom Focus Card */}
          <article className={`group card-glass md:col-span-2 min-h-[260px] relative overflow-hidden hover:scale-[1.02] transition-all duration-700 transform ${
            containerInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300">
                  <GraduationCap className="text-green-500 group-hover:scale-110 transition-transform duration-300" size={20} />
                </div>
                <h3 className="font-heading text-lg font-semibold group-hover:text-green-500 transition-colors duration-300">
                  Built for classrooms
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Standards-aligned curriculum with real-time progress tracking and detailed analytics.
              </p>
              
              {/* Feature list */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Progress tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Standards alignment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Detailed analytics</span>
                </div>
              </div>
            </div>
          </article>

          {/* Security & Compliance Card */}
          <article className={`group card-glass md:col-span-4 min-h-[260px] bg-[linear-gradient(var(--gradient-brand))] text-[hsl(var(--brand-contrast))] relative overflow-hidden hover:scale-[1.02] transition-all duration-700 transform ${
            containerInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ animationDelay: '0.4s' }}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 border border-white/30 rounded-full animate-ping" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border border-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 w-4 h-4 border border-white/30 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                  <Shield className="group-hover:scale-110 transition-transform duration-300" size={24} />
                </div>
                <h3 className="font-heading text-xl font-semibold">
                  Safe by design
                </h3>
              </div>
              <p className="opacity-90 leading-relaxed mb-6">
                Enterprise-grade security with FERPA compliance, content filtering, and comprehensive audit logs 
                to keep your classroom safe and compliant.
              </p>
              
              {/* Security features grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="opacity-80" />
                  <span className="text-sm opacity-90">FERPA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="opacity-80" />
                  <span className="text-sm opacity-90">Data Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="opacity-80" />
                  <span className="text-sm opacity-90">Admin Controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="opacity-80" />
                  <span className="text-sm opacity-90">Audit Logs</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Bento;
