"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import EmotionInput from "@/components/EmotionInput";
import Loading from "@/components/Loading";
import Commentary from "@/components/Commentary";
import PlaylistCard from "@/components/PlaylistCard";
import JournalTimeline from "@/components/JournalTimeline";
import AuthButton from "@/components/AuthButton";
import AdBanner from "@/components/AdBanner";
import MigrationPrompt from "@/components/MigrationPrompt";
import ThemeToggle from "@/components/ThemeToggle";
import BgmPlayer from "@/components/BgmPlayer";
import { EmotionAnalysis, PlaylistResult, JournalEntry } from "@/types";
import { useJournal } from "@/hooks/useJournal";

type Tab = "new" | "journal";
type AppState = "input" | "loading" | "result" | "error";

export default function Home() {
  const [tab, setTab] = useState<Tab>("new");
  const [appState, setAppState] = useState<AppState>("input");
  const [result, setResult] = useState<PlaylistResult | null>(null);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<EmotionAnalysis | null>(null);
  const [currentText, setCurrentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [diary, setDiary] = useState("");
  const [showMigration, setShowMigration] = useState(true);
  const [localEntriesForMigration, setLocalEntriesForMigration] = useState<
    JournalEntry[]
  >([]);
  const [bgmEnabled, setBgmEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("myost-bgm");
    if (saved === "true") setBgmEnabled(true);
  }, []);

  const {
    entries: journalEntries,
    isLoggedIn,
    saveEntry,
    deleteEntry,
    loadEntries,
    getLocalEntriesForMigration,
    migrateEntries,
  } = useJournal();

  useEffect(() => {
    if (isLoggedIn) {
      const local = getLocalEntriesForMigration();
      setLocalEntriesForMigration(local);
    }
  }, [isLoggedIn, getLocalEntriesForMigration]);

  const handleSubmit = async (text: string) => {
    setTab("new");
    setAppState("loading");
    setErrorMessage("");
    setSaved(false);
    setCurrentText(text);

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.message || "감정 분석에 실패했어요.");
      }

      const { analysis }: { analysis: EmotionAnalysis } =
        await analyzeRes.json();
      setCurrentAnalysis(analysis);

      const playlistRes = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });

      if (!playlistRes.ok) {
        const err = await playlistRes.json();
        throw new Error(err.message || "플레이리스트 생성에 실패했어요.");
      }

      const { result: playlistResult }: { result: PlaylistResult } =
        await playlistRes.json();

      setResult(playlistResult);
      setAppState("result");
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했어요. 다시 시도해주세요."
      );
      setAppState("error");
    }
  };

  const handleSave = async () => {
    if (!result || !currentAnalysis || saved) return;
    const success = await saveEntry(
      currentText,
      currentAnalysis.emotions,
      currentAnalysis.context,
      result,
      diary.trim() || undefined
    );
    if (success) {
      setSaved(true);
    }
  };

  const handleReset = () => {
    setAppState("input");
    setResult(null);
    setCurrentAnalysis(null);
    setCurrentText("");
    setErrorMessage("");
    setSaved(false);
    setDiary("");
  };

  const handleReRecommend = (entry: JournalEntry) => {
    setTab("new");
    handleSubmit(entry.text);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Pastel background orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-200/40 dark:bg-pink-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-200/40 dark:bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/30 dark:bg-purple-500/15 rounded-full blur-[128px]" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-100/30 dark:bg-amber-400/15 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Link href="/" onClick={handleReset} className="cursor-pointer">
              <Image
                src="/MyOST-Title.png"
                alt="MyOST"
                width={200}
                height={200}
                className="w-[200px] h-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>

          <div
            className="cursor-pointer flex justify-center"
            onClick={() => {
              if (appState === "input") {
                const next = !bgmEnabled;
                setBgmEnabled(next);
                localStorage.setItem("myost-bgm", String(next));
              } else {
                handleReset();
              }
            }}
          >
            <motion.div
              animate={
                bgmEnabled && appState === "input"
                  ? { rotate: [0, 2, 0, 2, 0, 2, 0] }
                  : { rotate: 0 }
              }
              transition={
                bgmEnabled && appState === "input"
                  ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            >
              <Image
                src="/MyOST-icon.png"
                alt="MyOST 마스코트"
                width={260}
                height={260}
                className="drop-shadow-lg rounded-full"
                priority
              />
            </motion.div>
          </div>
          <BgmPlayer isPlaying={appState === "input" && bgmEnabled} />
          <p className="text-[#8b7fa3] dark:text-purple-300 text-lg md:text-xl mt-2">
            당신의 감정에 맞는 음악을 찾아드립니다
          </p>
        </motion.header>

        {/* Migration prompt */}
        {isLoggedIn &&
          showMigration &&
          localEntriesForMigration.length > 0 && (
            <MigrationPrompt
              localEntries={localEntriesForMigration}
              onMigrate={async (entries) => {
                const count = await migrateEntries(entries);
                if (count > 0) setLocalEntriesForMigration([]);
                return count;
              }}
              onDismiss={() => setShowMigration(false)}
            />
          )}

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-8">
          <button
            onClick={() => {
              setTab("new");
              if (appState !== "loading" && appState !== "result") {
                handleReset();
              }
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              tab === "new"
                ? "bg-white/80 dark:bg-slate-800/80 text-[#6b5b8a] dark:text-purple-200 border border-purple-200 dark:border-purple-700 shadow-sm"
                : "text-[#8b7fa3] dark:text-purple-300 hover:text-[#6b5b8a] dark:hover:text-purple-200"
            }`}
          >
            오늘의 OST
          </button>
          <button
            onClick={() => setTab("journal")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              tab === "journal"
                ? "bg-white/80 dark:bg-slate-800/80 text-[#6b5b8a] dark:text-purple-200 border border-purple-200 dark:border-purple-700 shadow-sm"
                : "text-[#8b7fa3] dark:text-purple-300 hover:text-[#6b5b8a] dark:hover:text-purple-200"
            }`}
          >
            내 기록
            {journalEntries.length > 0 && (
              <span className="bg-purple-100 dark:bg-purple-900/60 text-purple-500 dark:text-purple-300 text-xs px-1.5 py-0.5 rounded-full">
                {journalEntries.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === "journal" ? (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <JournalTimeline
                entries={journalEntries}
                onReRecommend={handleReRecommend}
                onEntriesChange={loadEntries}
                onDelete={handleDelete}
              />
              {/* Ad after journal list */}
              {journalEntries.length > 0 && (
                <div className="mt-6">
                  <AdBanner slot="journal-list" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {appState === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmotionInput onSubmit={handleSubmit} isLoading={false} />
                  </motion.div>
                )}

                {appState === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loading />
                  </motion.div>
                )}

                {appState === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="text-6xl mb-4">:(</div>
                    <p className="text-[#6b5b8a] dark:text-purple-200 text-lg mb-6">
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700 rounded-full
                                 text-[#6b5b8a] dark:text-purple-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200"
                    >
                      다시 시도하기
                    </button>
                  </motion.div>
                )}

                {appState === "result" && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Commentary
                      djComment={result.djComment}
                      emotionSummary={result.emotionSummary}
                    />

                    <div className="w-full max-w-2xl mx-auto space-y-3">
                      <h2 className="text-[#8b7fa3] dark:text-purple-300 text-sm font-medium uppercase tracking-wider mb-4 px-2">
                        Your Playlist
                      </h2>
                      {result.tracks.map((track, index) => (
                        <PlaylistCard
                          key={track.id}
                          track={track}
                          index={index}
                        />
                      ))}
                    </div>

                    {/* Ad below playlist, above action buttons */}
                    <div className="mt-6 mb-4">
                      <AdBanner slot="result-bottom" />
                    </div>

                    {/* Diary input */}
                    {!saved && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="w-full max-w-2xl mx-auto mt-6"
                      >
                        <label className="block text-[#8b7fa3] dark:text-purple-300 text-sm font-medium mb-2 px-2">
                          오늘의 일기 (선택)
                        </label>
                        <textarea
                          value={diary}
                          onChange={(e) => setDiary(e.target.value.slice(0, 500))}
                          placeholder="오늘 하루를 기록해보세요..."
                          rows={4}
                          className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-purple-100 dark:border-purple-800 rounded-2xl px-5 py-4
                                     text-[#4a4458] dark:text-gray-100 placeholder-[#c4b5e0] dark:placeholder-purple-500 text-sm resize-none
                                     focus:outline-none focus:border-purple-300 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-700/50
                                     transition-all duration-300 shadow-sm"
                        />
                        <div className="text-right mt-1 px-2">
                          <span className={`text-xs ${diary.length >= 500 ? "text-rose-400" : "text-[#c4b5e0] dark:text-purple-400"}`}>
                            {diary.length}/500
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4 mb-8"
                    >
                      <button
                        onClick={handleSave}
                        disabled={saved}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                          saved
                            ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400"
                            : "bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/70"
                        }`}
                      >
                        {saved ? "기록 완료!" : "오늘의 기록으로 저장"}
                      </button>

                      <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-white/60 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-800 rounded-full
                                   text-[#8b7fa3] dark:text-purple-300 hover:text-[#6b5b8a] dark:hover:text-purple-200 hover:bg-white/80 dark:hover:bg-slate-800/80
                                   transition-all duration-200 text-sm"
                      >
                        새로운 이야기 들려주기
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-gradient-to-t from-[#f8f5ff] dark:from-[#1a1625] to-transparent">
        <p className="text-[#c4b5e0] dark:text-purple-400 text-xs">
          Powered by OpenAI & YouTube Music
        </p>
      </footer>
    </main>
  );
}
