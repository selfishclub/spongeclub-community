"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import membersData from "./members-data.json";

type Member = {
  name: string;
  group: number | null;
  slug: string;
  attendanceCount: number;
  sessionsAttended: number;
  shellsSent: number;
  shellsReceived: number;
  hasDiploma: boolean;
};

const groups = [1, 2, 3, 4, 5, 6];

// Track which certificates are ready (add slugs here as they're built)
const READY: Set<string> = new Set([
  "배짱-박종배",
  "amy",
  "나무-김남욱",
  "모닥",
  "민트-최서진",
  "솔-임솔",
  "아가타",
  "유스",
  "이든",
  "잭",
  "체스터-이상윤",
  // 2조
  "라엘",
  "마라",
  "박경선",
  "봄-김연미",
  "슬로우퀵-박은아",
  "이니",
  "이오-오국봉",
  "제제-최지예",
  "포노미터-김미라",
  "피노",
  "히카리-윤준영",
  // 3조
  "nina-이예지",
  "ppucca",
  "개미-임종범",
  "그린-이유경",
  "린디",
  "설록-권효선",
  "신연수",
  "율리아-조유리",
  "지니",
  "치코-김나영",
  "코니-황초롱",
  // 4조
  "4조-지니-신진영",
  "yongs-전용규",
  "거위의꿈",
  "달빛그린",
  "리보-이보경",
  "린",
  "먼지민-석지민",
  "박루아",
  "설민주",
  "에이스-최학곤",
  "정민",
  // 5조
  "artree",
  "거북이-나병우",
  "덕수-김효정",
  "로이캉",
  "박상임",
  "보미",
  "비키-서승리",
  "써니",
  "이안-박민우",
  "키노-강은주",
  "헤이즐-성윤재",
  // 6조
  "galia-방경은",
  "hook2-이창환",
  "j",
  "라라",
  "레이",
  "석영",
  "아이리스-이선애",
  "초보자",
  "하늘",
  "허니바른",
  "히얌",
]);

