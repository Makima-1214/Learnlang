"use client";

import { motion } from "framer-motion";

export default function HeroMascotIllustration() {
  return (
    <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
      {/* Glow background */}
      <div className="absolute inset-0 bg-[#E0E7FF] rounded-full filter blur-[60px] opacity-60 animate-[pulse_4s_infinite]" />
      
      <motion.svg 
        animate={{ 
          y: [0, -12, 0],
          rotate: [-1, 1, -1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        width="280" 
        height="280" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-xl"
      >
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="#E2E8F0" />
        
        {/* Holographic Aura / Rings */}
        <motion.ellipse 
          cx="100" cy="100" rx="85" ry="85" 
          stroke="#818CF8" strokeWidth="2" fill="none" strokeDasharray="12 12" 
          animate={{ rotate: 360 }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
          style={{ transformOrigin: "100px 100px" }}
          opacity="0.5"
        />
        <motion.ellipse 
          cx="100" cy="100" rx="105" ry="105" 
          stroke="#34D399" strokeWidth="1.5" fill="none" strokeDasharray="4 16" 
          animate={{ rotate: -360 }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
          style={{ transformOrigin: "100px 100px" }}
          opacity="0.5"
        />

        {/* Bot Body */}
        <rect x="50" y="70" width="100" height="90" rx="20" fill="#6366F1" />
        <rect x="50" y="70" width="100" height="80" rx="20" fill="#818CF8" />
        
        {/* Tech Details on Body */}
        <path d="M60 140 Q100 150 140 140" stroke="#4338CA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4"/>
        <path d="M70 128 Q100 136 130 128" stroke="#4338CA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.3"/>

        {/* Glowing Energy Core */}
        <motion.g
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 105px" }}
        >
          <circle cx="100" cy="105" r="16" fill="#312E81" />
          <circle cx="100" cy="105" r="12" fill="#10B981" style={{ filter: "drop-shadow(0 0 10px #34D399)" }} />
          <circle cx="100" cy="105" r="5" fill="#A7F3D0" />
          <path d="M100 97 L100 113 M92 105 L108 105" stroke="#ECFDF5" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </motion.g>
        
        {/* Bot Head */}
        <motion.g
          animate={{ rotate: [0, 6, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 70px" }}
        >
          <rect x="60" y="20" width="80" height="60" rx="15" fill="#6366F1" />
          <rect x="60" y="20" width="80" height="50" rx="15" fill="#818CF8" />
          {/* Ears */}
          <circle cx="50" cy="50" r="10" fill="#4338CA" />
          <circle cx="150" cy="50" r="10" fill="#4338CA" />
          {/* Antenna */}
          <line x1="100" y1="20" x2="100" y2="5" stroke="#4338CA" strokeWidth="4" />
          <circle cx="100" cy="5" r="5" fill="#FBBF24" className="animate-pulse" />
          {/* Screen/Face */}
          <rect x="70" y="30" width="60" height="30" rx="8" fill="#1E1B4B" />
          
          {/* Cute Rosy Cheeks */}
          <ellipse cx="78" cy="52" rx="4" ry="2.5" fill="#FF8A80" opacity="0.8" />
          <ellipse cx="122" cy="52" rx="4" ry="2.5" fill="#FF8A80" opacity="0.8" />

          {/* Natural Blinking Eyes */}
          <motion.ellipse 
            cx="85" cy="45" rx="5" ry="5" fill="#10B981" 
            animate={{ ry: [5, 5, 0.5, 5, 5] }}
            transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.92, 0.95, 0.98, 1] }}
          />
          <motion.ellipse 
            cx="115" cy="45" rx="5" ry="5" fill="#10B981" 
            animate={{ ry: [5, 5, 0.5, 5, 5] }}
            transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.92, 0.95, 0.98, 1] }}
          />
        </motion.g>
        {/* Arms */}
        <motion.g
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "45px 95px" }}
        >
          <path d="M40 90 L20 120" stroke="#6366F1" strokeWidth="12" strokeLinecap="round" />
        </motion.g>
        <motion.g
          animate={{ rotate: [0, 20, -10, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "155px 95px" }}
        >
          <path d="M160 90 L180 40" stroke="#6366F1" strokeWidth="12" strokeLinecap="round" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
