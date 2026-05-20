"use client";

import { motion } from "framer-motion";

export default function GamificationIllustration() {
  return (
    <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
      {/* Glow background */}
      <div className="absolute inset-0 bg-white rounded-full opacity-0" />
      
      <motion.svg 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        width="240" 
        height="240" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Holographic Ring Grid */}
        <motion.circle 
          cx="100" cy="100" r="80" 
          stroke="#818CF8" strokeWidth="1" strokeDasharray="6 12" 
          animate={{ rotate: 360 }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
          opacity="0.3"
        />

        {/* 1. HIGH-TECH BATTERY (Lives/Energy analog) */}
        <g transform="translate(30, 40)">
          {/* Outer Battery Body */}
          <rect x="5" y="15" width="55" height="95" rx="14" fill="#1E1B4B" stroke="#6366F1" strokeWidth="4" />
          {/* Battery Cap */}
          <rect x="20" y="5" width="25" height="12" rx="4" fill="#6366F1" />
          
          {/* Interactive Charging Bars */}
          {/* Bottom Bar */}
          <motion.rect 
            x="13" y="85" width="39" height="18" rx="6" 
            fill="#10B981" 
            style={{ filter: "drop-shadow(0 0 4px #34D399)" }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />
          {/* Middle Bar */}
          <motion.rect 
            x="13" y="62" width="39" height="18" rx="6" 
            fill="#10B981" 
            style={{ filter: "drop-shadow(0 0 4px #34D399)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          {/* Top Bar */}
          <motion.rect 
            x="13" y="39" width="39" height="18" rx="6" 
            fill="#10B981" 
            style={{ filter: "drop-shadow(0 0 4px #34D399)" }}
            animate={{ opacity: [0.1, 1, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Core Power Label inside Battery */}
          <text x="32" y="30" fill="#E0E7FF" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.6">FULL</text>
        </g>

        {/* 2. GLOWING ENERGY ZAP / LIGHTNING SHIELD (Streak/Speed analog) */}
        <motion.g 
          animate={{ rotate: [-2, 2, -2], scale: [0.98, 1.02, 0.98] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          transform="translate(100, 35)"
        >
          {/* Shield Outer Glow */}
          <circle cx="45" cy="65" r="45" fill="rgba(251, 191, 36, 0.1)" stroke="url(#shieldGlow)" strokeWidth="3" strokeDasharray="4 8" />
          
          {/* Main Shield Path */}
          <path 
            d="M45 25 C70 25 85 35 85 65 C85 95 45 110 45 112 C45 110 5 95 5 65 C5 35 20 25 45 25 Z" 
            fill="#FFFBEB" 
            stroke="#F59E0B" 
            strokeWidth="5" 
          />

          {/* Cyber Lightning Bolt */}
          <motion.path 
            d="M50 40 L30 70 L48 70 L38 98 L65 62 L46 62 Z" 
            fill="#FBBF24" 
            stroke="#D97706" 
            strokeWidth="2" 
            style={{ filter: "drop-shadow(0 0 8px #FBBF24)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Smile expression on the shield (kawaii style matching logo) */}
          <circle cx="38" cy="53" r="3" fill="#92400E" />
          <circle cx="52" cy="53" r="3" fill="#92400E" />
          <path d="M41 59 Q45 62 49 59" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </motion.g>

        <defs>
          <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
