"use client";

import { motion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Shield, Camera, Bell, Activity, ArrowRight, Eye, ScanSearch, CheckCircle, Database, Image as ImageIcon, Type, Gauge, Flag, Calendar, Cpu, Layers, LayoutDashboard, Target, Zap, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";

export default function Home() {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalViolations, setTotalViolations] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const { scrollY } = useScroll();
  const yBackground = useTransform(scrollY, [0, 1000], [0, 200]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "violations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalViolations(snapshot.size);
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
            <span className="text-sm text-gray-300 font-medium tracking-wide">
              {totalViolations > 0 ? `${totalViolations} Violations Stopped` : "System Active"}
            </span>
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
                <p className="text-gray-400 mb-8">YOLOv8 scanning 8.5 FPS live feeds with 91% helmet detection precision.</p>
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

      {/* AI PLAYGROUND SECTION */}
      <section id="playground" className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-black text-white mb-6">Experience <span className="text-cyan-400">AI Logic</span></h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Our YOLOv8 custom models aren't just software; they're digital eagle eyes. Click below to see how the system identifies violations in a fraction of a second.
            </p>
            <div className="space-y-4">
              {[
                { title: "Object Detection", detail: "YOLOv8 Performance Engine" },
                { title: "Confidence Scoring", detail: "90.7% Helmet mAP" },
                { title: "Inference Latency", detail: "117ms per Frame" }
              ].map((feat, i) => (
                <div key={i} className="flex items-center space-x-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  <span><strong className="text-white">{feat.title}:</strong> {feat.detail}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                setIsScanning(true);
                setTimeout(() => { setIsScanning(false); setScanComplete(true); }, 2000);
              }}
              className="mt-10 bg-cyan-500 hover:bg-cyan-400 text-black font-black px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95"
            >
              {scanComplete ? "Rescan Environment" : "Start Live AI Scan"}
            </Button>
          </motion.div>

          <Card className="p-0 overflow-hidden aspect-video relative border-cyan-500/30 group bg-black shadow-2xl">
            {/* Sample Street Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photo/test4.png"
              alt="AI Playground Scene"
              className={`w-full h-full object-cover transition-all duration-1000 ${isScanning ? "brightness-50 grayscale" : "brightness-75 group-hover:brightness-100"}`}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />

            {/* Scanning Laser Line */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgb(34,211,238)] z-20"
                />
              )}
            </AnimatePresence>

            {/* Detection Box Simulation */}
            <AnimatePresence>
              {scanComplete && !isScanning && (
                <>
                  {/* Bounding Box 1 - Head */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-[12%] left-[44%] w-[80px] h-[100px] border-2 border-green-500 z-30 flex flex-col justify-start"
                  >
                    <span className="bg-green-500 text-black text-[10px] font-black px-1.5 py-0.5 uppercase tracking-tighter">Helmet: OK</span>
                    <span className="bg-black/60 text-white text-[8px] px-1 font-mono">Conf: 0.98</span>
                  </motion.div>

                  {/* Bounding Box 2 - Plate */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-[68%] left-[43%] w-[100px] h-[60px] border-2 border-cyan-500 z-30 flex flex-col justify-end"
                  >
                    <span className="bg-black/60 text-white text-[8px] px-1 font-mono text-right">Plate: MH 12 AB 1234</span>
                    <span className="bg-cyan-500 text-black text-[10px] font-black px-1.5 py-0.5 uppercase tracking-tighter text-right">Plate: DETECTED</span>
                  </motion.div>

                  {/* Data Streaming Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-4 left-4 font-mono text-[8px] text-cyan-400 space-y-1">
                      <p>LAT: 22.5726</p>
                      <p>LONG: 88.3639</p>
                      <p>TEMP: 32C</p>
                    </div>
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Status Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-yellow-500 animate-pulse" : scanComplete ? "bg-green-500" : "bg-white/20"}`} />
              <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest leading-none">
                {isScanning ? "Processing..." : scanComplete ? "Detections Found" : "Standby"}
              </span>
            </div>
          </Card>
        </div>
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
                  { month: "July,2025", detail: "Mid", desc: "Project planning started", icon: Flag },
                  { month: "September,2025", detail: "Mid", desc: "Topic finalized", icon: Target },
                  { month: "October,2025", detail: "Mid", desc: "Dataset collection", icon: Database },
                  { month: "December,2025", detail: "Mid", desc: "Model training", icon: Cpu },
                  { month: "March,2026", detail: "Mid", desc: "Dataset expansion", icon: Layers },
                  { month: "April,2026", detail: "1", desc: "Website development", icon: LayoutDashboard },
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

      {/* COMPARISON SLIDER SECTION */}
      <section id="comparison" className="py-24 px-6 relative z-10 w-full overflow-hidden bg-[radial-gradient(circle_at_center,_#0a0a0a_0%,_#050505_100%)]">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">The <span className="text-cyan-400">AI Advantage</span></h2>
            <p className="text-gray-400 text-lg">See how IndianRoad AI transforms traditional monitoring into an automated enforcement engine.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-1 px-4 md:px-0">
            {/* MANUAL VIEW */}
            <div className="relative group overflow-hidden rounded-l-2xl border-y border-l border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photo/test4.png" alt="Manual Monitoring" className="w-full h-[400px] object-cover grayscale opacity-50" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-400 uppercase tracking-tighter">Manual Monitoring</h3>
                <p className="text-gray-500 text-sm mt-2 font-mono">Inefficient • High Error Rate • Limited Reach</p>
              </div>
              <div className="absolute top-4 left-4 py-1 px-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">TRADITIONAL</div>
            </div>

            {/* AI VIEW */}
            <div className="relative group overflow-hidden rounded-r-2xl border-y border-r border-cyan-500/30 shadow-[20px_0_50px_-10px_rgba(6,182,212,0.15)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photo/test4.png" alt="AI Monitoring" className="w-full h-[400px] object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 to-transparent flex flex-col items-center justify-center p-8 text-center">
                <Zap className="w-12 h-12 text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">IndianRoad<span className="text-cyan-400">.AI</span></h3>
                <p className="text-cyan-200/60 text-sm mt-2 font-mono">91% Helmet Accuracy • Instant Ticketing • 24/7 Ops</p>

                {/* Simulated Bounding Boxes - Adjusted for test4.png */}
                <div className="absolute top-[12%] left-[44%] w-20 h-24 border-2 border-green-500 rounded sm:flex hidden flex-col">
                  <span className="bg-green-500 text-black text-[8px] font-black px-1 uppercase">Helmet: OK</span>
                </div>
                <div className="absolute top-[68%] left-[43%] w-24 h-12 border-2 border-cyan-500 rounded sm:flex hidden flex-col justify-end">
                  <span className="bg-cyan-500 text-black text-[8px] font-black px-1 uppercase w-fit">Plate: DETECTED</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 py-1 px-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">AUTONOMOUS MODE</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SYSTEM ARCHITECTURE SECTION */}
      <section className="py-24 px-6 relative z-10 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">How the <span className="text-cyan-400">Engine</span> Works</h2>
          <p className="text-gray-500 mt-2 tracking-wide font-mono text-sm uppercase">Cloud-Edge Hybrid Enforcement Pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "Capture", desc: "Edge devices stream 4K frames to the cloud engine.", icon: Camera, color: "blue" },
            { title: "Identify", desc: "YOLOv8 detects helmets & number plate ROI.", icon: ScanSearch, color: "green" },
            { title: "Validate", desc: "Firestore syncs violation history instantly.", icon: Database, color: "blue" },
            { title: "Enforce", desc: "E-Challan generated & pushed to Dashboard.", icon: Bell, color: "red" },
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <Card glow="none" className="h-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors p-8 text-center">
                <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl bg-black border border-white/10 flex items-center justify-center`}>
                  <step.icon className={`w-7 h-7 ${idx % 2 === 0 ? "text-cyan-400" : "text-green-400"}`} />
                </div>
                <h4 className="text-white font-bold mb-2">{idx + 1}. {step.title}</h4>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </Card>
              {idx < 3 && (
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden md:block z-20">
                  <ChevronRight className="w-8 h-8 text-white/10" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </main>

  );
}