import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import membersJson from "@/app/certificate/members-data.json";

export const revalidate = 600; // ISR: 10 minutes

// Static id → slug mapping (slugs are used for URL routing and must stay stable)
const SLUG_MAP: Record<string, string> = {
  "5e12f561-51a6-4468-b502-b854c5d249d9": "amy",
  "0ffa8582-2f56-4068-aa98-7ae50aeae789": "나무-김남욱",
  "3b773b2f-346a-4f4c-92ca-d64ce2a5f536": "모닥",
  "688cca02-a32c-420e-8c98-62bcb13c3956": "민트-최서진",
  "de6c9197-5743-48b7-a499-3f3f2ab5c010": "배짱-박종배",
  "7271ede8-b459-427f-9cb8-9b7fe6030af0": "솔-임솔",
  "ee2ba8d4-c5f5-4113-9c0c-de286cbf5227": "아가타",
  "56f8a2b1-a69b-43af-ad56-c1d6de6a3ed4": "유스",
  "a8f34551-b55d-46d1-9816-c4fb45b30ce8": "이든",
  "c99c2220-f55d-4059-a4d9-762a604da074": "잭",
  "1906db0b-1b5b-4b82-a3d8-b88d31f785bc": "체스터-이상윤",
  "ad4bacbd-cbe0-4a31-8676-168e3d0e6e59": "라엘",
  "a94f4785-5993-4902-86ad-7c3a57532339": "마라",
  "ef5938e9-5a5b-42fc-b6ee-532d95d0184a": "박경선",
  "475b9d0e-384e-4c68-981f-bcdb85b705e7": "봄-김연미",
  "5077ae4c-04c4-4b53-aba3-b5cd44e0546b": "슬로우퀵-박은아",
  "58fe0ddc-b21b-48b3-b294-18e0cbc4cd01": "이니",
  "d6926487-8261-4f5f-950b-d3eafda198bc": "이오-오국봉",
  "377cbd2f-f41b-4734-8f8c-ac67f13902a3": "제제-최지예",
  "2e1f868d-0bee-447e-903e-7a97b210aa8e": "포노미터-김미라",
  "c2ce1ebe-fdea-48ca-b0bd-b3d2f20f56af": "피노",
  "f9c3cce4-2b37-4e74-9d76-67508a9bd9c2": "히카리-윤준영",
  "6e3edb72-47e7-41cf-84aa-a93e594e90c7": "nina-이예지",
  "98add247-147d-45d5-905a-adb44d6a87cb": "ppucca",
  "0bbded96-528c-4fd4-82a1-32788e5da5fd": "개미-임종범",
  "fe32cf1d-eca1-4628-bf00-bb630767eab7": "그린-이유경",
  "8dd44727-1624-4d46-95fe-5f22cead3bfc": "린디",
  "d0f4a2fd-ac98-4551-9608-44f8c162855f": "설록-권효선",
  "bc7c21e0-b63f-4984-b856-7bc33599ed75": "신연수",
  "e518e950-fe3c-4455-b370-f0c79d64c461": "율리아-조유리",
  "830a0ebe-520e-4588-afbe-876b4c49d7ef": "지니",
  "398d2652-0c10-4bee-b3ba-9187ac498882": "치코-김나영",
  "2634e6f9-55bf-430f-91db-0b098a824b07": "코니-황초롱",
  "7171dfe3-60f1-407e-9d1f-3cde2a4923f7": "찌니-신진영",
  "c59fc129-4680-49c7-b61c-397b78fc45f2": "yongs-전용규",
  "70703b78-b43c-415c-ab39-5fc4cc3d0715": "거위의꿈",
  "10f2ac97-eef1-453a-93ab-bee2e6b2ae0e": "달빛그린",
  "1d0239c7-7db1-4424-a00b-76017d12458d": "리보-이보경",
  "4981332d-fce1-4f78-afe1-0d1a66a6f755": "린",
  "f4640783-0543-4349-863c-040c7e8ac945": "먼지민-석지민",
  "dedf3f53-87fb-44b8-ae6f-6ba158af6b15": "나로-박루아",
  "4f08c0ec-6b25-4ea8-a59f-53c8e102144f": "설민주",
  "e77151d2-71a0-4d38-ae1b-96ab20b471b0": "에이스-최학곤",
  "292ec5db-6205-4982-a53f-aa040cd2ad3a": "정민",
  "d97143c6-f4e5-4c5c-98a9-2d3f5c18f25a": "artree",
  "28cf1400-110f-4dd0-9961-b1aba2ed2cac": "거북이-나병우",
  "cb0617d7-ab21-4296-9ef3-40043d9237de": "덕수-김효정",
  "081fc240-3aa3-413b-8f13-689f2c463a1f": "로이캉",
  "6df96608-6207-4c43-91f9-7e40b5a74187": "박상임",
  "6dc4a461-828f-4038-be24-29dbdc10d9e3": "보미",
  "c0f1f0f4-55ae-4c5e-9eb0-0608b1565411": "비키-서승리",
  "843df887-8e34-4ec7-a119-0d4201050749": "써니",
  "12c620e8-7a13-4393-a79e-d07563b13e3c": "이안-박민우",
  "f2f22c13-55cd-4fc5-9217-d170598df8a3": "키노-강은주",
  "d6126def-abd6-4206-b455-a9dcd509dca0": "헤이즐-성윤재",
  "57ef5a0d-4f14-45a4-862f-f4b296db3c36": "galia-방경은",
  "7563e13b-03c8-45d1-926e-a46c23c816d0": "hook2-이창환",
  "256e11a9-b00f-4f41-9353-db8275e0fd76": "j",
  "6fb65583-18fc-4f21-ba50-6df47beea398": "라라",
  "6ad0db26-b9dd-4e66-9719-8be4e01e729c": "레이",
  "e4279033-ffd1-4342-933e-4aee072c3f4e": "석영",
  "5a850b48-7486-4879-8a04-674c44c9cd8b": "아이리스-이선애",
  "1b25e47e-33cb-409f-ada1-921b2e506268": "초보자",
  "5e745589-7c88-4528-9d67-46fc24959e47": "하늘",
  "ee35b0fd-2414-4827-8427-7f5a402aaf3f": "허니바른",
  "55ed3efd-b0dd-44a6-aa03-9c6ae126283f": "히얌",
};

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch cohort=1, is_active=true members
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("id, name, group_number, shell_balance")
      .eq("cohort", 1)
      .eq("is_active", true)
      .order("group_number")
      .order("name");

    if (membersError) throw membersError;
    if (!members || members.length === 0) {
      return NextResponse.json([]);
    }

    const memberIds = members.map((m) => m.id);

    // 2. Fetch all shell_transactions for these members in parallel
    const [
      sessionsResult,
      snsResult,
      sentResult,
      receivedResult,
      skillShareResult,
      skillTriedResult,
      vodGrantResult,
    ] = await Promise.all([
      // sessionsAttended: session_attendees where status IN ('ATTENDED','REGISTERED') and session.status = 'COMPLETED'
      supabase
        .from("session_attendees")
        .select("member_id, sessions!inner(status)")
        .in("member_id", memberIds)
        .in("status", ["ATTENDED", "REGISTERED"])
        .eq("sessions.status", "COMPLETED"),

      // snsVerified: shell_transactions where reason = 'SNS_VERIFY'
      supabase
        .from("shell_transactions")
        .select("member_id")
        .in("member_id", memberIds)
        .eq("reason", "SNS_VERIFY"),

      // shellsSent: shell_transactions where reason = 'MEMBER_GIFT' AND related_member_id = this member (sender)
      supabase
        .from("shell_transactions")
        .select("related_member_id")
        .in("related_member_id", memberIds)
        .eq("reason", "MEMBER_GIFT"),

      // shellsReceived: shell_transactions where reason = 'MEMBER_GIFT' AND member_id = this member (receiver)
      supabase
        .from("shell_transactions")
        .select("member_id")
        .in("member_id", memberIds)
        .eq("reason", "MEMBER_GIFT"),

      // skillShare: reason = 'SKILL_SHARE'
      supabase
        .from("shell_transactions")
        .select("member_id")
        .in("member_id", memberIds)
        .eq("reason", "SKILL_SHARE"),

      // skillTried: reason = 'SKILL_TRIED'
      supabase
        .from("shell_transactions")
        .select("member_id")
        .in("member_id", memberIds)
        .eq("reason", "SKILL_TRIED"),

      // vodGrant: reason = 'VIDEO_GRANT'
      supabase
        .from("shell_transactions")
        .select("member_id")
        .in("member_id", memberIds)
        .eq("reason", "VIDEO_GRANT"),
    ]);

    // Helper: count occurrences by member_id in a result array
    function countBy<T extends Record<string, unknown>>(
      rows: T[] | null,
      key: string
    ): Map<string, number> {
      const map = new Map<string, number>();
      if (!rows) return map;
      for (const row of rows) {
        const id = row[key] as string;
        if (id) map.set(id, (map.get(id) || 0) + 1);
      }
      return map;
    }

    const sessionCounts = countBy(sessionsResult.data, "member_id");
    const snsCounts = countBy(snsResult.data, "member_id");
    const sentCounts = countBy(sentResult.data, "related_member_id");
    const receivedCounts = countBy(receivedResult.data, "member_id");
    const skillShareCounts = countBy(skillShareResult.data, "member_id");
    const skillTriedCounts = countBy(skillTriedResult.data, "member_id");
    const vodGrantCounts = countBy(vodGrantResult.data, "member_id");

    // 3. Build attendance fallback from static JSON (no DB table for weekly attendance)
    const attendanceMap = new Map<string, { attendance: (boolean | null)[]; attendanceCount: number; survey: unknown }>();
    for (const jm of membersJson as Array<{ id: string; attendance: (boolean | null)[]; attendanceCount: number; survey?: unknown }>) {
      attendanceMap.set(jm.id, {
        attendance: jm.attendance,
        attendanceCount: jm.attendanceCount,
        survey: jm.survey || null,
      });
    }

    // 4. Build response matching members-data.json shape
    const result = members.map((m) => {
      const sessionsAttended = sessionCounts.get(m.id) || 0;
      const snsVerified = snsCounts.get(m.id) || 0;
      const shellsSent = sentCounts.get(m.id) || 0;
      const shellsReceived = receivedCounts.get(m.id) || 0;
      const skillShare = skillShareCounts.get(m.id) || 0;
      const skillTried = skillTriedCounts.get(m.id) || 0;
      const vodGrant = vodGrantCounts.get(m.id) || 0;

      const fallback = attendanceMap.get(m.id);
      const attendanceCount = fallback?.attendanceCount ?? 0;
      const hasDiploma = attendanceCount >= 2;

      return {
        id: m.id,
        name: m.name,
        group: m.group_number,
        slug: SLUG_MAP[m.id] || m.id,
        shellBalance: m.shell_balance ?? 0,
        attendance: fallback?.attendance ?? null,
        attendanceCount,
        sessionsAttended,
        snsVerified,
        shellsSent,
        shellsReceived,
        skillShare,
        skillTried,
        vodGrant,
        hasDiploma,
        survey: fallback?.survey ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[certificate/stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to load certificate stats" },
      { status: 500 }
    );
  }
}
