import React, { useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import "./landing.css";
export const Navbar = ({ isAtTop }) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container mx-auto px-6">
        <nav
          className={`mt-6 flex items-center justify-between rounded-xl glass px-4 py-3`}
          style={
            isAtTop
              ? { border: "none", boxShadow: "none", maxWidth: "100%" }
              : {}
          }
        >
          <a href="#hero" className="flex items-center gap-3">
            <img
              src="/2.png"
              alt="Code Sprout logo"
              width={32}
              height={32}
              loading="eager"
            />
            <span className="font-heading font-semibold text-lg bg-[linear-gradient(var(--gradient-brand))] bg-clip-text text-transparent">
              Code Sprout
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="story-link">
              Features
            </a>
            <a href="#hero" className="story-link">
              Interactive
            </a>
            
            <Button className="glass rounded-lg transition-transform hover:scale-105 ">
              <a href="#cta" aria-label="Request a demo">
                Request a Demo
              </a>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
