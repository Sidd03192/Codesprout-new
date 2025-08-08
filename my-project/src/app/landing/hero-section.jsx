"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight, Sparkles, Zap } from "lucide-react";
import { CodeRain } from "./code-rain";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";

const HeroSection = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black dark:bg-black">
      <CodeRain />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-purple-500/20 border border-green-500/30 rounded-full px-4 py-2">
                <Sparkles size={16} className="text-green-400" />
                <span className="text-green-400 font-medium">Now in Development</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block text-white mb-2">The platform for</span>
              <span className="block bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent">
                live coding
              </span>
              <span className="block text-white">education</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Stream your IDE, push interactive polls, auto-grade assignments, and generate
              complete lesson plans—all in one powerful platform for{" "}
              <span className="text-purple-400 font-semibold">hybrid CS classrooms</span>.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={onOpen}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(34, 197, 94, 0.4)",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-green-400 to-green-500 text-black px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg shadow-green-400/25 transition-all duration-300"
              >
                <Zap size={20} />
                Join Waitlist Now!
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  <ModalHeader className="flex flex-col gap-1">Join Waitlist</ModalHeader>
                  <ModalBody>
                    <Input placeholder="Enter your email" className="mb-4" />
                    <Button onClick={onOpenChange}>Submit</Button>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </motion.div>
          </motion.div>

          {/* Right Side - Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="ml-4 text-gray-400 text-sm font-mono">instructor-dashboard.tsx</span>
              </div>
              <div className="font-mono text-sm space-y-2">
                <div className="text-purple-400">
                  <span className="text-gray-500">1</span>
                  <span className="ml-4">import</span>{" "}
                  <span className="text-green-400">{"{ CodeSprout }"}</span>{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'@codesprout/sdk'</span>
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-500">2</span>
                </div>
                <div className="text-blue-400">
                  <span className="text-gray-500">3</span>
                  <span className="ml-4">const</span>{" "}
                  <span className="text-white">session</span>{" "}
                  <span className="text-purple-400">=</span>{" "}
                  <span className="text-blue-400">CodeSprout</span>
                  <span className="text-white">.createSession()</span>
                </div>
                <div className="text-green-400">
                  <span className="text-gray-500">4</span>
                  <span className="ml-4">session.streamIDE()</span>
                </div>
                <div className="text-yellow-400">
                  <span className="text-gray-500">5</span>
                  <span className="ml-4">session.pushPoll(</span>
                  <span className="text-green-400">"What's the time complexity?"</span>
                  <span className="text-yellow-400">)</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-purple-500/10 rounded-2xl blur-xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
