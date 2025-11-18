"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const menuItems = [
  "About",
  "Blog",
  "Customers",
  "Pricing",
  "Enterprise",
  "Changelog",
  "Documentation",
  "Contact Us",
];

export default function Component(props) {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left Content */}
        <div className="flex items-center gap-2">
          <Image src="/2.png" width={40} height={40} alt="Code Sprout Logo"/>
          <span className="ml-2 text-lg font-medium">Code Sprout</span>
        </div>

        {/* Center Content */}
        <div className="flex justify-center">
          {/* Navigation items can be added here */}
        </div>

        {/* Right Content */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="rounded-full">
            Login
          </Button>
          {props.session ? (
            <Button
              className="bg-foreground font-medium text-background rounded-full"
              onClick={() => window.location.href = "/dashboard"}
            >
              Dashboard
              <Icon icon="solar:alt-arrow-right-linear" className="ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-foreground font-medium text-background rounded-full"
            >
              Get Started
              <Icon icon="solar:alt-arrow-right-linear" className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
