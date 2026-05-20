"use client";

import { motion } from "framer-motion";

export default function LeaderboardIllustration() {
  return (
    <div className="relative w-80 h-72 mx-auto flex items-end justify-center gap-2 pb-6">
      <div className="absolute inset-0 bg-white rounded-full opacity-0" />
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        whileInView={{ y: 0, opacity: 1 }} 
        viewport={{ once: true }} 
        className="flex flex-col items-center"
      >
        <div className="w-14 h-14 bg-blue-300 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-md mb-2">🥈</div>
        <div className="w-16 h-28 bg-[#B3E5FC] border-3 border-b-8 border-[#0288D1] rounded-t-2xl flex items-center justify-center">
          <span className="font-black text-2xl text-[#0288D1]">2</span>
        </div>
      </motion.div>
      <motion.div 
        initial={{ y: 70, opacity: 0 }} 
        whileInView={{ y: 0, opacity: 1 }} 
        viewport={{ once: true }} 
        transition={{ delay: 0.1 }} 
        className="flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-md mb-2 relative animate-bounce">
          👑
        </div>
        <div className="w-20 h-36 bg-[#FFE082] border-3 border-b-8 border-[#FFB300] rounded-t-2xl flex items-center justify-center">
          <span className="font-black text-3xl text-[#FFB300]">1</span>
        </div>
      </motion.div>
    </div>
  );
}
