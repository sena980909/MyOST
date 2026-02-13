"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JournalEntry } from "@/types";

interface MigrationPromptProps {
  localEntries: JournalEntry[];
  onMigrate: (entries: JournalEntry[]) => Promise<number>;
  onDismiss: () => void;
}

export default function MigrationPrompt({
  localEntries,
  onMigrate,
  onDismiss,
}: MigrationPromptProps) {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  if (localEntries.length === 0) return null;

  const handleMigrate = async () => {
    setMigrating(true);
    const count = await onMigrate(localEntries);
    setResult(count);
    setMigrating(false);

    if (count > 0) {
      localStorage.removeItem("myost-journal");
      setTimeout(onDismiss, 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full max-w-2xl mx-auto mb-4"
      >
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
          {result !== null ? (
            <p className="text-blue-600 text-sm text-center">
              {result}개의 기록이 클라우드로 이전되었어요!
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-blue-600 text-sm font-medium">
                  이 기기에 {localEntries.length}개의 기록이 있어요
                </p>
                <p className="text-blue-400 text-xs mt-0.5">
                  클라우드로 이전하면 모든 기기에서 볼 수 있어요
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 text-xs text-[#8b7fa3] hover:text-[#6b5b8a] transition-colors"
                >
                  나중에
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={migrating}
                  className="px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-lg text-xs text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  {migrating ? "이전 중..." : "이전하기"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
