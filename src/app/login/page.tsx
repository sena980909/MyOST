"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "회원가입에 실패했습니다.");
          setLoading(false);
          return;
        }

        // Auto-login after signup
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("회원가입 완료! 로그인해주세요.");
          setIsSignUp(false);
          setLoading(false);
          return;
        }

        window.location.href = "/";
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          setLoading(false);
          return;
        }

        window.location.href = "/";
      }
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Pastel background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-200/40 dark:bg-pink-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-200/40 dark:bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/30 dark:bg-purple-500/15 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto px-4"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/MyOST-Title.png"
              alt="MyOST"
              width={200}
              height={50}
              className="mx-auto mb-2 dark:hidden"
            />
            <Image
              src="/MyOST-Title-dark.png"
              alt="MyOST"
              width={200}
              height={200}
              className="hidden dark:block mx-auto mb-2 w-[200px] h-auto"
            />
          </Link>
          <Image
            src="/MyOST-icon.png"
            alt="MyOST 마스코트"
            width={260}
            height={260}
            className="mx-auto drop-shadow-lg rounded-full bg-white mb-3"
          />
          <p className="text-[#8b7fa3] dark:text-purple-300 text-sm">
            {isSignUp
              ? "계정을 만들고 내 삶의 OST를 기록하세요."
              : "로그인하고 내 삶의 OST를 기록하세요."}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800 rounded-2xl p-6 shadow-sm">
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                placeholder="닉네임"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-purple-800 rounded-xl text-gray-700 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-purple-500 focus:outline-none focus:border-purple-300 dark:focus:border-purple-600 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-700 transition-all"
              />
            )}
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-purple-800 rounded-xl text-gray-700 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-purple-500 focus:outline-none focus:border-purple-300 dark:focus:border-purple-600 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-700 transition-all"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-purple-800 rounded-xl text-gray-700 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-purple-500 focus:outline-none focus:border-purple-300 dark:focus:border-purple-600 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-700 transition-all"
            />

            {error && (
              <p className="text-red-500 dark:text-red-400 text-xs px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-500 dark:bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-600 dark:hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading
                ? "처리 중..."
                : isSignUp
                  ? "회원가입"
                  : "로그인"}
            </button>
          </form>

          {/* Toggle signup/login */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[#8b7fa3] dark:text-purple-300 text-xs hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isSignUp
                ? "이미 계정이 있나요? 로그인"
                : "계정이 없나요? 회원가입"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-purple-800" />
            <span className="text-xs text-gray-400 dark:text-purple-400">또는</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-purple-800" />
          </div>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-purple-800 rounded-xl text-gray-700 dark:text-gray-100 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-800 hover:shadow-sm transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 계속하기
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-[#c4b5e0] dark:text-purple-400 text-xs hover:text-[#8b7fa3] dark:hover:text-purple-300 transition-colors"
          >
            로그인 없이 사용하기
          </a>
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-2">
          <p className="text-[#c4b5e0] dark:text-purple-400 text-xs text-center mb-3">
            로그인하면 이런 것들이 가능해요
          </p>
          {[
            "모든 기기에서 감정 기록 동기화",
            "감정 기록 영구 보관",
          ].map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-2 text-[#8b7fa3] dark:text-purple-300 text-xs"
            >
              <svg
                className="w-3.5 h-3.5 text-purple-400 dark:text-purple-500 flex-shrink-0"
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
              {benefit}
            </div>
          ))}
        </div>

      </motion.div>
    </main>
  );
}
