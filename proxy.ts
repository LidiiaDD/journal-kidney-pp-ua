import { NextRequest, NextResponse } from "next/server";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("jrs_access")?.value;
  const refresh = request.cookies.get("jrs_refresh")?.value;
  if (!refresh || !process.env.JRS_SUPABASE_URL || !process.env.JRS_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }

  // The JWT payload is used solely as a refresh-time hint, never for authorization.
  let exp = 0;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      exp = Number(payload.exp) || 0;
    } catch {}
  }
  if (token && exp > Math.floor(Date.now() / 1000) + 120) {
    return NextResponse.next({ request });
  }

  const response = await fetch(
    `${process.env.JRS_SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        "apikey": process.env.JRS_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    }
  ).catch(() => null);

  if (!response?.ok) {
    const next = NextResponse.next({ request });
    next.cookies.delete("jrs_access");
    next.cookies.delete("jrs_refresh");
    return next;
  }

  const session = await response.json() as {
    access_token: string; refresh_token: string; expires_in: number
  };
  if (!session.access_token || !session.refresh_token) return NextResponse.next({ request });

  request.cookies.set("jrs_access", session.access_token);
  request.cookies.set("jrs_refresh", session.refresh_token);
  const next = NextResponse.next({ request });
  next.cookies.set("jrs_access", session.access_token, {
    ...cookieOptions,
    maxAge: Math.max(60, session.expires_in - 20),
  });
  next.cookies.set("jrs_refresh", session.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  return next;
}

export const config = {
  matcher: ["/admin/:path*"],
};
