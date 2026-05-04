import { NextRequest, NextResponse } from "next/server";
import { getSessionDetail } from "@/lib/session-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionDetail(id);

  if (!session) {
    return NextResponse.json({ error: "공유회를 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json({ session });
}
