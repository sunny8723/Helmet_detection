"use client";

import * as React from "react";
import { motion, HTMLMotionProps, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
  glow?: "none" | "blue" | "green";
  spotlightColor?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, glow = "none", spotlightColor = "rgba(255,255,255,0.06)", children, onMouseMove, ...props }, ref) => {
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
      if (onMouseMove) onMouseMove(e);
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={cn(
          "rounded-2xl p-6 relative overflow-hidden group transition-all duration-500",
          glass ? "bg-glass backdrop-blur-md border border-glass-border" : "bg-card border border-border shadow-sm dark:shadow-none",
          glow === "blue" && "border-glass-border hover:border-cyan-500/40 transition-colors duration-300 shadow-none hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]",
          glow === "green" && "border-glass-border hover:border-green-500/40 transition-colors duration-300 shadow-none hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(74,222,128,0.1)]",
          className
        )}
        {...props}
      >
        {/* Dynamic Framer Motion Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                ${spotlightColor},
                transparent 80%
              )
            `,
          }}
        />
        
        {/* Content Container protecting text from spotlight overlap */}
        <motion.div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </motion.div>
      </motion.div>
    );
  }
);

Card.displayName = "Card";
