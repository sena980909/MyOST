import OpenAI from "openai";
import { EmotionAnalysis } from "@/types";
import { Lang } from "@/lib/i18n";

function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Random style seeds to force diverse recommendations each time
const styleSeeds = {
  ko: [
    "이번에는 2000년대 초반 인디 팝과 얼터너티브 트랙을 중심으로 추천해주세요.",
    "이번에는 2010년대 후반~2020년대 최신 곡 위주로 추천해주세요.",
    "이번에는 90년대 클래식과 레트로 팝을 섞어서 추천해주세요.",
    "이번에는 영국 출신 아티스트와 인디씬 곡을 많이 포함해주세요.",
    "이번에는 R&B, 소울, 네오소울 계열 곡을 많이 포함해주세요.",
    "이번에는 싱어송라이터와 어쿠스틱 곡 위주로 추천해주세요.",
    "이번에는 일렉트로닉 팝, 신스팝, 드림팝 계열을 많이 넣어주세요.",
    "이번에는 잘 알려지지 않은 숨겨진 명곡 위주로 추천해주세요.",
    "이번에는 2020년대 신인 아티스트 곡을 많이 포함해주세요.",
    "이번에는 팝록, 인디록 계열 곡을 많이 포함해주세요.",
  ],
  en: [
    "Focus on early 2000s indie pop and alternative tracks this time.",
    "Focus on late 2010s to 2020s recent releases this time.",
    "Mix in 90s classics and retro pop this time.",
    "Include many British artists and indie scene tracks this time.",
    "Include many R&B, soul, and neo-soul tracks this time.",
    "Focus on singer-songwriters and acoustic tracks this time.",
    "Include many electronic pop, synth-pop, and dream pop tracks this time.",
    "Focus on hidden gems and lesser-known tracks this time.",
    "Include many tracks from 2020s emerging artists this time.",
    "Include many pop-rock and indie rock tracks this time.",
  ],
};

function getRandomStyleSeed(lang: Lang): string {
  const seeds = styleSeeds[lang] || styleSeeds.ko;
  return seeds[Math.floor(Math.random() * seeds.length)];
}

function buildExcludePrompt(excludeSongs: { title: string; artist: string }[], lang: Lang): string {
  if (!excludeSongs || excludeSongs.length === 0) return "";

  // Limit to most recent 50 songs to keep prompt size reasonable
  const limited = excludeSongs.slice(0, 50);
  const songList = limited.map(s => `- "${s.title}" by ${s.artist}`).join("\n");

  if (lang === "en") {
    return `\n\n⚠️ IMPORTANT - DO NOT recommend any of these songs (the user already has them):\n${songList}\n\nYou MUST choose completely different songs not in this list.`;
  }
  return `\n\n⚠️ 중요 - 아래 곡들은 이미 사용자가 가지고 있으므로 절대 추천하지 마세요:\n${songList}\n\n반드시 이 목록에 없는 완전히 다른 곡을 추천하세요.`;
}

