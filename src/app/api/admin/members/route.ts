import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { hashPin } from "@/lib/pin";

const MEMBER_PUBLIC_COLUMNS =
  "id, name, phone_last4, email, slack_user_id, survey_completed, shell_balance, is_admin, is_active, created_at, updated_at, group_number, pin_changed, profile_image, cohort";

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { members: data },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// 멤버 수동 등록
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone_last4, email, slack_user_id, survey_completed, is_admin, group_number, cohort } = body;

  if (!name || !phone_last4) {
    return NextResponse.json(
      { error: "name, phone_last4는 필수입니다" },
      { status: 400 }
    );
  }

  if (phone_last4.length !== 4) {
    return NextResponse.json(
      { error: "phone_last4는 4자리여야 합니다" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 중복 체크
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("phone_last4", phone_last4)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: `이미 등록된 뒷4자리입니다: ${phone_last4}` },
      { status: 409 }
    );
  }

  // 멤버 등록
  const { data: member, error: insertError } = await supabase
    .from("members")
    .insert({
      name,
      phone_last4,
      email: email || null,
      slack_user_id: slack_user_id || null,
      group_number: group_number ?? null,
      cohort: cohort ?? 2,
      survey_completed: survey_completed || false,
      shell_balance: survey_completed ? 10 : 0,
      is_admin: is_admin || false,
      is_active: true,
    })
    .select(MEMBER_PUBLIC_COLUMNS)
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
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

  return NextResponse.json({ success: true, member });
}

// 멤버 정보 수정
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, name, phone_last4, email, slack_user_id, is_admin, is_active, group_number, cohort, pin, pin_changed } = body;

  if (!id) {
    return NextResponse.json(
      { error: "멤버 id는 필수입니다" },
      { status: 400 }
    );
  }

  if (phone_last4 && phone_last4.length !== 4) {
    return NextResponse.json(
      { error: "phone_last4는 4자리여야 합니다" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // phone_last4 변경 시 중복 체크
  if (phone_last4) {
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("phone_last4", phone_last4)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `이미 등록된 뒷4자리입니다: ${phone_last4}` },
        { status: 409 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (phone_last4 !== undefined) updateData.phone_last4 = phone_last4;
  if (email !== undefined) updateData.email = email || null;
  if (slack_user_id !== undefined) updateData.slack_user_id = slack_user_id || null;
  if (group_number !== undefined) updateData.group_number = group_number;
  if (cohort !== undefined) updateData.cohort = cohort;
  if (is_admin !== undefined) updateData.is_admin = is_admin;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (pin !== undefined) {
    if (!/^\d{4}$/.test(String(pin))) {
      return NextResponse.json(
        { error: "PIN은 숫자 4자리여야 해요." },
        { status: 400 }
      );
    }
    updateData.pin = await hashPin(String(pin));
  }
  if (pin_changed !== undefined) updateData.pin_changed = pin_changed;

  const { data: member, error: updateError } = await supabase
    .from("members")
    .update(updateData)
    .eq("id", id)
    .select(MEMBER_PUBLIC_COLUMNS)
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, member });
}
