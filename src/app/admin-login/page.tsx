"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("비밀번호가 틀렸어요");
        setLoading(false);
      }
    } catch {
      setError("문제가 발생했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-amber-200 rounded-lg p-8 w-full max-w-sm shadow-sm"
      >
        <h1 className="text-xl font-bold text-amber-900 mb-2">
          🐚 어드민 로그인
        </h1>
        <p className="text-sm text-amber-700 mb-6">
          어드민 비밀번호를 입력해주세요.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="w-full border border-amber-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-amber-500"
          autoFocus
          inputMode="numeric"
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-amber-600 text-white rounded py-2 hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "확인 중..." : "확인"}
        </button>
      </form>
    </div>
  );
}
