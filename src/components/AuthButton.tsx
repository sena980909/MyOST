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
        className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/80 border border-purple-200 text-[#6b5b8a] hover:text-[#4a4458] hover:bg-white transition-all duration-200 shadow-sm"
      >
        로그인
      </Link>
    );
  }

  const tier = session.user.tier;
  const tierConfig = {
    premium: {
      label: "Premium",
      color: "bg-gradient-to-r from-amber-300 to-orange-300 text-white",
    },
    free: {
      label: "Free",
      color: "bg-purple-50 text-purple-400",
    },
  };
  const { label: tierLabel, color: tierColor } =
    tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.free;

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
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-purple-100 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-purple-50">
            <p className="text-[#4a4458] text-sm font-medium truncate">
              {session.user.name}
            </p>
            <p className="text-[#8b7fa3] text-xs truncate">
              {session.user.email}
            </p>
            <span
              className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tierColor}`}
            >
              {tierLabel}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2.5 text-sm text-[#8b7fa3] hover:text-[#4a4458] hover:bg-purple-50/50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
