"use client";

import { useEffect, useRef, useState } from "react";
import { Code, MessageSquare, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    id: 1,
    title: "Live Coding IDE",
    description:
      "A fully-featured, browser-based IDE where students can write, run, and debug code without any setup.",
    icon: Code,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: 2,
    title: "Automated Feedback",
    description:
      "Students receive hints and suggestions in real-time, helping them learn from mistakes instantly.",
    icon: MessageSquare,
    color: "from-green-500 to-teal-500",
  },
  {
    id: 3,
    title: "Teacher Dashboard",
    description:
      "Monitor class-wide progress, view detailed submission analytics, and manage assignments all in one place.",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
  },
];

const StickyScroll = () => {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (vh / 2 - rect.top) / (rect.height - vh))
      );
      const idx = Math.min(
        FEATURES.length - 1,
        Math.max(0, Math.floor(progress * FEATURES.length))
      );
      setActive(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getGradient = (f) => {
    switch (f.id) {
      case 1:
        return "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)";
      case 2:
        return "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)";
      default:
        return "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)";
    }
  };

  return (
    <section id="interactive" ref={containerRef} className="relative" style={{ height: `${FEATURES.length * 100}vh` }}>
      <div className="sticky top-24 container mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start min-h-[calc(100vh-6rem)]">
        {/* Left: scrollable features */}
        <div className="space-y-10">
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                active === i
                  ? "border-violet-500/50 bg-violet-500/10 scale-[1.02] shadow-xl shadow-violet-500/20"
                  : "border-white/10 bg-white/5 hover:scale-[1.01]"
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5 bg-gradient-to-r ${f.color} text-white`}
              >
                <f.icon size={28} />
              </div>
              <h3
                className={`text-2xl font-bold mb-3 ${
                  active === i ? "text-violet-300" : ""
                }`}
              >
                {f.title}
              </h3>
              <p className="text-white/80 leading-relaxed text-lg">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right: sticky preview */}
        <div className="lg:sticky lg:top-24">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/40">
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: active === i ? 1 : 0 }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: getGradient(f) }}
                >
                  <div className="text-white text-center p-8">
                    <f.icon size={64} className="mx-auto opacity-90" />
                    <h4 className="text-xl font-bold mt-3">{f.title}</h4>
                    <div className="opacity-80 text-sm">Interactive Demo Preview</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute top-4 left-4 flex gap-2">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    active === i ? "bg-violet-500" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyScroll;

