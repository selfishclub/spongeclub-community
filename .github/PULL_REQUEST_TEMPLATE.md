<!--
PR 작성 가이드:
- 제목: feat(missions): ... / fix(missions): ... / docs(...): ... / chore(...): ...
- 미션 게시판 작업이면 Epic 이슈를 본문에 Refs로 연결해주세요.
- 기존 Shell 시스템 회귀 방지를 위해 "기존 시스템 영향" 체크박스를 모두 확인.
-->

## 무엇 / 왜

<!-- 1-3줄. 어떤 변경을, 왜 하는지. 사용자 가치 또는 운영 문제 관점에서. -->

## 관련 (선택)

- Refs: #<Epic 이슈 번호>
- 디자인: <피그마/스크린샷 링크>
- 외부 의존: <Supabase 마이그레이션 / Slack App / env var>

## 변경 사항

<!-- 핵심 파일·기능을 글머리표로. -->

-

## 기존 시스템 영향 (필수 체크)

기존 Shell 시스템 회귀 방지를 위한 점검입니다. 해당 없으면 그대로 체크.

- [ ] `src/app/page.tsx` 기존 로직 수정 안 함 (홈 카드 추가는 합의 후 OK)
- [ ] `src/app/layout.tsx` 변경 안 함
- [ ] `src/app/{admin,admin-login,mypage,sessions}/**` 기존 동작 유지
- [ ] `src/app/api/{achievements,admin,auth,me,ranking,sessions,shell,slack}/**` 시그니처 변경 안 함
- [ ] `src/lib/{achievement,auth,ranking,session,shell,slack}-service.ts` 시그니처 변경 안 함
- [ ] `middleware.ts` 변경 안 함 (또는 변경 사유 명시)
- [ ] 기존 Supabase 테이블 `ALTER` 안 함 (새 테이블만 추가)
- [ ] `package.json` 기존 deps 버전 변경 안 함

## 검증

- [ ] `npm run build` 통과
- [ ] `/` (Shell 메인) 회귀 없음
- [ ] `/sessions`, `/mypage`, `/admin` 회귀 없음
- [ ] 변경한 페이지/엔드포인트 수동 확인
- [ ] (DB 변경 시) 마이그레이션 dry-run 결과 첨부

## 스크린샷 / 데모 (UI 변경 시)

<!-- before / after 이미지 또는 영상. -->
