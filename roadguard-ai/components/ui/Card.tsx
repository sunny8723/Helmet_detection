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
          glow === "blue" && "hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] border-transparent hover:border-cyan-500/50 transition-all duration-300",
          glow === "green" && "hover:shadow-[0_8px_30px_rgba(74,222,128,0.15)] border-transparent hover:border-green-500/50 transition-all duration-300",
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
