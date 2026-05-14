# 주차별 미션 게시판 — 개발자 가이드

> 📍 데굴데굴 유닛 공동 작업 영역
> 📌 트래킹 Issue: (Epic 이슈 링크 — 머지 후 갱신)

스폰지클럽 1기 멤버용 주차별 과제·공지·질문 게시판입니다.
**여러 명이 동시에 이 폴더를 진화시키므로, 작업 시작 전 이 문서를 읽고 Epic 이슈에 한 줄 남겨주세요.**

---

## 시작하기 전에 (필수)

1. **Epic 이슈 댓글에 "PR-N 시작합니다" 한 줄** — 작업 영역 충돌 방지
2. **브랜치 네이밍**: `feat/missions-<짧은제목>` (예: `feat/missions-timeline-pin`)
3. **PR 제목**: `feat(missions): ...` 또는 `fix(missions): ...` / `docs(missions): ...`
4. **PR 본문에 `Refs #<Epic 이슈 번호>` 추가**

---

## 폴더 구조 (현재)

```
src/app/missions/
├── README.md              ← 이 파일
├── page.tsx               ← /missions 본체 (서버 컴포넌트)
└── _components/           ← (예정) 미션 페이지 전용 컴포넌트
                              언더스코어 prefix → Next.js 라우트로 등록되지 않음

src/app/api/missions/      ← (예정) 미션 전용 API
├── notices/
├── questions/
├── progress/
└── slack-events/

src/lib/missions/          ← (예정) 미션 전용 서비스
├── slack-collector.ts
├── graphify.ts
├── mission-store.ts
└── types.ts

supabase/migrations/
└── YYYYMMDD_missions.sql  ← (예정) 신규 테이블만 (missions_*)
```

---

## 기존 시스템과의 격리 원칙

이 폴더는 기존 Shell 시스템과 **완전히 분리**되어야 합니다.

### ❌ 절대 건드리지 마세요

| 영역 | 이유 |
|---|---|
| `src/app/page.tsx` | Shell 메인 (홈 카드 1개만 예외 — 더 추가 시 합의 필요) |
| `src/app/layout.tsx` | 루트 레이아웃 (모든 페이지 영향) |
| `src/app/{admin,admin-login,mypage,sessions}/**` | 기존 기능 |
| `src/app/api/{achievements,admin,auth,me,ranking,sessions,shell,slack}/**` | 기존 API |
| `src/lib/{achievement,auth,ranking,session,shell}-service.ts` | 재사용은 OK, **수정 금지** |
| `src/lib/slack.ts` | **import만** OK (메서드 추가·시그니처 변경 금지) |
| `middleware.ts` | matcher가 `/admin*`만 — `/missions`는 자동 public |
| `supabase/schema.sql` 기존 테이블 | `ALTER` 금지. 새 마이그레이션 파일로만 추가 |

### ✅ 안전 패턴

- 새 컴포넌트 → `src/app/missions/_components/` 안
- 새 API → `src/app/api/missions/` 안 (기존 `/api/slack`과 분리)
- 새 라이브러리 → `src/lib/missions/`
- 새 DB 테이블 → `missions_*` 접두사
- 새 환경변수 → `MISSIONS_*` 접두사

---

## 디자인 토큰

기존 Shell 시스템의 디자인 시스템을 그대로 사용합니다.

```css
/* globals.css에 이미 정의됨 — 새로 만들지 마세요 */
--ink:       #0A0A0A      /* 본문 텍스트·테두리 */
--paper:     #FFFFFF      /* 배경 */
--yellow:    #E9ED12      /* 강조·CTA */
--yellow-dim: rgba(233, 237, 18, 0.15)
--ink-80, --ink-50, --ink-30, --ink-10, --ink-05
```

타이포: `font-extrabold` 기조, `text-xs/sm/base/lg`, `tracking-tight`/`tracking-wider`.
테두리: `border-2 border-[var(--ink)]` 가 표준.

---

## 로드맵 (PR 단계)

| PR | 내용 | 담당 |
|----|------|------|
| 1 | 스켈레톤 + 홈 카드 + 협업 인프라 | @tomost-dada |
| 2 | Supabase 마이그레이션 (missions_* 테이블) | (미정) |
| 3 | 운영진 CMS API (미션·일정·공지 입력) | (미정) |
| 4 | Slack Events 수집 + 자동 적재 | (미정) |
| 5 | 4꼭지 UI를 실데이터로 교체 | (미정) |
| 6 | Graphify 분류 + 미션 관련도 ≥70 게이팅 | (미정) |
| 7 | 디자인 폴리시 (스크린샷 매칭) | (미정) |

각 PR 시작 전 Epic 이슈에 의사 표명 → 다른 작업자와 영역 겹침 확인.

---

## 데이터 흐름 (예정)

```
[운영진 입력]                    [Slack]
   │ 미션·일정·공지              │
   │ (간단 CMS)                  │ Events API
   ▼                             ▼
[Next.js App Router]        [/api/missions/slack-events]
   │                             │
   │                             ▼
   │                       [Supabase: missions_messages]
   │                             │
   │           일 2회 GH Actions │
   │                  ┌──────────┘
   │                  ▼
   │            [Graphify 분류]
   │            주차 매칭 + 관련도 스코어
   │                  │
   ▼ ◄────────────────┘
[/missions]
   │
   └─ 6개 조 진척 ← (외부) spongeclub-homepage
```

---

## 자주 묻는 질문

**Q. /missions에 새 섹션 추가하고 싶어요**
→ `src/app/missions/_components/` 안에 컴포넌트 만들고 `page.tsx`에서 import.

**Q. 운영진 입력 CMS는 어떻게 만들죠?**
→ PR3 영역. 우선 Epic 이슈에 의사 표명 후, `src/app/api/missions/` 아래 라우트 추가 + `/admin/missions` 페이지 신설 (admin middleware 보호 자동 적용).

**Q. /missions를 admin 보호 페이지로 바꾸고 싶어요**
→ `middleware.ts`의 `matcher`에 `/missions/:path*` 추가. 단 **PRD §3 "로그인 없음" 원칙과 충돌**하므로 운영진 사전 합의 필요.

**Q. CODEOWNERS에 내 핸들 추가하고 싶어요**
→ `.github/CODEOWNERS` 편집. 본 폴더 작업에 참여하면 자동 리뷰어로 등록됨.

---

## 참고

- PRD 원본: `spongeclub/spongeclub_1` 레포의 미션 게시판 v1 제안 문서
- 디자인 레퍼런스: 스크린샷(Epic 이슈에 첨부)
