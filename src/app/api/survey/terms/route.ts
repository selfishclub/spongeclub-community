import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { memberId, name, termsAgreed, contentConsent } = await req.json();

    // Validation
    if (!memberId || !name?.trim()) {
      return NextResponse.json(
        { error: "멤버를 선택해 주세요." },
        { status: 400 }
      );
    }
    if (!termsAgreed) {
      return NextResponse.json(
        { error: "이용약관에 동의해 주세요." },
        { status: 400 }
      );
    }
    if (!contentConsent) {
      return NextResponse.json(
        { error: "콘텐츠 활용 동의 여부를 선택해 주세요." },
        { status: 400 }
      );
    }

    // Send to Google Sheets via Apps Script
    const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!sheetUrl) {
      console.error("GOOGLE_SHEET_WEBHOOK_URL is not set");
      return NextResponse.json(
        { error: "서버 설정 오류입니다. 관리자에게 문의해 주세요." },
        { status: 500 }
      );
    }

    const timestamp = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });

    const sheetRes = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        name: name.trim(),
        termsAgreed: "동의",
        contentConsent,
        timestamp,
      }),
    });

    if (!sheetRes.ok) {
      console.error("Google Sheet error:", await sheetRes.text());
      return NextResponse.json(
        { error: "기록 중 오류가 발생했습니다. 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Survey submission error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
