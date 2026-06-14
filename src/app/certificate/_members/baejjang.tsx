"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";

export default function BaejjangCertificate() {
  const member = {
    name: "배짱",
    realName: "박종배",
    team: "1조",
    cohort: 1,
    role: "크루",
    jobTitle: "IT 교육 브랜드 마케팅 헤드",
    period: "2026.05.03 — 2026.06.14",
    shellBalance: 41,
  };

  const character = {
    type: "조용한 응원단장",
    image: "/certificate/character-connector.svg",
    description:
      "공유회도 5번이나 다니고, SNS 인증도 꾸준히 했지만, 배짱이 진짜 많이 한 건 셸 보내기. 25번이나 다른 크루에게 셸을 보냈어요. 본인이 \"AI를 쉽게 진정성있게 풀어내는 사람\"으로 기억되고 싶다고 했는데, 실제로 말보다 응원으로 먼저 움직이는 사람이었어요.",
  };

  const stats = {
    attendance: { present: 6, total: 7 },
    sessionsAttended: 5,
    snsVerified: 5,
    shellsSent: 25,
    shellsReceived: 20,
    badges: 6,
    skillShared: 0,
  };

  const attendance = [
    { week: "OT", date: "5/3", present: true },
    { week: "1주차", date: "5/10", present: true },
    { week: "2주차", date: "5/17", present: true },
    { week: "3주차", date: "5/24", present: true },
    { week: "4주차", date: "5/31", present: true },
    { week: "5주차", date: "6/7", present: true },
    { week: "6주차", date: "6/14", present: null },
  ];

  const badges = [
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg", earned: "2026.05.10" },
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg", earned: "2026.05.10" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg", earned: "2026.05.14" },
    { name: "첫 공유회 오픈", icon: "/badges/first-session-host.svg", earned: "2026.05.17" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg", earned: "2026.05.19" },
    { name: "첫 크루챗", icon: "/badges/first-crewchat.svg", earned: "2026.06.08" },
  ];

  const allBadgeNames = [
    "첫 SNS 인증", "첫 공유회 오픈", "첫 스킬 공유", "스킬 공유 3회 달성",
    "공유회 3회 오픈", "첫 셸 보내기", "셸 5회 보내기", "셸 5회 받기",
    "이기적 올라운더", "첫 크루챗", "VOD 큰 손", "SNS 인플루언서",
    "공유회 단골손님", "셸 인기스타",
  ];
  const earnedSlugs = new Set(badges.map((b) => b.name));
  const lockedBadges = allBadgeNames.filter((n) => !earnedSlugs.has(n));

  const giftMessages = [
    { sender: "이든", message: "1조에 아빠가 있어서 얼마나 든든한지...이제 든든한 자쉭이 되어 아부지를 돕겠습니다" },
    { sender: "Amy", message: "항상 따수운 배짱에게 한번도 감사인사를 표한적이 없는듯해서 배짱에게 보냅니다" },
    { sender: "리보", message: "유쾌한 에너지를 주셔서 덕분에 웃음이 가득한 시간을 가졌습니다!" },
    { sender: "개미", message: "배짱님 덕분에 1부 진행이 조금 더 수월하지 않았나 싶습니다. 만드시려는 내용들이 참 따뜻한 것 같아요." },
    { sender: "박상임", message: "오늘 반갑게 인사해준 배짱! 고마워요~~" },
    { sender: "유스", message: "셸 보내주신 알림 덕분에 오늘은 맘먹고 제대로 한번 노력해보겠습니다... 감사해요!!" },
    { sender: "키노", message: "오늘도 렛츠꼬" },
  ];

  const beforeAfter = {
    before: "끝까지 가게 하는 힘. 결국 자리에 앉아서 시작하게 만드는 것. 에러가 났을 때 어떻게 해야 하는지.",
    after: "6주간 한 번도 빠지지 않고 출석했어요. FFmpeg.wasm이 4번 실패했을 때 git tag로 안전하게 되돌리고, 30분 후 Vercel Function으로 해결했어요. 에러 앞에서 멈추는 사람이 아니라, 에러를 기록하고 다음 라운드를 만드는 사람이 되어 있었어요.",
  };

  const timeline = [
    {
      week: "OT",
      date: "5/3",
      title: "옵시디언 & 워크플로우 세팅",
      summary: "\"오늘이 제일 어려운 거라고 생각해보며 더 힘을 내보겠습니다.\" 비비안의 확인을 받고 첫 제출 완료. 클로드에게 물어가며 우당탕탕 Git과 옵시디언을 익힌 첫 날.",
    },
    {
      week: "1주차",
      date: "5/10",
      title: "마케팅 OS 청사진 + 첫 부품 빌드",
      summary: "os-interview 스킬로 60분간 인터뷰를 받고, OS 선언문과 첫 부품(campaign-result-engine)을 만들었어요. \"가설을 진화시키고 새 영역을 여는 일만 하고, 검증·추적·다음 후보 제안은 시스템이 한다.\" 에러 7개를 만나 7개를 해결하면서, AI를 도구가 아니라 사고 동반자로 쓰는 전환점을 발견했어요.",
      insight: "AI는 '내 일을 대신하는 도구'가 아니라 '의사결정의 사고 동반자'가 될 때 가장 강력하다.",
    },
    {
      week: "2주차",
      date: "5/17",
      title: "LLM Wiki + 메타 정합성 발견",
      summary: "Karpathy의 LLM Wiki 패턴을 벤치마킹해 4-layer 지식 시스템을 만들었어요. 그런데 진짜 발견은 구조가 아니라 원리였어요. v0를 덧칠해서 v1으로 라벨만 바꾸려다 멈췄다 — \"가설이 같은 자리에 묵묵히 덧칠되는 것\"이 본인의 통점이었는데, 시스템 빌드 자체가 그 통점을 반복하고 있었어요. 이 발견이 \"메타 정합성\" 규범으로 박혔어요.",
      insight: "시스템이 풀려는 원리를 시스템 빌드 자체가 어기지 않는다.",
    },
    {
      week: "3주차",
      date: "5/24",
      title: "morning-mom — 엄마에게 매일 한 줄",
      summary: "정체성을 전환했어요. 본부장(회사)이 아니라 아들로서, 엄마에게 매일 따뜻한 한 줄을 보내는 손글씨 카드 도구를 빌드했어요. Claude Code 스킬(CLI)과 GitHub Pages 웹페이지 두 인터페이스로 출시. 하네스와 오케스트레이션의 정의를 사전에 박지 않고, 빌드하면서 손에 잡았어요.",
      insight: "LLM 한 번 호출과 다를 게 없으면 프로덕트가 아니다. 차별점은 컨텍스트·루프·관계·양식에서 나온다.",
    },
    {
      week: "4주차",
      date: "5/31",
      title: "morning-mom v2 — 디자인 시스템 + 두 결의 피드백",
      summary: "워크샵에서 흡수한 \"디자인 MD + 콘텐츠 MD 두 축\" 원리를 적용해 디자인 시스템을 SSoT로 박았어요. 와이프(\"좋으네유\")와 교회동료(3층 분석 피드백)에게 카드를 보냈더니 같은 도구가 완전히 다른 결로 받아졌어요. 교회동료의 피드백 두 가지를 마감 1시간 전 즉시 반영 — 성경 구절 추천과 관계 메타데이터.",
      insight: "같은 도구, 다른 페르소나, 다른 KPI. 와이프의 '좋으네유' 한 줄도 valid한 신호다.",
    },
    {
      week: "5주차",
      date: "6/7",
      title: "morning-mom v3 — 보이스, 자동 발송, 엄마 첫 응답",
      summary: "오프라인 모임에서 받은 7개 피드백을 5가지 즉시 + 2가지 다음 라운드로 분류했어요. 보이스 녹음, mp4 변환(FFmpeg.wasm 4번 실패 후 Vercel Function으로 해결), 텔레그램 자동 발송, 펜팔 사서함까지 확장. 그리고 마감 30분 전, 첫 영상편지를 엄마에게 보냈어요. 답이 왔어요 — \"아들 고마워요 고추소독하셨어요,,\"",
      insight: "4주 동안 만든 도구가 처음 닿아서 응답이 돌아온 순간. 이게 결정의 보상이다.",
    },
  ];

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">

      {/* ── 헤더 (최상단) ── */}
      <section className="bg-[var(--ink)]">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">
            SPONGE CLUB — 1기 활동 기록
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">
            {member.name}
          </h1>
          <p className="text-base text-[var(--paper)]/60 font-medium">
            {member.realName} · {member.team} · {member.jobTitle}
          </p>
          <p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">
            {member.period}
          </p>
        </div>
      </section>

      {/* ── 수료 상장 (3회 이상 출석자) ── */}
      {hasDiploma && (
        <section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]">
          <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="배짱(박종배)" />
              <div className="border border-dashed border-[#FCD34D] p-6 md:p-10">
                <div className="flex justify-center mb-6">
                  <Image src="/certificate/character-cheerleader.svg" alt="" width={64} height={64} className="w-16 h-16" />
                </div>

                <p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">
                  CERTIFICATE OF COMPLETION
                </p>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">
                  수 료 증
                </h1>

                <div className="mb-4">
                  <p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p>
                  <p className="text-sm text-[#78716C]">{member.realName}</p>
                </div>

                <div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" />

                <p className="text-sm text-[#78716C] mb-6">
                  위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.
                </p>

                <p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p>
                <p className="text-sm font-bold text-[#B45309]">
                  출석 {stats.attendance.present} / {stats.attendance.total}회
                </p>

                <div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" />

                <p className="text-[11px] text-[#A8A29E]">스폰지클럽 · 이기적 공유 커뮤니티</p>
                <div className="mt-4 inline-block rotate-[-12deg]">
                  <div className="border-4 border-red-500 rounded-full px-4 py-2 opacity-70">
                    <p className="text-red-500 font-extrabold text-lg tracking-wider">우수 수료</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#D6D3D1] mt-1">2026년 6월 14일 발급</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 캐릭터 유형 ── */}
      <section className="bg-[var(--yellow)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center">
          <div className="flex justify-center mb-4">
            <Image src={character.image} alt={character.type} width={100} height={100} className="w-24 h-24 md:w-28 md:h-28" />
          </div>
          <p className="text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-widest mb-2">
            나의 스폰지 유형
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-4">
            {character.type}
          </h2>
          <p className="text-sm text-[var(--ink-80)] leading-[1.9] max-w-lg mx-auto break-keep">
            {character.description}
          </p>
        </div>
      </section>

      {/* ── 숫자 요약 ── */}
      <section className="border-b border-[var(--ink-10)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">숫자로 보는 7주</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-[var(--ink)]">{stats.sessionsAttended}<span className="text-lg text-[var(--ink-30)]">회</span></p>
              <p className="text-xs font-bold text-[var(--ink-50)] mt-2">공유회 참여</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-[var(--ink)]">{stats.snsVerified}<span className="text-lg text-[var(--ink-30)]">회</span></p>
              <p className="text-xs font-bold text-[var(--ink-50)] mt-2">SNS 인증</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsSent}<span className="text-lg text-[var(--ink-30)]">개</span></p>
              <p className="text-xs font-bold text-[var(--ink-50)] mt-2">보낸 셸</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsReceived}<span className="text-lg text-[var(--ink-30)]">개</span></p>
              <p className="text-xs font-bold text-[var(--ink-50)] mt-2">받은 셸</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 출석 현황 ── */}
      <section className="border-b border-[var(--ink-10)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">출석 현황</h2>

          <div className="flex justify-center gap-3 md:gap-4">
            {attendance.map((a) => (
              <div key={a.week} className="flex flex-col items-center">
                <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg ${
                  a.present === true
                    ? "bg-[var(--yellow)] text-[var(--ink)]"
                    : a.present === false
                    ? "bg-red-50 text-red-400 border-2 border-red-200"
                    : "bg-[var(--ink-05)] text-[var(--ink-30)]"
                }`}>
                  {a.present === true ? "✓" : a.present === false ? "✗" : "—"}
                </div>
                <p className="text-[11px] font-bold text-[var(--ink-50)] mt-2">{a.week}</p>
                <p className="text-[10px] text-[var(--ink-30)]">{a.date}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--ink-30)] mt-6">
            <span className="font-extrabold text-[var(--ink)]">{attendance.filter(a => a.present === true).length}</span>회 출석 / 총 {stats.attendance.total}회
          </p>
        </div>
      </section>

      {/* ── 배지 컬렉션 ── */}
      <section className="border-b border-[var(--ink-10)] bg-[var(--ink-05)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">배지 컬렉션</h2>

          <div className="flex flex-wrap justify-center gap-6">
            {badges.map((badge) => (
              <div key={badge.name} className="flex flex-col items-center w-20">
                <div className="w-16 h-16 bg-[var(--paper)] border-2 border-[var(--yellow)] flex items-center justify-center p-2 shadow-sm">
                  <Image src={badge.icon} alt={badge.name} width={48} height={48} className="w-full h-full" />
                </div>
                <p className="text-[11px] font-bold text-[var(--ink)] text-center mt-2 leading-tight">{badge.name}</p>
                <p className="text-[10px] text-[var(--ink-30)]">{badge.earned}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--ink-30)] mt-6">
            <span className="font-extrabold text-[var(--ink)]">{badges.length}</span>개 획득 / 총 {allBadgeNames.length}개
          </p>
        </div>
      </section>

      {/* ── 주차별 여정 ── */}
      <section className="border-b border-[var(--ink-10)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-10 text-center">주차별 여정</h2>

          <div className="space-y-0">
            {timeline.map((week, i) => (
              <div key={week.week} className="relative pl-10 pb-12 last:pb-0">
                {i < timeline.length - 1 && (
                  <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-[var(--ink-10)]" />
                )}
                <div className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[11px] font-extrabold bg-[var(--yellow)] text-[var(--ink)]">
                  {week.week === "OT" ? "OT" : week.week.replace("주차", "")}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-extrabold text-[var(--ink)]">{week.week}</span>
                    <span className="text-xs text-[var(--ink-30)]">{week.date}</span>
                  </div>

                  <p className="text-sm font-bold text-[var(--ink)] mb-2">{week.title}</p>
                  <p className="text-sm text-[var(--ink-80)] leading-[1.8]">{week.summary}</p>

                  {week.insight && (
                    <div className="mt-4 border-l-4 border-[var(--yellow)] pl-4 py-2 bg-[var(--ink-05)]">
                      <p className="text-sm text-[var(--ink)] italic font-medium">&ldquo;{week.insight}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 크루들의 응원 ── */}
      {giftMessages.length > 0 && (
        <section className="border-b border-[var(--ink-10)]">
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">크루들의 응원</h2>

            <div className="max-w-md mx-auto space-y-4">
              {giftMessages.map((g, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--yellow)] flex items-center justify-center text-base flex-shrink-0">🐚</div>
                  <div className="flex-1">
                    <div className="relative bg-[var(--ink-05)] px-4 py-3">
                      <div className="absolute left-[-8px] top-3 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-[var(--ink-05)]" />
                      <p className="text-sm text-[var(--ink)] font-medium">&ldquo;{g.message}&rdquo;</p>
                    </div>
                    <p className="text-[11px] text-[var(--ink-30)] mt-1 ml-1">from {g.sender}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Before & After ── */}
      <section className="bg-[var(--ink)]">
        <div className="max-w-3xl mx-auto px-6 py-14 md:py-20">
          <h2 className="text-xs font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-10 text-center">Before & After</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Before */}
            <div>
              <p className="text-[10px] font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-3">BEFORE — 시작 전 막힌 점</p>
              <blockquote className="text-lg font-bold text-[var(--paper)]/60 leading-relaxed">
                &ldquo;{beforeAfter.before}&rdquo;
              </blockquote>
              <p className="text-xs text-[var(--paper)]/20 mt-3">— 프로그램 시작 전 설문에서</p>
            </div>

            {/* After */}
            <div>
              <p className="text-[10px] font-extrabold text-[var(--yellow)] uppercase tracking-widest mb-3">AFTER — 7주 후</p>
              <p className="text-lg font-bold text-[var(--paper)] leading-relaxed">
                {beforeAfter.after}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="py-14 text-center bg-[var(--yellow)]">
        <p className="text-2xl mb-2">🧽</p>
        <p className="text-sm font-extrabold text-[var(--ink)]">
          {member.name}, 스폰지클럽의 정식 스폰지 크루가 되었습니다.
        </p>
      </footer>
    </div>
  );
}
