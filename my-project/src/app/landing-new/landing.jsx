"use client";

import Hero from "./hero";
import Bento from "./bento";
const { default: Navbar } = require("./navbar");

import BackgroundEffects from "./background-effects";
import StickyScroll from "./sticky-scroll";
import Pricing from "./pricing";
import { useState, useEffect } from "react";

export const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="max-h-screen overflow-x-hidden relative overflow-y-auto bg-zinc-900">
      <BackgroundEffects />
      <Navbar className="bg-transparent" />{" "}
      <main>
        <Hero />
        <Bento />
        <StickyScroll />
        <Pricing />
      </main>
    </div>
  );
};
