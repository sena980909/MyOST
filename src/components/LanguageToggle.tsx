"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "ko" ? "en" : "ko")}
      className="flex items-center gap-1 p-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-800
                 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
      title={lang === "ko" ? "Switch to English" : "한국어로 전환"}
    >
      <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
      <span className="text-xs font-medium text-purple-500 dark:text-purple-400">
        {lang === "ko" ? "EN" : "KO"}
      </span>
    </button>
  );
}
