# 작업 핸드오프 — 비밀번호 정책 업그레이드

> 이 문서는 다른 맥북에서 작업 이어받기 위한 인계 노트.
> 작성일: 2026-06-30 (KST)
> 작성자: vivien + Claude Code

---

## 0. 한눈에 요약

- 어제(2026-06-29) **`/api/admin/*` 보안 구멍 막음**: 미들웨어로 외부 차단 + PIN 해시화 + 응답에서 PIN 제거. **이미 main에 배포돼 운영 중**.
- 오늘(2026-06-30) **비밀번호 정책 업그레이드 작업**을 시작. 4자리 PIN → 영문+숫자 6자 이상. **이 브랜치에 미배포 상태로 들어있음**.
- 사용자 결정: "보안사고 공지하지 않고 자연스러운 업그레이드로 처리". 즉 멤버에게는 "로그인 정책 업데이트" 톤으로만 안내.

## 1. 이 브랜치(`password-upgrade`)에 들어있는 변경

| 파일 | 변경 내용 |
|---|---|
| `src/lib/pin.ts` | `isValidPassword()` + `PASSWORD_RULE_MESSAGE` 추가 |
| `src/app/api/auth/change-pin/route.ts` | 4자리 정규식 → `isValidPassword()` 사용 |
| `src/app/mypage/page.tsx` | 모달 텍스트/입력칸/검증 모두 새 정책으로 |
| `src/app/page.tsx` | 로그인 폼: PIN → 비밀번호. 입력칸 길이 확장, 숫자 필터 제거 |

**미수정**: 어드민 멤버 추가/수정 폼 (의도적). 어드민은 임시 비밀번호로 4자리 PIN 계속 설정 가능. 멤버가 본인이 바꿀 때만 새 정책 적용됨.

## 1.5 사전 점검 결과 — 데이터 이슈 (2026-06-30 점검)

전체 144명 멤버 점검 결과:

**해결된 것:**
- ✅ 동명이인 '솔(임솔)' 2명 → 한 명 비활성화 처리
- ✅ 동명이인 '레이(이미숙)' 2명 → 한 명 비활성화 처리
- ✅ '솔(임솔)' 활성 계정의 slack_user_id 수정 완료

**유지하고 함께 업그레이드 받기로 한 것:**
- 어드민 '비비안(박정은)' (현재 PIN='1234') — 다른 멤버와 함께 강제 업그레이드 모달로 새 비밀번호 설정 예정
- 어드민 '워크스페이스관리자' (cohort=0, PIN='0000') — 마찬가지

**참고 통계:**
- 활성 멤버 143명 (비활성 1명)
- 어드민 2명 (둘 다 위에서 같이 업그레이드)
- 1기 70명, 2기 72명
- 취약 PIN(0000/1234/1111) 사용 중: 47명 — 강제 업그레이드로 다 해결됨
- 30일+ 비활동 멤버 5명 — 업그레이드 지연 가능 (한 달 후 별도 슬랙 DM 권장)

## 2. 다음에 할 일 — 순서대로

### Step 1. 운영에 배포

```bash
git checkout password-upgrade
git pull
git checkout main
git merge password-upgrade
git push origin main
```

→ Vercel 자동 배포 1~2분.

(또는 GitHub에서 PR 만들어서 merge하는 것도 OK)

### Step 2. 운영 사이트에서 테스트

브라우저로 https://spongeclub-community.vercel.app/

테스트 시나리오:
1. **로그인 화면**: "PIN" 라벨이 "비밀번호"로 바뀌었고 입력칸 길어졌는지
2. **기존 PIN으로 로그인**: 본인 4자리 PIN으로 로그인 잘 되는지
3. **비밀번호 변경 모달**:
   - `pin_changed = false`이면 로그인 직후 자동으로 뜸
   - 모달 안 뜨면 마이페이지 → "비밀번호 변경하기" 버튼
4. **검증 동작**:
   - `1234` → ❌ 거부 (영문 없음)
   - `abcdef` → ❌ 거부 (숫자 없음)
   - `abc 123` → ❌ 거부 (공백)
   - `abc123` → ✅ 성공
5. 변경 후 로그아웃 → 새 비밀번호로 다시 로그인 → ✅ 성공

### Step 3. 전체 멤버 강제 업그레이드 스위치

