# AI Life Solution Challenge - 가짜뉴스 탐지 및 군중심리 분석 플랫폼

## 1. 프로젝트 개요

### 1.1 프로젝트 명칭

AI 기반 가짜뉴스 탐지 및 군중심리 분석 플랫폼

### 1.2 프로젝트 목적

본 프로젝트는 정보화 시대에서 급증하는 가짜뉴스와 허위정보로부터 사용자를 보호하고, 군중심리에 의한 비이성적 판단을 예방하기 위한 AI 기반 분석 서비스를 제공한다. 사용자가 입력한 텍스트에 대해 실시간 뉴스 데이터를 기반으로 사실 여부를 검증하고, 군중심리적 요소를 분석하여 객관적인 정보 판단을 지원한다.

### 1.3 개발 배경

- 소셜 미디어를 통한 가짜뉴스 확산 속도 증가
- 허위정보로 인한 사회적 혼란 및 경제적 피해 발생
- 군중심리에 의한 집단적 오판 현상 빈발
- 기존 팩트체크 서비스의 실시간성 및 접근성 한계

## 2. 주요 기능

### 2.1 가짜뉴스 탐지 기능

- 사용자 입력 텍스트에 대한 실시간 뉴스 검색 및 교차 검증
- 네이버 뉴스 크롤링을 통한 최신 뉴스 데이터 수집
- LLM 기반 키워드 추출 및 관련 기사 매칭
- 신뢰도 점수 산출 및 근거 기사 제시
- 검증 결과에 대한 상세 분석 리포트 생성

### 2.2 군중심리 분석 기능

- 입력된 텍스트의 군중심리적 요소 탐지
- 감정적 호소, 동조 압력, 허위 합의 등 심리적 조작 기법 식별
- 분석 결과에 대한 구조화된 리포트 제공

### 2.3 보안 기능

- 프롬프트 인젝션 공격 탐지 및 차단
- 악의적 입력 패턴 필터링
- 사용자 입력 정제 처리

## 3. 시스템 아키텍처

### 3.1 전체 구조

```
Frontend (Next.js)
    |
    v
API Route Handler (/api/chat)
    |
    +-- security.ts (입력 검증)
    +-- keywords.ts (키워드 추출)
    +-- news.ts (뉴스 크롤링)
    +-- prompts.ts (시스템 프롬프트)
    +-- openai.ts (LLM 통신)
    |
    v
External Services
    +-- OpenAI Compatible API (GPT-5-mini)
    +-- Naver News Search
```

### 3.2 모듈 구성

#### 3.2.1 route.ts (메인 핸들러)

- HTTP POST 요청 처리
- 요청 검증 및 라우팅
- 응답 스트림 생성

#### 3.2.2 security.ts (보안 모듈)

- 프롬프트 인젝션 패턴 탐지
- 악의적 입력 차단
- 입력값 정제

#### 3.2.3 keywords.ts (키워드 추출 모듈)

- LLM 기반 핵심 키워드 추출
- 뉴스 검색용 쿼리 생성

#### 3.2.4 news.ts (뉴스 크롤링 모듈)

- 네이버 뉴스 검색 및 크롤링
- 기사 본문 추출
- 뉴스 데이터 포맷팅

#### 3.2.5 prompts.ts (프롬프트 관리 모듈)

- 분석 모드별 시스템 프롬프트 정의
- JSON 응답 구조 정의
- 보안 지시사항 관리

#### 3.2.6 openai.ts (LLM 통신 모듈)

- OpenAI 호환 API 클라이언트 설정
- SSE 스트림 처리
- 응답 데이터 정제

## 4. 기술 스택

### 4.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.0.3 | React 기반 풀스택 프레임워크 |
| React | 19.2.0 | UI 컴포넌트 라이브러리 |
| TypeScript | 5.x | 정적 타입 지원 |
| Tailwind CSS | 4.x | 유틸리티 기반 CSS 프레임워크 |

### 4.2 상태 관리 및 데이터 통신

| 기술 | 버전 | 용도 |
|------|------|------|
| Zustand | 5.0.8 | 경량 상태 관리 라이브러리 |
| AI SDK | 5.0.101 | Vercel AI SDK (LLM 통신) |
| @ai-sdk/react | 2.0.101 | React용 AI 훅 |
| @ai-sdk/openai | 2.0.71 | OpenAI 호환 프로바이더 |

