"use client";

import { UsageInfo } from "@/types";

interface UsageBannerProps {
  usageInfo: UsageInfo;
  isLoggedIn: boolean;
  onUpgradeClick: () => void;
}

export default function UsageBanner({
  usageInfo,
  isLoggedIn,
  onUpgradeClick,
}: UsageBannerProps) {
  if (!isLoggedIn) return null;

  const isPremium = usageInfo.tier === "premium";
  const dailyRemaining =
    usageInfo.limit != null ? usageInfo.limit - usageInfo.used : null;
  const hasPoints = usageInfo.points > 0;
  const isLow = !isPremium && dailyRemaining != null && dailyRemaining <= 0;

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs ${
          isPremium
            ? "bg-amber-50 border border-amber-200"
            : isLow
            ? "bg-rose-50 border border-rose-200"
            : "bg-white/60 border border-purple-100"
        }`}
      >
        <div className="flex items-center gap-3">
          {isPremium ? (
            <span className="text-amber-600">Premium - 무제한</span>
          ) : (
            <>
              <span className={isLow ? "text-rose-500" : "text-[#8b7fa3]"}>
                오늘 {dailyRemaining}/{usageInfo.limit}회
              </span>
              {hasPoints && (
                <>
                  <span className="text-purple-200">|</span>
                  <span className="text-emerald-500">
                    패스권 {usageInfo.points}회
                  </span>
                </>
              )}
            </>
          )}
        </div>
        {!isPremium && (
          <button
            onClick={onUpgradeClick}
            className="text-purple-400 hover:text-purple-500 transition-colors"
          >
            업그레이드
          </button>
        )}
        {isPremium && usageInfo.saveLimit == null && (
          <span className="text-amber-400">저장 {usageInfo.savedCount}개</span>
        )}
      </div>
      {!isPremium && usageInfo.saveLimit != null && (
        <div className="flex justify-end mt-1 px-1">
          <span className="text-[#c4b5e0] text-[10px]">
            저장 {usageInfo.savedCount}/{usageInfo.saveLimit}개
          </span>
        </div>
      )}
    </div>
  );
}
