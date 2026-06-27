# 스폰지 클럽 — 셸 시스템 (Shell System)

> 이기적 공유 커뮤니티의 활동 기반 포인트 시스템
> 클로드 코드용 MVP 개발 명세서

---

## 1. 프로젝트 개요

### 1.1 컨셉

**스폰지 클럽**은 멤버끼리 각자의 전문 분야를 공유하며 함께 성장하는 커뮤니티이다. 이 시스템은 그 중심이 되는 **셸(Shell, 🐚) 포인트 시스템**을 운영하기 위한 웹 플랫폼이다.

핵심 철학은 **"이기적 공유"** — 남에게 공유하기 위해 본인 안에서 한 번 더 정리되고, 그 과정에서 본인이 성장한다. 즉 공유는 남을 위한 것이 아니라 *나를 위한 것*이다.

### 1.2 셸이란

셸은 멤버의 활동에 대한 인정의 표시이자, 다른 멤버의 정리된 지식(공유회)에 접근하기 위한 입장권이다. 셸은 **시스템에서 발행되는 형태**로 작동하며, 멤버 간 거래는 *재화 이전*이 아니라 *인정의 표시*다.

### 1.3 시스템의 목표

- 공유회 세션 수 증가
- 크루(멤버)들의 공유 세션 비중 증가
- 멤버 간 셸을 주고받는 활동 활성화

---

## 2. 핵심 비즈니스 룰

### 2.1 셸 흐름

| 활동 | 셸 변동 | 비고 |
|---|---|---|
| 공유회 입장 (참여 신청) | -5 | 신청 시 즉시 차감 |
| 공유회 개최 (진행자 보상) | +10 | 공유회 완료 시 지급 |
| SNS 인증 | +2 | #스폰지클럽 해시태그 / 일일 1회 |
| 멤버 셸 받기 | +1 | 시스템 발행, 송신자 차감 없음 |
| 신규 가입 보너스 | +10 | 사전 설문 완료자에게 일괄 지급 |
| 1주차 첫 공유회 | 0 (무료) | 신규 멤버 첫 경험용 |
| 진행자 자율 팁 | 가변 | 참여자가 진행자에게 셸 송신 |

### 2.2 한도 및 환불

- **일일 셸 송신 한도**: 멤버 1인당 하루 1개까지 다른 멤버에게 송신 가능
- **공유회 신청 취소 환불**:
  - 개최일 24시간 전까지 취소: 5셸 100% 환불
  - 24시간 이내 취소 또는 노쇼: 환불 없음
- **SNS 인증 일일 한도**: 1회

### 2.3 공유회 룰

- **개최 주기**: 제약 없음. 누구나 언제든 신청 가능
- **개최 신청 기한**: 공유회 시작일 3일 전까지 신청 권장
- **공유회 형식**: 라이브 줌 (녹화 없음)
- **공유회 길이**: 진행자 자율 (단일 가격제 5셸)
- **정원**: 진행자 자율 (무제한 또는 정원 설정 가능)
- **승인 절차**: 어드민 검토 후 승인 시 공지 (자유 개최가 원칙이지만 MVP는 검토 단계 포함)

---

## 3. 기술 스택

### 3.1 추천 스택

- **프레임워크**: Next.js 14+ (App Router)
- **언어**: TypeScript
- **데이터베이스 / 인증**: Supabase (PostgreSQL + Auth + Realtime)
- **스타일링**: Tailwind CSS
- **호스팅**: Vercel
- **패키지 매니저**: pnpm 또는 npm

### 3.2 핵심 라이브러리

```
@supabase/supabase-js
@supabase/ssr
react-hook-form
zod (스키마 검증)
date-fns (날짜 처리)
lucide-react (아이콘)
@slack/web-api (Slack Bot API)
@slack/events-api (Slack 이벤트 수신) 또는 직접 검증 구현
```

