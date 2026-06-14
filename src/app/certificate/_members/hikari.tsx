"use client";

import Image from "next/image";

export default function HikariCertificate() {
  const member = { name: "히카리", realName: "윤준영", team: "2조", jobTitle: "자영업자(식당)/마케팅대행", period: "2026.05.03 — 2026.06.14" };

  const stats = { attendance: { present: 1, total: 7 }, sessionsAttended: 0, snsVerified: 0, shellsSent: 0, shellsReceived: 0 };

  const attendance = [
    { week: "OT", date: "5/3", present: true },
    { week: "1주차", date: "5/10", present: false },
    { week: "2주차", date: "5/17", present: false },
    { week: "3주차", date: "5/24", present: false },
    { week: "4주차", date: "5/31", present: false },
    { week: "5주차", date: "6/7", present: false },
    { week: "6주차", date: "6/14", present: null },
  ];

  const badges: { name: string; icon: string }[] = [];

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p><h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1><p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team} · {member.jobTitle}</p><p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">숫자로 보는 7주</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-6"><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.sessionsAttended}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">공유회 참여</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.snsVerified}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">SNS 인증</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsSent}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">보낸 셸</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsReceived}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">받은 셸</p></div></div></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">출석 현황</h2><div className="flex justify-center gap-3 md:gap-4">{attendance.map((a) => (<div key={a.week} className="flex flex-col items-center"><div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg ${a.present === true ? "bg-[var(--yellow)] text-[var(--ink)]" : a.present === false ? "bg-red-50 text-red-400 border-2 border-red-200" : "bg-[var(--ink-05)] text-[var(--ink-30)]"}`}>{a.present === true ? "✓" : a.present === false ? "✗" : "—"}</div><p className="text-[11px] font-bold text-[var(--ink-50)] mt-2">{a.week}</p><p className="text-[10px] text-[var(--ink-30)]">{a.date}</p></div>))}</div><p className="text-center text-xs text-[var(--ink-30)] mt-6"><span className="font-extrabold text-[var(--ink)]">{stats.attendance.present}</span>회 출석 / 총 {stats.attendance.total}회</p></div></section>

      <footer className="py-14 text-center bg-[var(--yellow)]"><p className="text-2xl mb-2">🧽</p><p className="text-sm font-extrabold text-[var(--ink)]">{member.name}, 스폰지클럽 1기와 함께했습니다.</p></footer>
    </div>
  );
}
