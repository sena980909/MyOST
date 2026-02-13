import { NextRequest, NextResponse } from "next/server";
import { analyzeAndRecommend } from "@/lib/openai";
import { auth } from "@/lib/auth";
import { checkRateLimit, logGeneration } from "@/lib/db";
import { containsBadWord } from "@/lib/badwords";
import { Lang, getTranslations } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  try {
    const { text, lang = "ko" } = await request.json() as { text: string; lang?: Lang };
    const t = getTranslations(lang === "en" ? "en" : "ko");

    // Rate limiting
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { allowed, remaining, limit } = await checkRateLimit(userId, ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: t.api.rateLimit(limit),
          remaining,
        },
        { status: 429 }
      );
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "invalid_input", message: t.api.inputRequired },
        { status: 400 }
      );
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        {
          error: "text_too_short",
          message: t.api.tooShort,
        },
        { status: 400 }
      );
    }

    if (containsBadWord(text)) {
      return NextResponse.json(
        {
          error: "inappropriate_content",
          message: t.api.inappropriate,
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeAndRecommend(text, lang === "en" ? "en" : "ko");

    // Log successful generation
    await logGeneration(userId, ip);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return NextResponse.json(
      {
        error: "analysis_failed",
        message: "Emotion analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