### 3.3 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # 어드민 작업용, 서버에서만 사용
SLACK_BOT_TOKEN=            # Slack Bot User OAuth Token (xoxb-...)
SLACK_SIGNING_SECRET=       # Slack App Signing Secret (요청 검증용)
```

---

## 4. 데이터 모델 (DB 스키마)

### 4.1 members (멤버)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| name | text | 멤버 이름 |
| phone_last4 | text | 전화번호 뒷 4자리 (로그인 식별자, UNIQUE) |
| email | text | 사전 설문에서 받은 이메일 (선택) |
| slack_user_id | text | 슬랙 사용자 ID (Phase 2용, 선택) |
| survey_completed | boolean | 사전 설문 완료 여부 |
| shell_balance | integer | 현재 셸 잔고 (캐시용, 트랜잭션에서 계산) |
| is_admin | boolean | 어드민 여부 |
| is_active | boolean | 활성 멤버 여부 |
| created_at | timestamp | 가입일 |
| updated_at | timestamp | 마지막 수정일 |

### 4.2 shell_transactions (셸 트랜잭션)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| member_id | uuid | FK → members.id |
| amount | integer | +적립 / -차감 |
| reason | text | 사유 코드 (아래 enum 참고) |
| reason_detail | text | 추가 설명 (예: "○○ 공유회 입장") |
| related_session_id | uuid | FK → sessions.id (해당하는 경우) |
| related_member_id | uuid | FK → members.id (멤버 송신의 경우) |
| created_by | uuid | FK → members.id (어드민 수동 조정 시) |
| created_at | timestamp | 발생 시점 |

**reason enum**:
- `SIGNUP_BONUS` (가입 보너스 +10)
- `SESSION_HOST` (공유회 개최 +10)
- `SESSION_ATTEND` (공유회 입장 -5)
- `SESSION_REFUND` (공유회 취소 환불 +5)
- `SNS_VERIFY` (SNS 인증 +2)
- `MEMBER_GIFT` (멤버 셸 받기 +1)
- `TIP_GIVEN` (진행자 팁 보냄, 송신자 측 0이지만 기록)
- `TIP_RECEIVED` (진행자 팁 받음 +n)
- `ADMIN_ADJUSTMENT` (어드민 수동 조정)

### 4.3 sessions (공유회)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| host_id | uuid | FK → members.id (진행자) |
| title | text | 공유회 제목 |
| description | text | 한 줄 설명 |
| target_audience | text | 적합 대상 |
| scheduled_at | timestamp | 진행 일시 |
| duration_minutes | integer | 길이 (분) |
| capacity | integer | 정원 (NULL = 무제한) |
| zoom_link | text | 줌 링크 (어드민 입력 또는 진행자 입력) |
| status | text | `PENDING` / `APPROVED` / `REJECTED` / `COMPLETED` / `CANCELLED` |
| is_free | boolean | 무료 여부 (1주차 첫 공유회용) |
| entry_cost | integer | 입장 비용 (기본 5, is_free=true면 0) |
| created_at | timestamp | |
| updated_at | timestamp | |

### 4.4 session_attendees (공유회 신청자)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → sessions.id |
| member_id | uuid | FK → members.id |
| status | text | `REGISTERED` / `CANCELLED` / `ATTENDED` / `NO_SHOW` |
| registered_at | timestamp | 신청 시점 |
| cancelled_at | timestamp | 취소 시점 (해당 시) |
| transaction_id | uuid | FK → shell_transactions.id (입장 차감 트랜잭션) |

UNIQUE(session_id, member_id) — 중복 신청 방지

### 4.5 sns_verifications (SNS 인증)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| member_id | uuid | FK → members.id |
| sns_url | text | 게시물 링크 |
| platform | text | instagram / twitter / blog / threads / linkedin / etc |
| status | text | `PENDING` / `APPROVED` / `REJECTED` |
| reviewed_by | uuid | FK → members.id (어드민) |
| reviewed_at | timestamp | |
| transaction_id | uuid | FK → shell_transactions.id (승인 시 +2셸 트랜잭션) |
| created_at | timestamp | 제출 시점 |

### 4.6 daily_limits (일일 한도 추적)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| member_id | uuid | FK → members.id |
| date | date | 해당 날짜 |
| gifts_sent | integer | 그날 송신한 셸 수 |
| sns_verifies | integer | 그날 SNS 인증 수 |

UNIQUE(member_id, date)

---

## 5. 기능 명세 (페이지/API 단위)

### 5.1 인증 (Auth)

#### `/login` — 로그인 페이지
- **입력**: 전화번호 뒷 4자리
- **처리**: members.phone_last4 일치 조회
- **성공**: 세션 쿠키 발급, `/` 또는 `/dashboard`로 리다이렉트
- **실패**: "일치하는 멤버가 없어요" 메시지

#### 세션 관리
- 쿠키 기반 세션 (Supabase Auth 또는 자체 JWT)
- 보안 약한 환경이므로 세션 만료는 24시간 정도 짧게

### 5.2 멤버 (Members)

#### `/dashboard` — 메인 대시보드 (로그인 후)
- 본인 셸 잔고 표시 (큰 숫자)
- 모집 중인 공유회 목록 (3~5개 미리보기)
- 본인이 신청한 공유회 목록
- 최근 트랜잭션 (3~5건 미리보기)

#### `/me` — 내 정보 / 트랜잭션
- 본인 정보 (이름, 잔고)
- 전체 트랜잭션 히스토리 (페이지네이션)
- 신청 중인 공유회 / 과거 참여 공유회

### 5.3 공유회 (Sessions)

#### `GET /sessions` — 공유회 목록
- 모집 중인 공유회 (status=APPROVED, scheduled_at > now)
- 정렬: 가까운 일정순
- 표시: 제목, 진행자, 일시, 입장 비용, 잔여 정원

#### `GET /sessions/[id]` — 공유회 상세
- 공유회 전체 정보
- 신청자 수 / 정원
- 본인 신청 여부 표시
- "신청하기" 또는 "신청 취소" 버튼
- 입장 비용이 본인 잔고보다 높으면 신청 버튼 비활성화

#### `POST /sessions/new` — 공유회 개최 신청
- 진행자가 작성: 제목, 한 줄 설명, 일시, 길이, 정원, 적합 대상
- 제출 시 `status=PENDING`으로 저장
- 어드민 검토 대기

#### `POST /sessions/[id]/register` — 참여 신청
- 트랜잭션 처리:
  1. 잔고 ≥ entry_cost 확인
  2. 정원 초과 확인 (capacity가 있는 경우)
  3. 중복 신청 확인
  4. shell_transactions에 -5 기록 (is_free=true면 0)
  5. session_attendees에 등록
- 위 모두 한 트랜잭션 내에서 처리 (DB transaction)

#### `POST /sessions/[id]/cancel` — 신청 취소
- 본인 신청 건 취소
- 24시간 룰 적용:
  - scheduled_at - now > 24h: +5셸 환불 트랜잭션 기록
  - 24h 이내: 환불 없음
- session_attendees.status = CANCELLED

### 5.4 SNS 인증

#### `POST /sns/submit` — SNS 인증 제출
- URL + 플랫폼 입력
- 일일 한도 1회 체크
- status=PENDING으로 저장
- 어드민 승인 대기

### 5.5 멤버 셸 송신 (선택, MVP 후반부 또는 Phase 2)

#### `POST /members/[id]/gift` — 다른 멤버에게 셸 1개 보내기
- 본인 일일 송신 한도 체크 (1개)
- 자기 자신에게 송신 차단
- 트랜잭션 기록 (수신자 +1, 송신자 0이지만 daily_limits 갱신)

### 5.7 Slack 셸 송신 (타코봇 방식)

#### `POST /api/slack/events` — Slack Event Subscription 엔드포인트
- Slack에서 메시지 이벤트 수신
- 메시지 패턴 파싱: `@멤버이름 +1🐚` 또는 `@멤버이름 +1🐚 고마워요!`
- 처리 흐름:
  1. 송신자 slack_user_id → members 테이블에서 멤버 조회
  2. 수신자 @멘션 → slack_user_id → members 테이블에서 멤버 조회
  3. 자기 자신 송신 차단
  4. 일일 송신 한도 체크 (1회)
  5. 셸 트랜잭션 기록 (수신자 +1, reason=MEMBER_GIFT)
  6. daily_limits 갱신
- Slack 응답 메시지:
  - 성공: "🐚 {송신자}님이 {수신자}님에게 셸을 보냈어요! (오늘 {n}/1회)"
  - 실패 — 한도 초과: "오늘의 셸은 이미 보냈어요! 내일 다시 보내주세요."
  - 실패 — 멤버 미등록: "스폰지클럽에 등록되지 않은 멤버예요."
  - 실패 — 자기 자신: "자기 자신에게는 셸을 보낼 수 없어요!"

#### Slack App 설정 요구사항
- **Bot Token Scopes**: `chat:write`, `app_mentions:read`, `channels:history`, `users:read`
- **Event Subscriptions**: `message.channels` (공개 채널 메시지 감지)
- **Request URL**: `https://{도메인}/api/slack/events`

