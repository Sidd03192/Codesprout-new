"use client";

import { useEffect, useRef, useState } from "react"; // Import useState

const BackgroundEffects = () => {
  const gradientRef = useRef(null);
  const [stars, setStars] = useState([]); // 1. Create state for stars

  // 2. Generate star data only once on component mount
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 60 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.max(1, Math.floor(Math.random() * 2) + 1)}px`,
        delay: `${Math.random() * 3}s`,
        duration: `${2 + Math.random() * 2}s`,
      }));
      setStars(newStars);
    };
    generateStars();
  }, []); // Empty dependency array means this runs only once

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gradientRef.current) return;
      const { clientX, clientY } = e;
      gradientRef.current.style.setProperty("--mx", `${clientX}px`);
      gradientRef.current.style.setProperty("--my", `${clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Starfield: subtle white dots pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: "0 0, 45px 45px",
        }}
      />

      {/* 3. Map over the stable star data from state */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: 0.6,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      {/* Mouse-following radial gradient spotlight */}
      {/* <div
        ref={gradientRef}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%),  rgba(5, 150, 105,.20), rgba(139,92,246,0.08) 10%, transparent 100%)",
        }}
      /> */}

      {/* Soft ambient color blobs */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(400px circle at 20% 80%, rgba(120,119,198,0.20), transparent 50%), radial-gradient(400px circle at 80% 20%, rgba(236,72,153,0.20), transparent 50%), radial-gradient(400px circle at 40% 40%, rgba(59,130,246,0.20), transparent 50%)",
        }}
      />
    </div>
  );
};

export default BackgroundEffects;
