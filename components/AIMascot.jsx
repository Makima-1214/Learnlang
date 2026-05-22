"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function AIMascot({ mood = "neutral", skin = "detective" }) {
  const isHappy = mood === "happy";
  const isWrong = mood === "wrong";
  const isExplorer = skin === "explorer";
  
  // Colors based on mood & skin
  const mainColor = isHappy ? "#10B981" : isWrong ? "#EF4444" : "#6366F1";
  const lightColor = isHappy ? "#34D399" : isWrong ? "#F87171" : "#818CF8";
  const glowColor = isHappy ? "rgba(16, 185, 129, 0.08)" : isWrong ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)";

  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      <motion.div 
        animate={{ backgroundColor: glowColor }}
        className="absolute inset-0 rounded-full filter blur-[40px] transition-colors duration-500" 
      />
      
      <motion.svg 
        animate={{ 
          y: isHappy ? [0, -15, 0] : isWrong ? [0, 2, -2, 0] : [0, -6, 0],
          scaleY: isHappy ? [1, 0.9, 1.1, 1] : [1, 0.98, 1.02, 1]
        }}
        transition={{ 
          duration: isHappy ? 0.6 : isWrong ? 0.3 : 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        width="160" 
        height="160" 
        viewBox="0 0 160 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-lg"
      >
        {/* Floating Shadow */}
        <ellipse cx="80" cy="148" rx="40" ry="8" fill="#E2E8F0" />

        {/* ==========================================
            EXPLORER SKIN: JETPACK BOOSTER BACKPACK (Behind body)
           ========================================== */}
        {isExplorer && (
          <g>
            {/* Left Jetpack Thruster */}
            <rect x="26" y="80" width="14" height="40" rx="5" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
            <ellipse cx="33" cy="85" rx="4" ry="2" fill="#38BDF8" opacity="0.8" />
            {/* Left Animated Plasma Flame */}
            <motion.path 
              d="M29 120 L33 138 L37 120 Z" 
              fill="#F97316" 
              style={{ filter: "drop-shadow(0 0 4px #F97316)" }}
              animate={{ scaleY: [1, 1.5, 1], y: [0, 3, 0] }} 
              transition={{ duration: 0.15, repeat: Infinity }} 
            />
            {/* Right Jetpack Thruster */}
            <rect x="120" y="80" width="14" height="40" rx="5" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
            <ellipse cx="127" cy="85" rx="4" ry="2" fill="#38BDF8" opacity="0.8" />
            {/* Right Animated Plasma Flame */}
            <motion.path 
              d="M123 120 L127 138 L131 120 Z" 
              fill="#F97316" 
              style={{ filter: "drop-shadow(0 0 4px #F97316)" }}
              animate={{ scaleY: [1, 1.5, 1], y: [0, 3, 0] }} 
              transition={{ duration: 0.15, repeat: Infinity }} 
            />
          </g>
        )}
        
        {/* Holographic Rings (Scanner Effect) */}
        {!isWrong && !isHappy && (
          <motion.ellipse 
            cx="80" cy="80" rx="65" ry="65" 
            stroke={lightColor} strokeWidth="1" fill="none" strokeDasharray="8 8" 
            animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
            transition={{ rotate: {duration: 10, repeat: Infinity, ease: "linear"}, scale: {duration: 2, repeat: Infinity} }} 
            style={{ transformOrigin: "80px 80px" }}
            opacity="0.20"
          />
        )}
        
        {/* Bot Body */}
        <motion.rect animate={{ fill: mainColor }} transition={{duration: 0.3}} x="40" y="60" width="80" height="70" rx="15" />
        <motion.rect animate={{ fill: lightColor }} transition={{duration: 0.3}} x="40" y="60" width="80" height="60" rx="15" />
        
        {/* Glowing Circuit Line details on body */}
        <path d="M50 85 L60 85 L60 98" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" style={{ filter: "drop-shadow(0 0 2px #38BDF8)" }} />
        <path d="M110 85 L100 85 L100 98" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" style={{ filter: "drop-shadow(0 0 2px #38BDF8)" }} />
        
        {/* Bot Head */}
        <motion.g
          animate={{ 
            rotate: isHappy ? [0, -10, 10, 0] : isWrong ? [-5, 5, -5, 5, 0] : [0, 3, -3, 0] 
          }}
          transition={{ duration: isHappy ? 1 : isWrong ? 0.4 : 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "80px 60px" }}
        >
          {/* ==========================================
              SKIN-SPECIFIC HEAD ACCESSORIES
             ========================================== */}
          {isExplorer ? (
            /* Cyber Headphones / Astronaut Halo (Explorer) */
            <g>
              {/* Left Cup */}
              <rect x="36" y="32" width="10" height="24" rx="4" fill="#312E81" stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="41" cy="44" r="3" fill="#38BDF8" className="animate-pulse" />
              {/* Right Cup */}
              <rect x="114" y="32" width="10" height="24" rx="4" fill="#312E81" stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="119" cy="44" r="3" fill="#38BDF8" className="animate-pulse" />
              {/* Headphone Band */}
              <path d="M41 32 Q80 8 119 32" stroke="#312E81" strokeWidth="5" fill="none" />
              <path d="M44 31 Q80 12 116 31" stroke="#38BDF8" strokeWidth="2" fill="none" style={{ filter: "drop-shadow(0 0 3px #38BDF8)" }} />
            </g>
          ) : (
            /* Cyber Detective Hat (Detective Fedora) */
            <g>
              <ellipse cx="80" cy="14" rx="36" ry="4" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
              <path d="M54 14 L58 1 C58 1, 80 4, 102 1 L106 14 Z" fill="#4338CA" />
              {/* Glowing Neon Cyan band */}
              <path d="M55 11 Q80 14 105 11" stroke="#38BDF8" strokeWidth="2.5" fill="none" style={{ filter: "drop-shadow(0 0 4px #38BDF8)" }} />
            </g>
          )}

          {/* Main Head Structure */}
          <motion.rect animate={{ fill: mainColor }} transition={{duration: 0.3}} x="45" y="15" width="70" height="55" rx="12" />
          <motion.rect animate={{ fill: lightColor }} transition={{duration: 0.3}} x="45" y="15" width="70" height="45" rx="12" />
          
          {/* Ears */}
          <motion.circle animate={{ fill: mainColor }} transition={{duration: 0.3}} cx="40" cy="40" r="6" />
          <motion.circle animate={{ fill: mainColor }} transition={{duration: 0.3}} cx="120" cy="40" r="6" />
          
          {/* Antenna */}
          <line x1="80" y1="15" x2="80" y2="2" stroke="#4338CA" strokeWidth="4" />
          <circle cx="80" cy="2" r="4" fill={isHappy ? "#A7F3D0" : isWrong ? "#FECACA" : "#FBBF24"} className="animate-pulse" />

          {/* Visor/Screen */}
          <rect x="55" y="25" width="50" height="24" rx="6" fill="#1E1B4B" />
          {/* Glossy Diagonal Visor Glare */}
          <path d="M57 27 L70 27 L60 45 L57 45 Z" fill="white" opacity="0.08" />
          
          {/* Digital Eyes / Expressions */}
          {mood === "neutral" && (
            <motion.g
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse cx="70" cy="37" rx="4" ry="4" fill="#38BDF8" />
              <ellipse cx="90" cy="37" rx="4" ry="4" fill="#38BDF8" />
              {/* Scanning light in visor */}
              <motion.rect 
                x="55" y="25" width="50" height="24" rx="6" fill="url(#scanGradient)" opacity="0.3"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.g>
          )}

          {mood === "happy" && (
            <g>
              {/* Happy eyes ^ ^ */}
              <path d="M65 39 Q70 33 75 39" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M85 39 Q90 33 95 39" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          )}

          {mood === "wrong" && (
            <g>
              {/* Wrong eyes > < */}
              <line x1="66" y1="33" x2="74" y2="41" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="74" y1="33" x2="66" y2="41" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="86" y1="33" x2="94" y2="41" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="94" y1="33" x2="86" y2="41" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        </motion.g>

        {/* ==========================================
            SKIN-SPECIFIC HAND Poses & items
           ========================================== */}
        {isExplorer ? (
          /* Explorer Pose: Exciting Flying arms & holding a glowing battery energy core */
          <motion.g
            animate={{ y: [-1, 1, -1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Left Arm pointing up/forward */}
            <path d="M40 90 Q22 80 18 68" stroke="#6366F1" strokeWidth="12" strokeLinecap="round" fill="none" />
            {/* Right Arm holding Core Crystal */}
            <path d="M120 90 Q138 96 118 116" stroke="#6366F1" strokeWidth="12" strokeLinecap="round" fill="none" />
            
            {/* Neon Green Energy Core Crystal in right hand */}
            <polygon 
              points="108,122 116,114 124,122 116,130" 
              fill="#10B981" 
              style={{ filter: "drop-shadow(0 0 5px #10B981)" }} 
            />
          </motion.g>
        ) : mood === "neutral" ? (
          /* Detective Pose (Fedora hat & magnifying glass) */
          <motion.g
            animate={{ rotate: [-4, 6, -4], y: [-1, 1, -1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 90px" }}
          >
            {/* Perfectly aligned arm */}
            <path d="M40 90 Q22 112 40 135" stroke="#6366F1" strokeWidth="12" strokeLinecap="round" fill="none" />
            
            {/* Mechanical Joint */}
            <circle cx="40" cy="90" r="7" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
            <circle cx="40" cy="90" r="2.5" fill="#38BDF8" className="animate-pulse" />
            
            {/* Handle */}
            <line x1="40" y1="135" x2="57" y2="118" stroke="#4338CA" strokeWidth="6" strokeLinecap="round" />
            
            {/* Magnifying Glass */}
            <circle cx="65" cy="110" r="12" stroke="#38BDF8" strokeWidth="4" fill="rgba(56, 189, 248, 0.12)" />
            <path d="M65 104 L65 116 M59 110 L71 110" stroke="#38BDF8" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
            
            {/* Scan Beam */}
            <motion.path 
              d="M65 122 L35 180 L95 180 Z" 
              fill="rgba(56, 189, 248, 0.08)"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.g>
        ) : null}

        <defs>
          <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </motion.svg>

      <AnimatePresence>
        {isHappy && (
          <motion.div 
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-6 bg-emerald-100 text-emerald-700 border-4 border-emerald-300 font-extrabold px-4 py-2 rounded-2xl text-xs shadow-md z-20"
          >
            Analisis Akurat!
          </motion.div>
        )}
        {isWrong && (
          <motion.div 
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-6 bg-red-100 text-red-700 border-4 border-red-300 font-extrabold px-4 py-2 rounded-2xl text-xs shadow-md z-20"
          >
            Ada yang salah!Cara Pintar
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
