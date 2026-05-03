"use client";

import { useEffect, useState } from "react";

interface RankingEntry {
  rank: number;
  member_id: string;
  name: string;
  total: number;
}

type TabType = "weekly" | "total";

export default function RankingPage() {
  const [tab, setTab] = useState<TabType>("total");
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ranking?type=${tab}`)
      .then((res) => res.json())
      .then((data) => {
        setRanking(data.ranking || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  const getMedal = (rank: number) => {
    if (rank === 1) return "\uD83E\uDD47";
    if (rank === 2) return "\uD83E\uDD48";
    if (rank === 3) return "\uD83E\uDD49";
    return `${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-1">
            🐚 스폰지클럽 셸 랭킹
          </h1>
          <p className="text-sm text-amber-600">
            멤버들이 보낸 마음을 확인해보세요
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex rounded-xl bg-amber-100 p-1 mb-6">
          <button
            onClick={() => setTab("weekly")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "weekly"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-amber-600 hover:text-amber-800"
            }`}
          >
            📅 현재 랭킹
          </button>
          <button
            onClick={() => setTab("total")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "total"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-amber-600 hover:text-amber-800"
            }`}
          >
            🏆 받은 셸 랭킹
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-amber-500 animate-pulse text-lg">🐚 로딩 중...</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🐚</p>
            <p className="text-amber-500">
              {tab === "weekly"
                ? "아직 기록이 없어요"
                : "아직 기록이 없어요"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((entry) => (
              <div
                key={entry.member_id}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  entry.rank <= 3
                    ? "bg-white shadow-md border border-amber-200"
                    : "bg-white/60 border border-amber-100"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                    entry.rank === 1
                      ? "bg-yellow-100 text-yellow-700 text-xl"
                      : entry.rank === 2
                        ? "bg-gray-100 text-gray-600 text-xl"
                        : entry.rank === 3
                          ? "bg-orange-100 text-orange-600 text-xl"
                          : "bg-amber-50 text-amber-500 text-sm"
                  }`}
                >
                  {getMedal(entry.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      entry.rank <= 3 ? "text-amber-900 text-base" : "text-amber-800 text-sm"
                    }`}
                  >
                    {entry.name}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <span
                    className={`font-bold ${
                      entry.rank <= 3
                        ? "text-amber-900 text-lg"
                        : "text-amber-700 text-sm"
                    }`}
                  >
                    {entry.total}
                  </span>
                  <span className="ml-1 text-amber-500">🐚</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-amber-400 mt-8 pb-8">
          🐚 셸은 멤버들의 인정의 표시에요
        </p>
      </div>
    </div>
  );
}
