"use client";

import { motion, Variants } from "framer-motion";
import { Shield, Camera, Bell, Activity, ArrowRight, Eye, ScanSearch, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScrollY) > 10) {
        const direction = scrollY > lastScrollY ? "down" : "up";
        if (direction !== scrollDirection) {
          setScrollDirection(direction);
        }
        lastScrollY = scrollY > 0 ? scrollY : 0;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDirection]);

  const handleProtectedAction = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    const auth = localStorage.getItem("isAuthenticated");
    if (!auth) {
      alert("⚠️ Access Denied: Please sign in to continue");
      router.push("/login");
    } else {
      router.push(path);
    }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Horizontal scroll animation matching requirements
  const scrollVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: scrollDirection === "down" ? -300 : 300 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } // Smooth snap transition
    }
  };

  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full mb-10 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] opacity-[0.15] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[40%] h-[40%] bg-[var(--neon-green)] opacity-[0.1] blur-[150px] rounded-full pointer-events-none" />

      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 relative z-10">
        <motion.div
           initial="hidden"
           animate="visible"
           variants={fadeInUp}
           className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] shadow-[0_0_8px_var(--neon-green)] animate-pulse" />
          <span className="text-sm text-gray-300 font-medium tracking-wide">System Active</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-white tracking-tight mb-4"
        >
          RoadGuard<span className="text-glow-blue text-[var(--neon-blue)]">.AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl text-xl text-gray-400 mb-10"
        >
          Smart Helmet & Traffic Violation Detection System powered by next-generation computer vision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <Button 
            variant="neon" 
            size="lg" 
            className="w-full sm:w-auto gap-2 group"
            onClick={(e) => handleProtectedAction(e, '/dashboard')}
          >
            Get Started 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto gap-2 group border-gray-600 hover:border-gray-400"
            onClick={(e) => handleProtectedAction(e, '/dashboard')}
          >
            View Live Demo 
            <Camera className="w-5 h-5 opacity-70 group-hover:text-white transition-colors" />
          </Button>
        </motion.div>
      </section>

      {/* ROAD SAFETY STATISTICS */}
      <section className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          variants={scrollVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Road Safety <span className="text-red-500 text-glow-red">Crisis</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Understanding the magnitude of traffic violations and the urgent need for AI intervention.</p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
           className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={scrollVariants}>
            <Card glow="none" className="h-full flex flex-col items-center text-center p-8 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors duration-300">
              <Activity className="w-12 h-12 text-red-500 mb-6 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <h3 className="text-5xl font-black text-white mb-2">70%</h3>
              <p className="text-gray-400">Two-wheeler fatalities involve helmet negligence</p>
            </Card>
          </motion.div>

          <motion.div variants={scrollVariants}>
            <Card glow="none" className="h-full flex flex-col items-center text-center p-8 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors duration-300">
               <Shield className="w-12 h-12 text-orange-500 mb-6 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              <h3 className="text-5xl font-black text-white mb-2">1.5M+</h3>
              <p className="text-gray-400">Annual road accidents globally primarily due to rule breaking</p>
            </Card>
          </motion.div>

          <motion.div variants={scrollVariants}>
             <Card glow="none" className="h-full flex flex-col items-center text-center p-8 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors duration-300">
               <Bell className="w-12 h-12 text-yellow-500 mb-6 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              <h3 className="text-5xl font-black text-white mb-2">Manual</h3>
               <p className="text-gray-400">Current enforcement is highly inefficient and error-prone</p>
            </Card>
           </motion.div>
        </motion.div>
      </section>

      {/* SOLUTION OVERVIEW & FEATURES */}
      <section className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: false, margin: "-10%" }}
          variants={scrollVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Our <span className="text-[var(--neon-green)] text-glow-green">Solution</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">An autonomous end-to-end pipeline replacing manual vigilance with accurate AI models.</p>
        </motion.div>

        <motion.div 
           variants={staggerContainer}
           initial="hidden"
           whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          className="grid md:grid-cols-3 gap-6"
        >
          <motion.div variants={scrollVariants}>
            <Card glow="blue" className="group h-full flex flex-col">
              <div className="w-14 h-14 bg-[var(--neon-blue)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--neon-blue)]/20 transition-colors">
                <ScanSearch className="w-7 h-7 text-[var(--neon-blue)] drop-shadow-[0_0_5px_var(--neon-blue)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Helmet Detection
              </h3>
              <p className="text-gray-400 leading-relaxed flex-1">
                YOLO-based classification model scanning live feeds to detect riders with or without safety helmets in real-time.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={scrollVariants}>
            <Card glow="green" className="group h-full flex flex-col">
              <div className="w-14 h-14 bg-[var(--neon-green)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--neon-green)]/20 transition-colors">
                <Eye className="w-7 h-7 text-[var(--neon-green)] drop-shadow-[0_0_5px_var(--neon-green)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                OCR Plate Recognition
              </h3>
              <p className="text-gray-400 leading-relaxed flex-1">
                Automatic number plate recognition (ANPR) isolates rule-breakers, accurately extracting vehicle plates using OCR.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={scrollVariants}>
             <Card glow="blue" className="group h-full flex flex-col">
              <div className="w-14 h-14 bg-[var(--neon-blue)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--neon-blue)]/20 transition-colors">
                 <CheckCircle className="w-7 h-7 text-[var(--neon-blue)] drop-shadow-[0_0_5px_var(--neon-blue)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Instant Alerts
              </h3>
              <p className="text-gray-400 leading-relaxed flex-1">
                Generates verifiable visual evidence linked to authorities dashboard for automated e-challan ticketing systems.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

    </main>
  );
}