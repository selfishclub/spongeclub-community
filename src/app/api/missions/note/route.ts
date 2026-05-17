/**
 * GET /api/missions/note?path=<vault 상대경로>
 *
 * 멤버 미션 노트(`02_mission/.../*_submit.md`)를 HTML 로 렌더해 반환.
 * MemberNoteModal(client)이 멤버 카드 클릭 시 호출한다.
 *
 * 캐시: 응답에 s-maxage=300 → Vercel CDN 이 URL(=노트)별로 5분 캐시.
 */
import { NextResponse } from "next/server";
import { getRenderedNote, isValidNotePath } from "@/lib/missions/note-fetcher";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path || !isValidNotePath(path)) {
    return NextResponse.json(
      { error: "유효하지 않은 노트 경로입니다." },
      { status: 400 },
    );
  }

  let note;
  try {
    note = await getRenderedNote(path);
  } catch {
    // GitHub Markdown API rate limit·일시 오류 등 — 렌더 단계 실패
    return NextResponse.json(
      { error: "노트를 렌더하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  if (!note) {
    return NextResponse.json(
      { error: "노트를 가져오지 못했어요." },
      { status: 404 },
    );
  }

  return NextResponse.json(note, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
