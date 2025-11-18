import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        flat: "bg-muted text-muted-foreground",
        bordered: "border border-input bg-background",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-600 text-white",
        danger: "bg-red-600 text-white",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function Chip({ className, variant, size, color, ...props }) {
  // Map color prop to variant for compatibility
  const effectiveVariant = color === "secondary" ? "secondary" :
                          color === "success" ? "success" :
                          color === "warning" ? "warning" :
                          color === "danger" ? "danger" :
                          variant;

  return (
    <span
      className={cn(chipVariants({ variant: effectiveVariant, size, className }))}
      {...props}
    />
  );
}

export { Chip, chipVariants };
