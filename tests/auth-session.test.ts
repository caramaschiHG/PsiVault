import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { enforceVaultAccess } from "../src/middleware";
import { buildOwnedWorkspaceSelector, ownsWorkspace } from "../src/lib/db";
import { createTotpEnrollment, generateTotpCode, verifyTotpCode } from "../src/lib/auth/mfa";
import { createSession, getSessionSnapshot } from "../src/lib/auth/session";
import {
  createPasswordResetToken,
  createSignupArtifacts,
  redeemPasswordResetToken,
  verifyPasswordHash,
} from "../src/lib/auth/tokens";

describe("auth/session baseline", () => {
  const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");
  const now = new Date("2026-03-13T12:00:00.000Z");

  it("defines the auth persistence primitives", () => {
    expect(schema).toContain("model Account");
    expect(schema).toContain("model Session");
    expect(schema).toContain("model VerificationToken");
    expect(schema).toContain("model PasswordResetToken");
    expect(schema).toContain("model MfaEnrollment");
  });

  it("signup flow creates a pending account, workspace, and verification token", () => {
    const artifacts = createSignupArtifacts(
      {
        email: "dra@example.com",
        password: "Vault#2026",
        displayName: "Dra. Helena Prado",
      },
      {
        now,
        createId: () => "acct_1",
        createWorkspaceId: () => "ws_1",
        createToken: () => "verify_token",
      },
    );

    expect(artifacts.account.id).toBe("acct_1");
    expect(artifacts.account.emailVerifiedAt).toBeNull();
    expect(artifacts.workspace.ownerAccountId).toBe("acct_1");
    expect(artifacts.verificationToken.plaintextToken).toBe("verify_token");
    expect(verifyPasswordHash("Vault#2026", artifacts.account.passwordHash)).toBe(true);
  });

  it("session persistence keeps the professional authenticated until expiry", () => {
    const session = createSession(
      {
        accountId: "acct_1",
        workspaceId: "ws_1",
      },
      {
        now,
        createId: () => "sess_1",
        createToken: () => "session_token",
      },
    );

    expect(
      getSessionSnapshot(
        session,
        new Date("2026-03-13T19:00:00.000Z"),
      ),
    ).toMatchObject({
      isAuthenticated: true,
      accountId: "acct_1",
      workspaceId: "ws_1",
    });
  });

  it("mfa gate uses TOTP before vault routes are allowed", () => {
    const enrollment = createTotpEnrollment(
      { accountId: "acct_1" },
      {
        now,
        createId: () => "mfa_1",
        createSecret: () => "JBSWY3DPEHPK3PXP",
      },
    );
    const code = generateTotpCode(enrollment.secret, now);

    expect(
      enforceVaultAccess({
        pathname: "/vault/setup",
        session: {
          accountId: "acct_1",
          workspaceId: "ws_1",
          expiresAt: new Date("2026-03-13T23:59:59.000Z"),
          revokedAt: null,
        },
        account: {
          id: "acct_1",
          emailVerifiedAt: now,
          mfaVerifiedAt: null,
        },
        now,
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/mfa-setup",
    });

    expect(verifyTotpCode(enrollment, code, now)).toBe(true);
  });

  it("password recovery exchanges a valid reset token for a new password hash", () => {
    const resetToken = createPasswordResetToken(
      { accountId: "acct_1" },
      {
        now,
        createId: () => "reset_1",
        createToken: () => "reset_token",
      },
    );
    const redeemed = redeemPasswordResetToken(
      resetToken,
      "reset_token",
      "NovaSenha#2026",
      new Date("2026-03-13T12:15:00.000Z"),
    );

    expect(redeemed.token.consumedAt).toEqual(new Date("2026-03-13T12:15:00.000Z"));
    expect(verifyPasswordHash("NovaSenha#2026", redeemed.passwordHash)).toBe(true);
  });

  it("vault-route protection redirects unauthenticated and unverified users explicitly", () => {
    expect(
      enforceVaultAccess({
        pathname: "/vault/setup",
        session: null,
        account: null,
        now,
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/sign-in",
    });

    expect(
      enforceVaultAccess({
        pathname: "/vault/setup",
        session: {
          accountId: "acct_1",
          workspaceId: "ws_1",
          expiresAt: new Date("2026-03-13T23:59:59.000Z"),
          revokedAt: null,
        },
        account: {
          id: "acct_1",
          emailVerifiedAt: null,
          mfaVerifiedAt: null,
        },
        now,
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/verify-email",
    });
  });

  it("account boundary scopes workspace access to the owning professional", () => {
    expect(buildOwnedWorkspaceSelector("acct_1", "ws_1")).toEqual({
      id_ownerAccountId: {
        id: "ws_1",
        ownerAccountId: "acct_1",
      },
    });

    expect(
      ownsWorkspace(
        {
          id: "ws_1",
          ownerAccountId: "acct_1",
        },
        "acct_1",
        "ws_1",
      ),
    ).toBe(true);

    expect(
      ownsWorkspace(
        {
          id: "ws_2",
          ownerAccountId: "acct_2",
        },
        "acct_1",
        "ws_1",
      ),
    ).toBe(false);
  });
});
