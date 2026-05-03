import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createAdminClient();

  const [membersRes, shellsRes, txRes] = await Promise.all([
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("members").select("shell_balance").eq("is_active", true),
    supabase
      .from("shell_transactions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().split("T")[0]),
  ]);

  const totalShells =
    shellsRes.data?.reduce((sum, m) => sum + m.shell_balance, 0) ?? 0;

  return NextResponse.json({
    totalMembers: membersRes.count ?? 0,
    totalShellsInCirculation: totalShells,
    todayTransactions: txRes.count ?? 0,
  });
}
