"use client";

import React, { useState } from "react";
import { Button, Input } from "@heroui/react"; // Assuming this is your button component

// A simple checkmark icon component
const CheckIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const BetaCard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'

  return (
    <section id="cta" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="relative max-w-7xl mx-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 lg:p-12 ">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-zinc-900/50 blur-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Try Codesprout for Free
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8">
                Get full, unlimited access to all Code Sprout features. Your
                feedback will directly shape the future of our platform and help
                us build the best tools for educators.
              </p>
              <ul className="space-y-3 text-left mb-10">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Unlimited access to all AI grading & summary tools
                  </span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Onboard unlimited students and classes</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Priority support and direct line to our development team
                  </span>
                </li>
              </ul>
            </div>

            {/* Right Column: Interactive Demo Form */}
            <div className="relative rounded-2xl p-8 ">
              <div className="absolute inset-x-0 top-0 h-48 "></div>
              <h3 className="text-xl font-bold text-center text-white mb-6">
                Request Your Free Demo
              </h3>
              {status === "success" ? (
                <div className="text-center p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="font-semibold text-emerald-300">
                    Thank you! We've received your request and will be in touch
                    shortly.
                  </p>
                </div>
              ) : (
                // A simplified example of the form in your BetaCard component

                <form
                  action="https://formspree.io/f/xpwlnjpd" // The URL from Formspree
                  method="POST"
                  className="space-y-4"
                >
                  <Input
                    placeholder="Your Name"
                    name="name" // The 'name' attribute is important
                    required
                  />
                  <Input
                    placeholder="Your Work Email"
                    name="email" // The 'name' attribute is important
                    type="email"
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="glass rounded-lg transition-transform hover:scale-105 "
                    >
                      Request a Demo
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BetaCard;
