import { NextRequest, NextResponse } from "next/server";
import { buildTracks } from "@/lib/youtube";
import { generateDJComment } from "@/lib/openai";
import { EmotionAnalysis } from "@/types";
import { Lang, getTranslations } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  try {
    const { analysis, lang = "ko" } = (await request.json()) as {
      analysis: EmotionAnalysis;
      lang?: Lang;
    };
    const safeLang = lang === "en" ? "en" : "ko";
    const t = getTranslations(safeLang);

    if (!analysis || !analysis.recommendations) {
      return NextResponse.json(
        { error: "invalid_input", message: t.api.analysisDataRequired },
        { status: 400 }
      );
    }

    const tracks = buildTracks(analysis.recommendations);

    const trackNames = tracks.map((t) => `${t.name} - ${t.artist}`);
    const djComment = await generateDJComment(
      analysis.emotions,
      analysis.context,
      trackNames,
      safeLang
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
        message: "Playlist generation failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
