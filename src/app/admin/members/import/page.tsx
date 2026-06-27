"use client";

import { useState } from "react";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/members/import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-6">
        CSV 일괄 등록
      </h1>

      <div className="border-2 border-[var(--ink-10)] p-6 mb-6">
        <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-3">
          CSV 형식
        </h2>
        <code className="block bg-[var(--ink-05)] p-4 text-xs text-[var(--ink)] font-mono mb-4">
          name,phone_last4,email,slack_user_id,survey_completed,cohort,pin
          <br />
          홍길동,1234,hong@email.com,U0123ABCDEF,true,2,0000
          <br />
          김영희,,,,true,2,0000
        </code>
        <ul className="text-xs text-[var(--ink-50)] space-y-1 font-medium">
          <li>- <strong>name</strong>: 필수</li>
          <li>- <strong>phone_last4, email, slack_user_id</strong>: 선택 (빈 값 가능)</li>
          <li>- <strong>survey_completed</strong>: true이면 가입 보너스 +10셸 자동 지급</li>
          <li>- <strong>cohort</strong>: 기수 (1, 2 등)</li>
          <li>- <strong>pin</strong>: 초기 PIN (기본값 0000)</li>
        </ul>
      </div>

      <div className="border-2 border-[var(--ink-10)] p-6">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 text-sm"
        />
        <br />
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] text-sm font-extrabold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {loading ? "처리 중..." : "업로드 및 등록"}
        </button>
      </div>

      {result && (
        <div className="mt-6 border-2 border-[var(--ink-10)] p-6">
          <h2 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-3">
            등록 결과
          </h2>
          <p className="text-sm font-bold text-[var(--ink)] mb-1">
            성공: {result.success}명
          </p>
          <p className="text-sm font-bold text-red-500 mb-3">실패: {result.failed}명</p>
          {result.errors.length > 0 && (
            <ul className="text-xs text-red-500 space-y-1">
              {result.errors.map((err, i) => (
                <li key={i}>- {err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
