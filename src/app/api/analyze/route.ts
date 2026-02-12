import { NextRequest, NextResponse } from "next/server";
import { analyzeAndRecommend } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
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