const RANK_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function CertificateIndexPage() {
  const members = membersData as Member[];
  const [rankMap, setRankMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/ranking?type=ranking")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {};
        for (const r of (data.ranking || []).slice(0, 3)) {
          map[r.name] = r.rank;
        }
        setRankMap(map);
      })
      .catch(() => {});
  }, []);

  const totalReady = members.filter((m) => READY.has(m.slug)).length;
  const total = members.length;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-2xl mb-2">🧽</p>
          <h1 className="text-3xl font-extrabold text-[var(--ink)] mb-2">
            스폰지클럽 1기 수료증
          </h1>
          <p className="text-sm text-[var(--ink-50)]">
            모두 고생하셨습니다!
          </p>
        </div>

        {/* Naming Guide Toggle */}
        <NamingGuide />

        {/* Groups */}
        <div className="space-y-8">
          {groups.map((groupNum) => {
            const groupMembers = members.filter((m) => m.group === groupNum);
            const groupReady = groupMembers.filter((m) => READY.has(m.slug)).length;

            return (
              <section key={groupNum} className="border-2 border-[var(--ink-10)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold text-[var(--ink)]">
                    {groupNum}조
                  </h2>
                  <span className="text-xs font-bold text-[var(--ink-30)]">
                    {groupReady}/{groupMembers.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupMembers.map((m) => {
                    const isReady = READY.has(m.slug);
                    return (
                      <Link
                        key={m.slug}
                        href={`/certificate/${m.slug}`}
                        className={`relative block p-3 border-2 transition-colors ${
                          isReady
                            ? "border-[var(--yellow)] bg-[var(--yellow)]/10 hover:bg-[var(--yellow)]/20"
                            : "border-[var(--ink-10)] bg-[var(--ink-05)] hover:bg-[var(--ink-10)] opacity-50"
                        }`}
                      >
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          {m.attendanceCount >= 6 && <span className="text-lg" title="개근상">💐</span>}
                          {rankMap[m.name] && <span className="text-lg">{RANK_EMOJI[rankMap[m.name]]}</span>}
                        </div>
                        <p className="text-sm font-extrabold text-[var(--ink)] truncate">
                          {m.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[var(--ink-30)]">
                            출석 {m.attendanceCount}/7
                          </span>
                          {m.hasDiploma && (
                            <span className="text-[9px] font-extrabold text-red-500 border-2 border-red-500 rounded-full px-1.5 py-0.5 rotate-[-8deg] inline-block opacity-80 ml-auto">
                              수료
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NamingGuide() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div className="mb-8 border-2 border-[var(--ink-10)]">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--ink-05)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="text-sm font-extrabold text-[var(--ink)]">수료 네이밍 가이드</span>
          <span className="text-xs text-[var(--ink-30)]">— 이력서·링크드인에 활용하세요</span>
        </div>
        <span className={`text-[var(--ink-30)] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-6 border-t border-[var(--ink-10)]">
          {/* 수료 네이밍 */}
          <div className="pt-5">
            <h3 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">수료 네이밍</h3>
            <div className="space-y-4">
              <div className="bg-[var(--ink-05)] p-4">
                <p className="text-[10px] font-bold text-[var(--ink-30)] mb-1">① 정식 명칭형 — 이력서·수료증 공식 표기</p>
                <p className="text-sm font-bold text-[var(--ink)]">스폰지클럽 1기 수료 — 셀피쉬클럽 AI 실전활용 프로그램</p>
                <p className="text-xs text-[var(--ink-50)] mt-1 italic">SpongeClub 1st Cohort, Completed — Selfish Club Practical AI Program</p>
              </div>
              <div className="bg-[var(--ink-05)] p-4">
                <p className="text-[10px] font-bold text-[var(--ink-30)] mb-1">② 역량 강조형 — 링크드인 자격증/Certification 칸</p>
                <p className="text-sm font-bold text-[var(--ink)]">스폰지클럽 AI Agent 빌딩 프로그램 수료 (7주 과정)</p>
                <p className="text-xs text-[var(--ink-50)] mt-1 italic">SpongeClub AI Agent Building Program — Certificate of Completion (7 Weeks)</p>
              </div>
              <div className="bg-[var(--ink-05)] p-4">
                <p className="text-[10px] font-bold text-[var(--ink-30)] mb-1">③ 간결형 — 한 줄 이력·경력 기술서 내 삽입</p>
                <p className="text-sm font-bold text-[var(--ink)]">셀피쉬클럽 스폰지클럽 1기 수료</p>
                <p className="text-xs text-[var(--ink-50)] mt-1 italic">Completed SpongeClub Cohort 1, Selfish Club</p>
              </div>
            </div>
          </div>

          {/* 크루 활동 네이밍 */}
          <div>
            <h3 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">스폰지 크루 활동 네이밍</h3>
            <div className="space-y-4">
              <div className="bg-[var(--ink-05)] p-4">
                <p className="text-[10px] font-bold text-[var(--ink-30)] mb-1">① 소속·직함형 — 경력 한 줄로 박을 때</p>
                <p className="text-sm font-bold text-[var(--ink)]">스폰지크루 (셀피쉬클럽 AI 빌딩 크루)</p>
                <p className="text-xs text-[var(--ink-50)] mt-1 italic">Sponge Crew, Selfish Club — AI Building Crew</p>
              </div>
              <div className="bg-[var(--ink-05)] p-4">
                <p className="text-[10px] font-bold text-[var(--ink-30)] mb-1">② 활동 강조형 — 경험 기술 항목</p>
                <p className="text-sm font-bold text-[var(--ink)]">셀피쉬클럽 스폰지크루 — AI 에이전트·프로덕트 빌딩 멤버</p>
                <p className="text-xs text-[var(--ink-50)] mt-1 italic">Sponge Crew Member, Selfish Club — AI Agent &amp; Product Building</p>
              </div>
              <div className="bg-[var(--ink-05)] p-4">
                <p className="text-[10px] font-bold text-[var(--ink-30)] mb-1">③ 커뮤니티형 — 사이드 프로젝트·커뮤니티 활동 칸</p>
                <p className="text-sm font-bold text-[var(--ink)]">스폰지크루 (셀피쉬클럽 AI 실전 크루)</p>
                <p className="text-xs text-[var(--ink-50)] mt-1 italic">Sponge Crew, Selfish Club AI Practitioner Community</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
