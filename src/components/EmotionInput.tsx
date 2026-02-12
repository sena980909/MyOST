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
    if (text.trim().length >= 5 && !isLoading) {
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
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4
                     text-white placeholder-white/30 text-lg resize-none
                     focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                     transition-all duration-300 disabled:opacity-50"
        />
        <div className="flex justify-between items-center mt-2 px-2">
          <span className="text-xs text-white/30">
            Shift+Enter로 줄바꿈
          </span>
          <span
            className={`text-xs ${
              text.length >= MAX_LENGTH
                ? "text-red-400"
                : "text-white/30"
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
            className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full
                       text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20
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
          disabled={text.trim().length < 5 || isLoading}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600
                     rounded-full text-white font-medium text-lg
                     hover:from-purple-500 hover:to-pink-500
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
        >
          <span className="relative z-10">
            {isLoading ? "분석 중..." : "내 OST 찾기"}
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        </button>
      </motion.div>
    </motion.div>
  );
}
