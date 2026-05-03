import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { approveShellRequest, rejectShellRequest } from "@/lib/shell-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("shell_requests")
    .select(`
      id,
      member_id,
      type,
      url,
      status,
      created_at,
      reviewed_at,
      member:members!shell_requests_member_id_fkey(name)
    `)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const requests = (data || []).map((r) => ({
    ...r,
    member_name: (r.member as unknown as { name: string } | null)?.name ?? "알 수 없음",
  }));

  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const { id, action } = await request.json();

  if (!id || !action) {
    return NextResponse.json({ error: "id, action 필수" }, { status: 400 });
  }

  // TODO: 실제 어드민 ID 사용
  const adminId = id;

  if (action === "approve") {
    const result = await approveShellRequest(id, adminId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } else if (action === "reject") {
    const result = await rejectShellRequest(id, adminId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
