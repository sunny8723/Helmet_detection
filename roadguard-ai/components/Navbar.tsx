"use client";

import Link from "next/link";
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
          <ShieldAlert className="w-8 h-8 text-cyan-400 group-hover:text-blue-400 transition-colors" />
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
