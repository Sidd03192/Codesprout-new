import { useState, useEffect } from "react";
import Hero from "./hero";
import Bento from "./bento";
import Features from "./Features";
import Pricing from "./pricing";
import "./landing.css";
const { default: Navbar } = require("./navbar");

export const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative overflow-x-hidden bg-black">
      <div className="starfield-bg"></div>
      <div
        className="pointer-events-none fixed inset-0 z-20 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`,
        }}
      />
      <Navbar />{" "}
      <main className="relative z-10">
        <Hero />
        <Bento />
        <Features />
        <Pricing />
      </main>
    </div>
  );
};
