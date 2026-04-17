import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
const AUTH_ROUTES = ["/sign-in", "/sign-up", "/verify-email", "/reset-password", "/mfa-setup", "/mfa-verify", "/complete-profile"];

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isAuthRoute) {
    if (user) {
      // Both calls are independent. Fire in parallel to avoid a round-trip.
      const [aalResult, mfaResult] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);
      const aal = aalResult.data;
      const mfaComplete = aal?.currentLevel === "aal2";

      if (mfaComplete) {
        // Let /complete-profile through — page itself checks CRP and redirects
        if (pathname === "/complete-profile") return supabaseResponse;
        return NextResponse.redirect(new URL("/inicio", request.url));
      }

      const mfaData = mfaResult.data;
      const hasMfa = mfaData?.totp?.some((f: { status: string }) => f.status === "verified") ?? false;

      // Already on the correct MFA page — let through
      if (pathname === "/mfa-verify" && hasMfa) return supabaseResponse;
      if (pathname === "/mfa-setup") return supabaseResponse; // allow reconfiguration too

      return NextResponse.redirect(
        new URL(hasMfa ? "/mfa-verify" : "/mfa-setup", request.url)
      );
    }
    return supabaseResponse;
  }

  // Vault routes
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2") {
    return NextResponse.redirect(new URL("/mfa-verify", request.url));
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
    "/mfa-setup",
    "/mfa-verify",
    "/complete-profile",
    "/inicio",
    "/patients/:path*",
    "/appointments/:path*",
    "/agenda/:path*",
    "/sessions/:path*",
    "/financeiro/:path*",
    "/settings/:path*",
  ],
};
