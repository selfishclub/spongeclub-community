"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";

export default function SolCertificate() {
  const member = { name: "솔", realName: "임솔", team: "1조", jobTitle: "", period: "2026.05.03 — 2026.06.14" };

  const character = {
    type: "OS를 선언한 크루",
    image: "/certificate/character-cheerleader.svg",
    description:
      "\"어디서부터 시작해야 할지 모르겠다\"는 막힌 점이 있었지만, 1주차에 60분 OS 인터뷰를 완주하고 \"못 자르기\"라는 통점을 정확히 짚었어요. 수익모델·시간·몸을 하나의 시스템으로 보는 OS를 선언했어요. 과제 제출은 OT과 1주차 두 번이었지만, 시작점을 만든 것 자체가 이 여정의 의미.",
  };

  const stats = { attendance: { present: 5, total: 7 }, sessionsAttended: 2, snsVerified: 0, shellsSent: 2, shellsReceived: 0 };

  const attendance = [
    { week: "OT", date: "5/3", present: true },
    { week: "1주차", date: "5/10", present: true },
    { week: "2주차", date: "5/17", present: true },
    { week: "3주차", date: "5/24", present: true },
    { week: "4주차", date: "5/31", present: true },
    { week: "5주차", date: "6/7", present: false },
    { week: "6주차", date: "6/14", present: null },
  ];

  const badges = [
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg" },
  ];

  const timeline = [
    {
      week: "1주차", date: "5/10",
      title: "OS 인터뷰 + 첫 부품 설계",
      summary: "60분간 OS 인터뷰를 완주하고, 핵심 통점 \"못 자르기\"를 발견했어요. revenue-setup-interview 스킬을 설계하고, Builder Josh OS를 벤치마킹해 4개 채택 + 3개 자르기를 결정했어요.",
      insight: "인터뷰의 진짜 출력은 선언문이 아니라 통점 한 줄이다.",
    },
  ];

  const giftMessages: { sender: string; message: string }[] = [];

  const beforeAfter = {
    before: "어디서부터 시작해야 할지 모르겠다",
    after: "OS 인터뷰에서 \"못 자르기\"라는 본인의 통점을 정확히 짚었어요. 수익모델·시간·몸이 한 시스템이라는 선언을 세웠다. 어디서부터 시작할지 몰랐던 사람이, 첫 번째 질문을 찾았어요.",
  };

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p><h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1><p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team}</p><p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p></div></section>

      {hasDiploma && (<section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]"><div className="max-w-2xl mx-auto px-6 py-12 md:py-16"><div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="솔(임솔)" /><div className="border border-dashed border-[#FCD34D] p-6 md:p-10"><div className="flex justify-center mb-6"><Image src="/certificate/character-cheerleader.svg" alt="" width={64} height={64} className="w-16 h-16" /></div><p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">CERTIFICATE OF COMPLETION</p><h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">수 료 증</h2><div className="mb-4"><p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p><p className="text-sm text-[#78716C]">{member.realName}</p></div><div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" /><p className="text-sm text-[#78716C] mb-6">위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.</p><p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p><p className="text-sm font-bold text-[#B45309]">출석 {stats.attendance.present} / {stats.attendance.total}회</p><div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" /><p className="text-[11px] text-[#A8A29E]">스폰지클럽 · 이기적 공유 커뮤니티</p>
                <div className="mt-4 inline-block rotate-[-12deg]">
                  <div className="border-4 border-red-500 rounded-full px-4 py-2 opacity-70">
                    <p className="text-red-500 font-extrabold text-lg tracking-wider">우수 수료</p>
                  </div>
                </div></div></div></div></section>)}

      <section className="bg-[var(--yellow)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center"><div className="flex justify-center mb-4"><Image src={character.image} alt={character.type} width={100} height={100} className="w-24 h-24 md:w-28 md:h-28" /></div><p className="text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-widest mb-2">나의 스폰지 유형</p><h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-4">{character.type}</h2><p className="text-sm text-[var(--ink-80)] leading-[1.9] max-w-lg mx-auto break-keep">{character.description}</p></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">숫자로 보는 7주</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-6"><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.sessionsAttended}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">공유회 참여</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.snsVerified}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">SNS 인증</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsSent}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">보낸 셸</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsReceived}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">받은 셸</p></div></div></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">출석 현황</h2><div className="flex justify-center gap-3 md:gap-4">{attendance.map((a) => (<div key={a.week} className="flex flex-col items-center"><div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg ${a.present === true ? "bg-[var(--yellow)] text-[var(--ink)]" : a.present === false ? "bg-red-50 text-red-400 border-2 border-red-200" : "bg-[var(--ink-05)] text-[var(--ink-30)]"}`}>{a.present === true ? "✓" : a.present === false ? "✗" : "—"}</div><p className="text-[11px] font-bold text-[var(--ink-50)] mt-2">{a.week}</p><p className="text-[10px] text-[var(--ink-30)]">{a.date}</p></div>))}</div><p className="text-center text-xs text-[var(--ink-30)] mt-6"><span className="font-extrabold text-[var(--ink)]">{stats.attendance.present}</span>회 출석 / 총 {stats.attendance.total}회</p></div></section>

      {timeline.length > 0 && (<section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-10 text-center">주차별 여정</h2><div className="space-y-0">{timeline.map((week, i) => (<div key={week.week} className="relative pl-10 pb-12 last:pb-0">{i < timeline.length - 1 && (<div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-[var(--ink-10)]" />)}<div className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[11px] font-extrabold bg-[var(--yellow)] text-[var(--ink)]">{week.week.replace("주차", "")}</div><div><div className="flex items-center gap-2 mb-2"><span className="text-base font-extrabold text-[var(--ink)]">{week.week}</span><span className="text-xs text-[var(--ink-30)]">{week.date}</span></div><p className="text-sm font-bold text-[var(--ink)] mb-2">{week.title}</p><p className="text-sm text-[var(--ink-80)] leading-[1.8]">{week.summary}</p>{week.insight && (<div className="mt-4 border-l-4 border-[var(--yellow)] pl-4 py-2 bg-[var(--ink-05)]"><p className="text-sm text-[var(--ink)] italic font-medium">&ldquo;{week.insight}&rdquo;</p></div>)}</div></div>))}</div></div></section>)}

      <section className="border-b border-[var(--ink-10)] bg-[var(--ink-05)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">배지 컬렉션</h2><div className="flex flex-wrap justify-center gap-6">{badges.map((badge) => (<div key={badge.name} className="flex flex-col items-center w-20"><div className="w-16 h-16 bg-[var(--paper)] border-2 border-[var(--yellow)] flex items-center justify-center p-2 shadow-sm"><Image src={badge.icon} alt={badge.name} width={48} height={48} className="w-full h-full" /></div><p className="text-[11px] font-bold text-[var(--ink)] text-center mt-2 leading-tight">{badge.name}</p></div>))}</div></div></section>

      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-14 md:py-20"><h2 className="text-xs font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-10 text-center">Before & After</h2><div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"><div><p className="text-[10px] font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-3">BEFORE — 시작 전 막힌 점</p><blockquote className="text-lg font-bold text-[var(--paper)]/60 leading-relaxed">&ldquo;{beforeAfter.before}&rdquo;</blockquote><p className="text-xs text-[var(--paper)]/20 mt-3">— 프로그램 시작 전 설문에서</p></div><div><p className="text-[10px] font-extrabold text-[var(--yellow)] uppercase tracking-widest mb-3">AFTER — 7주 후</p><p className="text-lg font-bold text-[var(--paper)] leading-relaxed">{beforeAfter.after}</p></div></div></div></section>

      <footer className="py-14 text-center bg-[var(--yellow)]"><p className="text-2xl mb-2">🧽</p><p className="text-sm font-extrabold text-[var(--ink)]">{member.name}, 스폰지클럽의 정식 스폰지 크루가 되었습니다.</p></footer>
    </div>
  );
}
