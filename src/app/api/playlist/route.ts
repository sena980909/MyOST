import { NextRequest, NextResponse } from "next/server";
import { buildTracks } from "@/lib/youtube";
import { generateDJComment } from "@/lib/openai";
import { EmotionAnalysis } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { analysis } = (await request.json()) as {
      analysis: EmotionAnalysis;
    };

    if (!analysis || !analysis.recommendations) {
      return NextResponse.json(
        { error: "invalid_input", message: "감정 분석 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    const tracks = buildTracks(analysis.recommendations);

    const trackNames = tracks.map((t) => `${t.name} - ${t.artist}`);
    const djComment = await generateDJComment(
      analysis.emotions,
      analysis.context,
      trackNames
    );

    return NextResponse.json({
      result: {
        djComment,
        tracks,
        emotionSummary: `${analysis.emotions.join(", ")} - ${analysis.context}`,
      },
    });
  } catch (error) {
    console.error("Playlist generation error:", error);
    return NextResponse.json(
      {
        error: "playlist_failed",
        message: "플레이리스트 생성 중 오류가 발생했어요. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
