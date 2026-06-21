"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";
import { useLiveStats } from "./_useLiveStats";

export default function HaneulCertificate() {
  const member = { name: "하늘", realName: "정하늘", team: "6조", jobTitle: "신경과전문의 / 유튜브채널 운영 중", period: "2026.05.03 — 2026.06.14" };

  const character = {
    type: "가벼운 부품부터 시작하는 크루",
    image: "/certificate/character-cheerleader.svg",
    description:
      "idea-collector 스킬(콘텐츠 아이디어 수집기)을 만들고, 단일 HTML 투두 게시판(localStorage, 반응형, 의존성 0)을 완성했어요. '통점을 3가지로 쪼개는 질문이 효과적', '처음 부품은 가장 가벼운 것부터'라는 인사이트를 발견했어요. 7/7 과제 전량 제출, 공유회 8번, 셸 19개 보내기. 6조에서 가장 다양하게 활동한 사람이에요.",
  };

  const stats = useLiveStats("하늘", { attendance: { present: 7, total: 7 }, sessionsAttended: 8, snsVerified: 4, shellsSent: 19, shellsReceived: 14 });

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
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg" },
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg" },
    { name: "첫 스킬 공유", icon: "/badges/first-skill-share.svg" },
    { name: "공유회 단골손님", icon: "/badges/session-regular.svg" },
    { name: "첫 크루챗", icon: "/badges/first-crewchat.svg" },
  ];

  const timeline: { week: string; date: string; title: string; summary: string; insight?: string }[] = [
    {
      week: "1주차", date: "5/10",
      title: "idea-collector 스킬 — 콘텐츠 아이디어 수집기",
      summary: "콘텐츠 크리에이터의 '오늘 뭐 만들지' 결정 비용을 없애는 idea-collector Claude 스킬을 만들었어요.",
      insight: "통점을 3가지로 쪼개는 질문이 효과적. 처음 부품은 가장 가벼운 것부터.",
    },
    {
      week: "2주차", date: "5/17",
      title: "단일 HTML 투두 게시판 + Carousel OS",
      summary: "localStorage 기반, 반응형, 의존성 0으로 단일 HTML 투두 게시판 CRUD를 완성했어요. 유튜브 영상 스크립트를 넣으면 8장 PNG 캐러셀 + 캡션을 자동 생성하고 인라인 편집까지 되는 웹앱도 만들었어요.",
    },
    {
      week: "3주차", date: "5/24",
      title: "Mecovery — 영양 자가체크 도구 (커뮤니티 입구)",
      summary: "사용자 컨디션 입력 → 영양제를 '처방'이 아닌 '함께 볼 가설'로 추천하는 셀프 체크 도구를 만들었어요. MVP로 선정됐어요.",
    },
    {
      week: "4주차", date: "5/31",
      title: "Mecovery — 하네스 5기둥 점검 + 톤가드 설계",
      summary: "CLAUDE.md·PRD·memory·SKILL·agent 5개 기둥을 점검하고, '가설 톤 검수 에이전트' 필요성을 발견했어요.",
    },
    {
      week: "5주차", date: "6/7",
      title: "Mecovery — 사용자 언어로 전면 재설계",
      summary: "전문 용어를 사용자 언어로 바꾸고, 인스타툰 캐릭터·빨간불 비유·편지 톤 결과지로 전면 개편했어요. MVP로 선정됐어요.",
    },
    {
      week: "6주차", date: "6/14",
      title: "Mecovery — 교육 버전 전환 (도구 봉인)",
      summary: "의료법 리스크를 판단해 영양소 추천·진단을 들어내고, 몸의 작동원리 교육 콘텐츠만 남긴 안전한 버전으로 전환했어요.",
    },
  ];

  const giftMessages = [
    { sender: "J", message: "화이팅입니다~~! ㅎㅎ" },
    { sender: "다니", message: "이번주도 화이팅입니닷!" },
    { sender: "Hook2", message: "적극적으로 셸을 모집하셔서 바로 지원들어갑니다!!" },
  ];

  const beforeAfter = {
    before: `더 효율적으로 사용할 수 있지 않을까.\n더 확장해서 쓸 수 있지 않을까 하는 생각이 있었어요. 혼자서 쓰다보니 제가 잘 쓰고 있는게 맞는지 모르겠더라구요. (품질검증 안됨) 바이브코딩도 해보고 싶었는데 엄두가 나지 않았습니다.`,
    after: "7/7 과제 전량 제출. idea-collector 스킬로 시작해서 투두 게시판, Carousel OS, Mecovery까지 확장했어요. '처음 부품은 가장 가벼운 것부터'라는 원칙대로 6조에서 가장 다양하게 활동한 사람이에요.",
  };

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p><h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1><p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team} · {member.jobTitle}</p><p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p></div></section>

      {hasDiploma && (<section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]"><div className="max-w-2xl mx-auto px-6 py-12 md:py-16"><div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="하늘(정하늘)" /><div className="border border-dashed border-[#FCD34D] p-6 md:p-10"><div className="flex justify-center mb-6"><Image src="/certificate/sponge-logo.png" alt="" width={64} height={64} className="w-16 h-16" /></div><p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">CERTIFICATE OF COMPLETION</p><h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">수 료 증</h2><div className="mb-4"><p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p><p className="text-sm text-[#78716C]">{member.realName}</p></div><div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" /><p className="text-sm text-[#78716C] mb-6">위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.</p><p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p><p className="text-sm font-bold text-[#B45309]">출석 {stats.attendance.present} / {stats.attendance.total}회</p><div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" /><p className="text-[11px] text-[#A8A29E]">스폰지클럽</p>
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
