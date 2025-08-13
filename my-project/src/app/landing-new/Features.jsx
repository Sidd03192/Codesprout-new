import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const features = [
  {
    title: "Live Coding IDE",
    text: "A fully-featured, browser-based IDE where students can write, run, and debug code without any setup.",
    image: "/1.svg",
  },
  {
    title: "Automated Feedback",
    text: "Students receive hints and suggestions in real-time, helping them learn from mistakes instantly.",
    image: "/2.svg",
  },
  {
    title: "Teacher Dashboard",
    text: "Monitor class-wide progress, view detailed submission analytics, and manage assignments all in one place.",
    image: "/file.svg",
  },
];

export const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featureRefs.current.indexOf(entry.target);
            setActiveFeature(index);
          }
        });
      },
      { threshold: 0.6 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Everything you need, nothing you don't
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our platform is packed with features to make teaching and learning code more effective and enjoyable.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featureRefs.current[index] = el)}
                className={`p-6 rounded-lg transition-all duration-300 ${
                  activeFeature === index
                    ? "bg-gray-800/50 shadow-lg"
                    : "bg-transparent"
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.text}</p>
              </div>
            ))}
          </div>
          <div className="sticky top-24">
            <div className="relative w-full h-96 rounded-lg bg-gray-800/50 overflow-hidden">
              {features.map((feature, index) => (
                <Image
                  key={index}
                  src={feature.image}
                  alt={feature.title}
                  layout="fill"
                  objectFit="contain"
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    activeFeature === index ? "opacity-100" : "opacity-0"
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

export default Features;