### 4.3 개발 도구

| 기술 | 버전 | 용도 |
|------|------|------|
| Biome | - | 코드 린팅 및 포맷팅 |
| pnpm | - | 패키지 매니저 |

### 4.4 외부 서비스

| 서비스 | 용도 |
|--------|------|
| OpenAI Compatible API | GPT-5-mini 모델 사용 |
| Naver News | 실시간 뉴스 데이터 수집 |

## 5. 프로젝트 구조

```
frontend/
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts        # API 엔드포인트
│   │       ├── openai.ts       # OpenAI 클라이언트
│   │       ├── prompts.ts      # 시스템 프롬프트
│   │       ├── security.ts     # 보안 모듈
│   │       ├── keywords.ts     # 키워드 추출
│   │       └── news.ts         # 뉴스 크롤링
│   ├── components/
│   │   ├── chat/
│   │   │   ├── InputArea.tsx   # 입력 영역
│   │   │   └── MessageBubble.tsx # 메시지 표시
│   │   └── layout/
│   │       ├── Header.tsx      # 헤더
│   │       ├── MainLayout.tsx  # 메인 레이아웃
│   │       ├── Sidebar.tsx     # 사이드바
│   │       └── UserMenu.tsx    # 사용자 메뉴
│   ├── store/
│   │   └── useAppStore.ts      # Zustand 스토어
│   ├── globals.css             # 전역 스타일
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 메인 페이지
├── public/                     # 정적 파일
├── biome.json                  # Biome 설정
├── next.config.ts              # Next.js 설정
├── package.json                # 의존성 정의
├── tailwind.config.ts          # Tailwind 설정
└── tsconfig.json               # TypeScript 설정
```

## 6. 설치 및 실행

### 6.1 요구사항

- Node.js 22.x 이상
- pnpm 패키지 매니저

### 6.2 설치

```bash
# 저장소 클론
git clone https://github.com/your-repo/2025-ai-life-solution-challenge.git
cd 2025-ai-life-solution-challenge/frontend

# 의존성 설치
pnpm install
```

### 6.3 환경 변수 설정

```bash
# .env.local 파일 생성
OPENAI_API_KEY=your_api_key_here
```

### 6.4 개발 서버 실행

```bash
pnpm dev
```

### 6.5 프로덕션 빌드

```bash
pnpm build
pnpm start
```

## 7. API 명세

### 7.1 채팅 API

**엔드포인트**: POST /api/chat

**요청 본문**:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "분석할 텍스트"
    }
  ],
  "mode": "fake-news" | "crowd-psychology"
}
```

**응답**: Server-Sent Events (SSE) 스트림

**응답 JSON 구조 (가짜뉴스 모드)**:

```json
{
  "summary": "분석 요약",
  "reliability": 0-100,
  "details": "상세 분석 내용",
  "sources": ["참고 기사 목록"]
}
```

## 8. 보안 기능 상세

### 8.1 프롬프트 인젝션 방어

본 시스템은 다음과 같은 프롬프트 인젝션 공격 패턴을 탐지하고 차단한다:

- 시스템 프롬프트 우회 시도
- 역할 변경 시도
- 탈옥(Jailbreak) 시도
- 시스템 프롬프트 노출 요청
- 구분자 삽입 공격

### 8.2 입력 정제

- HTML 태그 제거
- 연속 공백 정규화
- 입력 길이 제한 (5000자)

## 9. 향후 개발 계획

### 9.1 단기 계획

- 다국어 지원 (영어, 중국어, 일본어)
- 분석 결과 저장 및 히스토리 기능
- 사용자 인증 시스템 구현

### 9.2 중장기 계획

- 이미지 및 영상 기반 가짜뉴스 탐지
- 소셜 미디어 연동 분석
- 실시간 트렌드 모니터링 대시보드
- API 서비스 제공

## 10. 라이선스

본 프로젝트는 MIT 라이선스를 따른다.

## 11. 기여 방법

1. 저장소를 포크한다.
2. 기능 브랜치를 생성한다. (`git checkout -b feature/new-feature`)
3. 변경 사항을 커밋한다. (`git commit -m 'Add new feature'`)
4. 브랜치에 푸시한다. (`git push origin feature/new-feature`)
5. Pull Request를 생성한다.

## 12. 문의

프로젝트 관련 문의 사항은 이슈 트래커를 통해 등록할 수 있다.
