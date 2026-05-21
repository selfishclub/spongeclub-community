import type { Metadata } from "next";
import { getCuratedSkills } from "@/lib/skills/vault-fetcher";
import { SkillsHeader } from "./_components/SkillsHeader";
import { SkillsBoard } from "./_components/SkillsBoard";

export const metadata: Metadata = {
  title: "스킬 & 인사이트 — 스폰지클럽 1기",
  description: "스폰지들이 직접 써본 스킬과 가이드 모음",
};

// vault의 skill_*.md 갱신을 5분 안에 반영
export const revalidate = 300;

export default async function SkillsPage() {
  const skills = await getCuratedSkills();

  return (
    <>
      <SkillsHeader />
      <main className="max-w-6xl mx-auto px-5 py-6 flex-1 w-full">
        <SkillsBoard skills={skills} />
        <footer className="text-center text-xs text-[#A8A6A0] pt-6 pb-12 mt-8">
          스폰지클럽 1기 · 스킬 &amp; 인사이트 · 데굴데굴 큐레이션
        </footer>
      </main>
    </>
  );
}
