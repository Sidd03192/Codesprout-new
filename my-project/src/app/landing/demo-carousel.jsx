"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Users, BarChart3, Code, Play } from "lucide-react";
import Image from "next/image";

const features = [
  {
    id: "streaming",
    title: "Live IDE Streaming",
    description: "Stream your development environment in real-time with WebRTC technology",
    icon: Monitor,
    mockup: {
      title: "Instructor Dashboard - Live Streaming",
      description: "Your IDE streams live to all students with zero latency",
      image: "/placeholder.svg?height=600&width=900",
      highlights: ["WebRTC streaming", "Multi-platform support", "HD quality", "Auto-scaling"],
    },
  },
  // Other features here...
];

export default function DemoCarousel() {
  const [activeFeature, setActiveFeature] = useState("streaming");
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (sectionHeight - window.innerHeight)));

      const featureIndex = Math.floor(scrollProgress * features.length);
      const clampedIndex = Math.max(0, Math.min(features.length - 1, featureIndex));

      if (features[clampedIndex]) {
        setActiveFeature(features[clampedIndex].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentFeature = features.find((f) => f.id === activeFeature) || features[0];

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-gradient-to-b from-black via-gray-900/50 to-black dark:from-black dark:via-gray-900/50 dark:to-black relative overflow-hidden"
    >
      {/* Add the rest of the component */}
    </section>
  );
}
