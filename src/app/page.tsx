"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EmotionInput from "@/components/EmotionInput";
import Loading from "@/components/Loading";
import Commentary from "@/components/Commentary";
import PlaylistCard from "@/components/PlaylistCard";
import JournalTimeline from "@/components/JournalTimeline";
import AuthButton from "@/components/AuthButton";
import UsageBanner from "@/components/UsageBanner";
import PremiumUpgradeModal from "@/components/PremiumUpgradeModal";
import MigrationPrompt from "@/components/MigrationPrompt";
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMigration, setShowMigration] = useState(true);
  const [localEntriesForMigration, setLocalEntriesForMigration] = useState<
    JournalEntry[]
  >([]);

  const {
    entries: journalEntries,
    usageInfo,
    isLoggedIn,
    saveEntry,
    deleteEntry,
    loadEntries,
    loadUsage,
    getLocalEntriesForMigration,
    migrateEntries,
  } = useJournal();

  // Check for local entries to migrate when logged in
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

        // Handle usage limit exceeded
        if (err.error === "usage_limit_exceeded") {
          setAppState("input");
          setShowUpgradeModal(true);
          return;
        }

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

      // Refresh usage after successful generation
      loadUsage();
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
      result
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
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-700/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-700/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 pb-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 relative"
        >
          {/* Auth button - top right */}
          <div className="absolute right-0 top-0">
            <AuthButton />
          </div>

          <div className="cursor-pointer" onClick={handleReset}>
            <Image
              src="/MyOST-Title.png"
              alt="MyOST"
              width={200}
              height={200}
              className="mx-auto mb-2"
              priority
            />
          </div>
          <p className="text-white/50 text-lg md:text-xl">
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
                if (count > 0) {
                  setLocalEntriesForMigration([]);
                }
                return count;
              }}
              onDismiss={() => setShowMigration(false)}
            />
          )}

        {/* Usage banner */}
        <UsageBanner
          usageInfo={usageInfo}
          isLoggedIn={isLoggedIn}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />

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
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            오늘의 OST
          </button>
          <button
            onClick={() => setTab("journal")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              tab === "journal"
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            내 기록
            {journalEntries.length > 0 && (
              <span className="bg-purple-500/30 text-purple-300 text-xs px-1.5 py-0.5 rounded-full">
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
                    <p className="text-white/70 text-lg mb-6">
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-white/10 border border-white/20 rounded-full
                                 text-white hover:bg-white/20 transition-all duration-200"
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
                      <h2 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-4 px-2">
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

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-10 mb-8"
                    >
                      {/* Save button */}
                      <button
                        onClick={handleSave}
                        disabled={saved}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                          saved
                            ? "bg-green-500/20 border border-green-500/30 text-green-300"
                            : "bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                        }`}
                      >
                        {saved ? "기록 완료!" : "오늘의 기록으로 저장"}
                      </button>

                      {/* New story button */}
                      <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-full
                                   text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20
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

      {/* Premium upgrade modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-gradient-to-t from-[#0a0a0f] to-transparent">
        <p className="text-white/20 text-xs">
          Powered by OpenAI & YouTube Music
        </p>
      </footer>
    </main>
  );
}
