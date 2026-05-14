"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminWeek {
  id: string;
  weekFolder: string;
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  missions: { index: number; title: string }[];
  replayUrl: string | null;
  published: boolean;
}

export default function AdminMissionsPage() {
  const [weeks, setWeeks] = useState<AdminWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/missions/weeks")
      .then((r) => r.json())
      .then((data) => {
        setWeeks(data.weeks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">
          미션 관리
        </h1>
        <p className="text-xs text-[var(--ink-50)] font-medium">
          주차별 미션 제목·다시보기 링크 — /missions 페이지에 노출
        </p>
      </div>

      {loading ? (
        <p className="text-center py-12 text-[var(--ink-30)] text-sm">
          로딩 중...
        </p>
      ) : weeks.length === 0 ? (
        <p className="text-center py-12 text-[var(--ink-30)] text-sm">
          주차 정보가 없어요. supabase/migrations/20260514_missions_weeks.sql 을
          먼저 실행해주세요.
        </p>
      ) : (
        <div className="border-2 border-[var(--ink)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--ink)] text-[var(--paper)]">
              <tr>
                <th className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider">
                  주차
                </th>
                <th className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider">
                  기간
                </th>
                <th className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider">
                  미션
                </th>
                <th className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider">
                  다시보기
                </th>
                <th className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider">
                  공개
                </th>
                <th className="px-4 py-3 text-right font-extrabold text-xs uppercase tracking-wider">
                  편집
                </th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr
                  key={w.id}
                  className="border-t-2 border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors"
                >
                  <td className="px-4 py-3 font-extrabold text-[var(--ink)]">
                    {w.label}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-50)]">
                    {formatDateRange(w.startDate, w.endDate)}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-50)]">
                    {w.missions.length > 0 ? (
                      <span className="text-[var(--ink)] font-extrabold">
                        {w.missions.length}개 입력됨
                      </span>
                    ) : (
                      <span className="text-[var(--ink-30)]">미입력</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-50)]">
                    {w.replayUrl ? (
                      <span className="text-[var(--ink)] font-extrabold">
                        ✓ 등록됨
                      </span>
                    ) : (
                      <span className="text-[var(--ink-30)]">없음</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {w.published ? (
                      <span className="text-[var(--ink)] font-extrabold text-xs">
                        ON
                      </span>
                    ) : (
                      <span className="text-[var(--ink-30)] text-xs">OFF</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/missions/${encodeURIComponent(w.weekFolder)}`}
                      className="text-xs font-extrabold border-2 border-[var(--ink)] px-3 py-1.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                    >
                      편집 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDateRange(start: string, end: string): string {
  if (start === end) return formatShort(start);
  return `${formatShort(start)} – ${formatShort(end)}`;
}

function formatShort(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${parseInt(m[1], 10)}/${parseInt(m[2], 10)}`;
}