### 5.6 어드민

#### `/admin` — 어드민 대시보드
- 미승인 공유회 수 / SNS 인증 대기 수 등 요약

#### `/admin/members` — 멤버 관리
- 전체 멤버 목록 (이름, 4자리, 잔고, 가입일)
- 검색
- 멤버별 트랜잭션 조회
- 수동 셸 조정 (사유 필수 입력)

#### `/admin/members/import` — CSV 일괄 등록
- CSV 업로드 (이름, 전화번호 뒷4자리, 사전 설문 완료 여부, 이메일 선택)
- 처리:
  1. 각 행 검증
  2. members 테이블에 등록
  3. survey_completed=true인 멤버에게 +10셸 자동 트랜잭션 기록 (reason=SIGNUP_BONUS)
  4. 결과 표시 (성공 N명 / 실패 N명 + 사유)
- 중복 4자리 체크 (이미 존재하는 4자리는 실패)

#### `/admin/sessions` — 공유회 관리
- 미승인(PENDING) 목록 — 승인/거부 버튼
- 진행 예정 목록 — 상세 / 신청자 명단 / 줌 링크 추가
- 완료된 공유회 — 진행자 보상 +10셸 일괄 처리 버튼

#### `/admin/sns` — SNS 인증 관리
- 대기 중 목록 — URL 클릭 → 새 탭에서 확인 → 승인/거부 버튼
- 승인 시 +2셸 자동 트랜잭션 + daily_limits 갱신

