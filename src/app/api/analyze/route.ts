import { NextRequest, NextResponse } from "next/server";
import { analyzeAndRecommend } from "@/lib/openai";
import { auth } from "@/lib/auth";
import {
  getDailyUsageCount,
  incrementDailyUsage,
  getUserProfile,
  deductPoint,
} from "@/lib/db";

const FREE_DAILY_LIMIT = 2;

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

    // Check usage limits for logged-in users
    const session = await auth();
    if (session?.user?.id) {
      const [used, profile] = await Promise.all([
        getDailyUsageCount(session.user.id),
        getUserProfile(session.user.id),
      ]);

      const { tier, points } = profile;

      // Premium: unlimited
      if (tier === "premium") {
        await incrementDailyUsage(session.user.id);
      }
      // Free tier: check daily limit, then try points
      else if (used >= FREE_DAILY_LIMIT) {
        // Try to use a point
        if (points > 0) {
          const deducted = await deductPoint(session.user.id);
          if (!deducted) {
            return NextResponse.json(
              {
                error: "usage_limit_exceeded",
                message: "오늘의 무료 추천 횟수(2회)를 모두 사용했어요.",
                tier,
                points: 0,
                used,
                limit: FREE_DAILY_LIMIT,
              },
              { status: 429 }
            );
          }
          await incrementDailyUsage(session.user.id);
        } else {
          return NextResponse.json(
            {
              error: "usage_limit_exceeded",
              message: "오늘의 무료 추천 횟수(2회)를 모두 사용했어요.",
              tier,
              points,
              used,
              limit: FREE_DAILY_LIMIT,
            },
            { status: 429 }
          );
        }
      } else {
        // Free tier, still within daily limit
        await incrementDailyUsage(session.user.id);
      }
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
