import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/verify-email", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isAuthRoute && user) {
    const { data: mfaData } = await supabase.auth.mfa.listFactors();
    const hasMfa = mfaData?.totp?.some((f: { status: string }) => f.status === "verified") ?? false;
    const redirectTo = hasMfa ? "/inicio" : "/mfa-setup";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/vault/:path*",
    "/setup/:path*",
    "/sign-in",
    "/sign-up",
    "/verify-email",
    "/reset-password",
    "/inicio",
    "/patients/:path*",
    "/agenda/:path*",
    "/sessions/:path*",
    "/financeiro/:path*",
    "/settings/:path*",
  ],
};
