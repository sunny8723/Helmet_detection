"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
  glow?: "none" | "blue" | "green";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, glow = "none", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl p-6",
          glass ? "glass-panel" : "bg-[#111] border border-[#333]",
          glow === "blue" && "hover:shadow-neon-blue border-transparent hover:border-[var(--neon-blue)] transition-all duration-300",
          glow === "green" && "hover:shadow-neon-green border-transparent hover:border-[var(--neon-green)] transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
