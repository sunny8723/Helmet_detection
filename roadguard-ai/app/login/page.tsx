"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, KeyRound, Mail, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate basic auth validation
    setTimeout(() => {
      if (email.includes("@") && password.length >= 4) {
        localStorage.setItem("isAuthenticated", "true");
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please use any valid email & password.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative w-full h-full p-6">
      <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] bg-[var(--neon-blue)] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-[var(--neon-green)] opacity-[0.1] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <ShieldAlert className="w-12 h-12 text-[var(--neon-blue)] drop-shadow-[0_0_15px_var(--neon-blue)] mb-4" />
          <h1 className="text-3xl font-black text-white text-glow-blue">Secure Access</h1>
          <p className="text-gray-400 mt-2 text-center">Sign in to access the RoadGuard AI Dashboard</p>
        </div>

        <Card glow="blue" className="p-8 bg-[#0a0a0a]/90 backdrop-blur-md border border-[var(--neon-blue)]/30">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#111] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[var(--neon-blue)] focus:border-transparent text-white placeholder-gray-600 transition-all font-mono"
                    placeholder="officer@roadguard.ai"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#111] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[var(--neon-blue)] focus:border-transparent text-white placeholder-gray-600 transition-all font-mono"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium">
                {error}
              </motion.p>
            )}

            <Button 
              type="submit" 
              variant="neon" 
              className="w-full flex justify-center py-3 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center">
                  Initialize Session
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
            
            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                Demo Auth Mode Active. Enter any valid email and a 4+ character password.
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </main>
  );
}
