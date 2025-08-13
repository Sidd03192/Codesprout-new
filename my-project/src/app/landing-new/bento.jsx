import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  BarChart2,
  Shield,
  FileText,
  Search,
  Globe,
} from "lucide-react";

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

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, inView];
};

const bentoCards = [
  {
    title: "AI-Powered Autograder",
    text: "Get instant, detailed feedback on code submissions, checking for correctness, style, and efficiency.",
    icon: Sparkles,
    large: true,
  },
  {
    title: "Real-time Analytics",
    text: "Track student progress and identify learning gaps with a powerful dashboard.",
    icon: BarChart2,
    large: false,
  },
  {
    title: "Enterprise-Grade Security",
    text: "Protect student data with industry-leading security protocols, ensuring privacy and compliance.",
    icon: Shield,
    large: false,
  },
  {
    title: "AI Summaries & Automation",
    text: "Leverage AI to automatically generate assignment summaries, grade explanations, and automate repetitive teaching tasks.",
    icon: FileText,
    large: true,
  },
  {
    title: "Plagiarism Detection",
    text: "Ensure academic integrity with advanced code similarity analysis.",
    icon: Search,
    large: false,
  },
  {
    title: "Multi-Language Support",
    text: "Native support for Java, Python, C++, and more, allowing for a versatile curriculum.",
    icon: Globe,
    large: false,
  },
];

export const Bento = () => {
  const [containerRef, containerInView] = useInView(0.1);

  return (
    <section id="overview" className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6" ref={containerRef}>
        <div
          className={`text-center mb-12 transition-all duration-700 transform ${
            containerInView
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            A smarter way to teach code
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover a platform designed to automate the tedious parts of
            teaching, so you can focus on what matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bentoCards.map((card, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden transform transition-transform duration-300 ease-in-out hover:scale-[1.02] card-hover-glow
                ${card.large ? "md:col-span-2" : "md:col-span-1"}
                transition-all duration-700 transform ${
                  containerInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bento;
