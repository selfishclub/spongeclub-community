"use client";

import { useEffect, useState } from "react";

interface MemberOption {
  id: string;
  name: string;
}

export default function SurveyTermsPage() {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(
    null
  );
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [contentConsent, setContentConsent] = useState<
    "동의" | "비동의" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/survey/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members || []);
        setMembersLoading(false);
      })
      .catch(() => setMembersLoading(false));
  }, []);

  const filtered = search.trim()
    ? members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const isValid = selectedMember && termsAgreed && contentConsent !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/survey/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          name: selectedMember.name,
          termsAgreed,
          contentConsent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "제출에 실패했습니다.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center py-20">
          <div className="text-5xl mb-6">🧽</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            제출 완료!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            소중한 동의 감사합니다.
            <br />
            스폰지클럽에서 함께 성장해요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
            스폰지클럽 1기
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
            멤버의 약속 · 이용약관 · 콘텐츠 동의
          </h1>
          <p className="mt-3 text-gray-500 leading-relaxed text-sm">
            스폰지클럽은 운영진이 &apos;제공&apos;하는 강의가 아니라, 크루 모두가
            함께 굴리는 커뮤니티예요. 아래 내용을 천천히 읽어보신 후 체크해
            주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: 멤버 선택 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              본인 확인
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              이름을 검색해서 본인을 선택해 주세요.
            </p>

            {selectedMember ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-sm font-semibold text-gray-900">
                  {selectedMember.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setSearch("");
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  변경
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    membersLoading ? "로딩 중..." : "이름을 입력하세요..."
                  }
                  disabled={membersLoading}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:opacity-50"
                />
                {search.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-10">
                    {filtered.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-400">
                        검색 결과가 없어요
                      </p>
                    ) : (
                      filtered.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(m);
                            setSearch("");
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-800 font-medium hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                        >
                          {m.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section 2-1: 멤버의 약속 · 이용약관 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              멤버의 약속 · 이용약관
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              가볍게 넘기지 마시고, 천천히 읽어보신 후 체크해 주세요.
            </p>

            {/* 멤버의 약속 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                멤버의 약속
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                이기적공유에 진심으로 참여하기, 조의 리듬을 함께 만들기, 서로의
                시도를 존중하기 — 우리가 6주를 잘 보내기 위한 약속이에요.
              </p>
              <a
                href="https://sepia-quartz-81f.notion.site/3845c0a04646804895b9f28904682912"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
              >
                멤버의 약속 전문 보기 (노션)
              </a>
            </div>

            {/* 이용약관 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                이용약관
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                참여·운영·환불 등에 대한 기본 약관이에요.
              </p>
              <a
                href="https://sepia-quartz-81f.notion.site/3845c0a04646801b8b05e4f7c27bb738"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
              >
                이용약관 전문 보기 (노션)
              </a>
            </div>

            {/* 동의 체크박스 */}
            <label className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 accent-gray-900 shrink-0"
              />
              <span className="text-sm text-gray-800 leading-relaxed font-medium">
                이용약관을 모두 확인했으며, 스폰지클럽 멤버약속을 지킬 것에
                동의합니다.
              </span>
            </label>
          </section>

          {/* Section 2-2: 콘텐츠 활용 안내 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              콘텐츠 활용 안내
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              스폰지클럽 활동을 알리기 위한 콘텐츠 활용에 대한 안내예요.
            </p>

            <div className="text-sm text-gray-600 leading-relaxed mb-6 space-y-3">
              <p>
                스폰지클럽 활동 중 촬영되는 사진·영상, 그리고 슬랙·조 채널에
                쌓이는 공유 기록은 스폰지클럽의 활동을 이기적으로 알리는
                콘텐츠로 활용되거나 SNS 등에 올라갈 수 있어요.
              </p>
              <p className="text-gray-500">
                원치 않으시면{" "}
                <strong className="text-gray-700">
                  사전에 미리, 또는 이후에라도 운영진 비비안에게 말씀해주셔도
                  괜찮습니다.
                </strong>
              </p>
            </div>

            {/* 콘텐츠 동의 라디오 */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="radio"
                  name="contentConsent"
                  checked={contentConsent === "동의"}
                  onChange={() => setContentConsent("동의")}
                  className="w-5 h-5 text-gray-900 focus:ring-gray-900 accent-gray-900 shrink-0"
                />
                <span className="text-sm text-gray-800 font-medium">
                  콘텐츠 활용에 동의합니다.
                </span>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="radio"
                  name="contentConsent"
                  checked={contentConsent === "비동의"}
                  onChange={() => setContentConsent("비동의")}
                  className="w-5 h-5 text-gray-900 focus:ring-gray-900 accent-gray-900 shrink-0"
                />
                <span className="text-sm text-gray-800 font-medium">
                  콘텐츠 활용을 원하지 않습니다.
                </span>
              </label>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-4 rounded-2xl text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
          >
            {submitting ? "제출 중..." : "제출하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
