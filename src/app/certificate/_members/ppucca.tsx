"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";
import { useLiveStats } from "./_useLiveStats";

export default function PpuccaCertificate() {
  const member = {
    name: "ppucca",
    realName: "이세희",
    team: "3조",
    jobTitle: "명품 리셀업",
    period: "2026.05.03 — 2026.06.14",
  };

  const character = {
    type: "완벽주의를 내려놓은 크루",
    image: "/certificate/character-sprout.svg",
    description:
      "0-6주차 과제를 전부 제출했어요. 1주차에 자투리 배정기 v0.1을 만들어 v0.2까지 개선하고, 이후 W2-6에 걸쳐 할당 로직을 계속 다듬었어요. \"완벽주의는 죄책감 머신, 수용이 모멘텀\"이라는 깨달음을 얻은 사람이에요.",
  };

  const stats = useLiveStats("ppucca", {
    attendance: { present: 4, total: 7 },
    sessionsAttended: 0,
    snsVerified: 1,
    shellsSent: 8,
    shellsReceived: 16,
  });

  const attendance = [
    { week: "OT", date: "5/3", present: true },
    { week: "1주차", date: "5/10", present: true },
    { week: "2주차", date: "5/17", present: false },
    { week: "3주차", date: "5/24", present: true },
    { week: "4주차", date: "5/31", present: false },
    { week: "5주차", date: "6/7", present: false },
    { week: "6주차", date: "6/14", present: true },
  ];

  const badges = [
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg", earned: "2026.05" },
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg", earned: "2026.05" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg", earned: "2026.05" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg", earned: "2026.05" },
  ];

  const timeline = [
    {
      week: "1주차", date: "5/10",
      title: "자투리 배정기 v0.1 → v0.2",
      summary: "자투리 시간에 할 일을 자동 배정해주는 시스템을 만들어 v0.1에서 v0.2로 개선했어요.",
      insight: "완벽주의 = 죄책감 머신. 수용 = 모멘텀.",
    },
    {
      week: "2주차", date: "5/17",
      title: "할당 로직 개선 시작",
      summary: "W2-6에 걸쳐 자투리 배정기의 할당 로직을 지속적으로 개선했어요. 1-2주 검증 후 디자인을 확정하는 방식을 적용했어요.",
      insight: "1-2주 검증 후 디자인 확정.",
    },
    {
      week: "3주차", date: "5/24",
      title: "나만의 자서전 — 사전 인터뷰 웹앱 MVP",
      summary: "글을 쓰고 싶지만 시작 못 하는 사람을 위한 AI 사전 인터뷰 웹앱을 만들었어요. Next.js 14 + Notion DB 연동으로 손님용 랜딩·인터뷰·어드민까지 구현. 두 번의 사업 방향 폐기(모임 도구, 출판 대행) 끝에 \"같이 통과해주는 동반자\"로 재정의했어요.",
      insight: "AI를 셀링 포인트로 내세우지 않고, 출간 경험자가 직접 동반한다는 게 진짜 차별점.",
    },
    {
      week: "4주차", date: "5/31",
      title: "나만의 자서전 — 유형별 인터뷰 설계 + 페르소나 테스트",
      summary: "사람마다 다른 질문을 던지는 구조로 인터뷰를 재설계했어요. 유형 파악 질문 1개 + 유형별 질문 4개 + 정리 양식까지 문서 7개 완성. 혼자 테스트가 느려서 페르소나(말 짧은 어르신, 말 많은 사장 등)를 만들어 자동 테스트를 돌렸어요.",
      insight: "페르소나는 곤란한 질문을 피하긴 하지만 진짜 사람처럼 입을 닫지는 않는다. 결국 진짜 사람이 받아봐야 진짜 문제가 보인다.",
    },
    {
      week: "6주차", date: "6/14",
      title: "나만의 자서전 — 인터뷰 재설계 + 진행률 바 + 정리본 저장 개선",
      summary: "실제 사람이 인터뷰를 해보니 꼬리물기식 질문이 지루하고 진행 상황이 안 보이는 문제를 발견했어요. 진행률 바를 추가하고, 정리본 2000자 제한으로 날아가던 문제를 1800자씩 나눠 저장하도록 고쳤어요.",
      insight: "AI가 대체할 수 없는 영역은 역시 사람과의 소통, 교류라는 것을 알게 됐다.",
    },
  ];

  const giftMessages = [
    { sender: "신연수", message: "응원의 마음을 담아 셸 보내요!!" },
    { sender: "Nina", message: "텔레그램 봇 연결 공감되는 고민중인 뿌" },
    { sender: "흐민", message: "아침부터 좋은 질문 남겨주신 뿌까에게 셸 선물 드립니다" },
  ];

  const beforeAfter = {
    before: `프롬프트 효율화 (맥락 놓치지 않게)\n너무 다양한 기술들이 나오고 잇어서 어디서부터 어떻게 활용해야할지 막막.\n에이전트도 써보고 싶은데 모르겠음\n\n그저 막막`,
    after: "자투리 배정기를 v0.1에서 v0.2로 개선하고 6주간 할당 로직을 다듬으며, 완벽주의를 내려놓고 수용으로 모멘텀을 만드는 법을 배웠어요. 0-6주차 과제 전부 제출한 사람이에요.",
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
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="ppucca(이세희)" />
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

      {timeline.length > 0 && (
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
                    {week.week.replace("주차", "")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-extrabold text-[var(--ink)]">{week.week}</span>
                      <span className="text-xs text-[var(--ink-30)]">{week.date}</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--ink)] mb-2">{week.title}</p>
                    <p className="text-sm text-[var(--ink-80)] leading-[1.8]">{week.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
