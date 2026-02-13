"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageProvider";

export default function Loading() {
  const { t } = useLanguage();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < t.loading.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [t.loading.length]);

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
            className="w-2 bg-gradient-to-t from-pink-300 to-purple-300 dark:from-pink-400 dark:to-purple-400 rounded-full"
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
          className="text-[#6b5b8a] dark:text-purple-200 text-lg"
        >
          {t.loading[messageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {t.loading.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i <= messageIndex
                ? "bg-purple-400 scale-100"
                : "bg-purple-200 dark:bg-purple-700 scale-75"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