#### `/admin/transactions` — 전체 트랜잭션 로그
- 모든 셸 이동 기록
- 멤버별 / 사유별 / 기간별 필터
- CSV 다운로드 (선택)

---

## 6. 핵심 비즈니스 로직 (구현 주의사항)

### 6.1 셸 잔고 계산 일관성

`members.shell_balance` 컬럼은 **캐시용**이다. 진실은 `shell_transactions`에 있다. 두 가지 방식 가능:

**방식 A**: 트랜잭션 INSERT 시마다 트리거로 members.shell_balance 갱신
**방식 B**: 잔고 조회 시마다 트랜잭션 합산 (SUM)

MVP는 **방식 A** 권장 (조회 빠르고 단순). 다만 데이터 정합성 깨질 위험 있으므로 어드민 메뉴에 *"전체 잔고 재계산"* 기능을 둔다.

### 6.2 동시성 처리

공유회 정원이 마감 직전일 때 동시 신청 가능. PostgreSQL 트랜잭션 내에서 `SELECT ... FOR UPDATE`로 행 잠금 후 처리.

### 6.3 24시간 룰 환불

cron job이나 정해진 시점에 자동 처리할 필요 없음. 멤버가 취소 버튼 누를 때 서버에서 시간 비교 후 트랜잭션 처리. 단순함.

### 6.4 일일 한도

`daily_limits` 테이블에서 (member_id, date=오늘) 행을 가져오거나 생성. 한도 체크 후 카운트 증가. 트랜잭션 내에서.

---

## 7. 개발 순서 권장

클로드 코드와 작업할 때 한 번에 다 만들지 말고, 다음 순서로 단계적으로:

### Phase 1: 기반 + Slack 연동 (4~5일)
1. Next.js 프로젝트 셋업 + Tailwind + TypeScript
2. Supabase 프로젝트 생성 + DB 스키마 구축
3. 환경 변수 / Supabase 클라이언트 설정
4. 기본 레이아웃 / 네비게이션
5. Slack App 생성 + Bot Token / Event Subscriptions 설정
6. Slack 메시지 파싱 API (`@멤버 +1🐚 메시지` → 셸 송신)
7. members.slack_user_id 매핑 (CSV 등록 시 포함 또는 어드민 수동 매핑)

### Phase 2: 인증 + 멤버 (2~3일)
8. 4자리 로그인 페이지 + 세션 처리
9. 보호된 라우트 (미들웨어)
10. 본인 정보 페이지 (`/me`)
11. 잔고 표시

### Phase 3: 어드민 멤버 관리 + CSV 등록 (2~3일)
12. 어드민 권한 체크
13. 멤버 목록
14. CSV 일괄 등록 + 셸 자동 지급 (slack_user_id 포함)
15. 멤버 수동 셸 조정

### Phase 4: 공유회 핵심 (5~7일)
16. 공유회 신청 폼 (진행자용)
17. 어드민 공유회 승인/거부
18. 공유회 목록 + 상세
19. 참여 신청 + 셸 차감 (트랜잭션 처리)
20. 신청 취소 + 24시간 룰 환불

