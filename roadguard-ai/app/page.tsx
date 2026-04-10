"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Shield, Camera, Bell, Activity, ArrowRight, Eye, ScanSearch, CheckCircle, Database, Image as ImageIcon, Type, Gauge, Flag, Calendar, Cpu, Layers, LayoutDashboard, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { scrollY } = useScroll();
  const yBackground = useTransform(scrollY, [0, 1000], [0, 200]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

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
    if (!isAuthenticated) {
      alert("Login required to access live monitoring");
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

  const timelineVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full mb-10 overflow-hidden bg-[#050505]">

      {/* Background Decor - Parallax Image */}
      <motion.div
        style={{ y: yBackground }}
        className="absolute inset-0 z-0 pointer-events-none h-[130vh] overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <Image
            src="/photo/hero-bg.jpg"
            alt="City Traffic"
            fill
            className="object-cover opacity-40"
            priority
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505]" />
        </motion.div>
      </motion.div>

      {/* HERO SECTION */}
      <section id="hero" className="min-h-[100vh] flex flex-col justify-center items-center text-center px-4 relative z-10 pt-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="flex flex-col items-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center space-x-2 bg-black/40 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-lg"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-sm text-gray-300 font-medium tracking-wide">System Active</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-black text-white tracking-tight mb-6 drop-shadow-xl"
          >
            IndianRoad<span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">.AI</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="max-w-2xl text-xl text-gray-400 mb-10 leading-relaxed"
          >
            Smart Helmet & Traffic Violation Detection System powered by next-generation computer vision.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto gap-2 group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.25)] border-0 hover:scale-105 transition-all duration-300"
              onClick={(e) => handleProtectedAction(e, '/dashboard')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 group border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white transition-all duration-300"
              onClick={(e) => handleProtectedAction(e, '/dashboard')}
            >
              View Live Demo
              <Camera className="w-5 h-5 opacity-70 group-hover:text-white transition-colors" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ROAD SAFETY STATISTICS */}
      <section id="crisis" className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          variants={scrollVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Road Safety <span className="text-red-500 drop-shadow-md">Crisis</span></h2>
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
            <Link href="/articles/helmet-negligence" className="group block h-full">
              <Card glow="none" className="h-full flex flex-col items-center text-center p-8 border-red-500/20 bg-red-500/5 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-500 relative overflow-hidden">
                <Activity className="w-12 h-12 text-red-500 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-5xl font-black text-white mb-2">70%</h3>
                <p className="text-gray-400 mb-6">Two-wheeler fatalities involve helmet negligence</p>
                <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-red-400 font-bold text-sm">
                  Read Research <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={scrollVariants}>
            <Link href="/articles/accident-statistics" className="group block h-full">
              <Card glow="none" className="h-full flex flex-col items-center text-center p-8 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-500 relative overflow-hidden">
                <Shield className="w-12 h-12 text-orange-500 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-5xl font-black text-white mb-2">1.5M+</h3>
                <p className="text-gray-400 mb-6">Annual road accidents globally primarily due to rule breaking</p>
                <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-orange-400 font-bold text-sm">
                  Read Research <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={scrollVariants}>
            <Link href="/articles/manual-enforcement" className="group block h-full">
              <Card glow="none" className="h-full flex flex-col items-center text-center p-8 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 relative overflow-hidden">
                <Bell className="w-12 h-12 text-yellow-500 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-5xl font-black text-white mb-2">Manual</h3>
                <p className="text-gray-400 mb-6">Current enforcement is highly inefficient and error-prone</p>
                <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-yellow-400 font-bold text-sm">
                  Read Research <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* SOLUTION OVERVIEW & FEATURES */}
      <section id="solution" className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          variants={scrollVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Our <span className="bg-gradient-to-r from-green-400 to-cyan-500 text-transparent bg-clip-text">Solution</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">An autonomous end-to-end pipeline replacing manual vigilance with accurate AI models.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          className="grid md:grid-cols-4 gap-6"
        >
          {/* Bento Item 1: Wide */}
          <motion.div variants={scrollVariants} className="md:col-span-2">
            <Link href="/features/helmet-detection" className="group block h-full">
              <Card glow="blue" spotlightColor="rgba(34,211,238,0.15)" className="h-full flex flex-col justify-end min-h-[300px] p-8 border border-cyan-500/20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#111] to-[#111]">
                <ScanSearch className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-bold text-white mb-2">Autonomous Helmet Detection</h3>
                <p className="text-gray-400 mb-8">YOLOv8 scanning 60fps live feeds instantly penalizing offenders at edge speed.</p>
                <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-cyan-400 font-bold text-sm">
                  Explore Technology <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Bento Item 2: Square */}
          <motion.div variants={scrollVariants} className="md:col-span-2">
            <Link href="/features/ocr-plate-extraction" className="group block h-full">
              <Card glow="green" spotlightColor="rgba(74,222,128,0.15)" className="h-full flex flex-col justify-end min-h-[300px] p-8 border border-green-500/20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/40 via-[#111] to-[#111]">
                <Eye className="w-10 h-10 text-green-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-bold text-white mb-2">OCR Plate Extraction</h3>
                <p className="text-gray-400 mb-8">Pinpoint accuracy in isolating vehicle numbers during high-speed movement.</p>
                <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-green-400 font-bold text-sm">
                  Explore Technology <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Bento Item 3: Full Width */}
          <motion.div variants={scrollVariants} className="md:col-span-4">
            <Link href="/features/e-challan-pipeline" className="group block h-full">
              <Card glow="blue" spotlightColor="rgba(255,255,255,0.08)" className="h-full flex flex-col md:flex-row items-center p-8 bg-[#0a0a0a] border border-white/10">
                <div className="flex-1 text-left mb-8 md:mb-0 md:mr-8 flex flex-col h-full justify-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">Realtime E-Challan Pipeline</h3>
                  <p className="text-gray-400 max-w-lg text-lg leading-relaxed mb-6">
                    Automatically generates verifiable visual evidence and pushes directly to the central dashboard for rapid ticketing.
                  </p>
                  <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center text-blue-400 font-bold text-sm">
                    Explore Technology <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>

                {/* Custom CSS Mini-Chart Visual */}
                <div className="w-full md:w-1/2 flex items-end justify-between h-[200px] border border-white/5 bg-black rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  {[35, 60, 45, 85, 55, 95, 70, 90, 60, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ delay: 0.1 * i, duration: 0.8, type: "spring" }}
                      className="w-[8%] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md shadow-[0_0_15px_rgba(34,211,238,0.3)] relative group-hover:from-blue-500 group-hover:to-cyan-300 transition-colors"
                    />
                  ))}
                  <div className="absolute top-4 left-6 py-1 px-3 bg-white/10 backdrop-blur-md rounded border border-white/20 text-xs font-mono text-cyan-100">
                    SYSTEM LOAD
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* CHALLENGES SECTION */}
      <section id="challenges" className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          variants={scrollVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Challenges We <span className="text-cyan-400">Faced</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Overcoming technical hurdles to build a robust safety enforcement system.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10%" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { title: "Limited Dataset", desc: "Initially had very small dataset for helmet detection", icon: Database },
            { title: "Data Quality Issues", desc: "Variations in lighting, angles, and occlusions affected accuracy", icon: ImageIcon },
            { title: "OCR Accuracy Challenges", desc: "Number plate recognition inconsistent in low-light or motion blur", icon: Type },
            { title: "Real-time Performance", desc: "Balancing detection accuracy with low latency was difficult", icon: Gauge },
          ].map((challenge, idx) => (
            <motion.div key={idx} variants={scrollVariants}>
              <Card glow="none" className="h-full border border-white/5 bg-white/5 backdrop-blur-sm p-6 hover:-translate-y-2 hover:border-cyan-500/30 transition-all duration-300">
                <challenge.icon className="w-10 h-10 text-cyan-400 mb-4 opacity-80" />
                <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{challenge.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PROJECT JOURNEY SECTION */}
      <section id="journey" className="py-24 px-6 relative z-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-10%" }}
            variants={scrollVariants}
            className="text-center mb-20"
          >
            <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4">From Idea to Implementation</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Project <span className="bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text">Journey</span></h2>
          </motion.div>

          <div className="relative overflow-x-auto pb-12 hide-scrollbar">
            <div className="min-w-[1000px] md:min-w-0 relative h-[450px] flex flex-col justify-center">
              {/* Timeline Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent transform -translate-y-1/2" />

              <div className="grid grid-cols-6 h-full items-center relative z-10">
                {[
                  { month: "July,2025", desc: "Project planning started", icon: Flag },
                  { month: "September,2025", desc: "Topic finalized", icon: Target },
                  { month: "October,2025", desc: "Dataset collection", icon: Database },
                  { month: "December,2025", desc: "Model training", icon: Cpu },
                  { month: "March,2026", desc: "Dataset expansion", icon: Layers },
                  { month: "April,2026", desc: "Website development", icon: LayoutDashboard },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={timelineVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="relative flex flex-col items-center justify-center h-full"
                  >
                    {/* Desktop Card (Alternating) */}
                    <div className={`absolute left-4 right-4 hidden md:block ${idx % 2 === 0 ? "bottom-[calc(50%+40px)]" : "top-[calc(50%+40px)]"}`}>
                      <Card glow="none" className="bg-[#0a0a0a]/60 border border-white/10 p-4 text-center hover:border-cyan-500/40 transition-colors">
                        <p className="text-cyan-400 text-xs font-bold mb-1">{item.month} {item.detail}</p>
                        <p className="text-gray-300 text-xs leading-snug">{item.desc}</p>
                      </Card>
                    </div>

                    {/* Dot on the Line */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.9)] z-20 border-4 border-[#050505]" />
                      <div className="absolute w-10 h-10 rounded-full bg-cyan-500/20 animate-ping" />

                      {/* Mobile Card (Below dot) */}
                      <div className="absolute top-8 w-40 md:hidden">
                        <Card glow="none" className="bg-[#0a0a0a]/60 border border-white/10 p-3 text-center">
                          <p className="text-cyan-400 text-xs font-bold mb-1">{item.month} {item.detail}</p>
                          <p className="text-gray-300 text-xs">{item.desc}</p>
                        </Card>
                      </div>
                    </div>

                    {/* Desktop Icon Indicator */}
                    <div className={`absolute left-0 right-0 flex justify-center hidden md:flex ${idx % 2 === 0 ? "top-[calc(50%+20px)]" : "bottom-[calc(50%+20px)]"}`}>
                      <item.icon className="w-4 h-4 text-cyan-400 opacity-30" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM IN ACTION / DEPLOYMENT */}
      <section id="action" className="py-24 px-6 relative z-10 w-full bg-[#0a0a0a]/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-10%" }}
            variants={scrollVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">System in <span className="bg-gradient-to-r from-green-400 to-cyan-500 text-transparent bg-clip-text">Action</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Real-world deployments scanning road tracking metrics across Indian highways and city junctions.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} variants={scrollVariants} className="group relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/photo/indian-road-${i}.jpg`} alt={`Deployment ${i}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    <span className="text-xs font-mono text-green-400 tracking-widest drop-shadow-md">LIVE • CAMERA 0{i}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg drop-shadow-md">Indian City Junction 0{i}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}