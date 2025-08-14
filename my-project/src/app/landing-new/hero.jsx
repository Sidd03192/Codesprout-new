import { Button, Card, CardBody } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import React from "react";

export const Hero = () => {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  // This text will be animated
  const textToAnimate = "Start Teaching With Codesprout";
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
              ✨ Beta Release 1.0
            </span>
          </a>
        </div>

        <h1 className="font-heading text-6xl md:text-7xl font-bold leading-tight mb-4 md:mb-6 animate-enter ">
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
        <div class="relative z-10 inline-flex items-center justify-center gap-4 group">
          <div class="absolute inset-0 duration-1000 opacity-60 transitiona-all cursor-crosshair bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-400 rounded-xl blur-md filter group-hover:opacity-100 group-hover:duration-200"></div>
          <a
            role="button"
            class="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
            title="payment"
            href="#"
          >
            Request A Demo
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>

        {/* Demo screen below buttons */}
        <div className="mt-10 md:mt-14">
          <figure className="relative rounded-2xl glass  p-2 hero-glow isolation-isolate">
            <img
              src="/example.png"
              alt="Code Sprout product demo screen"
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
