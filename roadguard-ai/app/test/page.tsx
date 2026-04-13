"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, Camera, ImageIcon, ScanSearch, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIImageTest() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{ image: string; plate: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setResult(null);
    setError(null);
    setLoading(true);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/detect_image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Detection failed. Make sure backend is running on port 5000.");

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-white mb-4">
            AI Image <span className="text-cyan-400">Sandbox</span>
          </h1>
          <p className="text-gray-400">
            Upload a road scene to test real-time helmet detection and license plate extraction.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-8 border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
            <input 
              type="file" 
              onChange={handleUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              accept="image/*"
            />
            <AnimatePresence mode="wait">
              {!image ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-cyan-400 w-8 h-8" />
                  </div>
                  <p className="text-white font-bold mb-1">Click to upload or drag & drop</p>
                  <p className="text-gray-500 text-sm">JPEG, PNG or WEBP (Max 10MB)</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full relative flex items-center justify-center"
                >
                  <img src={image} alt="Preview" className="max-h-[350px] rounded-lg shadow-2xl" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/70 uppercase tracking-widest font-mono">
                    Input Preview
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-cyan-400 font-mono text-sm animate-pulse uppercase tracking-widest">Running AI Inference...</p>
              </div>
            )}
          </Card>

          {/* Result Section */}
          <Card className={`p-8 bg-[#0a0a0a] border border-white/10 flex flex-col items-center justify-center min-h-[400px] relative ${!result && !error ? 'opacity-50' : 'opacity-100'}`}>
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center text-red-500"
                >
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold">Error Occurred</p>
                  <p className="text-sm opacity-70 mt-1">{error}</p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full space-y-6"
                >
                  <div className="relative rounded-lg overflow-hidden border border-cyan-500/30">
                    <img 
                      src={`data:image/jpeg;base64,${result.image}`} 
                      className="w-full rounded-lg shadow-2xl shadow-cyan-500/10" 
                      alt="Result"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <ScanSearch className="w-3 h-3" />
                      AI Annotated
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Detected Plate</p>
                      <p className="text-2xl font-black text-white tracking-tight">{result.plate}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-green-500 w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center">
                   <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                   <p className="text-gray-600 font-medium">Result will appear here</p>
                   <p className="text-gray-700 text-xs mt-1">Upload a photo to see the AI in action</p>
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Info Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            Helmet Detection Active
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            Plate OCR Ready
          </div>
        </motion.div>
      </div>
    </div>
  );
}
