import { Button, Card, CardBody } from "@heroui/react";
import React from "react";

export const Hero = () => {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  // This text will be animated
  const textToAnimate = "Start Teaching";
  const [typedText, setTypedText] = React.useState("");

  React.useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setTypedText(textToAnimate.slice(0, i + 1));
      i++;
      if (i > textToAnimate.length) {
        clearInterval(intervalId);
      }
    }, 60);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section
      id="hero"
      className="pt-28 md:pt-36 pb-10 md:pb-14 spotlight"
      style={{
        "--x": `${pos.x}px`,
        "--y": `${pos.y}px`,
      }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      <div className="container mx-auto px-6 text-center max-w-[90%]">
        <div className="items-center w-full">
          <a
            href="#"
            className="inline-block bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300 hover:border-gray-500 transition-all mb-6 group"
          >
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text font-semibold">
              ✨ Now Powered with AI
            </span>
          </a>
        </div>

        <div className="mx-auto size-20 md:size-24 rounded-2xl flex items-center justify-center mb-6 md:mb-8 glass">
          <img
            src="/2.png"
            alt="Code Sprout logo"
            width={96}
            height={96}
            loading="eager"
          />
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-4 md:mb-6 animate-enter">
          <span>Stop Grading, </span>{" "}
          <span className="bg-[linear-gradient(var(--gradient-brand))] bg-clip-text text-transparent">
            {typedText}
          </span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in">
          Code Sprout is the AI-powered teaching assistant that automates your
          grading workflow, provides instant student feedback, and gives you
          back your weekends.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button className="glass " size="lg" asChild>
            <a href="#cta" aria-label="Request a demo" className="hover-scale">
              Request a demo
            </a>
          </Button>
          <Button className="hero-button " size="lg" asChild>
            <a
              href="#services"
              aria-label="Explore the platform"
              className="hover-scale"
            >
              Get Started Now
            </a>
          </Button>
        </div>

        {/* Demo screen below buttons */}
        <div className="mt-10 md:mt-14">
          <figure className="relative rounded-2xl glass overflow-hidden p-2">
            <img
              src="/example.png"
              alt="Code Sprout product demo screen showing code feedback and analytics"
              className="w-full h-auto rounded-xl"
              loading="lazy"
            />
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Hero;
