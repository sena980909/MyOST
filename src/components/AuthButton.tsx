"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-purple-100 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/80 dark:bg-white/10 border border-purple-200 dark:border-purple-700 text-[#6b5b8a] dark:text-[#e8dff5] hover:text-[#4a4458] hover:bg-white dark:hover:bg-white/20 transition-all duration-200 shadow-sm"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 group"
      >
        {session.user.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full border-2 border-purple-100 group-hover:border-purple-200 transition-colors"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-purple-500 text-sm font-medium">
            {session.user.name?.[0] ?? "?"}
          </div>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#241f33] border border-purple-100 dark:border-purple-800 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-purple-50 dark:border-purple-800">
            <p className="text-[#4a4458] dark:text-[#e8dff5] text-sm font-medium truncate">
              {session.user.name}
            </p>
            <p className="text-[#8b7fa3] dark:text-[#c4b5e0] text-xs truncate">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2.5 text-sm text-[#8b7fa3] dark:text-[#c4b5e0] hover:text-[#4a4458] dark:hover:text-[#e8dff5] hover:bg-purple-50/50 dark:hover:bg-purple-900/30 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
