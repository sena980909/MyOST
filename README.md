# MyOST - AI Emotion-Based Music Curation

> Tell us how you feel today. AI will find your personal OST.
>
> 오늘의 감정을 텍스트로 알려주세요. AI가 당신만의 OST를 찾아드립니다.

**[https://myost.vercel.app](https://myost.vercel.app)**

## About / 소개

MyOST is a web service that analyzes your emotions with AI and curates a 10-track playlist that perfectly matches your mood. Music is delivered with warm commentary in the style of a late-night radio DJ.

MyOST는 사용자의 감정을 AI로 분석하고, 그 감정에 딱 맞는 10곡의 플레이리스트를 추천하는 웹 서비스입니다. 심야 라디오 DJ 스타일의 따뜻한 코멘터리와 함께 음악을 전달합니다.

## Features / 주요 기능

- **AI Emotion Analysis / AI 감정 분석** - Analyzes emotions and nuances from text (GPT-4o-mini)
- **Personalized Music Curation / 맞춤 음악 추천** - 10 English pop songs matched to your emotions
- **DJ Commentary / DJ 코멘터리** - Warm, poetic song introductions in late-night radio DJ style
- **YouTube Integration / YouTube 연동** - Direct links to YouTube & YouTube Music
- **Emotion Journal / 감정 기록 저장** - Timeline-based emotion diary with journal entries
- **Korean / English Toggle / 한영 전환** - Full UI + AI response language switching
- **Dark Mode / 다크 모드** - Light/Dark theme toggle
- **Lobby BGM / 로비 BGM** - Hidden background music via mascot click
- **Google Login / Google 로그인** - OAuth + Email/Password authentication
- **Cloud Sync / 클라우드 동기화** - Sync records across all devices when logged in
- **PWA Support / PWA 지원** - Add to mobile home screen

## Tech Stack / 기술 스택

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| AI | OpenAI GPT-4o-mini |
| Auth | NextAuth v5 (Google OAuth + Credentials) |
| Database | Supabase (PostgreSQL) |
| i18n | Custom implementation (React Context) |
| Deploy | Vercel |

## Project Structure / 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # Main page (lobby + results)
│   ├── login/page.tsx        # Login / Sign up
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── analyze/          # Emotion analysis API
│       ├── playlist/         # Playlist generation API
│       ├── journal/          # Journal CRUD API
│       └── signup/           # Sign up API
├── components/
│   ├── EmotionInput.tsx      # Emotion text input
│   ├── Loading.tsx           # Loading animation (sound wave)
│   ├── Commentary.tsx        # DJ commentary display
│   ├── PlaylistCard.tsx      # Track card (YouTube links)
│   ├── JournalTimeline.tsx   # Emotion journal timeline
│   ├── BgmPlayer.tsx         # Lobby BGM player
│   ├── LanguageToggle.tsx    # Korean/English language toggle
│   ├── LanguageProvider.tsx  # i18n context provider
│   ├── ThemeToggle.tsx       # Dark/Light mode toggle
│   ├── ThemeProvider.tsx     # Theme context
│   ├── AuthButton.tsx        # Login/Profile button
│   └── MigrationPrompt.tsx   # Local→Cloud migration
├── hooks/
│   └── useJournal.ts         # Journal management hook
└── lib/
    ├── i18n.ts               # Translation strings (ko/en)
    ├── openai.ts             # OpenAI API client (bilingual prompts)
    ├── auth.ts               # NextAuth config
    ├── supabase.ts           # Supabase client
    ├── db.ts                 # DB queries + rate limiting
    └── badwords.ts           # Inappropriate content filter
```

## Getting Started / 시작하기

### Environment Variables / 환경 변수

Create a `.env.local` file:

```env
OPENAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Run / 실행

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build / 빌드

```bash
npm run build
```

## Rate Limit / 레이트 리밋

- All users: 10 generations per hour / 모든 사용자: 1시간에 10회 생성 가능

## License / 라이선스

Private Project
