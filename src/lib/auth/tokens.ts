import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  EMAIL_VERIFICATION_TTL_MS,
  PASSWORD_RESET_TTL_MS,
} from "./config";

export interface SignupAccountRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  emailVerifiedAt: Date | null;
  mfaRequired: boolean;
  mfaVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceRecord {
  id: string;
  ownerAccountId: string;
  slug: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenRecord {
  id: string;
  accountId: string;
  plaintextToken: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

interface TokenDependencies {
  now: Date;
  createId?: () => string;
  createWorkspaceId?: () => string;
  createToken?: () => string;
}

function randomValue() {
  return randomBytes(16).toString("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSlug(displayName: string, email: string) {
  const source = displayName.trim() || (email.split("@")[0] ?? "workspace");
  const slug = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "workspace";
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);

  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export function verifyPasswordHash(password: string, passwordHash: string) {
  const [saltHex, hashHex] = passwordHash.split(":");

  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derivedKey = scryptSync(password, salt, expected.length);

  return timingSafeEqual(expected, derivedKey);
}

export function createSignupArtifacts(
  input: {
    email: string;
    password: string;
    displayName?: string;
  },
  deps: TokenDependencies,
) {
  const now = deps.now;
  const createId = deps.createId ?? randomValue;
  const createWorkspaceId = deps.createWorkspaceId ?? randomValue;
  const createToken = deps.createToken ?? randomValue;
  const accountId = createId();
  const workspaceId = createWorkspaceId();
  const plaintextToken = createToken();
  const displayName = input.displayName?.trim() || normalizeEmail(input.email).split("@")[0];

  const account: SignupAccountRecord = {
    id: accountId,
    email: normalizeEmail(input.email),
    passwordHash: hashPassword(input.password),
    displayName,
    emailVerifiedAt: null,
    mfaRequired: true,
    mfaVerifiedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const workspace: WorkspaceRecord = {
    id: workspaceId,
    ownerAccountId: accountId,
    slug: createSlug(displayName, account.email),
    displayName,
    createdAt: now,
    updatedAt: now,
  };

  const verificationToken: TokenRecord = {
    id: createId(),
    accountId,
    plaintextToken,
    tokenHash: hashToken(plaintextToken),
    expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS),
    consumedAt: null,
    createdAt: now,
  };

  return {
    account,
    workspace,
    verificationToken,
  };
}

export function createPasswordResetToken(
  input: { accountId: string },
  deps: TokenDependencies,
): TokenRecord {
  const createId = deps.createId ?? randomValue;
  const createToken = deps.createToken ?? randomValue;
  const plaintextToken = createToken();

  return {
    id: createId(),
    accountId: input.accountId,
    plaintextToken,
    tokenHash: hashToken(plaintextToken),
    expiresAt: new Date(deps.now.getTime() + PASSWORD_RESET_TTL_MS),
    consumedAt: null,
    createdAt: deps.now,
  };
}

export function redeemPasswordResetToken(
  tokenRecord: TokenRecord,
  plaintextToken: string,
  newPassword: string,
  now: Date,
) {
  if (tokenRecord.consumedAt) {
    throw new Error("Password reset token already used");
  }

  if (tokenRecord.expiresAt.getTime() < now.getTime()) {
    throw new Error("Password reset token expired");
  }

  if (hashToken(plaintextToken) !== tokenRecord.tokenHash) {
    throw new Error("Invalid password reset token");
  }

  return {
    passwordHash: hashPassword(newPassword),
    token: {
      ...tokenRecord,
      consumedAt: now,
    },
  };
}
