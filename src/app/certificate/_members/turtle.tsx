"use client";

import Image from "next/image";
import RankBadge from "./_RankBadge";
import { useLiveStats } from "./_useLiveStats";

export default function TurtleCertificate() {
  const member = {
    name: "거북이",
    realName: "나병우",
    team: "5조",
    jobTitle: "1인 기업 / 이커머스 화장품&식품",
    period: "2026.05.03 — 2026.06.14",
  };

  const character = {
    type: "냅다 해보고 다시 하는 크루",
    image: "/certificate/character-cheerleader.svg",
    description:
      "0, 1주차 과제를 제출하며 sogood-writer 콘텐츠 제작 OS에서 시작해, LLM Wiki + 6-agent 시스템으로 확장했어요. 식약 표시 규정 자동 점검 시스템을 만들고 아르밍 제품 9개를 ingest하며 실전에 적용한 사람이에요. \"냅다 한번 해보고, 문제점 고민 후 다시 하면 훨씬 좋다\"는 철학과 \"MECE는 도구가 아니라 책임 기준\"이라는 통찰을 남겼어요.",
  };

  const stats = useLiveStats("거북이(나병우)", {
    attendance: { present: 7, total: 7 },
    sessionsAttended: 7,
    snsVerified: 6,
    shellsSent: 17,
    shellsReceived: 24,
  });

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
    { name: "첫 SNS 인증", icon: "/badges/first-sns.svg", earned: "2026.05" },
    { name: "첫 셸 보내기", icon: "/badges/first-shell-send.svg", earned: "2026.05" },
    { name: "셸 5회 보내기", icon: "/badges/shell-send-5.svg", earned: "2026.05" },
    { name: "셸 5회 받기", icon: "/badges/shell-receive-5.svg", earned: "2026.05" },
    { name: "첫 크루챗", icon: "/badges/first-crewchat.svg", earned: "2026.05" },
    { name: "첫 공유회 오픈", icon: "/badges/first-session-host.svg", earned: "2026.05" },
  ];

  const giftMessages = [
    { sender: "박상임", message: "지식의 깊이가 남다르신! 올려주신 옵시디언 정보도 잘 보겠습니다~~" },
    { sender: "ppucca", message: "어제 꿀팁 너무 감사했습니다!!" },
    { sender: "Hook2", message: "같이 메타 들어요~~" },
  ];

  const timeline = [
    {
      week: "1주차", date: "5/10",
      title: "sogood-writer 스킬 — 콘텐츠 제작 OS",
      summary: "1인 이커머스 셀러로서 상품 콘텐츠 제작 부담을 줄이기 위한 sogood-writer 스킬을 만들었어요. 콘텐츠 제작 OS의 첫 부품이에요.",
      insight: "냅다 한번 해보고, 문제점 고민한 뒤 다시 하면 훨씬 좋아요.",
    },
    {
      week: "2주차", date: "5/17",
      title: "LLM Wiki + 6-agent 시스템 — 식약 표시 규정 자동 점검",
      summary: "LLM Wiki 기반으로 6개 에이전트 시스템을 구축하고, 식약 표시 규정 자동 점검 시스템을 만들었어요. 아르밍 제품 9개를 ingest하며 실전에 적용했어요.",
      insight: "MECE는 도구가 아니라 책임 기준이에요.",
    },
    {
      week: "3주차", date: "5/24",
      title: "쇼핑인사이트 키워드 분석기 — 의미 분해 + AI 시장 해석",
      summary: "네이버 쇼핑인사이트 인기검색어 Top100을 의미 단위로 분해·정량화하고, LLM이 시장 해석을 붙여주는 로컬 웹앱(Streamlit)을 만들었어요. 소상공인 셀러가 카테고리별 '키워드 DNA'를 파악하는 도구예요.",
      insight: "단발성 업무를 시스템에 쌓으면, 쓸수록 똑똑해지는 자산이 된다.",
    },
    {
      week: "4주차", date: "5/31",
      title: "키워드 분석기 — Tailscale 외부 접속 + AI 속도 개선",
      summary: "내 PC에서만 돌아가던 앱을 Tailscale VPN으로 어디서든 접속 가능하게 만들었어요. AI 키워드 100개 분해를 5개씩 병렬 처리로 바꿔 대기 시간을 18초로 단축했어요.",
      insight: "AI 작업도 쪼개면 빨라진다. 단순 반복엔 경량 모델, 해석엔 상위 모델.",
    },
    {
      week: "5주차", date: "6/7",
      title: "콘텐츠 제작 OS — 1회성 작업을 자산으로",
      summary: "제품 자료(LLM Wiki)를 중심에 두고 어떤 AI 도구에서든 꺼내 쓰는 콘텐츠 제작 OS를 구축했어요. DB + MCP 서버 + 3접점(CLI·헤르메스·웹) + 스킬·에이전트 4개 구성요소가 맞물려 돌아가요.",
      insight: "한 번 쌓은 자료·스킬이 재사용·누적되는 자산이 되는 것이 본질.",
    },
  ];

  const beforeAfter = {
    before: ` 컨텐츠 제작, 기획서 작성, 데이터 분석 등 작업을 위한 기초 데이터를 어떻게 DB화하고\n이 데이터들을 어떻게 활용해서 결과물의 퀄리티를 높일 수 있을까?\n-> 옵시디언에 LLM Wiki를 세팅하는 것이 나에게는 최적의 답이라고 판단!!`,
    after: "sogood-writer에서 시작해 LLM Wiki + 6-agent 시스템까지 확장하며, 식약 표시 규정 자동 점검이라는 실전 도구를 만들었어요. \"냅다 해보고 다시 하면 훨씬 좋다\"는 자기만의 학습법을 찾은 사람이에요.",
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
            <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] p-8 md:p-12 text-center relative"><RankBadge memberName="거북이(나병우)" />
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

      {timeline.length > 0 && (<section className="border-b border-[var(--ink-10)]"><div className="max-w-3xl mx-auto px-6 py-12 md:py-16"><h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-10 text-center">주차별 여정</h2><div className="space-y-0">{timeline.map((week, i) => (<div key={week.week} className="relative pl-10 pb-12 last:pb-0">{i < timeline.length - 1 && (<div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-[var(--ink-10)]" />)}<div className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center text-[11px] font-extrabold bg-[var(--yellow)] text-[var(--ink)]">{week.week.replace("주차", "")}</div><div><div className="flex items-center gap-2 mb-2"><span className="text-base font-extrabold text-[var(--ink)]">{week.week}</span><span className="text-xs text-[var(--ink-30)]">{week.date}</span></div><p className="text-sm font-bold text-[var(--ink)] mb-2">{week.title}</p><p className="text-sm text-[var(--ink-80)] leading-[1.8]">{week.summary}</p>{(week as any).insight && (<div className="mt-4 border-l-4 border-[var(--yellow)] pl-4 py-2 bg-[var(--ink-05)]"><p className="text-sm text-[var(--ink)] italic font-medium">&ldquo;{(week as any).insight}&rdquo;</p></div>)}</div></div>))}</div></div></section>)}

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
