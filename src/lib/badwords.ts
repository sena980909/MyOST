const BADWORDS = [
  // Korean profanity
  "시발", "씨발", "ㅅㅂ", "ㅆㅂ", "시bal", "씨bal", "sibal",
  "병신", "ㅂㅅ", "byungsin",
  "지랄", "ㅈㄹ", "jiral",
  "개새끼", "새끼", "ㅅㄲ", "개새",
  "좆", "ㅈ같", "존나", "ㅈㄴ", "졸라",
  "꺼져", "닥쳐", "썅", "엿먹어",
  "씹", "개같", "개년", "개놈",
  "걸레", "창녀", "보지", "자지",

  // Korean discrimination / hate
  "한남", "한녀", "맘충", "틀딱", "급식충",
  "김치녀", "된장녀", "싸이코",

  // Korean sexual
  "강간", "성폭행", "몰카", "야동", "포르노",

  // Korean violence
  "죽여", "죽어", "살인", "자살해", "뒤져", "뒤져라", "패죽",

  // Korean family insults
  "느금마", "니미", "애미", "에미", "니애미", "엄마없",

  // English profanity
  "fuck", "fck", "f*ck", "shit", "bitch", "dick", "pussy",
  "nigger", "nigga", "cunt", "whore", "slut", "bastard",
  "cock", "penis", "asshole", "motherfucker", "stfu", "gtfo",

  // English sexual / violence
  "rape", "molest", "porn", "hentai",
  "kill you", "murder",

  // Prompt injection / hacking attempts
  "ignore previous", "ignore above", "disregard",
  "system prompt", "you are now", "act as",
  "jailbreak", "dan mode", "developer mode",
  "bypass", "override instructions",

  // Admin impersonation
  "admin", "관리자", "운영자", "myost", "시스템",
];

export function containsBadWord(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[\s_\-.,!?]/g, "");
  return BADWORDS.some((word) => normalized.includes(word.toLowerCase().replace(/\s/g, "")));
}
