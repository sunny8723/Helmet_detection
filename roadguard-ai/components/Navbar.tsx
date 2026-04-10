"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut(auth);
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="sticky top-0 w-full z-50 px-6 py-4 backdrop-blur-lg bg-black/40 border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-105 transition-all duration-300 border border-cyan-500/20">
            <Image 
              src="/photo/IndianRoad.AI digital logo design.png" 
              alt="IndianRoad AI Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            IndianRoad<span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">.AI</span>
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
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
