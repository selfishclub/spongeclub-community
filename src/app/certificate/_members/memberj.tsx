"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";
import { useLiveStats } from "./_useLiveStats";

export default function MemberJCertificate() {
  const member = { name: "J", realName: "허지은", team: "6조", jobTitle: "온라인MD", period: "2026.05.03 — 2026.06.14" };

  const character = {
    type: "반복 비용을 흡수하는 크루",
    image: "/certificate/character-cheerleader.svg",
    description:
      "주간 보고서 + 주식 분석 2개 스킬로 4시간 걸리던 작업을 1시간으로 단축했어요. 텔레그램 봇 'J의 비서' + 노션 MCP 동기화를 구축하며, '자동화 = 도구 교체가 아니라 반복 비용 흡수'라는 인사이트를 발견했어요. 5/7 과제 제출, 공유회 8번 참여, 셸 11개 보내기.",
  };

  const stats = useLiveStats("J", { attendance: { present: 7, total: 7 }, sessionsAttended: 8, snsVerified: 4, shellsSent: 11, shellsReceived: 10 });

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
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg" },
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg" },
  ];

  const timeline: { week: string; date: string; title: string; summary: string; insight?: string }[] = [
    {
      week: "1주차", date: "5/10",
      title: "주간보고서 자동화 + 주식 분석 스킬",
      summary: "엑셀 데이터 붙여넣기로 주간보고서를 자동 생성하는 스킬과, 시황/종목/포트폴리오/실적 4모드 주식 분석 스킬을 만들었어요. 4시간 걸리던 작업을 1시간으로 단축. 텔레그램 봇 'J의 비서' + 노션 MCP 동기화도 구축.",
      insight: "자동화 = 도구 교체가 아니라 반복 비용 흡수.",
    },
    {
      week: "2주차", date: "5/17",
      title: "텔레그램 일정관리 봇 — 개인 OS",
      summary: "하루 6번 자동으로 할 일과 진척도를 물어보는 텔레그램 어시스턴트 봇을 만들었어요. 플러그인 전역 등록이 핵심 삽질 포인트였어요.",
    },
    {
      week: "3주차", date: "5/24",
      title: "네이버 블로그 주제 브리핑 봇",
      summary: "네이버 카페·인스타·유튜브 3개 소스를 병렬 검색해서 오늘 날짜 기준 핫한 글감 10개를 추천하고, 카카오톡 발송까지 자동화했어요.",
    },
    {
      week: "4주차", date: "5/31",
      title: "하네스 구조 리팩터링 — CLAUDE.md + PRD 분리",
      summary: "CLAUDE.md에 몰려있던 API·프롬프트·UI 로직을 PRD 4개 + MEMORY.md로 분리하고, 실사용자 2명에게 직접 피드백을 받았어요.",
    },
    {
      week: "5주차", date: "6/7",
      title: "블로그 브리핑 봇 — Gemini API + UI 디벨롭",
      summary: "Gemini API 연결, 더보기·아코디언·세션캐시·에러처리 UI를 붙여 실배포 직전 상태까지 완성했어요.",
    },
  ];

  const giftMessages = [
    { sender: "하늘", message: "감사합니다~! 저도 응원 보냅니다!" },
    { sender: "Galia", message: "응원합니다~!!" },
    { sender: "하늘", message: "6조 화이팅입니다! ㅎㅎ" },
  ];

  const beforeAfter = {
    before: `프롬프트를 처음부터 어떻게 잘 줄지 고민이됨. \n다양한 활용사례를 보고, 활발하게 쓰고 싶은데 온라인 상의 쏟아지는 정보 중엔 나에게 핏하는게 잘 없는 것 같다. (배우는 과정 발품 소요)`,
    after: "5/7 과제 제출. 주간보고서 + 주식 분석 스킬로 반복 작업 시간을 75% 줄이고, 텔레그램 봇 + 노션 MCP 동기화까지 구축했어요. '자동화는 반복 비용 흡수'라는 자신만의 원칙을 세운 사람이에요.",
  };

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p><h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1><p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team} · {member.jobTitle}</p><p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p></div></section>

      {hasDiploma && (<section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]"><div className="max-w-2xl mx-auto px-6 py-12 md:py-16"><div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="J(허지은)" /><div className="border border-dashed border-[#FCD34D] p-6 md:p-10"><div className="flex justify-center mb-6"><Image src="/certificate/sponge-logo.png" alt="" width={64} height={64} className="w-16 h-16" /></div><p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">CERTIFICATE OF COMPLETION</p><h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">수 료 증</h2><div className="mb-4"><p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p><p className="text-sm text-[#78716C]">{member.realName}</p></div><div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" /><p className="text-sm text-[#78716C] mb-6">위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.</p><p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p><p className="text-sm font-bold text-[#B45309]">출석 {stats.attendance.present} / {stats.attendance.total}회</p><div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" /><p className="text-[11px] text-[#A8A29E]">스폰지클럽</p>
                <div className="absolute bottom-24 right-16 rotate-[-12deg]">
                  <div className="border-4 border-red-500 rounded-full px-4 py-2 opacity-70">
                    <p className="text-red-500 font-extrabold text-lg tracking-wider">우수 수료</p>
                  </div>
                </div></div></div></div></section>)}

      <section className="bg-[var(--yellow)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center"><div className="flex justify-center mb-4"><Image src={character.image} alt={character.type} width={100} height={100} className="w-24 h-24 md:w-28 md:h-28" /></div><p className="text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-widest mb-2">나의 스폰지 유형</p><h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-4">{character.type}</h2><p className="text-sm text-[var(--ink-80)] leading-[1.9] max-w-lg mx-auto break-keep">{character.description}</p></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">숫자로 보는 7주</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-6"><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.sessionsAttended}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">공유회 참여</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.snsVerified}<span className="text-lg text-[var(--ink-30)]">회</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">SNS 인증</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsSent}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">보낸 셸</p></div><div className="text-center"><p className="text-4xl font-extrabold text-[var(--ink)]">{stats.shellsReceived}<span className="text-lg text-[var(--ink-30)]">개</span></p><p className="text-xs font-bold text-[var(--ink-50)] mt-2">받은 셸</p></div></div></div></section>

      <section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">출석 현황</h2><div className="flex justify-center gap-3 md:gap-4">{attendance.map((a) => (<div key={a.week} className="flex flex-col items-center"><div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg ${a.present === true ? "bg-[var(--yellow)] text-[var(--ink)]" : a.present === false ? "bg-red-50 text-red-400 border-2 border-red-200" : "bg-[var(--ink-05)] text-[var(--ink-30)]"}`}>{a.present === true ? "✓" : a.present === false ? "✗" : "—"}</div><p className="text-[11px] font-bold text-[var(--ink-50)] mt-2">{a.week}</p><p className="text-[10px] text-[var(--ink-30)]">{a.date}</p></div>))}</div><p className="text-center text-xs text-[var(--ink-30)] mt-6"><span className="font-extrabold text-[var(--ink)]">{stats.attendance.present}</span>회 출석 / 총 {stats.attendance.total}회</p></div></section>

      {timeline.length > 0 && (<section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-10 text-center">주차별 여정</h2><div className="space-y-0">{timeline.map((week, i) => (<div key={week.week} className="relative pl-10 pb-12 last:pb-0">{i < timeline.length - 1 && (<div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-[var(--ink-10)]" />)}<div className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[11px] font-extrabold bg-[var(--yellow)] text-[var(--ink)]">{week.week.replace("주차", "")}</div><div><div className="flex items-center gap-2 mb-2"><span className="text-base font-extrabold text-[var(--ink)]">{week.week}</span><span className="text-xs text-[var(--ink-30)]">{week.date}</span></div><p className="text-sm font-bold text-[var(--ink)] mb-2">{week.title}</p><p className="text-sm text-[var(--ink-80)] leading-[1.8]">{week.summary}</p>{(week as any).insight && (<div className="mt-4 border-l-4 border-[var(--yellow)] pl-4 py-2 bg-[var(--ink-05)]"><p className="text-sm text-[var(--ink)] italic font-medium">&ldquo;{(week as any).insight}&rdquo;</p></div>)}</div></div>))}</div></div></section>)}

      {badges.length > 0 && (<section className="border-b border-[var(--ink-10)] bg-[var(--ink-05)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">배지 컬렉션</h2><div className="flex flex-wrap justify-center gap-6">{badges.map((badge) => (<div key={badge.name} className="flex flex-col items-center w-20"><div className="w-16 h-16 bg-[var(--paper)] border-2 border-[var(--yellow)] flex items-center justify-center p-2 shadow-sm"><Image src={badge.icon} alt={badge.name} width={48} height={48} className="w-full h-full" /></div><p className="text-[11px] font-bold text-[var(--ink)] text-center mt-2 leading-tight">{badge.name}</p></div>))}</div></div></section>)}

      {giftMessages.length > 0 && (<section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-8 text-center">크루들의 응원</h2><div className="max-w-md mx-auto space-y-4">{giftMessages.map((g, i) => (<div key={i} className="flex items-start gap-3"><div className="w-9 h-9 rounded-full bg-[var(--yellow)] flex items-center justify-center text-base flex-shrink-0">🐚</div><div className="flex-1"><div className="relative bg-[var(--ink-05)] px-4 py-3"><div className="absolute left-[-8px] top-3 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-[var(--ink-05)]" /><p className="text-sm text-[var(--ink)] font-medium">&ldquo;{g.message}&rdquo;</p></div><p className="text-[11px] text-[var(--ink-30)] mt-1 ml-1">from {g.sender}</p></div></div>))}</div></div></section>)}

      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-14 md:py-20"><h2 className="text-xs font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-10 text-center">Before & After</h2><div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"><div><p className="text-[10px] font-extrabold text-[var(--paper)]/30 uppercase tracking-widest mb-3">BEFORE — 시작 전 막힌 점</p><blockquote className="text-lg font-bold text-[var(--paper)]/60 leading-relaxed">&ldquo;{beforeAfter.before}&rdquo;</blockquote><p className="text-xs text-[var(--paper)]/20 mt-3">— 프로그램 시작 전 설문에서</p></div><div><p className="text-[10px] font-extrabold text-[var(--yellow)] uppercase tracking-widest mb-3">AFTER — 7주 후</p><p className="text-lg font-bold text-[var(--paper)] leading-relaxed">{beforeAfter.after}</p></div></div></div></section>

      <footer className="py-14 text-center bg-[var(--yellow)]"><p className="text-2xl mb-2">🧽</p><p className="text-sm font-extrabold text-[var(--ink)]">{member.name}, 스폰지클럽의 정식 스폰지 크루가 되었습니다.</p></footer>
    </div>
  );
}
