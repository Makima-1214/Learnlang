"use client";

import { motion } from "framer-motion";

export default function AIReviewIllustration() {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative w-full max-w-sm mx-auto p-6 bg-white border-4 border-gray-200 rounded-3xl shadow-[0_8px_0_#E2E8F0]"
    >
      <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#1CB0F6] flex items-center justify-center text-white font-black text-sm">AI</div>
        <div className="h-4 bg-gray-200 rounded-full w-24" />
      </div>
      
      <div className="space-y-4">
        <div className="bg-[#FFF5F5] border-2 border-[#FFCDD2] p-3.5 rounded-2xl flex items-start gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="text-xs font-black text-red-400 uppercase tracking-wider">Jawaban Kamu:</p>
            <p className="text-gray-700 font-extrabold text-sm mt-0.5">I am not agree with you.</p>
          </div>
        </div>

        <div className="bg-[#F1FFF8] border-2 border-[#A8E6CF] p-3.5 rounded-2xl flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-xs font-black text-emerald-500 uppercase tracking-wider">Koreksi AI:</p>
            <p className="text-emerald-700 font-extrabold text-sm mt-0.5">I don't agree with you.</p>
            <div className="bg-white border-2 border-[#E8F5ED] rounded-xl p-2.5 mt-2">
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                💡 Dalam bahasa Inggris, "agree" adalah kata kerja (verb), bukan kata sifat. Gunakan "don't", bukan "am not".
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
