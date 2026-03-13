import { AUTH_ROUTE_PATHS, SESSION_TTL_MS, isVaultRoute } from "./config";

export interface SessionRecord {
  id: string;
  accountId: string;
  workspaceId: string;
  sessionToken: string;
  expiresAt: Date;
  lastSeenAt: Date;
  revokedAt: Date | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultAccountState {
  id: string;
  emailVerifiedAt: Date | null;
  mfaVerifiedAt: Date | null;
}

export interface SessionSnapshot {
  isAuthenticated: boolean;
  accountId: string | null;
  workspaceId: string | null;
  expired: boolean;
  revoked: boolean;
}

interface SessionDependencies {
  now: Date;
  createId?: () => string;
  createToken?: () => string;
  durationMs?: number;
}

function createOpaqueId() {
  const buffer = new Uint8Array(12);
  globalThis.crypto.getRandomValues(buffer);

  return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function createSession(
  input: {
    accountId: string;
    workspaceId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
  deps: SessionDependencies,
): SessionRecord {
  const now = deps.now;
  const createId = deps.createId ?? createOpaqueId;
  const createToken = deps.createToken ?? createOpaqueId;
  const durationMs = deps.durationMs ?? SESSION_TTL_MS;

  return {
    id: createId(),
    accountId: input.accountId,
    workspaceId: input.workspaceId,
    sessionToken: createToken(),
    expiresAt: new Date(now.getTime() + durationMs),
    lastSeenAt: now,
    revokedAt: null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getSessionSnapshot(
  session: Pick<SessionRecord, "accountId" | "workspaceId" | "expiresAt" | "revokedAt">,
  now: Date,
): SessionSnapshot {
  const expired = session.expiresAt.getTime() <= now.getTime();
  const revoked = session.revokedAt !== null;

  if (expired || revoked) {
    return {
      isAuthenticated: false,
      accountId: null,
      workspaceId: null,
      expired,
      revoked,
    };
  }

  return {
    isAuthenticated: true,
    accountId: session.accountId,
    workspaceId: session.workspaceId,
    expired: false,
    revoked: false,
  };
}

export interface VaultAccessDecision {
  allowed: boolean;
  redirectTo: string | null;
}

export function decideVaultAccess(input: {
  pathname: string;
  session: Pick<SessionRecord, "accountId" | "workspaceId" | "expiresAt" | "revokedAt"> | null;
  account: VaultAccountState | null;
  now: Date;
}): VaultAccessDecision {
  if (!isVaultRoute(input.pathname)) {
    return {
      allowed: true,
      redirectTo: null,
    };
  }

  if (!input.session) {
    return {
      allowed: false,
      redirectTo: AUTH_ROUTE_PATHS.signIn,
    };
  }

  const session = getSessionSnapshot(input.session, input.now);

  if (!session.isAuthenticated) {
    return {
      allowed: false,
      redirectTo: AUTH_ROUTE_PATHS.signIn,
    };
  }

  if (!input.account?.emailVerifiedAt) {
    return {
      allowed: false,
      redirectTo: AUTH_ROUTE_PATHS.verifyEmail,
    };
  }

  if (!input.account.mfaVerifiedAt) {
    return {
      allowed: false,
      redirectTo: AUTH_ROUTE_PATHS.mfaSetup,
    };
  }

  return {
    allowed: true,
    redirectTo: null,
  };
}
