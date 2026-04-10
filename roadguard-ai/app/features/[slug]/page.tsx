"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ScanSearch, Eye, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

// Content Dictionary for dynamic slug rendering
const featureContent: Record<string, any> = {
  "helmet-detection": {
    title: "Autonomous Helmet Detection",
    subtitle: "Real-time edge computing powered by YOLOv8",
    icon: <ScanSearch className="w-16 h-16 text-cyan-400 mb-6" />,
    color: "cyan",
    body: "Our custom-trained YOLOv8 object detection model scans high-resolution camera feeds at 60fps to identify two-wheeler riders. The neural network calculates bounding boxes with pinpoint accuracy and runs a fast secondary classification pass to verify the existence of safety helmets.",
    stats: [
      { label: "Processing Speed", value: "< 20ms" },
      { label: "Detection Accuracy", value: "98.5%" },
      { label: "FPS Capacity", value: "60+" }
    ]
  },
  "ocr-plate-extraction": {
    title: "OCR Plate Extraction",
    subtitle: "Automatic Number Plate Recognition (ANPR)",
    icon: <Eye className="w-16 h-16 text-green-400 mb-6" />,
    color: "green",
    body: "Upon detecting a helmet violation, the frame is targeted and frozen. Advanced Optical Character Recognition (OCR) algorithms dynamically adjust for motion blur and poor lighting to isolate and extract the alphanumeric characters from the vehicle's standard number plate.",
    stats: [
      { label: "Reading Time", value: "0.2s" },
      { label: "Night Vision", value: "Supported" },
      { label: "Error Rate", value: "< 2%" }
    ]
  },
  "e-challan-pipeline": {
    title: "Realtime E-Challan Pipeline",
    subtitle: "Automated Evidence Generation & Ticketing",
    icon: <CheckCircle className="w-16 h-16 text-blue-400 mb-6" />,
    color: "blue",
    body: "Extracted vehicle numbers and high-definition violation snapshot evidence are aggregated and securely pushed to central authority dashboards. The system automatically drafts the e-challan log and queues it for administrative execution without human bottlenecks.",
    stats: [
      { label: "Uptime", value: "99.9%" },
      { label: "Data Pipeline", value: "Encrypted WebSocket" },
      { label: "Dashboard Sync", value: "Real-time" }
    ]
  }
};

export default function FeaturePage() {
  const pathname = usePathname();
  const slug = pathname?.split("/").pop() || "";
  const content = featureContent[slug];

  if (!content) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
         <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
         <h1 className="text-3xl font-bold">Feature Not Found</h1>
         <Link href="/" className="mt-8 text-cyan-400 hover:underline flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <Navbar />
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] opacity-[0.03] blur-[100px] rounded-full bg-white" />
         <div className={`absolute top-[40%] right-[10%] w-[30%] h-[50%] opacity-[0.05] blur-[120px] rounded-full bg-${content.color}-500`} />
         <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-black" />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-32 relative z-10 flex flex-col">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center mb-16 inline-flex w-max">
           <ArrowLeft className="w-5 h-5 mr-3" /> Back to Overview
        </Link>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="w-full flex flex-col items-center text-center"
        >
           <motion.div 
             initial={{ scale: 0 }} 
             animate={{ scale: 1 }} 
             transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
           >
              {content.icon}
           </motion.div>
           
           <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-xl">
             {content.title}
           </h1>
           <p className={`text-xl md:text-2xl font-mono text-${content.color}-400 mb-12`}>
             {content.subtitle}
           </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="w-full max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-14 backdrop-blur-md shadow-2xl relative overflow-hidden group"
        >
           <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-transparent to-${content.color}-500/10 pointer-events-none rounded-3xl`} />
           
           <p className="text-gray-300 text-xl leading-relaxed mb-16 font-light">
             {content.body}
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {content.stats.map((stat: any, idx: number) => (
               <div key={idx} className="flex flex-col border-l border-white/10 pl-6">
                 <span className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-2">{stat.label}</span>
                 <span className="text-3xl font-black text-white tracking-widest">{stat.value}</span>
               </div>
             ))}
           </div>
        </motion.div>
      </main>
    </div>
  );
}
