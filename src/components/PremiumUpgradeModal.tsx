"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Check = () => (
  <svg
    className="w-4 h-4 text-emerald-400 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ComingSoon = () => (
  <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-400 rounded-full">
    Soon
  </span>
);

type PlanTab = "pass" | "premium";

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
}: PremiumUpgradeModalProps) {
  const [activeTab, setActiveTab] = useState<PlanTab>("pass");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300" />

            <div className="p-6">
              <h2 className="text-[#4a4458] text-lg font-bold mb-1">
                더 많은 음악을 만나보세요
              </h2>
              <p className="text-[#8b7fa3] text-sm mb-5">
                오늘의 무료 추천을 다 사용했어요
              </p>

              {/* Plan tabs */}
              <div className="flex bg-purple-50/50 rounded-xl p-1 mb-5">
                <button
                  onClick={() => setActiveTab("pass")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "pass"
                      ? "bg-white text-emerald-600 border border-emerald-200 shadow-sm"
                      : "text-[#8b7fa3] hover:text-[#6b5b8a]"
                  }`}
                >
                  패스권
                </button>
                <button
                  onClick={() => setActiveTab("premium")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "premium"
                      ? "bg-white text-amber-600 border border-amber-200 shadow-sm"
                      : "text-[#8b7fa3] hover:text-[#6b5b8a]"
                  }`}
                >
                  프리미엄 구독
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "pass" ? (
                  <motion.div
                    key="pass"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 text-center">
                      <p className="text-emerald-500/70 text-xs mb-1">
                        커피 한 잔 값으로
                      </p>
                      <div className="text-3xl font-bold text-[#4a4458] mb-1">
                        ₩2,900
                      </div>
                      <p className="text-[#8b7fa3] text-xs">
                        10회 플레이리스트 생성권
                      </p>
                    </div>

                    <div className="space-y-2 mb-5">
                      {[
                        "무료 횟수 소진 후에도 추가 생성",
                        "구매한 횟수는 만료 없음",
                        "구독 부담 없이 필요할 때만",
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <Check />
                          <span className="text-[#6b5b8a]">{f}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full py-3 bg-gradient-to-r from-emerald-300 to-teal-300 text-white font-bold rounded-xl text-sm opacity-50 cursor-not-allowed"
                      disabled
                    >
                      곧 오픈 예정
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="premium"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 text-center">
                      <p className="text-amber-500/70 text-xs mb-1">
                        월간 구독
                      </p>
                      <div className="text-3xl font-bold text-[#4a4458] mb-1">
                        ₩4,900
                        <span className="text-base font-normal text-[#8b7fa3]">
                          /월
                        </span>
                      </div>
                      <p className="text-[#8b7fa3] text-xs">
                        모든 기능 무제한 이용
                      </p>
                    </div>

                    <div className="space-y-2 mb-5">
                      {[
                        { text: "무제한 플레이리스트 생성", soon: false },
                        { text: "기록 무제한 보관 & 동기화", soon: false },
                        { text: "AI 심층 대화 (더 자세한 고민 상담)", soon: true },
                        { text: "월간 감정 레포트", soon: true },
                        { text: "PDF 내보내기", soon: true },
                      ].map((f) => (
                        <div
                          key={f.text}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check />
                          <span className={f.soon ? "text-[#a99bc4]" : "text-[#6b5b8a]"}>
                            {f.text}
                            {f.soon && <ComingSoon />}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full py-3 bg-gradient-to-r from-amber-300 to-orange-300 text-white font-bold rounded-xl text-sm opacity-50 cursor-not-allowed"
                      disabled
                    >
                      곧 오픈 예정
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 pt-4 border-t border-purple-50">
                <p className="text-[#c4b5e0] text-[11px] text-center">
                  무료 플랜: 매일 2회 생성 &middot; 최근 5개 저장 &middot; 요약 코멘터리
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-3 py-2 text-[#8b7fa3] text-xs hover:text-[#6b5b8a] transition-colors"
              >
                다음에 할게요
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
