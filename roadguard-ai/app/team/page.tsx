/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { Linkedin, Instagram, ArrowLeft, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

interface TeamMember {
  name: string;
  role: string;
  instagram?: string;
  linkedin?: string;
  photo: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Sunny Das",
    role: "Project Lead",
    instagram: "https://www.instagram.com/__.sunnydas.__/",
    linkedin: "https://www.linkedin.com/in/sunny-das05/",
    photo: "/photo/sunny.jpg"
  },
  {
    name: "Sachin Kumar",
    role: "Core Developer",
    instagram: "http://instagram.com/sachinkr05022004/",
    linkedin: "https://www.linkedin.com/in/sachin-kumar05/",
    photo: "/photo/sachin.jpg"
  },
  {
    name: "L. Bedajit Sharma",
    role: "Core Developer",
    photo: "https://ui-avatars.com/api/?name=L+Bedajit+Sharma&background=050505&color=fff&size=256&font-size=0.33"
  }
];

export default function TeamPage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col relative w-full mb-10 overflow-hidden min-h-screen">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] opacity-[0.1] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[40%] h-[40%] bg-[var(--neon-green)] opacity-[0.1] blur-[150px] rounded-full pointer-events-none" />

      <section className="pt-24 pb-12 px-6 relative z-10 max-w-7xl mx-auto w-full">
        
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-[var(--neon-blue)]/5 border border-[var(--neon-blue)]/20 px-4 py-2 rounded-full mb-6">
            <Users className="w-4 h-4 text-[var(--neon-blue)]" />
            <span className="text-sm text-[var(--neon-blue)] font-medium tracking-wide">The Architects</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
            IndianRoad <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)]">Team</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Meet the developers building the next generation of autonomous traffic safety and enforcement systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <Card glow="blue" className="h-full flex flex-col p-8 bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-800 hover:border-[var(--neon-blue)]/40 transition-all group overflow-hidden relative">
                
                {/* Accent glow on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Photo Placeholder */}
                <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-b from-[var(--neon-blue)]/50 to-transparent mb-6 relative">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#111] relative bg-black">
                     <img 
                        src={member.photo} 
                        alt={member.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
                     />
                  </div>
                </div>

                <div className="text-center flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[var(--neon-blue)] transition-colors">{member.name}</h3>
                  <p className="text-[var(--neon-green)] font-mono text-sm tracking-wide mb-6 flex items-center justify-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {member.role}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4 mt-auto">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-[var(--neon-blue)]/50 transition-all"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.instagram && (
                      <a 
                        href={member.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-pink-500/50 transition-all"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
