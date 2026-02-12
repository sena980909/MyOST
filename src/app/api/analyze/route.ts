import { NextRequest, NextResponse } from "next/server";
import { analyzeAndRecommend } from "@/lib/openai";
import { auth } from "@/lib/auth";
import { checkRateLimit, logGeneration } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { allowed, remaining, limit } = await checkRateLimit(userId, ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: `1시간에 ${limit}번까지 생성할 수 있어요. 잠시 후 다시 시도해주세요.`,
          remaining,
        },
        { status: 429 }
      );
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "invalid_input", message: "텍스트를 입력해주세요." },
        { status: 400 }
      );
    }

    if (text.trim().length < 5) {
      return NextResponse.json(
        {
          error: "text_too_short",
          message: "조금 더 자세히 이야기해주세요. (최소 5자)",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeAndRecommend(text);

    // Log successful generation
    await logGeneration(userId, ip);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return NextResponse.json(
      {
        error: "analysis_failed",
        message: "감정 분석 중 오류가 발생했어요. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
