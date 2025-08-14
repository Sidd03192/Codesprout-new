import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Zap,
  Crown,
  Rocket,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@heroui/react";

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

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, inView]);

  return count;
};

// Floating particles component
const FloatingParticle = ({ delay = 0, duration = 4 }) => (
  <div
    className="absolute w-2 h-2 bg-primary/20 rounded-xl animate-ping"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const PricingCard = ({ plan, isPopular = false, delay = 0, inView }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={cardRef}
      className={`
        relative group pricing-card transition-all duration-700 transform
        ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        ${isPopular ? "scale-105 z-10" : "hover:scale-105"}
        ${isHovered ? "shadow-2xl" : ""}
      `}
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-[linear-gradient(var(--gradient-brand))] text-[hsl(var(--brand-contrast))] px-4 py-1 rounded-xl text-sm font-semibold flex items-center gap-1">
            <Crown size={14} />
            Most Popular
          </div>
        </div>
      )}

      {/* Glow effect */}
      {isPopular && (
        <div className="absolute inset-0 bg-[linear-gradient(var(--gradient-brand))] rounded-[56px] md:rounded-[64px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      )}

      <div
        className={`
        relative h-full card-glass rounded-xl p-8 overflow-hidden
        ${isPopular ? "border-2 border-primary/30" : ""}
      `}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingParticle delay={0} />
          <FloatingParticle delay={1.5} />
          <FloatingParticle delay={3} />
          {isPopular && (
            <>
              <div className="absolute top-4 right-4">
                <Sparkles className="text-primary/30 animate-pulse" size={16} />
              </div>
              <div className="absolute bottom-4 left-4">
                <Star className="text-secondary/30 animate-pulse" size={12} />
              </div>
            </>
          )}
        </div>

        {/* Plan header */}
        <div className="relative z-10 text-center mb-6">
          <div
            className={`inline-flex p-3 rounded-xl mb-4 ${
              isPopular
                ? "bg-[linear-gradient(var(--gradient-brand))] text-[hsl(var(--brand-contrast))]"
                : "bg-primary/10 text-primary"
            }`}
          >
            <plan.icon
              size={24}
              className={
                isPopular
                  ? ""
                  : "group-hover:scale-110 transition-transform duration-300"
              }
            />
          </div>

          <h3
            className={`text-xl font-bold mb-2 ${
              isPopular
                ? "text-primary"
                : "group-hover:text-primary transition-colors duration-300"
            }`}
          >
            {plan.name}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="relative z-10 text-center mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">$</span>
            <span className="text-5xl font-bold">
              <AnimatedCounter end={plan.price} inView={inView} />
            </span>
            <span className="text-muted-foreground">/{plan.period}</span>
          </div>
          {plan.originalPrice && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-muted-foreground line-through text-sm">
                ${plan.originalPrice}
              </span>
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-xl text-xs font-medium">
                Save {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="relative z-10 mb-8">
          <Button
            className={`w-full group/btn transition-all duration-300 ${
              isPopular
                ? "bg-[linear-gradient(var(--gradient-brand))] text-[hsl(var(--brand-contrast))] hover:shadow-lg hover:shadow-primary/25"
                : "glass hover:bg-primary/10"
            }`}
            size="lg"
          >
            <span className="flex items-center gap-2">
              {plan.ctaText}
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform duration-300"
              />
            </span>
          </Button>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {plan.features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 transition-all duration-500 ${
                inView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              }`}
              style={{ animationDelay: `${delay + 0.1 * index}s` }}
            >
              <div
                className={`p-1 rounded-xl ${
                  feature.included
                    ? "bg-green-500/20 text-green-400"
                    : "bg-muted/20 text-muted-foreground"
                }`}
              >
                <Check size={12} />
              </div>
              <span
                className={`text-sm ${
                  feature.included ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Additional info */}
        {plan.additionalInfo && (
          <div className="relative z-10 mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              {plan.additionalInfo}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Pricing = () => {
  const [containerRef, containerInView] = useInView(0.1);
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      icon: Zap,
      description: "Perfect for individual teachers or small classes",
      price: isAnnual ? 0 : 0,
      originalPrice: isAnnual ? 0 : 0,
      period: isAnnual ? "year" : "month",
      ctaText: "Request a Demo",
      features: [
        { text: "Up to 30 students", included: true },
        { text: "AI-powered code review", included: true },
        { text: "Basic analytics", included: true },
        { text: "Email support", included: true },
        { text: "Custom assignments", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Priority support", included: false },
      ],
      additionalInfo: "No credit card required",
    },
    {
      name: "Professional",
      icon: Crown,
      description: "Ideal for schools and larger classrooms",
      price: isAnnual ? 79 : 95,
      originalPrice: isAnnual ? 129 : 155,
      period: isAnnual ? "year" : "month",
      ctaText: "Get Started",
      features: [
        { text: "Up to 150 students", included: true },
        { text: "AI-powered code review", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom assignments", included: true },
        { text: "Priority support", included: true },
        { text: "Plagiarism detection", included: true },
        { text: "Grade book integration", included: false },
      ],
      additionalInfo: "Most popular choice among educators",
    },
    {
      name: "Enterprise",
      icon: Rocket,
      description: "For institutions and large organizations",
      price: isAnnual ? 199 : 239,
      period: isAnnual ? "year" : "month",
      ctaText: "Contact Sales",
      features: [
        { text: "Unlimited students", included: true },
        { text: "Everything in Professional", included: true },
        { text: "Custom integrations", included: true },
        { text: "Dedicated support", included: true },
        { text: "Advanced security", included: true },
        { text: "Custom branding", included: true },
        { text: "On-premise deployment", included: true },
      ],
      additionalInfo: "Custom pricing available for large deployments",
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-xl blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/5 rounded-xl blur-3xl" />
      </div>

      <div className="container mx-auto px-6" ref={containerRef}>
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 transform ${
            containerInView
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Choose your{" "}
            <span className="bg-[linear-gradient(var(--gradient-brand))] bg-clip-text text-transparent">
              perfect plan
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
            Start with a free trial, then choose the plan that best fits your
            classroom needs. All plans include our AI-powered teaching assistant
            and core features.
          </p>

          {/* Pricing Toggle */}
          <div
            className={`inline-flex items-center p-1 bg-content2 rounded-xl transition-all duration-500 ${
              containerInView ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                !isAnnual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                isAnnual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-xl">
                Save 40%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPopular={index === 1}
              delay={index * 0.2}
              inView={containerInView}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 transform ${
            containerInView
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-muted-foreground mb-4">
            Need a custom solution? We offer special pricing for large
            institutions.
          </p>
          <Button variant="outline" size="lg" className="glass">
            Contact Our Sales Team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
