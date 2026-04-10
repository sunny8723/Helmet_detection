"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Activity, 
  Zap, 
  AlertTriangle, 
  Flag, 
  Camera,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "hero", label: "Home", icon: Home },
  { id: "crisis", label: "Crisis", icon: Activity },
  { id: "solution", label: "Solution", icon: Zap },
  { id: "challenges", label: "Challenges", icon: AlertTriangle },
  { id: "journey", label: "Journey", icon: Flag },
  { id: "action", label: "Action", icon: Camera },
];

export function SideNav() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("hero");
  const [isHovered, setIsHovered] = useState(false);

  // Intersection Observer to track active section
  useEffect(() => {
    if (pathname !== "/") return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Trigger when section is in top-middle of screen
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Only show on the home page
  if (pathname !== "/") return null;

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col space-y-4 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="relative cursor-pointer group outline-none"
          >
            <div className={`p-3 rounded-xl transition-all duration-300 flex items-center ${
              activeSection === item.id 
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
              : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
            }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: "auto" }}
                    exit={{ opacity: 0, x: -10, width: 0 }}
                    className="ml-3 text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Indicator Dot */}
              {activeSection === item.id && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -left-1 w-1 h-4 bg-cyan-500 rounded-full"
                />
              )}
            </div>

            {/* Tooltip (Fallback when not hovered) */}
            {!isHovered && (
              <div className="absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[110]">
                {item.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-cyan-500" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Expand Indicator */}
      <motion.div 
        animate={{ x: isHovered ? 10 : 0, opacity: isHovered ? 0 : 1 }}
        className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-cyan-500/30"
      >
        <ChevronRight className="w-4 h-4 animate-pulse" />
      </motion.div>
    </motion.div>
  );
}
