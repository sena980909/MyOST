"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const EXAMPLE_PROMPTS = [
  "비 오는 날 카페에서 창밖을 바라보고 있어요",
  "오랜만에 옛 친구를 만나서 기분이 좋아요",
  "새벽에 잠이 안 와서 혼자 생각이 많아요",
  "오늘 드디어 큰 프로젝트를 끝냈어요!",
  "이별 후 처음으로 그 사람 생각이 났어요",
];

const MAX_LENGTH = 500;

interface EmotionInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function EmotionInput({
  onSubmit,
  isLoading,
}: EmotionInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim().length >= 10 && !isLoading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) =>
            setText(e.target.value.slice(0, MAX_LENGTH))
          }
          onKeyDown={handleKeyDown}
          placeholder="오늘 당신의 이야기를 들려주세요..."
          disabled={isLoading}
          rows={4}
          className="w-full bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-purple-100 dark:border-purple-600 rounded-2xl px-6 py-4
                     text-[#4a4458] dark:text-white placeholder-[#c4b5e0] dark:placeholder-purple-400 text-lg resize-none
                     focus:outline-none focus:border-purple-300 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50
                     transition-all duration-300 disabled:opacity-50 shadow-sm"
        />
        <div className="flex justify-between items-center mt-2 px-2">
          <span className="text-xs text-[#c4b5e0]">
            Shift+Enter로 줄바꿈
          </span>
          <span
            className={`text-xs ${
              text.length >= MAX_LENGTH
                ? "text-rose-400"
                : "text-[#c4b5e0]"
            }`}
          >
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {EXAMPLE_PROMPTS.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => setText(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs bg-white/60 dark:bg-purple-800/40 border border-purple-100 dark:border-purple-600 rounded-full
                       text-[#8b7fa3] dark:text-purple-200 hover:text-[#6b5b8a] dark:hover:text-white hover:bg-white/80 dark:hover:bg-purple-700/50 hover:border-purple-200
                       transition-all duration-200 disabled:opacity-30"
          >
            {prompt}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex justify-center"
      >
        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 10 || isLoading}
          className="group relative px-8 py-4 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300
                     dark:from-pink-500 dark:via-purple-500 dark:to-blue-500
                     rounded-full text-white font-medium text-lg
                     hover:from-pink-400 hover:via-purple-400 hover:to-blue-400
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-purple-800/50"
        >
          <span className="relative z-10">
            {isLoading ? "분석 중..." : "내 OST 찾기"}
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        </button>
      </motion.div>
    </motion.div>
  );
}