const systemPrompts = {
  ko: {
    analyze: `당신은 사용자의 텍스트에서 감정을 분석하고, 그 감정에 딱 맞는 음악을 추천하는 전문 음악 큐레이터입니다.
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
- ⚠️ 반드시 영어권 팝송(Pop)만 추천하세요. 한국 곡, 일본 곡 등 비영어권 곡은 절대 포함하지 마세요
- 반드시 실제로 존재하는 곡만 추천하세요. 곡을 지어내지 마세요!
- 곡 제목은 실제 발매된 공식 제목 그대로 사용하세요
- 아티스트명도 공식 활동명을 정확히 사용하세요
- 확신이 없는 곡보다는 잘 알려진 정확한 곡을 추천하세요
- 곡 제목과 아티스트의 조합이 정확한지 반드시 확인하세요
- 감정의 뉘앙스에 맞는 곡을 선택하세요 (단순 키워드 매칭이 아닌 분위기/무드 매칭)
- 너무 유명한 곡만 추천하지 말고, 숨겨진 명곡도 섞어주세요
- 매번 같은 곡을 추천하지 말고, 다양한 아티스트와 시대의 곡을 골고루 추천하세요
- 10곡 중 최소 3곡은 잘 알려지지 않은 곡(히든 젬)으로 구성하세요
- 같은 아티스트의 곡은 최대 1곡만 포함하세요
- 선곡 이유는 청취자의 감정과 곡의 분위기를 연결하여 시적이고 감성적으로 작성하세요
- 반말체를 사용하되, 친근하고 포근한 느낌으로요

감정-음악 매핑 가이드:
- 슬픔/그리움: 잔잔한 팝 발라드, 어쿠스틱 팝, 인디 팝
- 기쁨/설렘: 경쾌한 팝, 댄스 팝, 펑키 팝
- 분노/답답함: 팝록, 얼터너티브 팝
- 평온/안정: 소프트 팝, 드림 팝, lo-fi 팝
- 불안/긴장: 얼터너티브 팝, 일렉트로 팝
- 사랑/따뜻함: R&B 팝, 소울 팝, 어쿠스틱 팝`,
    dj: `당신은 감성적이고 따뜻한 심야 라디오 DJ입니다.
청취자의 감정에 깊이 공감하며, 플레이리스트를 소개하는 멘트를 작성합니다.
2-3문장으로, 반말체, 친근하고 포근한 느낌으로 작성하세요.
JSON 형식으로 응답: {"djComment": "멘트 내용"}`,
    djFallback: "오늘 밤, 당신을 위한 음악을 준비했어.",
  },
  en: {
    analyze: `You are an expert music curator who analyzes emotions from user text and recommends perfectly matching songs.
Read beyond surface-level words to understand the underlying emotions and nuances.

Respond ONLY in the following JSON format:
{
  "emotions": ["emotion1", "emotion2"],
  "intensity": 0.0~1.0,
  "context": "Brief situation summary (one sentence)",
  "recommendations": [
    {
      "title": "Song title (original)",
      "artist": "Artist name",
      "reason": "Why this song was chosen (1-2 sentences, warm late-night radio DJ style)"
    }
  ]
}

Recommendation guidelines:
- Recommend exactly 10 songs
- ⚠️ Only recommend English-language pop songs. Never include Korean, Japanese, or other non-English songs
- Only recommend songs that actually exist. Do not make up songs!
- Use the exact official release title for song names
- Use the exact official stage name for artists
- Prefer well-known accurate songs over uncertain ones
- Double-check that song title and artist combinations are correct
- Choose songs that match the emotional nuance (mood matching, not keyword matching)
- Mix well-known hits with hidden gems
- Don't always recommend the same songs - use diverse artists and eras
- At least 3 out of 10 songs should be lesser-known hidden gems
- Include at most 1 song per artist
- Write selection reasons poetically, connecting the listener's emotions with the song's atmosphere
- Use a warm, friendly, casual tone

Emotion-music mapping guide:
- Sadness/Nostalgia: Gentle pop ballads, acoustic pop, indie pop
- Joy/Excitement: Upbeat pop, dance pop, funky pop
- Anger/Frustration: Pop rock, alternative pop
- Peace/Calm: Soft pop, dream pop, lo-fi pop
- Anxiety/Tension: Alternative pop, electro pop
- Love/Warmth: R&B pop, soul pop, acoustic pop`,
    dj: `You are an emotional and warm late-night radio DJ.
You deeply empathize with the listener's emotions and write a comment introducing the playlist.
Write 2-3 sentences in a warm, friendly, casual tone.
Respond in JSON format: {"djComment": "your comment"}`,
    djFallback: "Tonight, I've prepared some music just for you.",
  },
};

export async function analyzeAndRecommend(
  text: string,
  lang: Lang = "ko",
  excludeSongs: { title: string; artist: string }[] = []
): Promise<EmotionAnalysis> {
  const styleSeed = getRandomStyleSeed(lang);
  const excludePrompt = buildExcludePrompt(excludeSongs, lang);
  const systemContent = systemPrompts[lang].analyze + excludePrompt + "\n\n" + styleSeed;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemContent,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 1.0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty OpenAI response");
  }

  return JSON.parse(content) as EmotionAnalysis;
}

export async function generateDJComment(
  emotions: string[],
  context: string,
  trackNames: string[],
  lang: Lang = "ko"
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompts[lang].dj,
      },
      {
        role: "user",
        content: `${lang === "ko" ? "청취자 감정" : "Listener emotions"}: ${emotions.join(", ")}
${lang === "ko" ? "상황" : "Context"}: ${context}
${lang === "ko" ? "준비한 곡" : "Prepared songs"}: ${trackNames.join(", ")}`,
      },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) return systemPrompts[lang].djFallback;

  const parsed = JSON.parse(content);
  return parsed.djComment || systemPrompts[lang].djFallback;
}
