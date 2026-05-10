"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  phone_last4: string;
  email: string | null;
  slack_user_id: string | null;
  shell_balance: number;
  group_number: number | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

interface Attended {
  id: string;
  status: string;
  registered_at: string;
  cancelled_at: string | null;
  session: {
    id: string;
    title: string;
    scheduled_at: string;
    status: string;
    entry_cost: number;
    host: { name: string } | null;
  } | null;
}

interface Hosted {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  entry_cost: number;
  capacity: number | null;
  created_at: string;
}

interface ShellRequest {
  id: string;
  url: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

interface Sent {
  id: string;
  amount: number;
  reason: string;
  reason_detail: string | null;
  created_at: string;
  receiver: { id: string; name: string } | null;
}

interface Received {
  id: string;
  amount: number;
  reason: string;
  reason_detail: string | null;
  created_at: string;
  sender: { id: string; name: string } | null;
}

interface VodRequest {
  id: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  session: { id: string; title: string; scheduled_at: string; entry_cost: number } | null;
}

interface VideoGrant {
  id: string;
  granted_at: string;
  video: { id: string; title: string; youtube_url: string; cost: number; expires_at: string } | null;
}

interface Badge {
  id: string;
  earned_at: string;
  achievement: { slug: string; name: string; description: string; icon: string } | null;
}

interface ActivitiesData {
  member: Member;
  attended: Attended[];
  hosted: Hosted[];
  sns: ShellRequest[];
  skill: ShellRequest[];
  sent: Sent[];
  received: Received[];
  vodRequests: VodRequest[];
  videoGrants: VideoGrant[];
  badges: Badge[];
}

const fmt = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "거부",
  COMPLETED: "완료",
  CANCELLED: "취소",
  REGISTERED: "신청",
  ATTENDED: "참석",
  NO_SHOW: "노쇼",
  RESOLVED: "처리됨",
};

