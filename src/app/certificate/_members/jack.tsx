"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";
import { useLiveStats } from "./_useLiveStats";

export default function JackCertificate() {
  const member = { name: "잭", realName: "유재현", team: "1조", jobTitle: "패션 커머스 퍼포먼스 마케터", period: "2026.05.03 — 2026.06.14" };

  const character = {
    type: "콘텐츠를 시스템으로 바꾼 크루",
    image: "/certificate/character-builder.svg",
    description:
      "\"원하는 결과가 있는데 중간에 오류 발생시 이 시간을 줄이고 싶다\"고 했어요. 1주차에 인스타 캐러셀 자동 생성 스킬을 만들고, 2주차엔 콘텐츠 OS 웹 프로토타입을, 3주차엔 리뷰 코칭 도구까지 확장했어요. 스킬 7회 나눔 — 1조에서 가장 많이 스킬을 공유한 사람이에요.",
  };

  const stats = useLiveStats("잭", { attendance: { present: 7, total: 7 }, sessionsAttended: 7, snsVerified: 2, shellsSent: 20, shellsReceived: 15 });

  const attendance = [
    { week: "OT", date: "5/3", present: true },
    { week: "1주차", date: "5/10", present: true },
    { week: "2주차", date: "5/17", present: true },
    { week: "3주차", date: "5/24", present: true },
    { week: "4주차", date: "5/31", present: true },
    { week: "5주차", date: "6/7", present: true },
    { week: "6주차", date: "6/14", present: true },
  ];

  const badges = [
    { name: "첫 스킬 공유", icon: "/badges/first-skill-share.svg" },
    { name: "스킬 공유 3회 달성", icon: "/badges/skill-share-3.svg" },
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg" },
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg" },
    { name: "첫 크루챗", icon: "/badges/first-crewchat.svg" },
  ];

  const timeline = [
    {
      week: "1주차", date: "5/10",
      title: "인스타 캐러셀 자동 생성 스킬",
      summary: "60분 OS 인터뷰 후 인스타 캐러셀 5단계 워크플로우 스킬을 만들었어요. Voice Reference(실제 코칭 대본)를 핵심으로, Opus로 검토하는 흐름을 설계.",
      insight: "스킬의 핵심은 Voice Reference다 — 실제 말투 패턴이 일반 지시보다 강력하다.",
    },
    {
      week: "2주차", date: "5/17",
      title: "Vupercent 콘텐츠 OS",
      summary: "콘텐츠 OS 웹 프로토타입(vupercent-content-os.vercel.app)을 만들었어요. 진짜 통점은 \"아이디어가 없는 게 아니라 흩어져 있는 것\"이라는 발견.",
      insight: "통점은 없음이 아니라 흩어짐이다.",
    },
    {
      week: "3주차", date: "5/24",
      title: "리뷰 코칭 도구 — OCR + AI 해석",
      summary: "이커머스 브랜드 고객 리뷰를 OCR로 읽고 AI가 코칭 에피소드로 해석하는 도구를 설계. Notion + Tiro MCP를 연동해 캐러셀 카피까지 자동 생성.",
    },
  ];

  const giftMessages = [
    { sender: "먼지민", message: "응원의 셸을 보냄미다" },
    { sender: "모닥", message: "미션 공유 감사합니다!" },
    { sender: "유스", message: "한번도 안드렸던 것 같아서 보내봅니다!!" },
    { sender: "배짱", message: "1조 셸1위 잭님 감사하고 응원합니다!" },
  ];

  const beforeAfter = {
    before: `원하는 결과가 있는데 중간에 오류 발생시 이 시간을 줄이고 싶습니다.\n그리고 좋은 결과물을 많이 알면 더 좋은 지시를 할 텐데 그 부분을 알고 싶습니다`,
    after: "인스타 캐러셀 자동 생성, 콘텐츠 OS, 리뷰 코칭 도구 — 3개의 프로덕트를 만들며 오류를 줄이는 게 아니라 시스템으로 흡수하는 법을 배웠어요. 스킬 7회 나눔으로 1조에서 가장 많이 공유한 사람이에요.",
  };

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p><h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1><p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team} · {member.jobTitle}</p><p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p></div></section>

      {hasDiploma && (<section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]"><div className="max-w-2xl mx-auto px-6 py-12 md:py-16"><div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="잭(유재현)" /><div className="border border-dashed border-[#FCD34D] p-6 md:p-10"><div className="flex justify-center mb-6"><Image src="/certificate/sponge-logo.png" alt="" width={64} height={64} className="w-16 h-16" /></div><p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">CERTIFICATE OF COMPLETION</p><h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">수 료 증</h2><div className="mb-4"><p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p><p className="text-sm text-[#78716C]">{member.realName}</p></div><div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" /><p className="text-sm text-[#78716C] mb-6">위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.</p><p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p><p className="text-sm font-bold text-[#B45309]">출석 {stats.attendance.present} / {stats.attendance.total}회</p><div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" /><p className="text-[11px] text-[#A8A29E]">스폰지클럽</p>
                <div className="absolute bottom-24 right-16 rotate-[-12deg]">
                  <div className="border-4 border-red-500 rounded-full px-4 py-2 opacity-70">
                    <p className="text-red-500 font-extrabold text-lg tracking-wider">우수 수료</p>
                  </div>
                </div></div></div></div></section>)}

      <section className="bg-[var(--yellow)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center"><div className="flex justify-center mb-4"><Image src={character.image} alt={character.type} width={100} height={100} className="w-24 h-24 md:w-28 md:h-28" /></div><p className="text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-widest mb-2">나의 스폰지 유형</p><h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-4">{character.type}</h2><p className="text-sm text-[var(--ink-80)] leading-[1.9] max-w-lg mx-auto break-keep">{character.description}</p></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">숫자로 보는 7주</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-6"><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.sessionsAttended}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">공유회 참여</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.snsVerified}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">SNS 인증</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsSent}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">보낸 셸</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsReceived}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">받은 셸</p></div></div></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">출석 현황</h2><div className="flex justify-center gap-3 md:gap-4">{attendance.map((a) => (<div key={a.week} className="flex flex-col items-center"><div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg ${a.present === true ? "bg-[var(--yellow)] text-[var(--ink)]" : a.present === false ? "bg-red-50 text-red-400 border-2 border-red-200" : "bg-[var(--ink-05)] text-[var(--ink-30)]"}`}>{a.present === true ? "✓" : a.present === false ? "✗" : "—"}</div><p className="text-[11px] font-bold text-[var(--ink-50)] mt-2">{a.week}</p><p className="text-[10px] text-[var(--ink-30)]">{a.date}</p></div>))}</div><p className="text-center text-xs text-[var(--ink-30)] mt-6"><span className="font-extrabold text-[var(--ink)]">{stats.attendance.present}</span>회 출석 / 총 {stats.attendance.total}회</p></div></section>

      {timeline.length > 0 && (<section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-10 text-center">주차별 여정</h2><div className="space-y-0">{timeline.map((week, i) => (<div key={week.week} className="relative pl-10 pb-12 last:pb-0">{i < timeline.length - 1 && (<div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-[var(--ink-10)]" />)}<div className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[11px] font-extrabold bg-[var(--yellow)] text-[var(--ink)]">{week.week.replace("주차", "")}</div><div><div className="flex items-center gap-2 mb-2"><span className="text-base font-extrabold text-[var(--ink)]">{week.week}</span><span className="text-xs text-[var(--ink-30)]">{week.date}</span></div><p className="text-sm font-bold text-[var(--ink)] mb-2">{week.title}</p><p className="text-sm text-[var(--ink-80)] leading-[1.8]">{week.summary}</p>{(week as any).insight && (<div className="mt-4 border-l-4 border-[var(--yellow)] pl-4 py-2 bg-[var(--ink-05)]"><p className="text-sm text-[var(--ink)] italic font-medium">&ldquo;{(week as any).insight}&rdquo;</p></div>)}</div></div>))}</div></div></section>)}

      <section className="border-b border-[var(--ink-10)] bg-[var(--ink-05)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">배지 컬렉션</h2><div className="flex flex-wrap justify-center gap-6">{badges.map((badge) => (<div key={badge.name} className="flex flex-col items-center w-20"><div className="w-16 h-16 bg-[var(--paper)] border-2 border-[var(--yellow)] flex items-center justify-center p-2 shadow-sm"><Image src={badge.icon} alt={badge.name} width={48} height={48} className="w-full h-full" /></div><p className="text-[11px] font-bold text-[var(--ink)] text-center mt-2 leading-tight">{badge.name}</p></div>))}</div></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">크루들의 응원</h2><div className="max-w-md mx-auto space-y-4">{giftMessages.map((g, i) => (<div key={i} className="flex items-start gap-3"><div className="w-9 h-9 rounded-full bg-[var(--yellow)] flex items-center justify-center text-base flex-shrink-0">🐚</div><div className="flex-1"><div className="relative bg-[var(--ink-05)] px-4 py-3"><div className="absolute left-[-8px] top-3 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-[var(--ink-05)]" /><p className="text-sm text-[var(--ink)] font-medium">&ldquo;{g.message}&rdquo;</p></div><p className="text-[11px] text-[var(--ink-30)] mt-1 ml-1">from {g.sender}</p></div></div>))}</div></div></section>

      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-14 md:py-20"><h2 className="text-xs font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-10 text-center">Before & After</h2><div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"><div><p className="text-[10px] font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-3">BEFORE — 시작 전 막힌 점</p><blockquote className="text-lg font-bold text-[var(--paper)]/60 leading-relaxed">&ldquo;{beforeAfter.before}&rdquo;</blockquote><p className="text-xs text-[var(--paper)]/20 mt-3">— 프로그램 시작 전 설문에서</p></div><div><p className="text-[10px] font-extrabold text-[var(--yellow)] uppercase tracking-widest mb-3">AFTER — 7주 후</p><p className="text-lg font-bold text-[var(--paper)] leading-relaxed">{beforeAfter.after}</p></div></div></div></section>

      <footer className="py-14 text-center bg-[var(--yellow)]"><p className="text-2xl mb-2">🧽</p><p className="text-sm font-extrabold text-[var(--ink)]">{member.name}, 스폰지클럽의 정식 스폰지 크루가 되었습니다.</p></footer>
    </div>
  );
}
