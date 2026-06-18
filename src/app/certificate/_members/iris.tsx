"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";
import { useLiveStats } from "./_useLiveStats";

export default function IrisCertificate() {
  const member = { name: "아이리스", realName: "이선애", team: "6조", jobTitle: "커피 로스팅 전문가 / 디자이너", period: "2026.05.03 — 2026.06.14" };

  const character = {
    type: "29번 수상한 로스터",
    image: "/certificate/character-cheerleader.svg",
    description:
      "오프라인에서 교량 설계·반도체·디자인(8년)을 거쳐 커피 로스팅 전문가로 활동 중이라고 소개했어요. 국내외 대회 29개 수상, 칭다오 중국 대회 1위. Claude를 활용해 QR 코드 기반 카카오 채널 구독자를 10명에서 214명으로 증가시켰어요. 10년간 축적한 로스팅 노트 데이터를 특허·출판으로 연결하는 방안을 모색 중이에요.",
  };

  const stats = useLiveStats("아이리스(이선애)", { attendance: { present: 7, total: 7 }, sessionsAttended: 2, snsVerified: 0, shellsSent: 0, shellsReceived: 14 });

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
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg" },
  ];

  const timeline: { week: string; date: string; title: string; summary: string; insight?: string }[] = [
    {
      week: "1주차", date: "5/10",
      title: "COFFEEMOMS CRM — 부산커피쇼 고객 관리 시스템",
      summary: "Google Sheets, Forms, Apps Script로 부산커피쇼 고객 관리 자동화 시스템을 만들었어요. B2C/B2B 고객을 분리하고, QR 코드 기반 쿠폰 발급과 이메일 자동 발송까지 구현했어요.",
    },
    {
      week: "2주차", date: "5/17",
      title: "COFFEEMOMS 고객 퍼널 OS — QR에서 재구매까지",
      summary: "QR 초대장을 입구로, 카카오채널로 관계를 유지하고, 스마트스토어로 재구매를 연결하는 고객 퍼널 OS를 설계했어요. 4일간 카카오채널 구독자 5명에서 214명으로 증가시켰어요.",
    },
    {
      week: "3주차", date: "5/24",
      title: "고객 여정 하네스 9개 + 오케스트레이션 설계",
      summary: "QR 커피초대장부터 카카오싱크까지 9가지 하네스를 정의하고, 고객 여정에 맞춰 순차 배치하는 오케스트레이션을 완성했어요. \"QR은 입구, 쿠폰은 행동 장치, 카카오채널은 관계 유지 공간\"이라는 구조를 잡았어요.",
    },
    {
      week: "4주차", date: "5/31",
      title: "49세 왕초보 영어회화 OS — 매일 문장 5개 입에 붙이기",
      summary: "파닉스, 단어, 패턴 조립, 말하기, 복습이 하나의 흐름으로 연결되는 영어 학습 OS를 만들었어요. \"I want coffee.\" 한 문장부터 시작해, 카페 현장에서 바로 쓸 수 있는 구조를 설계했어요.",
    },
    {
      week: "5주차", date: "6/7",
      title: "고1 딸을 위한 숨 쉬는 학습 OS",
      summary: "기말고사 준비 중인 딸을 위한 학습 관리 웹앱을 만들었어요. \"엄마, 숨을 못 쉬겠어\"라는 피드백으로 방향을 전환해, 오늘 목표 3개만 보여주고 나머지는 숨기는 구조로 바꿨어요.",
      insight: "좋은 학습 OS는 자료를 많이 모으는 시스템이 아니라, 아이가 공부할 수 있는 상태를 만들어주는 시스템이다.",
    },
  ];

  const giftMessages = [
    { sender: "석영", message: "셀을 보냈습니다~!" },
    { sender: "다니", message: "1주차 과제 끝까지 만들어주셔서 감사합니다!" },
  ];

  const beforeAfter = {
    before: "이제는 카테고리별 정리를 하고 싶습니다. 너무 많이 벌려놓아서요.",
    after: "오프라인에서 Claude로 QR 기반 카카오 채널 10→214명 성과를 공유했어요. 10년 로스팅 노트를 특허·출판으로 연결하는 방향을 잡아가고 있어요.",
  };

  const hasDiploma = stats.attendance.present >= 2;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <section className="bg-[var(--ink)]"><div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--paper)]/40 mb-8">SPONGE CLUB — 1기 활동 기록</p><h1 className="text-5xl md:text-6xl font-extrabold text-[var(--paper)] tracking-tight mb-3">{member.name}</h1><p className="text-base text-[var(--paper)]/60 font-medium">{member.realName} · {member.team} · {member.jobTitle}</p><p className="text-xs text-[var(--paper)]/30 mt-6 font-medium">{member.period}</p></div></section>

      {hasDiploma && (<section className="bg-[var(--ink-05)] border-b border-[var(--ink-10)]"><div className="max-w-2xl mx-auto px-6 py-12 md:py-16"><div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="아이리스(이선애)" /><div className="border border-dashed border-[#FCD34D] p-6 md:p-10"><div className="flex justify-center mb-6"><Image src="/certificate/sponge-logo.png" alt="" width={64} height={64} className="w-16 h-16" /></div><p className="text-[10px] font-bold text-[#B45309] tracking-[6px] uppercase mb-4">CERTIFICATE OF COMPLETION</p><h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-wider mb-6">수 료 증</h2><div className="mb-4"><p className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mb-1">{member.name}</p><p className="text-sm text-[#78716C]">{member.realName}</p></div><div className="w-48 h-px bg-[#F59E0B] mx-auto mb-4" /><p className="text-sm text-[#78716C] mb-6">위 사람은 스폰지클럽 1기 과정을 성실히 수료하였음을 증명합니다.</p><p className="text-xs text-[#A8A29E] mb-2">2026년 5월 3일 — 2026년 6월 14일</p><p className="text-sm font-bold text-[#B45309]">출석 {stats.attendance.present} / {stats.attendance.total}회</p><div className="w-32 h-px bg-[#FCD34D] mx-auto mt-6 mb-4" /><p className="text-[11px] text-[#A8A29E]">스폰지클럽</p>
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
