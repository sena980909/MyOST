"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-700/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-700/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto px-4"
      >
        <div className="text-center mb-8">
          <Image
            src="/MyOST-Title.png"
            alt="MyOST"
            width={180}
            height={180}
            className="mx-auto mb-4"
          />
          <p className="text-white/50 text-sm">
            로그인하고 감정 기록을 동기화하세요
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-xl text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors"
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

          {/* Kakao */}
          <button
            onClick={() => signIn("kakao", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-xl text-[#391B1B] font-medium text-sm hover:bg-[#FADA0A] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#391B1B">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.725 1.794 5.118 4.508 6.49l-.916 3.388a.427.427 0 00.65.462l3.953-2.62a13.218 13.218 0 001.805.124c5.523 0 10-3.463 10-7.844C22 6.463 17.523 3 12 3z" />
            </svg>
            카카오로 계속하기
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-white/30 text-xs hover:text-white/50 transition-colors"
          >
            로그인 없이 사용하기
          </a>
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-2">
          <p className="text-white/30 text-xs text-center mb-3">
            로그인하면 이런 것들이 가능해요
          </p>
          {[
            "모든 기기에서 감정 기록 동기화",
            "감정 기록 영구 보관",
            "프리미엄 업그레이드 가능",
          ].map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-2 text-white/40 text-xs"
            >
              <svg
                className="w-3.5 h-3.5 text-purple-400 flex-shrink-0"
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
