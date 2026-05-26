import { discussions } from "@/data/discussions";
import { siteConfig } from "@/data/config";
import type { Discussion } from "@/lib/types";

function ReactionList({ reactions }: { reactions: Discussion["reactions"] }) {
  return (
    <>
      {reactions.map((r, i) => (
        <span key={i}>
          {i > 0 && <span className="ddot" />}
          {r.emoji} {r.count}
        </span>
      ))}
    </>
  );
}

function DiscussionSummary({ d }: { d: Discussion }) {
  return (
    <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 hover:bg-ink-50">
      <span className="mt-1 text-[10px] text-ink-300 transition group-open:rotate-90">
        ▶
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-medium leading-snug">{d.title}</span>
        <span className="mt-1 text-xs text-ink-500 flex items-center flex-wrap">
          <span>
            {d.author}
            {d.team > 0 && <> · {d.team}조</>}
          </span>
          <span className="ddot" />
          <span>{d.timeAgo}</span>
          {d.reactions.length > 0 && <span className="ddot" />}
          <ReactionList reactions={d.reactions} />
        </span>
      </span>
      {d.href && (
        <span className="text-[11px] text-ink-400 shrink-0 mt-1">원문 있음</span>
      )}
      {d.linkToSkill && !d.href && (
        <a
          href="/skills"
          className="text-[11px] text-sponge-600 hover:underline shrink-0 mt-1"
        >
          스킬로 보기 →
        </a>
      )}
    </summary>
  );
}

function DiscussionReplies({ replies }: { replies: Discussion["replies"] }) {
  if (!replies || replies.length === 0) {
    return <p className="text-sm text-ink-400">아직 Slack 스레드 답변이 없습니다.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-ink-400">답변 {replies.length}개</p>
      {replies.map((reply, index) => (
        <article
          key={`${reply.author}-${reply.timeAgo}-${index}`}
          className="rounded-xl bg-white border border-ink-100 p-3"
        >
          <div className="flex items-center gap-2 text-[11px] text-ink-400">
            <span className="font-semibold text-ink-600">{reply.author}</span>
            <span className="ddot" />
            <span>{reply.timeAgo}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
            {reply.text}
          </p>
        </article>
      ))}
    </div>
  );
}

function DiscussionItem({ d }: { d: Discussion }) {
  return (
    <li id={`discussion-${d.id}`} className="scroll-mt-20">
      <details className="group open:bg-ink-50/50">
        <DiscussionSummary d={d} />
        <div className="px-5 pb-4 pl-14 text-sm leading-relaxed text-ink-600">
          <p className="whitespace-pre-wrap">{d.text ?? d.title}</p>
          <div className="mt-3">
            <DiscussionReplies replies={d.replies} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-300">
            {d.href && (
              <a
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-500 hover:text-ink-900 hover:underline"
              >
                Slack 가기 ↗
              </a>
            )}
            <span>
              원문 ID: <code>{d.id}</code>
            </span>
          </div>
        </div>
      </details>
    </li>
  );
}

export function DiscussionBoard({ items }: { items?: Discussion[] }) {
  const source = items ?? discussions;
  const total = source.length;
  return (
    <section className="rounded-2xl bg-white border border-ink-100">
      <header className="p-5 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-lg">💬 미션 관련 질문 &amp; 공유</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Slack 질문과 스레드 답변을 모아 보여줍니다.
          </p>
        </div>
        <p className="text-xs text-ink-500">총 {total}건</p>
      </header>

      <ul className="divide-y divide-ink-100">
        {source.map((d) => (
          <DiscussionItem key={d.id} d={d} />
        ))}
      </ul>

      <footer className="p-3 border-t border-ink-100 flex items-center justify-between text-xs">
        <a
          href={siteConfig.slackWorkspaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-500 hover:text-ink-900 inline-flex items-center gap-1"
        >
          ✏️ Slack에 바로 쓰기 <span className="text-[10px]">↗</span>
        </a>
        <a href="/missions" className="text-ink-500 hover:text-ink-900">
          미션 메인으로
        </a>
      </footer>
    </section>
  );
}
