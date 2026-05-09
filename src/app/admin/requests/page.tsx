"use client";

import { useEffect, useState } from "react";

interface ShellRequest {
  id: string;
  member_id: string;
  member_name: string;
  type: string;
  url: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  SNS_VERIFY: "SNS 인증",
  SKILL_SHARE: "스킬 공유",
};

const TYPE_SHELLS: Record<string, number> = {
  SNS_VERIFY: 2,
  SKILL_SHARE: 1,
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<ShellRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<Record<string, "approve" | "reject">>({});

  const fetchRequests = () => {
    fetch(`/api/admin/requests?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []));
  };

  useEffect(() => {
    setActionDone({});
    fetchRequests();
  }, [statusFilter]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setLoading(id);
    await fetch("/api/admin/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setLoading(null);
    setActionDone((prev) => ({ ...prev, [id]: action }));
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-6">신청 관리</h1>

      <div className="flex border-2 border-[var(--ink)] mb-6 w-fit">
        {[
          ["PENDING", "대기 중"],
          ["APPROVED", "승인됨"],
          ["REJECTED", "거부됨"],
        ].map(([key, label], i) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-5 py-2.5 text-xs font-extrabold transition-colors ${i > 0 ? "border-l-2 border-[var(--ink)]" : ""} ${
              statusFilter === key
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">
        {requests.length}건
      </p>

      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="border-2 border-[var(--ink-10)] p-4 hover:bg-[var(--yellow-dim)] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--ink)] text-sm">
                    {req.member_name}
                  </span>
                  <span className="text-[10px] font-extrabold bg-[var(--ink)] text-[var(--paper)] px-1.5 py-0.5 uppercase tracking-wider">
                    {TYPE_LABELS[req.type] || req.type}
                  </span>
                  <span className="text-[10px] font-extrabold text-[var(--ink)] bg-[var(--yellow)] px-1.5 py-0.5">
                    +{TYPE_SHELLS[req.type]} 셸
                  </span>
                </div>
                <a
                  href={req.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--ink-50)] hover:text-[var(--ink)] underline break-all"
                >
                  {req.url}
                </a>
                <p className="text-xs text-[var(--ink-30)] mt-1 font-medium">
                  {new Date(req.created_at).toLocaleString("ko-KR")}
                </p>
              </div>

              {statusFilter === "PENDING" && !actionDone[req.id] && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={loading === req.id}
                    className="px-3 py-1.5 text-xs font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 disabled:opacity-40"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={loading === req.id}
                    className="px-3 py-1.5 text-xs font-bold border-2 border-[var(--ink-10)] text-[var(--ink-50)] hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40"
                  >
                    거부
                  </button>
                </div>
              )}

              {statusFilter === "PENDING" && actionDone[req.id] && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-1 uppercase tracking-wider ${
                    actionDone[req.id] === "approve"
                      ? "bg-[var(--yellow)] text-[var(--ink)]"
                      : "bg-[var(--ink-10)] text-[var(--ink-30)]"
                  }`}
                >
                  {actionDone[req.id] === "approve" ? "승인 완료" : "거부 완료"}
                </span>
              )}

              {statusFilter !== "PENDING" && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-1 uppercase tracking-wider ${
                    req.status === "APPROVED"
                      ? "bg-[var(--yellow)] text-[var(--ink)]"
                      : "bg-[var(--ink-10)] text-[var(--ink-30)]"
                  }`}
                >
                  {req.status === "APPROVED" ? "승인" : "거부"}
                </span>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-center py-8 text-[var(--ink-30)] text-sm">
            {statusFilter === "PENDING"
              ? "대기 중인 신청이 없습니다."
              : "해당 상태의 신청이 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
