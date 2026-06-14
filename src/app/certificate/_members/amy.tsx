"use client";

import Image from "next/image";

export default function AmyCertificate() {
  const member = {
    name: "Amy",
    realName: "임유영",
    team: "1조",
    jobTitle: "IT 서비스 기획자",
    period: "2026.05.03 — 2026.06.14",
  };

  const character = {
    type: "설계하는 실행가",
    image: "/certificate/character-recorder.svg",
    description:
      "\"여러 단계 작업물을 엮는 게 어렵다\"고 했던 사람이, 기획안→SRS→기능정의서→화면정의서를 자동으로 연결하는 스킬을 직접 만들었어요. 거기서 멈추지 않고 PLOT에서 베이스캠프로 브랜드를 3번 재정의하며 실제 등록자를 받는 MVP까지 출시했어요. 동선을 먼저 설계하고 기능을 붙이는 사람이에요.",
  };

  const stats = {
    attendance: { present: 6, total: 7 },
    sessionsAttended: 4,
    snsVerified: 5,
    shellsSent: 10,
    shellsReceived: 7,
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
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg", earned: "2026.05" },
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg", earned: "2026.05" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg", earned: "2026.05" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg", earned: "2026.05" },
    { name: "첫 크루챗", icon: "/badges/first-crewchat.svg", earned: "2026.06" },
  ];

  const timeline = [
    {
      week: "1주차",
      date: "5/10",
      title: "srs-to-sds 스킬 + 데일리 OS MVP",
      summary: "기획안에서 SRS 초안, 기능정의서, 화면정의서까지 자동 생성하는 Claude 스킬을 만들었어요. 동시에 목표 기반 일정 관리 앱 MVP를 빌드. 인박스 → 분류 → 오늘 탭 → 데일리 동선으로 구성했어요.",
      insight: "스킬이 스킬을 낳는다 — 인터뷰로 한 스킬 만들면 다음 부품이 보인다.",
    },
    {
      week: "2주차",
      date: "5/17",
      title: "데일리 OS 리디자인 — 동선 우선 설계",
      summary: "인박스 구조를 재설계하고, AI 자동분류와 마중물(30초 시작) 기능을 추가했어요. 기능 중심에서 동선 중심 설계로 전환한 것이 이번 주의 가장 큰 발견이었어요.",
      insight: "워크플로우 설계가 기능보다 우선 — 동선을 먼저 짜고 기능을 붙이면 더 빠르다.",
    },
    {
      week: "3주차",
      date: "5/24",
      title: "PLOT — 사이드프로젝트 수익화 커뮤니티",
      summary: "직장인 사이드프로젝터를 타겟으로 한 커뮤니티 컨셉을 잡고, 고객 페르소나 정의와 유저 획득 전략을 수립했어요. Vercel에 첫 사이트를 배포했어요.",
    },
    {
      week: "5주차",
      date: "6/7",
      title: "베이스캠프 — 노마드×로컬 플랫폼 출시",
      summary: "PLOT에서 베이스캠프로 브랜드를 3번 재정의했어요. Next.js + Supabase + Vercel 풀스택으로 실제 등록자를 받는 MVP를 출시. 1기 대기 등록, 디렉토리, 라운지, 총무 에이전트까지 구현했어요.",
      insight: "포지셔닝이 제품의 90% — 기능보다 '누구를 위한 것인가'를 먼저 정해야 한다.",
    },
  ];

  const giftMessages = [
    { sender: "이든", message: "애착 에이미에게" },
    { sender: "아가타", message: "에이미님 글을 보고 공개로 전환!" },
    { sender: "배짱", message: "아자아자 퐈이팅!" },
    { sender: "이든", message: "폭주하는 에이미에게... 신나 보여서... 에너지가 나보여서 좋다...." },
    { sender: "유스", message: "리마인드 감사해요!" },
  ];

  const beforeAfter = {
    before: "여러 단계 작업물을 엮을 때, 처음하는 업무 프로세스를 프롬프트화할 때 막혔어요.",
    after: "기획안→SRS→기능정의서→화면정의서를 자동으로 엮는 스킬을 직접 만들었고, 브랜드 포지셔닝을 3번 재정의하며 실제 유저가 등록하는 MVP를 출시했어요. 프로세스를 프롬프트로 만드는 게 아니라, 프로세스 자체를 시스템으로 만드는 사람이 되어 있었어요.",
  };

  const hasDiploma = stats.attendance.present >= 4;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1>
          <p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team} · {member.jobTitle}</p>
          <p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p>
        </div>
      </section>

      {hasDiploma && (
        <section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]">
          <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center">
              <div className="border border-dashed border-[#FCD34D] p-6 md:p-10">
                <div className="flex justify-center mb-6"><Image src="/certificate/character-cheerleader.svg" alt="" width={64} height={64} className="w-16 h-16" /></div>
                <p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">CERTIFICATE OF COMPLETION</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">수 료 증</h2>
                <div className="mb-4">
                  <p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p>
                  <p className="text-sm text-[#78716C]">{member.realName}</p>
                </div>
                <div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" />
                <p className="text-sm text-[#78716C] mb-6">위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.</p>
                <p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p>
                <p className="text-sm font-bold text-[#B45309]">출석 {stats.attendance.present} / {stats.attendance.total}회</p>
                <div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" />
                <p className="text-[11px] text-[#A8A29E]">스폰지클럽 · 이기적 공유 커뮤니티</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[var(--yellow)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center">
          <div className="flex justify-center mb-4"><Image src={character.image} alt={character.type} width={100} height={100} className="w-24 h-24 md:w-28 md:h-28" /></div>
          <p className="text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-widest mb-2">나의 스폰지 유형</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-4">{character.type}</h2>
          <p className="text-sm text-[var(--ink-80)] leading-[1.9] max-w-lg mx-auto break-keep">{character.description}</p>
        </div>
      </section>

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

      <section className="border-b border-[var(--ink-10)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">출석 현황</h2>
          <div className="flex justify-center gap-3 md:gap-4">
            {attendance.map((a) => (
              <div key={a.week} className="flex flex-col items-center">
                <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg ${a.present === true ? "bg-[var(--yellow)] text-[var(--ink)]" : a.present === false ? "bg-red-50 text-red-400 border-2 border-red-200" : "bg-[var(--ink-05)] text-[var(--ink-30)]"}`}>
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

      <section className="border-b border-[var(--ink-10)]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-10 text-center">주차별 여정</h2>
          <div className="space-y-0">
            {timeline.map((week, i) => (
              <div key={week.week} className="relative pl-10 pb-12 last:pb-0">
                {i < timeline.length - 1 && (<div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-[var(--ink-10)]" />)}
                <div className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[11px] font-extrabold bg-[var(--yellow)] text-[var(--ink)]">
                  {week.week.replace("주차", "")}
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
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="bg-[var(--ink)]">
        <div className="max-w-3xl mx-auto px-6 py-14 md:py-20">
          <h2 className="text-xs font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-10 text-center">Before & After</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-[10px] font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-3">BEFORE — 시작 전 막힌 점</p>
              <blockquote className="text-lg font-bold text-[var(--paper)]/60 leading-relaxed">&ldquo;{beforeAfter.before}&rdquo;</blockquote>
              <p className="text-xs text-[var(--paper)]/20 mt-3">— 프로그램 시작 전 설문에서</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[var(--yellow)] uppercase tracking-widest mb-3">AFTER — 7주 후</p>
              <p className="text-lg font-bold text-[var(--paper)] leading-relaxed">{beforeAfter.after}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-14 text-center bg-[var(--yellow)]">
        <p className="text-2xl mb-2">🧽</p>
        <p className="text-sm font-extrabold text-[var(--ink)]">{member.name}, 스폰지클럽의 정식 스폰지 크루가 되었습니다.</p>
      </footer>
    </div>
  );
}
