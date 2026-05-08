"use client";

import { useEffect, useState } from "react";

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  description: string | null;
  cost: number;
  expires_at: string;
  created_at: string;
  grant_count: number;
}

interface MemberOption {
  id: string;
  name: string;
  shell_balance: number;
  is_active: boolean;
}

interface Grant {
  id: string;
  granted_at: string;
  member_id: string;
  members: { id: string; name: string; shell_balance: number } | null;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [grantsModalId, setGrantsModalId] = useState<string | null>(null);

  const loadVideos = () => {
    fetch("/api/admin/videos")
      .then((r) => r.json())
      .then((data) => {
        setVideos(data.videos || []);
        setLoading(false);
      });
  };

  useEffect(loadVideos, []);

  const handleDelete = async (id: string) => {
    if (!confirm("이 영상을 삭제하시겠어요? 부여된 권한도 모두 사라집니다 (셸 환불 없음)")) return;
    const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (res.ok) loadVideos();
    else alert("삭제 실패");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-900">영상 관리</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
        >
          + 영상 등록
        </button>
      </div>

      <p className="text-sm text-amber-900 mb-6">
        🎬 유튜브에 <b>일부 공개(Unlisted)</b>로 업로드한 영상 링크를 등록하세요. 어드민이 멤버에게 시청 권한을 부여하면 해당 멤버의 셸이 자동 차감됩니다.
      </p>

      {loading ? (
        <p className="text-amber-800">로딩 중...</p>
      ) : videos.length === 0 ? (
        <p className="text-amber-800 py-8 text-center">등록된 영상이 없어요</p>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => {
            const expired = new Date(v.expires_at) < new Date();
            return (
              <div
                key={v.id}
                className="bg-white border border-amber-200 rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-amber-900 truncate">{v.title}</h3>
                    {expired && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">만료</span>
                    )}
                  </div>
                  <p className="text-xs text-amber-800 truncate">{v.youtube_url}</p>
                  <div className="flex gap-3 text-xs text-amber-900 mt-1">
                    <span>💰 {v.cost}🐚</span>
                    <span>📅 ~ {new Date(v.expires_at).toLocaleString("ko-KR")}</span>
                    <span>👥 {v.grant_count}명 권한</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setGrantsModalId(v.id)}
                    className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                  >
                    권한 관리
                  </button>
                  <button
                    onClick={() => setEditingId(v.id)}
                    className="px-3 py-1.5 border border-amber-300 text-amber-900 rounded text-sm hover:bg-amber-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <VideoFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            loadVideos();
          }}
        />
      )}

      {editingId && (
        <VideoFormModal
          videoId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null);
            loadVideos();
          }}
        />
      )}

      {grantsModalId && (
        <GrantsModal
          videoId={grantsModalId}
          onClose={() => {
            setGrantsModalId(null);
            loadVideos();
          }}
        />
      )}
    </div>
  );
}

