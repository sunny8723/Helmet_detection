"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, AlertTriangle, CheckCircle, Clock, Zap, Target, Activity, RefreshCcw, History, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  const [cameraActive, setCameraActive] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
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
    if (!isAuthenticated) return;

    let interval: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const runInference = async () => {
      if (!videoRef.current || !canvasRef.current || !cameraActive) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || video.videoWidth === 0) return;

      // Optimize: 640px is the native resolution for YOLO, making it 4x faster than 720p
      canvas.width = 640;
      canvas.height = 480;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.5); // Fast compression

      try {
        const response = await fetch("http://127.0.0.1:5000/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageBase64 }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.detections) setDetections(data.detections);
        }
      } catch (err) {
        console.error("Inference Error:", err);
      } finally {
        // Adaptive polling: Only send the next frame once the current one is done
        if (cameraActive) {
          interval = setTimeout(runInference, 80); // Targeting ~12 FPS
        }
      }
    };

    startCamera();
    runInference();

    return () => {
      clearTimeout(interval);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAuthenticated, cameraActive]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchViolations();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="flex-1 p-6 relative w-full h-full flex flex-col items-center justify-center">
         <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
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
          <p className="text-gray-400">IndianRoad AI System Status: <span className="text-green-400 font-medium">Online</span></p>
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
           Inference: {detections.length > 0 ? <span className="text-green-400">ACTIVE</span> : <span className="text-gray-600">IDLE</span>} | API: 127.0.0.1:5000
        </div>
      </motion.div>

      {/* AI METRICS TOP SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card glow="blue" spotlightColor="rgba(34,211,238,0.15)" className="bg-[#0a0a0a]/80 border border-cyan-500/30 flex justify-between items-center p-6 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#111] to-[#111]">
           <div className="flex items-center">
             <Zap className="w-12 h-12 text-cyan-400 mr-5" />
             <div>
               <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Avg Latency</p>
               <h3 className="text-3xl font-black text-white">{metrics.latency}s</h3>
             </div>
           </div>
           <div className="hidden sm:flex items-end space-x-1 h-12 opacity-80">
             {[4, 2, 5, 3, 6, 4, 7, 5].map((h, i) => (
                <div key={i} className="w-2 bg-cyan-400/50 rounded-t-sm" style={{ height: `${h * 15}%` }} />
             ))}
           </div>
        </Card>

        <Card glow="green" spotlightColor="rgba(74,222,128,0.15)" className="bg-[#0a0a0a]/80 border border-green-500/30 flex justify-between items-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/40 via-[#111] to-[#111]">
           <div className="flex items-center">
             <Target className="w-12 h-12 text-green-400 mr-5" />
             <div>
               <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Accuracy</p>
               <h3 className="text-3xl font-black text-white">{metrics.accuracy}%</h3>
             </div>
           </div>
           <div className="hidden sm:flex items-end space-x-1 h-12 opacity-80">
             {[5, 6, 7, 6, 8, 7, 9, 8].map((h, i) => (
                <div key={i} className="w-2 bg-green-400/50 rounded-t-sm" style={{ height: `${h * 10}%` }} />
             ))}
           </div>
        </Card>

        <Card glow="none" spotlightColor="rgba(249,115,22,0.15)" className="bg-[#0a0a0a]/80 border border-orange-500/30 flex justify-between items-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-900/40 via-[#111] to-[#111]">
           <div className="flex items-center">
             <Activity className="w-12 h-12 text-orange-500 mr-5" />
             <div>
               <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Violations</p>
               <h3 className="text-3xl font-black text-white">{metrics.total}</h3>
             </div>
           </div>
           <div className="hidden sm:flex items-end space-x-1 h-12 opacity-80">
             {[2, 3, 2, 4, 3, 5, 4, 3].map((h, i) => (
                <div key={i} className="w-2 bg-orange-400/50 rounded-t-sm" style={{ height: `${h * 15}%` }} />
             ))}
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
          <Card glow="blue" className="h-full min-h-[500px] flex flex-col relative overflow-hidden border border-cyan-500/30">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-cyan-500/50">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              <span className="text-sm font-bold text-white tracking-wider">CAM_01_MAIN_JUNCTION</span>
            </div>
            
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex items-center shadow-lg">
              <Camera className="w-4 h-4 mr-2 text-gray-300" />
              <span className="text-sm font-bold font-mono tracking-widest text-red-500 animate-pulse">REC</span>
            </div>

            {/* Live Video Embedded Display */}
            <div className="w-full h-full p-4 flex items-center justify-center bg-black/40">
              <div className="relative w-full aspect-video rounded-xl border border-white/10 overflow-hidden bg-black shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Hidden canvas for capturing frames */}
                <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

                {/* SVG Overlay for detections */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 1280 720"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {detections.map((det, idx) => (
                    <g key={idx}>
                      <rect
                        x={det.box[0]}
                        y={det.box[1]}
                        width={det.box[2] - det.box[0]}
                        height={det.box[3] - det.box[1]}
                        fill="transparent"
                        stroke={det.label.includes("Face") ? "#ef4444" : "#22c55e"}
                        strokeWidth="3"
                        className="transition-all duration-200"
                      />
                      <rect
                        x={det.box[0]}
                        y={det.box[1] - 30}
                        width={200}
                        height={30}
                        fill={det.label.includes("Face") ? "#ef4444" : "#22c55e"}
                        fillOpacity="0.8"
                      />
                      <text
                        x={det.box[0] + 8}
                        y={det.box[1] - 8}
                        className="text-[18px] font-bold fill-white"
                      >
                        {det.label} ({Math.round(det.conf * 100)}%)
                      </text>
                      {det.plate && (
                        <text
                          x={det.box[0]}
                          y={det.box[3] + 35}
                          className="text-[22px] font-black fill-[#ef4444] font-mono filter drop-shadow-md"
                        >
                          PLATE: {det.plate}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
                    <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest text-center px-4">
                      Initializing Browser Camera...<br/>
                      <span className="text-white/30 text-xs text-center block mt-2">Requesting permission for local webcam</span>
                    </p>
                  </div>
                )}
              </div>
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
                className="p-1.5 text-gray-400 hover:text-cyan-400 transition-colors hover:bg-cyan-500/10 rounded-md focus:outline-none"
                aria-label="Refresh Data"
              >
                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {violations.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center opacity-30 text-center">
                   <ShieldAlert className="w-12 h-12 mb-3" />
                   <p className="text-sm font-mono tracking-widest uppercase">No Violations Logged</p>
                </div>
              ) : (
                violations.map((v, i) => {
                  let colorClasses = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                  if (v.violation === "No Helmet") colorClasses = "text-red-400 bg-red-500/10 border-red-500/20";
                  else if (v.violation === "Speeding") colorClasses = "text-orange-400 bg-orange-500/10 border-orange-500/20";

                  return (
                    <motion.div
                      key={v.id || i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 hover:border-gray-700 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${colorClasses}`}>
                          {v.violation}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">{new Date(v.time).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-white font-mono tracking-wider group-hover:text-cyan-400 transition-colors uppercase">{v.plate}</p>
                          <p className="text-xs text-gray-400 flex items-center">
                             <Target className="w-3 h-3 mr-1" /> {Math.round(v.confidence)}% Confidence
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                           {v.image ? <img src={v.image} alt="Plate" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-gray-600" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
            <button className="w-full mt-4 py-2.5 text-sm font-medium text-cyan-400 hover:text-white border border-cyan-500/30 hover:bg-cyan-500/20 rounded-lg transition-all focus:outline-none">
              View Analytics
            </button>
          </Card>
        </motion.div>
      </div>

      {/* NEW SECTION: VIOLATION HISTORY (No Helmet Focus) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card glow="blue" className="p-0 overflow-hidden border border-cyan-500/20 bg-[#0a0a0a]/90 backdrop-blur-md">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#111] to-[#0a0a0a]">
            <div>
              <h3 className="text-xl font-bold flex items-center text-white tracking-tight">
                <History className="w-5 h-5 text-cyan-400 mr-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                Violation History
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium italic">Tracking every 'No Helmet' detection instance</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                Live Feed Active
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-[#0d0d0d]/80 text-gray-500 border-b border-white/5 font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold text-cyan-500/80">Timestamp</th>
                  <th className="px-6 py-4 font-semibold text-cyan-500/80 text-center">Detection Type</th>
                  <th className="px-6 py-4 font-semibold text-cyan-500/80">Confidence</th>
                  <th className="px-6 py-4 font-semibold text-cyan-500/80 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#0a0a0a]/40">
                {violations.filter(v => v.violation === "No Helmet").length > 0 ? (
                  violations
                    .filter(v => v.violation === "No Helmet")
                    .map((v, i) => (
                      <tr key={v.id || i} className="hover:bg-cyan-500/5 transition-all group/row border-l-2 border-l-transparent hover:border-l-cyan-500">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover/row:border-cyan-500/30 transition-colors">
                              <Clock className="w-4 h-4 text-gray-500 group-hover/row:text-cyan-400" />
                            </div>
                            <span className="font-mono text-gray-300 group-hover/row:text-white transition-colors">{v.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] group-hover/row:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all">
                            NO HELMET
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-1.5 w-48">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-gray-500 group-hover/row:text-gray-400">ACCURACY</span>
                              <span className="text-cyan-400 font-bold">{Math.round(v.confidence)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round(v.confidence)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                             <span className="text-[10px] font-black text-gray-500 group-hover/row:text-gray-300 tracking-widest uppercase">Verified</span>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <ShieldAlert className="w-12 h-12 mb-4 text-gray-600" />
                        <p className="text-gray-500 font-mono text-sm tracking-widest">NO HELMET VIOLATIONS DETECTED IN SESSION</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

       {/* BOTTOM SECTION: RECORDS TABLE */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
       >
         <Card glow="none" className="p-0 overflow-hidden border border-gray-800 bg-[#0a0a0a]/90 backdrop-blur-md">
           <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#111]">
             <h3 className="font-bold flex items-center text-white">
               <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
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
                             <div className="h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ width: `${Math.round(v.confidence * 100)}%` }}></div>
                           </div>
                           <span className="text-green-400 font-mono text-xs">{Math.round(v.confidence * 100)}%</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button className="px-3 py-1 text-xs font-medium text-cyan-400 hover:text-white hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/30 rounded transition-all">Review</button>
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
