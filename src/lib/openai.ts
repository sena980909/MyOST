import OpenAI from "openai";
import { EmotionAnalysis } from "@/types";

function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeAndRecommend(text: string): Promise<EmotionAnalysis> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `당신은 사용자의 텍스트에서 감정을 분석하고, 그 감정에 딱 맞는 음악을 추천하는 전문 음악 큐레이터입니다.
사용자의 글에서 표면적인 단어뿐만 아니라 내재된 감정과 뉘앙스까지 파악해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "emotions": ["감정1", "감정2"],
  "intensity": 0.0~1.0,
  "context": "상황 요약 (한 문장)",
  "recommendations": [
    {
      "title": "곡 제목 (원제)",
      "artist": "아티스트명",
      "reason": "이 곡을 선곡한 이유 (1-2문장, 심야 라디오 DJ 스타일로 따뜻하게)"
    }
  ]
}

추천 가이드:
- 정확히 10곡을 추천하세요
- 한국 곡과 해외 곡을 적절히 섞어주세요
- ⚠️ 가장 중요: 반드시 실제로 존재하는 곡만 추천하세요. 곡을 지어내지 마세요!
- 곡 제목은 실제 발매된 공식 제목 그대로 사용하세요. 번역하거나 변형하지 마세요
- 아티스트명도 공식 활동명을 정확히 사용하세요 (예: "아이유" O, "IU" O, "이지은" X)
- 확신이 없는 곡보다는 잘 알려진 정확한 곡을 추천하세요
- 곡 제목과 아티스트의 조합이 정확한지 반드시 확인하세요 (다른 아티스트의 곡과 혼동하지 마세요)
- 감정의 뉘앙스에 맞는 곡을 선택하세요 (단순 키워드 매칭이 아닌 분위기/무드 매칭)
- 너무 유명한 곡만 추천하지 말고, 숨겨진 명곡도 섞어주세요
- 선곡 이유는 청취자의 감정과 곡의 분위기를 연결하여 시적이고 감성적으로 작성하세요
- 반말체를 사용하되, 친근하고 포근한 느낌으로요

감정-음악 매핑 가이드:
- 슬픔/그리움: 잔잔한 발라드, 어쿠스틱, 인디
- 기쁨/설렘: 경쾌한 팝, 댄스, 펑키
- 분노/답답함: 록, 힙합, 강렬한 일렉트로닉
- 평온/안정: 앰비언트, 재즈, 클래식, lo-fi
- 불안/긴장: 얼터너티브, 포스트록, 일렉트로니카
- 사랑/따뜻함: R&B, 소울, 어쿠스틱 팝`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.6,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("OpenAI 응답이 비어있습니다.");
  }

  return JSON.parse(content) as EmotionAnalysis;
}

export async function generateDJComment(
  emotions: string[],
  context: string,
  trackNames: string[]
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `당신은 감성적이고 따뜻한 심야 라디오 DJ입니다.
청취자의 감정에 깊이 공감하며, 플레이리스트를 소개하는 멘트를 작성합니다.
2-3문장으로, 반말체, 친근하고 포근한 느낌으로 작성하세요.
JSON 형식으로 응답: {"djComment": "멘트 내용"}`,
      },
      {
        role: "user",
        content: `청취자 감정: ${emotions.join(", ")}
상황: ${context}
준비한 곡: ${trackNames.join(", ")}`,
      },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) return "오늘 밤, 당신을 위한 음악을 준비했어.";

  const parsed = JSON.parse(content);
  return parsed.djComment || "오늘 밤, 당신을 위한 음악을 준비했어.";
}
