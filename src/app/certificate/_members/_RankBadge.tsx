"use client";

import { useEffect, useState } from "react";

export default function RankBadge({ memberName }: { memberName: string }) {
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ranking?type=ranking")
      .then((r) => r.json())
      .then((data) => {
        const top3 = (data.ranking || []).slice(0, 3);
        const found = top3.find((r: { name: string }) => r.name === memberName);
        if (found) setRank(found.rank);
      })
      .catch(() => {});
  }, [memberName]);

  if (!rank || rank > 3) return null;

  const labels = ["🥇", "🥈", "🥉"];
  const colors = [
    "from-yellow-400 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-600 to-amber-700",
  ];

  return (
    <div className={`absolute -top-5 -right-5 bg-gradient-to-br ${colors[rank - 1]} text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg rotate-[12deg] z-10`}>
      <span className="text-3xl leading-none">{labels[rank - 1]}</span>
      <span className="text-[9px] font-extrabold mt-0.5">활동 {rank}위</span>
    </div>
  );
}
