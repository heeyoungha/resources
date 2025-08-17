# 컨텐츠 공유 플랫폼

## 📊 프로젝트 개요

**기간**: 2시간  
**목표**:
- Next.js / React / TypeScript / Supabase / TailwindCSS 등 전체 플로우를 빠르게 경험
- MCP(Model Context Protocol)를 활용해 외부 도구와 연동
- 빠른 학습 사이클을 통해 언어와 프레임워크를 습득

## 🎯 학습 관점에서 얻은 것

### 언어 습득
- **TypeScript로 타입 안정성을 체감** → 단순한 JS가 아닌 명확한 타입 기반 사고 학습
- **Next.js 14 App Router 구조 경험** → 서버/클라이언트 컴포넌트 차이 이해
- **Supabase 인증 플로우(PKCE, Magic Link) 구현** → OAuth / 세션 동기화 개념 학습

### MCP 활용
- **Figma MCP**: 디자인 → 코드 변환 자동화 → "디자인-개발 간극" 체험
- **Context7 MCP**: 라이브러리 최신 문서 바로 활용 → 문서 탐색 효율성 학습
- **Supabase MCP**: DB 연동 간소화 → 실시간 데이터 흐름 경험

### 짧은 주기 속 전체 플로우 경험
- **프로젝트 세팅 → UI 구성 → 인증/데이터 연동 → 최적화까지** 엔드투엔드 사이클
- **"부분적 실습"이 아닌 서비스 전체를 작게 구현해보는 경험**

## 🏗️ 아키텍처 & 흐름

### 디렉토리 구조

```
resourece/
├── .cursor/
│   └── mcp.json                 # 프로젝트별 MCP 설정
├── app/                         # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 페이지 (서버 컴포넌트)
│   ├── globals.css             # 글로벌 스타일
│   └── auth/
│       ├── callback/route.ts    # OAuth 콜백 (미사용)
│       ├── confirm/route.ts     # Magic Link 확인
│       └── auth-code-error/page.tsx # 인증 오류 페이지
├── components/                  # React 컴포넌트
│   ├── AuthButton.tsx          # 로그인/로그아웃 버튼
│   ├── ClientPage.tsx          # 메인 클라이언트 컴포넌트
│   ├── CategoryList.tsx        # 카테고리 필터
│   ├── ShareForm.tsx           # 공유 폼
│   ├── SharedItemsList.tsx     # 링크 리스트
│   ├── ItemDetailModal.tsx     # 상세보기 모달
│   ├── ShareModal.tsx          # 공유 모달
│   ├── ImageUpload.tsx         # 이미지 업로드
│   ├── ProfileDropdown.tsx     # 프로필 드롭다운
│   └── ui/                     # UI 컴포넌트
│       ├── card.tsx
│       ├── tabs.tsx
│       └── sonner.tsx
├── lib/                        # 유틸리티
│   ├── utils.ts               # 공통 함수
│   ├── supabase/              # Supabase 설정
│   │   ├── client.ts          # 클라이언트 사이드
│   │   └── server.ts          # 서버 사이드
│   ├── database/              # 데이터베이스 관련
│   │   ├── queries.ts         # DB 쿼리 함수
│   │   └── types.ts           # DB 타입 정의
│   ├── storage/               # 파일 저장소
│   │   ├── images.ts          # 이미지 업로드
│   │   └── check-storage.ts   # Storage 설정 확인
│   └── types/
│       ├── database.ts        # 데이터베이스 타입
│       └── shared.ts          # 공유 타입
├── hooks/                     # 커스텀 훅
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── database/                  # SQL 파일들
│   ├── database_schema.sql    # 데이터베이스 스키마
│   └── setup-supabase-storage.sql # Storage 설정
├── scripts/                   # 유틸리티 스크립트
│   └── setup-storage.js       # Storage 설정 가이드
├── middleware.ts              # Next.js 미들웨어
├── .env                       # 환경 변수
├── package.json              # 의존성
├── tailwind.config.js         # Tailwind 설정
├── tsconfig.json             # TypeScript 설정
├── README.md                 # 프로젝트 가이드
└── SUPABASE_SETUP.md         # Supabase 설정 가이드
```

### 인증 플로우
- **Magic Link 이메일 로그인**
- **PKCE 플로우로 보안 강화**
- **서버/클라이언트 세션 동기화** (middleware.ts + onAuthStateChange)

### 주요 기능
- 📧 **이메일 인증** (Magic Link)
- 🔗 **링크 공유** (카테고리별 분류)
- 🖼️ **이미지 업로드** (Supabase Storage)
- 👤 **프로필 드롭다운** (사용자 이름 표시)
- 🎨 **컴팩트 UI** (리스트 & 상세 모달)
- 🤖 **MCP 통합** (디자인·문서·DB 연동)
- ⚡ **React 성능 최적화** (useMemo, useCallback)

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 설정
`.env.example`을 참고하여 `.env.local` 파일 생성:
```bash
cp env.example .env.local
```

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Key

### 3. Supabase 설정
`SUPABASE_SETUP.md` 파일을 참고하여 데이터베이스와 Storage 설정

### 4. 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000에서 애플리케이션 확인

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, Lucide Icons
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Hooks, Local Storage
- **Development**: ESLint, Prettier, Cursor Editor

## 📚 학습 자료

- [Next.js 14 App Router](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [TailwindCSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🔧 MCP 설정

이 프로젝트는 다음 MCP 서버들을 활용합니다:

- **Figma MCP**: 디자인 파일에서 컴포넌트 추출
- **Context7 MCP**: 최신 라이브러리 문서 검색
- **Supabase MCP**: 데이터베이스 연동 지원

MCP 설정은 `.cursor/mcp.json`에서 확인할 수 있습니다.

## 📝 라이선스

MIT License
