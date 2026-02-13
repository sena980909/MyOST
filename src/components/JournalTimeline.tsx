"use client";

import { motion, AnimatePresence } from "framer-motion";
import { JournalEntry } from "@/types";
import { formatDate, formatTime } from "@/lib/journal-local";
import { useState } from "react";

interface JournalTimelineProps {
  entries: JournalEntry[];
  onReRecommend: (entry: JournalEntry) => void;
  onEntriesChange: () => void;
  onDelete?: (id: string) => void;
}

export default function JournalTimeline({
  entries,
  onReRecommend,
  onEntriesChange,
  onDelete,
}: JournalTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="text-4xl mb-4 opacity-30">&#9835;</div>
        <p className="text-[#c4b5e0] text-sm">
          아직 기록이 없어요.
          <br />
          오늘의 이야기를 들려주세요.
        </p>
      </motion.div>
    );
  }

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    onEntriesChange();
  };

  const grouped = entries.reduce<Record<string, JournalEntry[]>>(
    (acc, entry) => {
      const dateKey = formatDate(entry.date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
      return acc;
    },
    {}
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {Object.entries(grouped).map(([dateLabel, dateEntries]) => (
        <div key={dateLabel}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-purple-100 dark:bg-purple-800" />
            <span className="text-[#c4b5e0] dark:text-[#9b8fb3] text-xs font-medium">
              {dateLabel}
            </span>
            <div className="h-px flex-1 bg-purple-100 dark:bg-purple-800" />
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {dateEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-purple-100 dark:border-purple-800 rounded-2xl p-4 hover:bg-white/80 dark:hover:bg-white/15 transition-colors shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[#c4b5e0] text-xs">
                        {formatTime(entry.date)}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {entry.emotions.map((emotion) => (
                          <span
                            key={emotion}
                            className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-full text-purple-500 dark:text-purple-400 text-xs"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-[#c4b5e0] hover:text-rose-400 transition-colors p-1"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Text preview */}
                  <p className="text-[#6b5b8a] dark:text-[#c4b5e0] text-sm leading-relaxed mb-3 line-clamp-2">
                    {entry.text}
                  </p>

                  {/* Expanded playlist */}
                  <AnimatePresence>
                    {expandedId === entry.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-purple-100 dark:border-purple-800 pt-3 mb-3">
                          <p className="text-[#8b7fa3] text-xs italic mb-2">
                            &ldquo;{entry.playlist.djComment}&rdquo;
                          </p>
                          <div className="space-y-1.5">
                            {entry.playlist.tracks.map((track, i) => (
                              <a
                                key={track.id}
                                href={track.youtubeMusicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-[#8b7fa3] hover:text-[#6b5b8a] transition-colors"
                              >
                                <span className="text-[#c4b5e0] font-mono w-5">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="truncate">
                                  {track.name}
                                </span>
                                <span className="text-[#c4b5e0]">-</span>
                                <span className="text-[#a99bc4] truncate">
                                  {track.artist}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === entry.id ? null : entry.id
                        )
                      }
                      className="text-xs text-[#8b7fa3] hover:text-[#6b5b8a] transition-colors"
                    >
                      {expandedId === entry.id
                        ? "플레이리스트 접기"
                        : "플레이리스트 보기"}
                    </button>
                    <span className="text-purple-200">|</span>
                    <button
                      onClick={() => onReRecommend(entry)}
                      className="text-xs text-pink-400/60 hover:text-pink-500 transition-colors"
                    >
                      새로운 추천 받기
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
