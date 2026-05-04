import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { approveSession, rejectSession, completeSession } from "@/lib/session-service";
import { getSlackClient } from "@/lib/slack";

const SHELL_FEED_CHANNEL = "C0B19KV8538";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ALL";

  const supabase = createAdminClient();

  let query = supabase
    .from("sessions")
    .select(`
      id, title, description, category, scheduled_at, duration_minutes,
      entry_cost, capacity, status, zoom_link, created_at,
      host:members!sessions_host_id_fkey(id, name)
    `);

  if (status !== "ALL") {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 참석자 수 추가
  const sessions = await Promise.all(
    (data || []).map(async (s) => {
      const { count } = await supabase
        .from("session_attendees")
        .select("id", { count: "exact", head: true })
        .eq("session_id", s.id)
        .eq("status", "REGISTERED");
      return { ...s, attendee_count: count || 0 };
    })
  );

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const { id, action } = await request.json();

  if (!id || !action) {
    return NextResponse.json({ error: "id, action 필수" }, { status: 400 });
  }

  let result;
  if (action === "approve") {
    result = await approveSession(id);

    // 승인 시 Slack 알림
    if (result.success) {
      try {
        const supabase = createAdminClient();
        const { data: session } = await supabase
          .from("sessions")
          .select("title, entry_cost, scheduled_at, host:members!sessions_host_id_fkey(name)")
          .eq("id", id)
          .single();

        if (session) {
          const hostName = (session.host as unknown as { name: string } | null)?.name ?? "";
          const date = new Date(session.scheduled_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });
          await getSlackClient().chat.postMessage({
            channel: SHELL_FEED_CHANNEL,
            text: `📆 새 공유회가 등록되었어요!\n*${session.title}* by ${hostName}\n🗓 ${date} | ${session.entry_cost}🐚\n👉 신청하기: https://spongeclub-community.vercel.app`,
          });
        }
      } catch {
        // Slack 알림 실패해도 승인은 유지
      }
    }
  } else if (action === "reject") {
    result = await rejectSession(id);
  } else if (action === "complete") {
    result = await completeSession(id, id); // TODO: 실제 adminId
  } else {
    return NextResponse.json({ error: "잘못된 action" }, { status: 400 });
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
