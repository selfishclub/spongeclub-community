"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";

export default function PinoCertificate() {
  const member = {
    name: "피노",
    realName: "피노",
    team: "2조",
    jobTitle: "일반 직장인, 여러 직종 경험 중",
    period: "2026.05.03 — 2026.06.14",
  };

  const character = {
    type: "첫 부품을 찾은 크루",
    image: "/certificate/character-sprout.svg",
    description:
      "\"어디서부터 시작하는 게 맞는지 결정하는 게 쉽지 않다\"고 했어요. 1주차 OS 인터뷰에서 \"다 해야 한다\"는 막연함이 \"첫 부품 1개\"로 좁혀지는 경험을 했어요. 아침 브리핑 스킬을 만들고, 노션 업무 OS를 벤치마킹.",
  };

  const stats = {
    attendance: { present: 6, total: 7 },
    sessionsAttended: 1,
    snsVerified: 0,
    shellsSent: 0,
    shellsReceived: 2,
  };

  const attendance = [
    { week: "OT", date: "5/3", present: true },
    { week: "1주차", date: "5/10", present: true },
    { week: "2주차", date: "5/17", present: true },
    { week: "3주차", date: "5/24", present: true },
    { week: "4주차", date: "5/31", present: true },
    { week: "5주차", date: "6/7", present: true },
    { week: "6주차", date: "6/14", present: false },
  ];

  const badges: { name: string; icon: string }[] = [];

  const timeline = [
    {
      week: "1주차",
      date: "5/10",
      title: "OS 선언문 + 아침 브리핑 스킬",
      summary:
        "OS 인터뷰로 선언문을 세우고, 첫 부품으로 우선순위별 체크리스트를 제공하는 아침 브리핑 스킬을 설계. 노션 업무 OS도 벤치마킹.",
      insight: "\"다 해야 한다\"는 막연함에서 \"첫 부품 1개\"로 좁혀지는 과정이 핵심.",
    },
  ];

  const giftMessages = [
    { sender: "이니", message: "피노님! 열정적인 모습 자극 많이 받고 있습니다:)" },
    { sender: "포노미터", message: "활기찬 월요일 되세요~" },
  ];

  const beforeAfter = {
    before: "어디서부터 시작하는 게 맞는지 결정하는 게 쉽지 않음.",
    after:
      "OS 인터뷰에서 \"첫 부품 1개\"로 시작점을 좁혔어요. 6주간 한 번도 빠지지 않고 출석하며 꾸준히 자리를 지켰어요.",
  };

  const hasDiploma = stats.attendance.present >= 2;

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
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="피노" />
              <div className="border border-dashed border-[#FCD34D] p-6 md:p-10">
                <div className="flex justify-center mb-6"><Image src="/certificate/sponge-logo.png" alt="" width={64} height={64} className="w-16 h-16" /></div>
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
                <p className="text-[11px] text-[#A8A29E]">스폰지클럽</p>
                <div className="absolute bottom-24 right-16 rotate-[-12deg]">
                  <div className="border-4 border-red-500 rounded-full px-4 py-2 opacity-70">
                    <p className="text-red-500 font-extrabold text-lg tracking-wider">우수 수료</p>
                  </div>
                </div>
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
                  {(week as any).insight && (
                    <div className="mt-4 border-l-4 border-[var(--yellow)] pl-4 py-2 bg-[var(--ink-05)]">
                      <p className="text-sm text-[var(--ink)] italic font-medium">&ldquo;{(week as any).insight}&rdquo;</p>
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
          {badges.length === 0 && (
            <p className="text-sm text-[var(--ink-30)] text-center">아직 획득한 배지가 없습니다.</p>
          )}
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
