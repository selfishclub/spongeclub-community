import { NextRequest, NextResponse } from "next/server";
import { getApprovedSessions, createSession } from "@/lib/session-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  const sessions = await getApprovedSessions(year, month);
  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { host_id, title, description, category, scheduled_at, duration_minutes, entry_cost, capacity } = body;

  if (!host_id || !title || !scheduled_at || !entry_cost || !category) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
  }

  if (entry_cost < 1 || entry_cost > 10) {
    return NextResponse.json({ error: "가격은 1~10셸이어야 해요." }, { status: 400 });
  }

  const result = await createSession(host_id, {
    title,
    description: description || "",
    category,
    scheduled_at,
    duration_minutes: duration_minutes || 60,
    entry_cost,
    capacity,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, session: result.session });
}
