import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decideVaultAccess, type VaultAccountState, type SessionRecord } from "./lib/auth/session";

export function enforceVaultAccess(input: {
  pathname: string;
  session: Pick<SessionRecord, "accountId" | "workspaceId" | "expiresAt" | "revokedAt"> | null;
  account: VaultAccountState | null;
  now: Date;
}) {
  return decideVaultAccess(input);
}

export function middleware(request: NextRequest) {
  const decision = enforceVaultAccess({
    pathname: request.nextUrl.pathname,
    session: null,
    account: null,
    now: new Date(),
  });

  if (!decision.allowed && decision.redirectTo) {
    const redirectUrl = new URL(decision.redirectTo, request.url);

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vault/:path*", "/setup/:path*"],
};

