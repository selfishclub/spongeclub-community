"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CrewchatPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🧽</p>
        <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-2">크루챗은 종료되었어요</h1>
        <p className="text-sm text-[var(--ink-50)]">홈으로 이동합니다...</p>
      </div>
    </div>
  );
}
