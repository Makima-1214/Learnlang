"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedText() {
  const words = ["Cerdas", "Pintar", "Interaktif", "Seru", "Praktis"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span 
      className="inline-flex relative overflow-hidden align-bottom translate-y-[-0.02em] pr-3 pb-1"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="inline-block text-[#6366F1] font-black whitespace-nowrap leading-none"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