테스트 다 OK면 Supabase SQL Editor에서:

```sql
UPDATE members SET pin_changed = false;
```

→ 이후 모든 멤버가 다음 로그인 시 비밀번호 변경 모달을 강제로 보게 됨.

### Step 4. 슬랙 공지 (보안사고 아닌 톤)

추천 문구:
> "로그인 정책이 업데이트됐어요. 다음 로그인 때 새 비밀번호를 설정해 주세요. 기존 PIN 4자리 그대로 로그인하면 바로 변경 화면이 뜹니다. (영문+숫자 6자 이상)"

### Step 5. (선택, 1주~한 달 후)

아직 업그레이드 안 한 멤버에게 슬랙 DM으로 리마인드:
```sql
SELECT name, slack_user_id FROM members
WHERE is_active = true AND pin_changed = false;
```

## 3. 어제 했던 작업 요약 (이미 main에 배포됨, 참고용)

커밋 `f0c5d3e` — **외부 노출 차단**:
- `middleware.ts` matcher에 `/api/admin/:path*` 추가, API는 403 JSON
- `src/lib/pin.ts` 신규 — bcrypt 해시/검증
- `src/app/api/admin/members/route.ts`:
  - `select("*")` → 명시 컬럼 (pin 제외)
  - PATCH 시 PIN 해시 저장
  - `Cache-Control: no-store`
- `src/app/api/admin/members/import/route.ts` — CSV PIN 해시화
- `src/app/api/auth/login/route.ts` — verifyPin + 평문 PIN 자동 해시 마이그레이션
- `src/app/api/auth/change-pin/route.ts` — 해시 저장 (오늘 정책 검증으로 다시 갱신)
- `src/app/api/auth/me/route.ts`, `my-transactions/route.ts` — Cache-Control 헤더
- `package.json` — bcryptjs 추가

**현재 운영 상태 (2026-06-30 기준)**:
- ✅ `/api/admin/*` 외부 접근 차단됨 (HTTP 403 확인)
- ✅ admin 응답에 PIN 안 들어감
- ✅ 새 PIN 변경/등록은 해시 저장
- ⏳ 기존 평문 PIN은 멤버가 로그인할 때 자동으로 해시로 마이그레이션 중
- ⏳ Vercel 환경변수 `ADMIN_PASSWORD` 교체는 아직 안 함 (TODO)

## 4. 미해결 / 의도적으로 미룬 것

- **`ADMIN_PASSWORD` 환경변수 교체**: 현재 기본값 `0428`일 가능성. Vercel 대시보드에서 변경 + Redeploy 필요.
- **노출됐던 144명 PIN 일괄 재설정**: 사용자 판단으로 안 함 (옵션 D). 대신 이 브랜치의 자연스러운 업그레이드로 대체.
- **로그인 rate limit**: 미구현. 무차별 대입 방지용. 나중에 고려.
- **이메일/phone_last4 컬럼의 향후 처리**: 둘 다 현재 실사용 없음. 정리할지 유지할지 결정 필요.

## 5. 외부 노출 추적 결과 (어제 점검)

| 추적 경로 | 결과 |
|---|---|
| Vercel 로그 | 30분만 보존, 8주치 추적 불가. 현재 시점은 403 차단 정상 |
| Supabase 로그 | 3시간만 보존, 배포 전후 쿼리 패턴이 정확히 갈림 (수정 적용 확인) |
| Wayback Machine | 아카이브 0건 ✅ |
| Google 색인 | 색인 없음 ✅ |

**결론**: 8주 노출 기간 동안 누가 가져갔는지는 추적 불가하지만, 자동 크롤러나 공개 아카이브에는 흔적 없음.

## 6. 프로젝트 메모

- 로컬 경로: `/Users/vivien/spongeclub-community` (이 Mac 기준. 다른 Mac은 본인 경로)
- 운영 URL: https://spongeclub-community.vercel.app/
- 저장소: github.com/selfishclub/spongeclub-community (selfishclub owner 계정으로 push)
- 이중 인증 구조:
  - 멤버: 이름 + PIN/비밀번호 → 쿠키 `sponge-session`
  - 어드민: 별도 `ADMIN_PASSWORD` → 쿠키 `admin-auth` (middleware가 `/admin/*` + `/api/admin/*` 보호)
