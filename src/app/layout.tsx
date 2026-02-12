import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MyOST - 당신의 감정에 맞는 음악을 찾아드립니다",
  description:
    "AI가 당신의 감정을 분석하고, 지금 이 순간에 딱 맞는 10곡의 플레이리스트를 만들어드려요. 심야 라디오 DJ의 따뜻한 코멘터리와 함께.",
  manifest: "/manifest.json",
  openGraph: {
    title: "MyOST - AI 감정 기반 음악 큐레이션",
    description: "오늘의 감정을 텍스트로 알려주세요. AI가 당신만의 OST를 찾아드립니다.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyOST - AI 감정 기반 음악 큐레이션",
    description: "오늘의 감정을 텍스트로 알려주세요. AI가 당신만의 OST를 찾아드립니다.",
  },
};

export const viewport: Viewport = {
  themeColor: "#a855f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] min-h-screen`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
