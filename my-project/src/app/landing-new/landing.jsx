"use client";

import React, { useState, useEffect, useRef } from "react";
import Hero from "./hero";
import Bento from "./bento";
import Navbar from "./navbar"; // Corrected import syntax
import BackgroundEffects from "./background-effects";
import Pricing from "./pricing";
import BetaCard from "./cta";
import Banner from "./banner";
export const Landing = () => {
  const [isAtTop, setIsAtTop] = useState(true);
  const scrollContainerRef = useRef(null);
  console.log(isAtTop);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsAtTop(container.scrollTop === 0);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    const handleMouseMove = (event) => {};
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    // Attach the ref to your main scrollable div
    <>
      <div
        ref={scrollContainerRef}
        className="max-h-[100vh] overflow-x-hidden relative overflow-y-auto bg-zinc-900 scroll-smooth"
      >
        <BackgroundEffects />

        {/* You can now pass the isAtTop state to the Navbar if it needs to change styles */}
        <Navbar isAtTop={isAtTop} />
        <main>
          <Hero />
          <Bento />
          <BetaCard />
          {/* <Pricing /> */}
        </main>
      </div>
    </>
  );
};

// It's standard practice to export default at the end
export default Landing;
