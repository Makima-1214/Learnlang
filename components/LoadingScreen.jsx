"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen({ fullPage = true }) {
  const [loadingText, setLoadingText] = useState("Menghubungkan Core Siber...");
  const texts = [
    "Menghubungkan Core Siber...",
    "Menerjemahkan Deskripsi AI...",
    "Mengunduh Modul Detektif...",
    "Menyiapkan Peta Sirkuit...",
    "Menyelaraskan Energi Reactor..."
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerClass = fullPage
    ? "min-h-screen w-full bg-[#0B0F19] flex flex-col items-center justify-center relative overflow-hidden"
    : "w-full flex flex-col items-center justify-center p-12 bg-[#0B0F19]/95 backdrop-blur-md rounded-3xl border border-indigo-500/20 relative overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Scanline pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.02)_1.5px,_transparent_1.5px)] bg-[size:24px_24px] opacity-40 pointer-events-none -z-10" />

      {/* Main loading content block */}
      <div className="flex flex-col items-center relative">
        
        {/* Holographic Radar Ring orbiting Learny */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-44 h-44 border border-dashed border-indigo-500/30 rounded-full -top-4"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute w-52 h-52 border border-dashed border-emerald-500/20 rounded-full -top-8"
        />

        {/* ==============================================
            HIGH-FIDELITY LOADING MASCOT (Learny Jetpack)
           ============================================== */}
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 3.2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative w-36 h-36 flex items-center justify-center mb-6"
        >
          <svg 
            width="130" 
            height="130" 
            viewBox="0 0 160 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
          >
            <defs>
              <linearGradient id="visorScan" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Left Jetpack Thruster & Flame */}
            <g>
              <rect x="24" y="75" width="14" height="36" rx="4" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
              <ellipse cx="31" cy="80" rx="3" ry="1.5" fill="#38BDF8" opacity="0.8" />
              <motion.path 
                d="M27 111 L31 132 L35 111 Z" 
                fill="#F97316" 
                style={{ filter: "drop-shadow(0 0 5px #F97316)" }}
                animate={{ scaleY: [1, 1.4, 1], y: [0, 2, 0] }} 
                transition={{ duration: 0.28, repeat: Infinity }} 
              />
            </g>

            {/* Right Jetpack Thruster & Flame */}
            <g>
              <rect x="122" y="75" width="14" height="36" rx="4" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
              <ellipse cx="129" cy="80" rx="3" ry="1.5" fill="#38BDF8" opacity="0.8" />
              <motion.path 
                d="M125 111 L129 132 L133 111 Z" 
                fill="#F97316" 
                style={{ filter: "drop-shadow(0 0 5px #F97316)" }}
                animate={{ scaleY: [1, 1.4, 1], y: [0, 2, 0] }} 
                transition={{ duration: 0.28, repeat: Infinity }} 
              />
            </g>

            {/* Learny Core Body */}
            <rect x="38" y="55" width="84" height="65" rx="14" fill="#6366F1" />
            <rect x="38" y="55" width="84" height="55" rx="14" fill="#818CF8" />

            {/* Circuit Lines on Chest */}
            <path d="M48 80 L58 80 L58 92" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" style={{ filter: "drop-shadow(0 0 2px #38BDF8)" }} />
            <path d="M112 80 L102 80 L102 92" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" style={{ filter: "drop-shadow(0 0 2px #38BDF8)" }} />

            {/* Head group with gentle rotation tilt */}
            <g style={{ transformOrigin: "80px 55px" }}>
              {/* Explorer Helmet/Astronaut Halo */}
              <g>
                <rect x="34" y="27" width="10" height="22" rx="4" fill="#312E81" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="39" cy="38" r="2.5" fill="#38BDF8" className="animate-pulse" />
                <rect x="116" y="27" width="10" height="22" rx="4" fill="#312E81" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="121" cy="38" r="2.5" fill="#38BDF8" className="animate-pulse" />
                <path d="M39 27 Q80 3 121 27" stroke="#312E81" strokeWidth="4.5" fill="none" />
                <path d="M42 26 Q80 7 118 26" stroke="#38BDF8" strokeWidth="1.8" fill="none" style={{ filter: "drop-shadow(0 0 3px #38BDF8)" }} />
              </g>

              {/* Face structure */}
              <rect x="43" y="12" width="74" height="52" rx="11" fill="#6366F1" />
              <rect x="43" y="12" width="74" height="42" rx="11" fill="#818CF8" />

              {/* Antenna */}
              <line x1="80" y1="12" x2="80" y2="2" stroke="#4338CA" strokeWidth="3.5" />
              <circle cx="80" cy="2" r="3.5" fill="#FBBF24" className="animate-pulse" />

              {/* Digital Visor */}
              <rect x="52" y="21" width="56" height="22" rx="5" fill="#1E1B4B" />
              <path d="M54 23 L65 23 L58 39 L54 39 Z" fill="white" opacity="0.08" />

              {/* Scanning eyes */}
              <g>
                <ellipse cx="66" cy="32" rx="3.5" ry="3.5" fill="#38BDF8" />
                <ellipse cx="94" cy="32" rx="3.5" ry="3.5" fill="#38BDF8" />
                {/* Horizontal scanner beam overlay */}
                <motion.rect 
                  x="52" y="21" width="56" height="22" rx="5" fill="url(#visorScan)"
                  animate={{ y: [-4, 18, -4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </g>
            </g>
          </svg>

          {/* Jetpack particle bubble emissions (Emitter) */}
          <div className="absolute bottom-0 inset-x-0 flex justify-between px-6 pointer-events-none">
            {[1, 2, 3].map((dot) => (
              <motion.span
                key={dot}
                animate={{ 
                  y: [0, 28], 
                  opacity: [1, 0],
                  scale: [1, 0.4] 
                }}
                transition={{ 
                  duration: 1.6, 
                  repeat: Infinity, 
                  delay: dot * 0.45,
                  ease: "easeOut"
                }}
                className="w-1.5 h-1.5 rounded-full bg-orange-400"
              />
            ))}
          </div>
        </motion.div>

        {/* Dynamic scanning bar */}
        <div className="w-48 h-1 bg-indigo-950 rounded-full overflow-hidden border border-indigo-500/10 mb-4 p-0.5">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: "linear" }}
            className="w-1/2 h-full rounded-full bg-gradient-to-r from-transparent via-[#10B981] to-transparent"
          />
        </div>

        {/* Status text */}
        <div className="h-6 flex items-center justify-center">
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest text-center"
          >
            {loadingText}
          </motion.p>
        </div>

      </div>
    </div>
  );
}
