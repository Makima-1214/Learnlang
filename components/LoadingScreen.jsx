"use client";

import { motion } from "framer-motion";

export default function LoadingScreen({ fullPage = true }) {
  const containerClass = fullPage
    ? "min-h-screen flex flex-col items-center justify-center"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full"
      />
    </div>
  );
}
