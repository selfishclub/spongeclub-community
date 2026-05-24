import type { Metadata } from "next";
import Link from "next/link";
import { DiscussionsHeader } from "@/components/DiscussionsHeader";
import { DiscussionBoard } from "@/components/DiscussionBoard";
import { getSiteDiscussions } from "@/lib/supabase-content";

export const metadata: Metadata = {
  title: "스폰지클럽 1기 — 미션 질문 전체보기",
  description: "Slack 미션 관련 질문과 스레드 답변 모아보기",
};

export const revalidate = 300;

export default async function DiscussionsPage() {
  const discussions = await getSiteDiscussions();

  return (
    <>
      <DiscussionsHeader />
      <main className="max-w-3xl mx-auto px-5 py-8 flex-1 w-full space-y-6">
        <header>
          <Link
            href="/missions"
            className="text-xs text-ink-500 hover:text-ink-900 inline-flex items-center gap-1"
          >
            ← 미션 메인으로
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            💬 미션 관련 질문 전체보기
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            메인에서는 요약만 보여주고, 이 화면에서만 토글을 펼쳐 Slack 원문과 스레드 답변을 확인합니다. 총 {discussions.length}건.
          </p>
        </header>

        <DiscussionBoard items={discussions} />

        <footer className="text-center text-xs text-ink-300 pt-6 pb-12">
          데이터 출처: Supabase 질문 DB + Slack generated fallback
        </footer>
      </main>
    </>
  );
}
