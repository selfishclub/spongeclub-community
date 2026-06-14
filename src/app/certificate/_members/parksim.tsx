"use client";

import Image from "next/image";

export default function ParksimCertificate() {
  const member = {
    name: "박상임",
    realName: "박상임",
    team: "5조",
    jobTitle: "구축프로젝트PMO",
    period: "2026.05.03 — 2026.06.14",
  };

  const character = {
    type: "전체 멤버 중 가장 활발한 사람",
    image: "/certificate/character-cheerleader.svg",
    description:
      "셸 35개 보내기, 29개 받기. SNS 인증 22회. 공유회 7번 참여. VOD 7개 구매. 스킬 공유 1회. 이 모든 숫자가 전체 멤버 최상위권. \"단순 채팅으로 끝나는 부분\"이 막힌 점이었다고 했는데, 채팅을 넘어 시스템을 만들고 나누는 사람이 되었어요.",
  };

  const stats = {
    attendance: { present: 6, total: 7 },
    sessionsAttended: 7,
    snsVerified: 22,
    shellsSent: 35,
    shellsReceived: 29,
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
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg", earned: "2026.05" },
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg", earned: "2026.05" },
    { name: "첫 스킬 공유", icon: "/badges/first-skill-share.svg", earned: "2026.05" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg", earned: "2026.05" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg", earned: "2026.05" },
    { name: "스킬 공유 3회 달성", icon: "/badges/skill-share-3.svg", earned: "2026.06" },
    { name: "VOD 큰 손", icon: "/badges/vod-big-hand.svg", earned: "2026.06" },
    { name: "SNS 인플루언서", icon: "/badges/sns-influencer.svg", earned: "2026.06" },
    { name: "공유회 단골손님", icon: "/badges/session-regular.svg", earned: "2026.06" },
  ];

  const giftMessages = [
    { sender: "키노", message: "오늘의 MVP 축하드려요!" },
    { sender: "보미", message: "과제 공유에서 영감 받음!" },
    { sender: "오웬", message: "다시보기까지 결제해서 리모션 스킬 따라 온 상임의 열정에 박수를 보내요!!" },
  ];

  const beforeAfter = {
    before: "단순 채팅으로 끝나는 부분.",
    after: "셸 35개 보내기, SNS 22회, VOD 7개 구매. 채팅을 넘어 시스템을 만들고, 가장 적극적으로 나누는 사람이 되었어요.",
  };

  const hasDiploma = stats.attendance.present >= 3;

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
