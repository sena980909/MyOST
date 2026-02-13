# MyOST - AI 감정 기반 음악 큐레이션

> 오늘의 감정을 텍스트로 알려주세요. AI가 당신만의 OST를 찾아드립니다.

**[https://myost.vercel.app](https://myost.vercel.app)**

## 소개

MyOST는 사용자의 감정을 AI로 분석하고, 그 감정에 딱 맞는 10곡의 플레이리스트를 추천하는 웹 서비스입니다. 심야 라디오 DJ 스타일의 따뜻한 코멘터리와 함께 음악을 전달합니다.

## 주요 기능

- **AI 감정 분석** - 텍스트에서 감정과 뉘앙스를 분석 (GPT-4o-mini)
- **맞춤 음악 추천** - 감정에 맞는 영어권 팝송 10곡 큐레이션
- **DJ 코멘터리** - 심야 라디오 DJ 스타일의 감성적인 선곡 멘트
- **YouTube 연동** - YouTube / YouTube Music 바로가기 링크
- **감정 기록 저장** - 타임라인 형태의 감정 일기장 (일기 작성 포함)
- **다크 모드** - 라이트/다크 테마 토글 지원
- **로비 BGM** - 마스코트 클릭으로 배경음악 온/오프
- **Google 로그인** - OAuth 인증 + 이메일/비밀번호 회원가입
- **클라우드 동기화** - 로그인 시 모든 기기에서 기록 동기화
- **PWA 지원** - 모바일 홈 화면 추가 가능

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 애니메이션 | Framer Motion |
| AI | OpenAI GPT-4o-mini |
| 인증 | NextAuth v5 (Google OAuth + Credentials) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 배포 | Vercel |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지 (로비 + 결과)
│   ├── login/page.tsx        # 로그인/회원가입 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   └── api/
│       ├── analyze/          # 감정 분석 API
│       ├── playlist/         # 플레이리스트 생성 API
│       ├── journal/          # 감정 기록 CRUD API
│       └── signup/           # 회원가입 API
├── components/
│   ├── EmotionInput.tsx      # 감정 텍스트 입력
│   ├── Loading.tsx           # 로딩 애니메이션 (사운드 웨이브)
│   ├── Commentary.tsx        # DJ 코멘터리 표시
│   ├── PlaylistCard.tsx      # 트랙 카드 (YouTube 링크)
│   ├── JournalTimeline.tsx   # 감정 기록 타임라인
│   ├── BgmPlayer.tsx         # 로비 배경음악 플레이어
│   ├── ThemeToggle.tsx       # 다크/라이트 모드 토글
│   ├── ThemeProvider.tsx     # 테마 컨텍스트
│   ├── AuthButton.tsx        # 로그인/프로필 버튼
│   └── MigrationPrompt.tsx   # 로컬→클라우드 마이그레이션
├── hooks/
│   └── useJournal.ts         # 감정 기록 관리 훅
└── lib/
    ├── openai.ts             # OpenAI API 클라이언트
    ├── auth.ts               # NextAuth 설정
    ├── supabase.ts           # Supabase 클라이언트
    ├── db.ts                 # DB 쿼리 + 레이트 리밋
    └── badwords.ts           # 부적절 표현 필터
```

## 시작하기

### 환경 변수

`.env.local` 파일을 생성하고 아래 값을 설정하세요:

```env
OPENAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 빌드

```bash
npm run build
```

## 레이트 리밋

- 모든 사용자: 1시간에 10회 생성 가능

## 라이선스

Private Project