function VideoFormModal({
  videoId,
  onClose,
  onSaved,
}: {
  videoId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("0");
  const [expiresAt, setExpiresAt] = useState(""); // datetime-local
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    fetch(`/api/admin/videos/${videoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.video) {
          setTitle(data.video.title);
          setYoutubeUrl(data.video.youtube_url);
          setDescription(data.video.description || "");
          setCost(String(data.video.cost));
          // ISO → datetime-local
          const d = new Date(data.video.expires_at);
          const pad = (n: number) => String(n).padStart(2, "0");
          setExpiresAt(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          );
        }
      });
  }, [videoId]);

  const handleSave = async () => {
    setError("");
    if (!title.trim() || !youtubeUrl.trim() || !expiresAt) {
      setError("제목, 유튜브 링크, 시청 종료일은 필수예요");
      return;
    }
    setSaving(true);
    const body = {
      title: title.trim(),
      youtube_url: youtubeUrl.trim(),
      description: description.trim() || null,
      cost: Number(cost),
      expires_at: new Date(expiresAt).toISOString(),
    };
    const res = await fetch(
      videoId ? `/api/admin/videos/${videoId}` : "/api/admin/videos",
      {
        method: videoId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "저장 실패");
      setSaving(false);
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-amber-900 mb-4">
          {videoId ? "영상 수정" : "영상 등록"}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-amber-800 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-amber-800 mb-1">유튜브 링크</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              className="w-full px-3 py-2 border border-amber-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-amber-800 mb-1">설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-amber-300 rounded text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-amber-800 mb-1">비용 (셸)</label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-amber-800 mb-1">시청 종료일</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded text-sm"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-amber-300 text-amber-900 rounded"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrantsModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    fetch(`/api/admin/videos/${videoId}`)
      .then((r) => r.json())
      .then((data) => {
        setVideo(data.video);
        setGrants(data.grants || []);
      });
  };

  useEffect(() => {
    load();
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => setMembers(data.members || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const grantedIds = new Set(grants.map((g) => g.member_id));
  const filtered = members
    .filter((m) => m.is_active && !grantedIds.has(m.id))
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleGrant = async (memberId: string) => {
    setAdding(memberId);
    setError("");
    const res = await fetch(`/api/admin/videos/${videoId}/grants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "권한 부여 실패");
      setAdding(null);
      return;
    }
    setAdding(null);
    setSearch("");
    load();
  };

  const handleRevoke = async (grantId: string, refund: boolean) => {
    const ok = confirm(refund ? "권한을 회수하고 셸을 환불할까요?" : "권한을 회수할까요? (환불 없음)");
    if (!ok) return;
    const res = await fetch(
      `/api/admin/videos/${videoId}/grants/${grantId}?refund=${refund}`,
      { method: "DELETE" }
    );
    if (res.ok) load();
    else alert("회수 실패");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-amber-900">시청 권한 관리</h2>
          <button onClick={onClose} className="text-amber-800">✕</button>
        </div>
        {video && (
          <div className="text-sm text-amber-900 mb-4 pb-3 border-b border-amber-100">
            <p className="font-semibold text-amber-900">{video.title}</p>
            <p className="text-xs">비용 {video.cost}🐚 · ~ {new Date(video.expires_at).toLocaleString("ko-KR")}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {/* 권한 부여된 멤버 */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">
              권한 보유 ({grants.length})
            </h3>
            <div className="flex-1 overflow-y-auto border border-amber-200 rounded">
              {grants.length === 0 ? (
                <p className="text-xs text-amber-800 p-3 text-center">아직 없음</p>
              ) : (
                grants.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between px-3 py-2 border-b border-amber-100 last:border-b-0 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-amber-900 font-medium truncate">{g.members?.name ?? "(알 수 없음)"}</p>
                      <p className="text-xs text-amber-800">
                        {new Date(g.granted_at).toLocaleDateString("ko-KR")} 부여
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {video && video.cost > 0 && (
                        <button
                          onClick={() => handleRevoke(g.id, true)}
                          className="text-xs px-2 py-1 border border-amber-300 text-amber-900 rounded hover:bg-amber-50"
                          title="회수 + 환불"
                        >
                          환불
                        </button>
                      )}
                      <button
                        onClick={() => handleRevoke(g.id, false)}
                        className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        회수
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 권한 부여 */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">멤버 추가</h3>
            <input
              type="text"
              placeholder="이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded text-sm mb-2"
            />
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <div className="flex-1 overflow-y-auto border border-amber-200 rounded">
              {filtered.length === 0 ? (
                <p className="text-xs text-amber-800 p-3 text-center">결과 없음</p>
              ) : (
                filtered.slice(0, 50).map((m) => {
                  const insufficient = video && m.shell_balance < video.cost;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-3 py-2 border-b border-amber-100 last:border-b-0 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-amber-900 font-medium truncate">{m.name}</p>
                        <p className={`text-xs ${insufficient ? "text-red-500" : "text-amber-800"}`}>
                          {m.shell_balance}🐚
                        </p>
                      </div>
                      <button
                        onClick={() => handleGrant(m.id)}
                        disabled={!!insufficient || adding === m.id}
                        className="text-xs px-2 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-40"
                      >
                        {adding === m.id ? "..." : "부여"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
