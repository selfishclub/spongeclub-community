import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.trim().split("\n");
  const header = lines[0].split(",").map((h) => h.trim());

  const supabase = createAdminClient();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    header.forEach((h, idx) => (row[h] = values[idx] || ""));

    const name = row["name"];
    const phone_last4 = row["phone_last4"];
    const email = row["email"] || null;
    const slack_user_id = row["slack_user_id"] || null;
    const survey_completed = row["survey_completed"] === "true";

    if (!name || !phone_last4) {
      errors.push(`${i + 1}행: name 또는 phone_last4 누락`);
      failed++;
      continue;
    }

    if (phone_last4.length !== 4) {
      errors.push(`${i + 1}행: phone_last4는 4자리여야 합니다 (${phone_last4})`);
      failed++;
      continue;
    }

    // 중복 체크
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("phone_last4", phone_last4)
      .single();

    if (existing) {
      errors.push(`${i + 1}행: 이미 등록된 뒷4자리 (${phone_last4}) — ${name}`);
      failed++;
      continue;
    }

    // 멤버 등록
    const { data: member, error: insertError } = await supabase
      .from("members")
      .insert({
        name,
        phone_last4,
        email,
        slack_user_id,
        survey_completed,
        shell_balance: survey_completed ? 10 : 0,
        is_admin: false,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      errors.push(`${i + 1}행: 등록 실패 — ${insertError.message}`);
      failed++;
      continue;
    }

    // 가입 보너스 트랜잭션
    if (survey_completed && member) {
      await supabase.from("shell_transactions").insert({
        member_id: member.id,
        amount: 10,
        reason: "SIGNUP_BONUS",
        reason_detail: "사전 설문 완료 가입 보너스",
      });
    }

    success++;
  }

  return NextResponse.json({ success, failed, errors });
}
