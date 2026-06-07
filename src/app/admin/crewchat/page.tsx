"use client";

import { useEffect, useState } from "react";

interface ChatLog {
  id: string;
  requester_name: string;
  requester_image: string | null;
  partner_name: string;
  partner_image: string | null;
  status: string;
  memo: string;
  created_at: string;
}

export default function AdminCrewChatPage() {
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "requested" | "completed">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/crewchat")
      .then((r) => r.json())
      .then((data) => {
        setChats(data.chats || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = chats.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.requester_name.toLowerCase().includes(q) || c.partner_name.toLowerCase().includes(q);
    }
    return true;
  });

  const totalCount = chats.length;
  const requestedCount = chats.filter((c) => c.status === "requested").length;
  const completedCount = chats.filter((c) => c.status === "completed").length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-6">☕ 크루챗 로그</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--ink-05)] p-4 text-center">
          <p className="text-xs text-[var(--ink-30)] font-bold uppercase tracking-wider mb-1">전체</p>
          <p className="text-2xl font-extrabold text-[var(--ink)]">{totalCount}</p>
        </div>
        <div className="bg-[var(--ink-05)] p-4 text-center">
          <p className="text-xs text-[var(--ink-30)] font-bold uppercase tracking-wider mb-1">신청 중</p>
          <p className="text-2xl font-extrabold text-[var(--yellow)]">{requestedCount}</p>
        </div>
        <div className="bg-[var(--ink-05)] p-4 text-center">
          <p className="text-xs text-[var(--ink-30)] font-bold uppercase tracking-wider mb-1">완료</p>
          <p className="text-2xl font-extrabold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* 필터 + 검색 */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="이름 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "requested" | "completed")}
          className="px-4 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium"
        >
          <option value="all">전체</option>
          <option value="requested">신청 중</option>
          <option value="completed">완료</option>
        </select>
      </div>

      {/* 테이블 */}
      {loading ? (
        <p className="text-center py-12 text-[var(--ink-30)] text-sm">로딩 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-[var(--ink-30)] text-sm">크루챗 기록이 없어요</p>
      ) : (
        <div className="border-2 border-[var(--ink-10)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--ink-05)]">
                <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest">신청자</th>
                <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest">→</th>
                <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest">상대방</th>
                <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest">상태</th>
                <th className="text-right px-4 py-3 text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((chat) => (
                <tr key={chat.id} className="border-t border-[var(--ink-05)] hover:bg-[var(--yellow-dim)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {chat.requester_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={chat.requester_image} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[var(--ink-10)] flex items-center justify-center text-xs font-extrabold text-[var(--ink-50)] flex-shrink-0">
                          {chat.requester_name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-bold text-[var(--ink)]">{chat.requester_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--ink-30)]">→</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {chat.partner_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={chat.partner_image} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[var(--ink-10)] flex items-center justify-center text-xs font-extrabold text-[var(--ink-50)] flex-shrink-0">
                          {chat.partner_name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-bold text-[var(--ink)]">{chat.partner_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-extrabold px-2 py-1 ${
                      chat.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-[var(--yellow-dim)] text-[var(--ink)]"
                    }`}>
                      {chat.status === "completed" ? "완료" : "신청 중"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-[var(--ink-30)]">
                    {new Date(chat.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
