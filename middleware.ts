import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "spongeclub-secret"
);

const ADMIN_COOKIE = "admin-auth";

export async function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const isAdminAuthEndpoint = request.nextUrl.pathname === "/api/admin/auth";

  if (isAdminAuthEndpoint) {
    return NextResponse.next();
  }

  const unauthorized = () =>
    isApi
      ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(new URL("/admin-login", request.url));

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return unauthorized();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
