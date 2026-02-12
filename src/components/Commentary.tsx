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
        className="inline-block px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4"
      >
        <span className="text-purple-300 text-sm">{emotionSummary}</span>
      </motion.div>

      {/* DJ Comment */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10
                   border border-white/10 rounded-2xl p-6"
      >
        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-purple-600 rounded-full">
          <span className="text-xs text-white font-medium">DJ MyOST</span>
        </div>
        <p className="text-white/80 text-lg leading-relaxed mt-2 italic">
          &ldquo;{djComment}&rdquo;
        </p>
      </motion.div>
    </motion.div>
  );
}
