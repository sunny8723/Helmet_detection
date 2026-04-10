"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, AlertTriangle, CheckCircle, Clock, Zap, Target, Activity, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Violation {
  id: string;
  plate: string;
  time: string;
  image: string;
  latency: number;
  confidence: number;
  violation: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [metrics, setMetrics] = useState({ latency: 0, accuracy: 0, total: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (!auth) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsRefreshing(true);
    const q = query(collection(db, "violations"));
    
    // Set up a real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Violation[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Violation);
      });
      
      setViolations(data);
      if (data.length > 0) {
        const avgLat = data.reduce((acc, curr) => acc + (curr.latency || 0), 0) / data.length;
        const avgConf = data.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / data.length;
        setMetrics({
          latency: Number(avgLat.toFixed(3)),
          accuracy: Math.round(avgConf * 100),
          total: data.length
        });
      } else {
        setMetrics({ latency: 0, accuracy: 0, total: 0 });
      }
      setIsRefreshing(false);
    }, (err) => {
      console.error("Could not fetch violations from Firebase:", err);
      setIsRefreshing(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [isAuthenticated]);

  const fetchViolations = () => {
    // We keep this function stub for the refresh button, but it's largely unnecessary now
    // as onSnapshot handles updates automatically. We can play an animation.
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchViolations();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="flex-1 p-6 relative w-full h-full flex flex-col items-center justify-center">
         <div className="w-10 h-10 border-4 border-[var(--neon-blue)]/30 border-t-[var(--neon-blue)] rounded-full animate-spin"></div>
         <p className="mt-4 text-gray-400 font-mono text-sm animate-pulse tracking-widest">VERIFYING CREDENTIALS...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 relative w-full h-full max-w-[1600px] mx-auto overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-black text-white">Live Monitoring</h1>
          <p className="text-gray-400">RoadGuard AI System Status: <span className="text-[var(--neon-green)] font-medium">Online</span></p>
        </div>
      </motion.div>

      {/* AI METRICS TOP SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card glow="blue" className="bg-[#0a0a0a]/80 border border-[var(--neon-blue)]/30 flex items-center p-5">
           <Zap className="w-12 h-12 text-[var(--neon-blue)] mr-5 drop-shadow-[0_0_8px_var(--neon-blue)]" />
           <div>
             <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Avg Latency</p>
             <h3 className="text-3xl font-black text-white">{metrics.latency}s</h3>
           </div>
        </Card>
        <Card glow="green" className="bg-[#0a0a0a]/80 border border-[var(--neon-green)]/30 flex items-center p-5">
           <Target className="w-12 h-12 text-[var(--neon-green)] mr-5 drop-shadow-[0_0_8px_var(--neon-green)]" />
           <div>
             <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Accuracy</p>
             <h3 className="text-3xl font-black text-white">{metrics.accuracy}%</h3>
           </div>
        </Card>
        <Card glow="none" className="bg-[#0a0a0a]/80 border border-orange-500/30 flex items-center p-5">
           <Activity className="w-12 h-12 text-orange-500 mr-5 drop-shadow-[0_0_8px_rgb(249,115,22)]" />
           <div>
             <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Violations</p>
             <h3 className="text-3xl font-black text-white">{metrics.total}</h3>
           </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        
        {/* LEFT COLUMN: LIVE FEED (Takes 2 columns on lg) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card glow="blue" className="h-full min-h-[500px] flex flex-col relative overflow-hidden border border-[var(--neon-blue)]/30">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-[var(--neon-blue)]/50">
              <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse shadow-[0_0_10px_var(--neon-green)]" />
              <span className="text-sm font-bold text-white tracking-wider">CAM_01_MAIN_JUNCTION</span>
            </div>
            
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex items-center shadow-lg">
              <Camera className="w-4 h-4 mr-2 text-gray-300" />
              <span className="text-sm font-bold font-mono tracking-widest text-red-500 animate-pulse">REC</span>
            </div>

            {/* Simulating Camera Feed Box */}
            <div className="flex-1 w-full bg-[#050505] rounded-xl flex items-center justify-center relative overflow-hidden group border border-white/5">
              {/* High-visibility Scanning line */}
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                className="absolute left-0 w-full h-[3px] bg-[var(--neon-blue)] opacity-90 shadow-[0_0_15px_3px_var(--neon-blue)] z-20 pointer-events-none"
              />
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />
              
              {/* Crosshair decoration */}
              <div className="absolute w-full h-full pointer-events-none z-10">
                <div className="absolute top-[20%] left-[20%] w-10 h-10 border-t-2 border-l-2 border-[var(--neon-green)]/70" />
                <div className="absolute top-[20%] right-[20%] w-10 h-10 border-t-2 border-r-2 border-[var(--neon-green)]/70" />
                <div className="absolute bottom-[20%] left-[20%] w-10 h-10 border-b-2 border-l-2 border-[var(--neon-green)]/70" />
                <div className="absolute bottom-[20%] right-[20%] w-10 h-10 border-b-2 border-r-2 border-[var(--neon-green)]/70" />
              </div>

              {/* Live Video Embedded Display */}
              <img 
                src="http://127.0.0.1:5000/video_feed" 
                alt="Live Camera Feed" 
                className="w-[95%] h-[95%] rounded border border-white/10 object-cover relative z-10 shadow-[0_0_20px_var(--neon-blue)]" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-msg')) {
                     const fallback = document.createElement('div');
                     fallback.className = 'flex flex-col items-center fallback-msg relative z-10 mt-8';
                     fallback.innerHTML = `
                       <svg class="w-16 h-16 text-white/5 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>
                       </svg>
                       <p class="text-red-500/80 font-mono text-sm uppercase tracking-widest text-center px-4">
                         Video Stream Offline.<br/>
                         <span class="text-white/30 text-xs">Run 'python main.py' to start the backend.</span>
                       </p>
                     `;
                     parent.appendChild(fallback);
                  }
                }} 
              />
            </div>
          </Card>
        </motion.div>

        {/* RIGHT COLUMN: VIOLATIONS */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-1 flex flex-col"
        >
          <Card glow="none" className="h-full flex flex-col p-5 bg-[#0a0a0a]/90 backdrop-blur-sm border-gray-800">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h2 className="text-xl font-bold flex items-center text-white">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2 drop-shadow-[0_0_5px_rgb(249,115,22)]" />
                Recent Violations
              </h2>
              <button 
                onClick={fetchViolations}
                disabled={isRefreshing}
                className="p-1.5 text-gray-400 hover:text-[var(--neon-blue)] transition-colors hover:bg-[var(--neon-blue)]/10 rounded-md focus:outline-none"
                aria-label="Refresh Data"
              >
                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[var(--neon-blue)]" : ""}`} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {violations.map((v, i) => {
                 let colorClasses = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                 if (v.violation === "No Helmet") colorClasses = "text-red-400 bg-red-500/10 border-red-500/20";
                 else if (v.violation === "Speeding") colorClasses = "text-orange-400 bg-orange-500/10 border-orange-500/20";

                 return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-start space-x-3 hover:border-gray-600 transition-all cursor-pointer group hover:bg-[#1a1a1a]"
                  >
                    {/* Thumbnail Placeholder */}
                    <div className="w-16 h-16 bg-black rounded-lg overflow-hidden relative border border-gray-800 group-hover:border-gray-600 transition-colors shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-mono font-bold text-gray-200 truncate">{v.plate}</h4>
                        <span className="text-xs text-gray-500 flex items-center shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {v.time}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className={`px-2 py-0.5 border text-xs rounded font-medium truncate ${colorClasses}`}>
                          {v.violation}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                 );
              })}
            </div>
            
            <button className="w-full mt-4 py-2.5 text-sm font-medium text-[var(--neon-blue)] hover:text-white border border-[var(--neon-blue)]/30 hover:bg-[var(--neon-blue)]/20 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)]/50">
              View All Events
            </button>
          </Card>
        </motion.div>
      </div>

       {/* BOTTOM SECTION: RECORDS TABLE */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
       >
         <Card glow="none" className="p-0 overflow-hidden border border-gray-800 bg-[#0a0a0a]/90 backdrop-blur-md">
           <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#111]">
             <h3 className="font-bold flex items-center text-white">
               <CheckCircle className="w-5 h-5 text-[var(--neon-green)] mr-2 drop-shadow-[0_0_5px_var(--neon-green)]" />
               Automated E-Challan Logs
             </h3>
             <span className="text-sm text-gray-400">System Logs</span>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-xs uppercase bg-[#161616] text-gray-500 border-b border-gray-800 font-mono tracking-wider">
                 <tr>
                   <th className="px-6 py-4">Event ID</th>
                   <th className="px-6 py-4">Timestamp</th>
                   <th className="px-6 py-4">Vehicle Plate</th>
                   <th className="px-6 py-4">Violation Type</th>
                   <th className="px-6 py-4">Confidence</th>
                   <th className="px-6 py-4 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-800/50">
                 {violations.map((v, i) => {
                    let colorClasses = "text-yellow-400 bg-yellow-500/10";
                    if (v.violation === "No Helmet") colorClasses = "text-red-400 bg-red-500/10";
                    else if (v.violation === "Speeding") colorClasses = "text-orange-400 bg-orange-500/10";

                    return (
                     <tr key={v.id || i} className="hover:bg-[#1a1a1a] transition-colors group">
                       <td className="px-6 py-4 font-mono text-gray-400 group-hover:text-gray-300">{v.id ? `EV-${v.id.substring(0, 6).toUpperCase()}` : `EV-ERR`}</td>
                       <td className="px-6 py-4 text-gray-400">{v.time}</td>
                       <td className="px-6 py-4 font-mono font-bold text-white tracking-wider">{v.plate}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorClasses}`}>
                            {v.violation}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center">
                           <div className="w-20 h-1.5 bg-gray-800 rounded-full mr-3 overflow-hidden">
                             <div className="h-full bg-[var(--neon-green)] rounded-full shadow-[0_0_8px_var(--neon-green)]" style={{ width: `${Math.round(v.confidence * 100)}%` }}></div>
                           </div>
                           <span className="text-[var(--neon-green)] font-mono text-xs">{Math.round(v.confidence * 100)}%</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button className="px-3 py-1 text-xs font-medium text-[var(--neon-blue)] hover:text-white hover:bg-[var(--neon-blue)]/20 border border-transparent hover:border-[var(--neon-blue)]/30 rounded transition-all">Review</button>
                       </td>
                     </tr>
                    )
                 })}
               </tbody>
             </table>
           </div>
         </Card>
       </motion.div>
    </main>
  );
}
