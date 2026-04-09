"use client";

import { MoveRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-800/60 bg-[#050505]/80 backdrop-blur-lg flex flex-col pt-12 pb-6 px-6 relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-gray-800/40 pb-8 mb-6">

        {/* Central Gov Portals */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-blue)] shadow-[0_0_8px_var(--neon-blue)] mr-3"></span>
            Central Government of India
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="https://morth.nic.in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-blue)] transition-colors flex items-center group text-sm">
                Ministry of Road Transport and Highways (MoRTH)
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
            <li>
              <a href="https://parivahan.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-blue)] transition-colors flex items-center group text-sm">
                Parivahan Sewa
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
            <li>
              <a href="https://echallan.parivahan.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-blue)] transition-colors flex items-center group text-sm">
                e-Challan System
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
            <li>
              <a href="https://morth.nic.in/road-safety" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-blue)] transition-colors flex items-center group text-sm">
                National Road Safety Portal
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
          </ul>
        </div>

        {/* State Gov Portals */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] shadow-[0_0_8px_var(--neon-green)] mr-3"></span>
            State (Arunachal Pradesh)
          </h3>
          <ul className="space-y-3">
            <li>
              <a href="https://arunachal.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-green)] transition-colors flex items-center group text-sm">
                Transport Department
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
            <li>
              <a href="https://parivahan.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-green)] transition-colors flex items-center group text-sm">
                RTO Services
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
            <li>
              <a href="https://arunpol.gov.in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--neon-green)] transition-colors flex items-center group text-sm">
                Arunachal Police Traffic Portal
                <MoveRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p className="mb-4 md:mb-0 max-w-3xl text-center md:text-left leading-relaxed">
          <span className="text-red-400/80 font-bold uppercase tracking-wider mr-2 text-[10px]">Disclaimer</span>
          This platform is an independent project and is <strong className="text-gray-400">not affiliated with or endorsed by any government authority</strong>. Links are provided for informational purposes only.
        </p>
        <p className="font-mono">
          © {new Date().getFullYear()} RoadGuard AI  build by Sunny Das
        </p>
      </div>
    </footer>
  );
}