### Phase 5: 부가 기능 (2~3일)
21. SNS 인증 제출 + 어드민 승인
22. 트랜잭션 히스토리 페이지
23. 어드민 전체 트랜잭션 로그

### Phase 6: QA + 폴리싱 (3~5일)
24. 시드 데이터로 전체 시나리오 테스트
25. 엣지 케이스 (잔고 부족, 정원 초과, 중복 신청, Slack 셸 송신 한도)
26. UI 다듬기 (모바일 대응 포함)
27. 배포 (Vercel + Supabase 운영 설정)

---

## 8. UI/UX 가이드

### 8.1 톤

- 따뜻하고 친근하게. 무거운 시스템처럼 보이지 않게
- 셸 이모지 🐚 적극 활용
- 색감: 바다, 모래, 부드러운 베이지/블루 톤 추천

### 8.2 핵심 UX 포인트

- **잔고는 항상 잘 보이는 곳에**: 상단 네비게이션이나 대시보드 메인
- **신청 버튼은 부담 없게**: "5🐚 신청하기" — 비용 명시
- **취소 가능 여부 명확히**: "24시간 전까지 취소 시 환불"
- **에러 메시지는 친근하게**: "셸이 부족해요. SNS 인증으로 모아보세요!"

### 8.3 모바일 대응

멤버 대부분이 슬랙 알림 → 모바일로 접속할 가능성 높음. 모바일 우선 디자인.

---

## 9. 1주차 운영을 위한 시드 데이터

개발 완료 후 1주차 시작 전 준비할 데이터:

1. **어드민 계정**: 본인(운영자) 멤버 등록 + is_admin=true
2. **기존 멤버 CSV 일괄 등록**: 사전 설문 완료자 일괄 등록 + 셸 10개씩 자동 지급
3. **1주차 보너스 공유회 3개 사전 등록**:
   - 첫 번째 공유회는 `is_free=true` 설정 (무료 청취)
   - 나머지 2개는 정상 5셸 입장
4. **진행자 매핑**: 각 공유회 host_id를 실제 진행자(기존 크루)로 설정

---

## 10. Phase 2 — MVP 출시 후 추가 (참고용)

MVP 출시 후 1~2개월 운영하면서 데이터 보고 추가:

1. **슬랙 자동 알림**: 공유회 승인 시 슬랙 채널에 카드 메시지 자동 발송 + "자세히 보기" 딥링크
2. **셸 잔고 슬랙 명령어**: `/셸` 명령어로 잔고 조회
4. **SNS 인증 자동화**: URL 검증 + 해시태그 자동 확인 (수동 승인은 유지 가능)
5. **공유회 후기 + 진행자 자율 팁**: 후기 작성 + 슬랙에서 진행자에게 셸 송신
6. **인플레 방지**: 분기별 셸 일부 소멸 또는 만료 룰 (필요 시)

---

## 11. 알려진 제약 / 디자인 결정의 근거

- **전화번호 뒷 4자리 로그인**: 보안 약함. 현재 멤버 풀에서 4자리 중복 없음 확인됨. 신규 멤버 추가 계획 없음. 향후 보안 이슈 발생 시 보완책(SMS 2FA 등) 도입 예정
- **공유회 사전 검토**: 자유 개최가 원칙이지만 MVP는 어드민 검토 단계 포함. 운영 안정화 후 자동 승인으로 전환 가능
- **녹화 없음**: 라이브 가치 강조. 다시보기 제공 안 함
- **단일 가격제**: 공유회 길이 무관 5셸. 진행자 자율 팁으로 길이별 가치 차이 보완
- **시스템 발행 셸**: 멤버 간 송신은 송신자 차감 없음. 셸은 *재화 이전*이 아니라 *인정의 표시*

---

## 12. 컨텍스트 (개발 시 참고)

- 멤버 규모: 30~50명 시작 (현재 풀)
- 운영자: 1명 (1~2개월 단독 운영 후 활동 멤버 합류 예정)
- 운영 도구: 슬랙(메인 소통) + 본 플랫폼(셸 시스템) + 줌(공유회 진행)
- 기존 사용 도구: 슬랙, 노션, 구글 워크스페이스
- 1주차 일정: 별도 계획. 본 시스템 MVP 완성 전까지는 슬랙+노션으로 수동 운영
