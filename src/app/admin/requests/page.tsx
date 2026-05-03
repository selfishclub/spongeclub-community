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

  const fetchRequests = () => {
    fetch(`/api/admin/requests?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []));
  };

  useEffect(() => {
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
    fetchRequests();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">신청 관리</h1>

      <div className="flex gap-3 mb-4">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm rounded-lg ${
              statusFilter === s
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {s === "PENDING" ? "대기 중" : s === "APPROVED" ? "승인됨" : "거부됨"}
          </button>
        ))}
      </div>

      <p className="text-sm text-amber-600 mb-4">총 {requests.length}건</p>

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-lg border border-amber-200 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-amber-900">
                    {req.member_name}
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    {TYPE_LABELS[req.type] || req.type}
                  </span>
                  <span className="text-xs text-amber-500">
                    +{TYPE_SHELLS[req.type]}🐚
                  </span>
                </div>
                <a
                  href={req.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {req.url}
                </a>
                <p className="text-xs text-amber-400 mt-1">
                  {new Date(req.created_at).toLocaleString("ko-KR")}
                </p>
              </div>

              {statusFilter === "PENDING" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={loading === req.id}
                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={loading === req.id}
                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    거부
                  </button>
                </div>
              )}

              {statusFilter !== "PENDING" && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    req.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {req.status === "APPROVED" ? "승인" : "거부"}
                </span>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-center py-8 text-amber-500">
            {statusFilter === "PENDING"
              ? "대기 중인 신청이 없습니다."
              : "해당 상태의 신청이 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
