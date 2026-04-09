"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-b-[rgba(255,255,255,0.05)] px-6 py-4 backdrop-blur-xl bg-[#0a0a0a]/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <ShieldAlert className="w-8 h-8 text-[var(--neon-blue)] group-hover:drop-shadow-[0_0_10px_var(--neon-blue)] transition-all" />
          <span className="text-xl font-bold tracking-wider text-white text-glow-blue">
            RoadGuard<span className="text-[var(--neon-green)] text-glow-green">.AI</span>
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-[var(--neon-blue)] transition-colors">
            Dashboard
          </Link>
          {isMounted && (
            <Button variant="neon" size="sm" onClick={handleAuthAction}>
              {isAuthenticated ? "Sign Out" : "Sign In"}
            </Button>
          )}
          {!isMounted && (
             <Button variant="neon" size="sm" className="opacity-0 pointer-events-none">
                Sign In
             </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
