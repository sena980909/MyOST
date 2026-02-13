"use client";

import { motion } from "framer-motion";

interface CommentaryProps {
  djComment: string;
  emotionSummary: string;
}

export default function Commentary({
  djComment,
  emotionSummary,
}: CommentaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      {/* Emotion tag */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-block px-4 py-1.5 bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-full mb-4"
      >
        <span className="text-purple-500 dark:text-purple-400 text-sm">{emotionSummary}</span>
      </motion.div>

      {/* DJ Comment */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-purple-100 dark:border-purple-800 rounded-2xl p-6 shadow-sm"
      >
        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full">
          <span className="text-xs text-white font-medium">DJ MyOST</span>
        </div>
        <p className="text-[#4a4458] dark:text-[#e8dff5] text-lg leading-relaxed mt-2 italic">
          &ldquo;{djComment}&rdquo;
        </p>
      </motion.div>
    </motion.div>
  );
}
