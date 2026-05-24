"use client";

import { useEffect, useMemo, useState } from "react";
import type { Announcement } from "@/lib/types";

const STORAGE_KEY = "spongeclub-announcement-overrides-v1";
const ADMIN_MODE_KEY = "spongeclub-announcement-admin-mode-v1";
const OVERRIDE_EVENT = "spongeclub-announcement-overrides-change";

type EditableAnnouncementFields = Partial<
  Pick<Announcement, "title" | "text" | "href" | "pinned">
> & {
  hidden?: boolean;
};

type StoredOverrides = Record<string, EditableAnnouncementFields>;

function displayTitle(a: Announcement): string {
  return a.title?.trim() || a.text;
}

function readOverrides(): StoredOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as StoredOverrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: StoredOverrides) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides, null, 2));
  window.dispatchEvent(new Event(OVERRIDE_EVENT));
}

function readAdminMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_MODE_KEY) === "1";
}

function setAdminMode(enabled: boolean) {
  if (enabled) {
    window.localStorage.setItem(ADMIN_MODE_KEY, "1");
  } else {
    window.localStorage.removeItem(ADMIN_MODE_KEY);
  }
}

function applyClientOverride(
  announcement: Announcement,
  override?: EditableAnnouncementFields,
): Announcement | null {
  if (!override) return announcement;
  if (override.hidden) return null;

  return {
    ...announcement,
    ...override,
    title: override.title?.trim() || announcement.title,
    text: override.text?.trim() || announcement.text,
    href: override.href?.trim() || announcement.href,
  };
}

export function AnnouncementRow({ a }: { a: Announcement }) {
  const [overrides, setOverrides] = useState<StoredOverrides>({});
  const [editing, setEditing] = useState(false);
  const [adminMode, setAdminModeState] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get("admin");
    if (adminParam === "1") setAdminMode(true);
    if (adminParam === "0") setAdminMode(false);

    queueMicrotask(() => {
      setAdminModeState(readAdminMode());
    });
  }, []);

  useEffect(() => {
    const refresh = () => setOverrides(readOverrides());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(OVERRIDE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(OVERRIDE_EVENT, refresh);
    };
  }, []);

  const override = overrides[a.id];
  const announcement = useMemo(
    () => applyClientOverride(a, override),
    [a, override],
  );

  if (!announcement) return null;

  return (
    <li id={`announcement-${a.id}`} className="scroll-mt-20 py-2">
      <details className="group -mx-2 rounded-lg px-2 open:bg-ink-50/50">
        <summary className="flex cursor-pointer list-none items-start gap-2 py-1 text-sm leading-snug hover:text-ink-900">
          <span className="mt-0.5 text-[10px] text-ink-300 transition group-open:rotate-90">
            ▶
          </span>
          <span className="flex-1 font-medium">
            {announcement.pinned && <span className="mr-1 text-ink-300">📌</span>}
            {displayTitle(announcement)}
          </span>
          <span
            className={`mt-0.5 shrink-0 whitespace-nowrap text-[11px] ${
              announcement.pinned ? "text-ink-300" : "text-ink-500"
            }`}
          >
            {announcement.pinned ? "고정" : announcement.timeAgo}
          </span>
        </summary>

        <div className="pb-3 pl-5 pr-2 text-sm leading-relaxed text-ink-600">
          <p className="whitespace-pre-wrap">{announcement.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-300">
            {announcement.href && (
              <a
                href={announcement.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-500 hover:text-ink-900 hover:underline"
              >
                원문 보기 ↗
              </a>
            )}
            <span>
              수정 ID: <code>{announcement.id}</code>
            </span>
            {adminMode && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full px-1.5 text-ink-200 transition hover:bg-sponge-100 hover:text-ink-700 focus-visible:bg-sponge-100 focus-visible:text-ink-900 focus-visible:outline-none"
                title="비밀 수정창 열기"
                aria-label="공지 비밀 수정창 열기"
              >
                ●
              </button>
            )}
            {override && adminMode && (
              <span className="rounded-full bg-sponge-100 px-2 py-0.5 text-sponge-700">
                내 브라우저에서 수정됨
              </span>
            )}
          </div>
        </div>
      </details>

      {editing && (
        <AnnouncementEditDialog
          announcement={announcement}
          original={a}
          override={override}
          onClose={() => setEditing(false)}
          onSave={(nextOverride) => {
            const next = { ...readOverrides() };
            next[a.id] = nextOverride;
            writeOverrides(next);
            setEditing(false);
          }}
          onReset={() => {
            const next = { ...readOverrides() };
            delete next[a.id];
            writeOverrides(next);
            setEditing(false);
          }}
        />
      )}
    </li>
  );
}

function AnnouncementEditDialog({
  announcement,
  original,
  override,
  onClose,
  onSave,
  onReset,
}: {
  announcement: Announcement;
  original: Announcement;
  override?: EditableAnnouncementFields;
  onClose: () => void;
  onSave: (override: EditableAnnouncementFields) => void;
  onReset: () => void;
}) {
  const [title, setTitle] = useState(announcement.title ?? "");
  const [text, setText] = useState(announcement.text);
  const [href, setHref] = useState(announcement.href ?? "");
  const [pinned, setPinned] = useState(Boolean(announcement.pinned));
  const [hidden, setHidden] = useState(Boolean(override?.hidden));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="공지사항 수정"
      onClick={onClose}
    >
      <form
        className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            title: title.trim() || undefined,
            text: text.trim() || original.text,
            href: href.trim() || undefined,
            pinned,
            hidden,
          });
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sponge-600">
              비밀 공지 수정
            </p>
            <h2 className="mt-1 text-xl font-bold">사이트에서 바로 고치기</h2>
            <p className="mt-1 text-xs text-ink-500">
              이 수정은 현재 브라우저에 저장됩니다. 전체 배포용 수정은 나중에 DB/API로
              바꾸는 게 안전해요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-ink-300 hover:bg-ink-50 hover:text-ink-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-ink-700">
            제목
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-sponge-500"
              placeholder="접힌 상태에서 보일 제목"
            />
          </label>

          <label className="block text-sm font-medium text-ink-700">
            펼쳤을 때 본문
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-sponge-500"
            />
          </label>

          <label className="block text-sm font-medium text-ink-700">
            원문/이동 링크
            <input
              value={href}
              onChange={(event) => setHref(event.target.value)}
              className="mt-1 w-full rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-sponge-500"
              placeholder="https://..."
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm text-ink-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />
              고정 표시
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(event) => setHidden(event.target.checked)}
              />
              숨기기
            </label>
          </div>

          <p className="rounded-xl bg-ink-50 px-3 py-2 text-[11px] leading-relaxed text-ink-500">
            ID: <code>{original.id}</code>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-4 py-2 text-sm text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            원래대로
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink-100 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-full bg-sponge-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sponge-600"
            >
              저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