const StatusPill = ({ status }: { status: string }) => (
  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-[var(--ink-05)] text-[var(--ink-50)] px-1.5 py-0.5">
    {STATUS_LABEL[status] || status}
  </span>
);

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-base font-extrabold text-[var(--ink)] mb-3 flex items-center gap-2">
      {title}
      <span className="text-xs font-bold bg-[var(--ink-05)] text-[var(--ink-50)] px-2 py-0.5 rounded-full">{count}</span>
    </h2>
    {count === 0 ? (
      <p className="text-sm text-[var(--ink-30)] py-4 text-center bg-white border border-[var(--ink-10)]">기록 없음</p>
    ) : (
      <div className="bg-white border border-[var(--ink-10)] divide-y divide-[var(--ink-10)]">
        {children}
      </div>
    )}
  </section>
);

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ActivitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/members/${id}/activities`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d: ActivitiesData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("멤버 정보를 불러올 수 없어요.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-[var(--ink-50)]">로딩 중...</p>;
  if (error || !data) return <p className="text-red-500">{error || "오류"}</p>;

  const { member } = data;

  return (
    <div>
      <Link href="/admin/members" className="inline-block text-xs font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)] uppercase tracking-widest mb-4">
        ← 멤버 목록으로
      </Link>

      {/* 멤버 헤더 */}
      <div className="bg-white border border-[var(--ink-10)] p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold text-[var(--ink)]">{member.name}</h1>
              {member.is_admin && (
                <span className="text-[10px] font-extrabold bg-[var(--yellow)] text-[var(--ink)] px-1.5 py-0.5 uppercase tracking-wider">어드민</span>
              )}
              {!member.is_active && (
                <span className="text-[10px] font-extrabold bg-[var(--ink-05)] text-[var(--ink-50)] px-1.5 py-0.5 uppercase tracking-wider">비활성</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--ink-30)] font-extrabold mb-1">조</p>
                <p className="font-bold text-[var(--ink)]">{member.group_number ? `${member.group_number}조` : "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--ink-30)] font-extrabold mb-1">잔고</p>
                <p className="font-bold text-[var(--ink)]">{member.shell_balance}🐚</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--ink-30)] font-extrabold mb-1">전화</p>
                <p className="font-bold text-[var(--ink)] tabular-nums">****{member.phone_last4}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--ink-30)] font-extrabold mb-1">Slack</p>
                <p className="font-mono text-xs text-[var(--ink-50)]">{member.slack_user_id || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 참여한 공유회 */}
      <Section title="🪑 참여한 공유회" count={data.attended.length}>
        {data.attended.map((a) => (
          <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-[var(--ink)] truncate">{a.session?.title || "(삭제된 공유회)"}</p>
                <StatusPill status={a.status} />
              </div>
              <p className="text-xs text-[var(--ink-30)]">
                {fmt(a.session?.scheduled_at)}
                {a.session?.host && <> · 진행자: {a.session.host.name}</>}
                {a.session && <> · 입장 {a.session.entry_cost}🐚</>}
              </p>
            </div>
          </div>
        ))}
      </Section>

      {/* 개최한 공유회 */}
      <Section title="🎤 개최한 공유회" count={data.hosted.length}>
        {data.hosted.map((h) => (
          <div key={h.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-[var(--ink)] truncate">{h.title}</p>
                <StatusPill status={h.status} />
              </div>
              <p className="text-xs text-[var(--ink-30)]">
                {fmt(h.scheduled_at)} · 입장 {h.entry_cost}🐚
                {h.capacity && <> · 정원 {h.capacity}명</>}
              </p>
            </div>
          </div>
        ))}
      </Section>

      {/* SNS 인증 */}
      <Section title="📱 SNS 인증" count={data.sns.length}>
        {data.sns.map((s) => (
          <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--ink)] hover:underline truncate block">
                  {s.url}
                </a>
                <StatusPill status={s.status} />
              </div>
              <p className="text-xs text-[var(--ink-30)]">
                신청 {fmt(s.created_at)}
                {s.reviewed_at && <> · 검토 {fmt(s.reviewed_at)}</>}
              </p>
            </div>
          </div>
        ))}
      </Section>

      {/* 스킬 공유 */}
      <Section title="🛠️ 스킬 공유" count={data.skill.length}>
        {data.skill.map((s) => (
          <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--ink)] hover:underline truncate block">
                  {s.url}
                </a>
                <StatusPill status={s.status} />
              </div>
              <p className="text-xs text-[var(--ink-30)]">
                신청 {fmt(s.created_at)}
                {s.reviewed_at && <> · 검토 {fmt(s.reviewed_at)}</>}
              </p>
            </div>
          </div>
        ))}
      </Section>

      {/* 셸 보낸 내역 */}
      <Section title="💛 셸 보낸 내역" count={data.sent.length}>
        {data.sent.map((t) => (
          <div key={t.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-[var(--ink)]">→ {t.receiver?.name || "(알 수 없음)"}</p>
              <span className="text-xs font-bold text-[var(--ink-50)]">{t.amount}🐚</span>
            </div>
            {t.reason_detail && <p className="text-xs text-[var(--ink-50)] mb-0.5">"{t.reason_detail}"</p>}
            <p className="text-xs text-[var(--ink-30)]">{fmt(t.created_at)}</p>
          </div>
        ))}
      </Section>

      {/* 셸 받은 내역 */}
      <Section title="🌟 셸 받은 내역" count={data.received.length}>
        {data.received.map((t) => (
          <div key={t.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-[var(--ink)]">← {t.sender?.name || "(시스템/알 수 없음)"}</p>
              <span className="text-xs font-bold text-[var(--ink-50)]">{t.amount}🐚</span>
            </div>
            {t.reason_detail && <p className="text-xs text-[var(--ink-50)] mb-0.5">"{t.reason_detail}"</p>}
            <p className="text-xs text-[var(--ink-30)]">{fmt(t.created_at)}</p>
          </div>
        ))}
      </Section>

      {/* VOD 신청 */}
      <Section title="📼 VOD 구매 신청" count={data.vodRequests.length}>
        {data.vodRequests.map((v) => (
          <div key={v.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-[var(--ink)] truncate">{v.session?.title || "(삭제된 공유회)"}</p>
                <StatusPill status={v.status} />
              </div>
              <p className="text-xs text-[var(--ink-30)]">
                신청 {fmt(v.created_at)}
                {v.resolved_at && <> · 처리 {fmt(v.resolved_at)}</>}
              </p>
            </div>
          </div>
        ))}
      </Section>

      {/* 시청 권한 받은 영상 */}
      <Section title="🎬 시청 권한 받은 영상" count={data.videoGrants.length}>
        {data.videoGrants.map((g) => (
          <div key={g.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <a href={g.video?.youtube_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--ink)] hover:underline truncate">
                {g.video?.title || "(삭제된 영상)"}
              </a>
              {g.video && <span className="text-xs font-bold text-[var(--ink-50)]">{g.video.cost}🐚</span>}
            </div>
            <p className="text-xs text-[var(--ink-30)]">
              부여 {fmt(g.granted_at)}
              {g.video?.expires_at && <> · 만료 {fmt(g.video.expires_at)}</>}
            </p>
          </div>
        ))}
      </Section>

      {/* 배지 */}
      <Section title="🏅 획득 배지" count={data.badges.length}>
        {data.badges.map((b) => (
          <div key={b.id} className="px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">{b.achievement?.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--ink)]">{b.achievement?.name}</p>
              <p className="text-xs text-[var(--ink-50)]">{b.achievement?.description}</p>
              <p className="text-xs text-[var(--ink-30)] mt-0.5">획득 {fmt(b.earned_at)}</p>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
