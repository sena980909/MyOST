"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "감정을 읽고 있어요...",
  "당신의 이야기에 귀 기울이는 중...",
  "어울리는 음악을 찾고 있어요...",
  "당신만의 OST를 준비하고 있어요...",
  "거의 다 됐어요...",
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* Sound wave animation */}
      <div className="flex items-end gap-1 h-16 mb-8">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 bg-gradient-to-t from-pink-300 to-purple-300 rounded-full"
            animate={{
              height: [12, 48, 24, 56, 16],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Loading message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-[#6b5b8a] dark:text-[#c4b5e0] text-lg"
        >
          {LOADING_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {LOADING_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i <= messageIndex
                ? "bg-purple-400 scale-100"
                : "bg-purple-200 dark:bg-purple-800 scale-75"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
