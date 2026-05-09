"use client";

import { useEffect, useState } from "react";

interface Suggestion {
  id: string;
  suggester_name: string;
  target_name: string;
  topic: string;
  status: string;
  created_at: string;
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");

  const fetchSuggestions = () => {
    setLoading(true);
    fetch(`/api/admin/suggestions?status=${tab}`)
      .then((r) => r.json())
      .then((data) => { setSuggestions(data.suggestions || []); setLoading(false); });
  };

  useEffect(() => { fetchSuggestions(); }, [tab]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchSuggestions();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-6">공유회 추천</h1>

      <div className="flex border-2 border-[var(--ink)] mb-6">
        {[["PENDING", "대기"], ["ACCEPTED", "수락"], ["REJECTED", "거절"], ["all", "전체"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-xs font-extrabold transition-colors border-r border-[var(--ink)] last:border-r-0 ${
              tab === key ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-12 text-[var(--ink-30)] text-sm">로딩 중...</p>
      ) : suggestions.length === 0 ? (
        <p className="text-center py-12 text-[var(--ink-30)] text-sm">추천이 없어요</p>
      ) : (
        <div className="border-t-2 border-[var(--ink-10)]">
          {suggestions.map((s) => (
            <div key={s.id} className="px-5 py-4 border-b border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--ink)]">
                    <span className="text-[var(--ink-50)]">{s.suggester_name}</span>
                    {" → "}
                    <span>{s.target_name}</span>
                  </p>
                  <p className="text-sm text-[var(--ink-80)] mt-1 leading-relaxed">{s.topic}</p>
                  <p className="text-[11px] text-[var(--ink-30)] mt-1.5">{new Date(s.created_at).toLocaleString("ko-KR")}</p>
                </div>
                {s.status === "PENDING" && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => updateStatus(s.id, "ACCEPTED")}
                      className="px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] text-xs font-bold hover:opacity-90 transition-opacity">
                      수락
                    </button>
                    <button onClick={() => updateStatus(s.id, "REJECTED")}
                      className="px-3 py-1.5 border-2 border-[var(--ink-10)] text-[var(--ink-50)] text-xs font-bold hover:bg-[var(--ink-05)] transition-colors">
                      거절
                    </button>
                  </div>
                )}
                {s.status !== "PENDING" && (
                  <span className={`text-xs font-extrabold px-2 py-1 ${
                    s.status === "ACCEPTED" ? "bg-[var(--yellow)] text-[var(--ink)]" : "bg-[var(--ink-05)] text-[var(--ink-30)]"
                  }`}>
                    {s.status === "ACCEPTED" ? "수락" : "거절"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
