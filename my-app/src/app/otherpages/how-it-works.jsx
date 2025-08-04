"use client";

import { motion } from "framer-motion";
import { Play, Users, BarChart } from "lucide-react";

const steps = [
  {
    icon: Play,
    title: "Launch Your Session",
    description: "Start streaming your IDE with one click. Students join instantly via QR code or link.",
    color: "green",
  },
  {
    icon: Users,
    title: "Teach & Poll in Real Time",
    description: "Push interactive polls, see live code heat-maps, and collaborate in breakout rooms.",
    color: "purple",
  },
  {
    icon: BarChart,
    title: "Review Insights & Grow",
    description: "Analyze engagement metrics, auto-grade assignments, and track learning progress.",
    color: "green",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Three simple steps to transform your CS classroom
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-purple-400 to-green-400 transform -translate-y-1/2 opacity-30" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        boxShadow:
                          step.color === "green"
                            ? "0 0 30px rgba(34, 197, 94, 0.5)"
                            : "0 0 30px rgba(168, 85, 247, 0.5)",
                      }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        step.color === "green"
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : "bg-gradient-to-r from-purple-400 to-purple-500"
                      } text-black shadow-lg`}
                    >
                      <step.icon size={32} />
                    </motion.div>

                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border-2 border-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Connecting arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8 mb-8">
                    <div className="w-1 h-12 bg-gradient-to-b from-green-400 to-purple-400 opacity-50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
