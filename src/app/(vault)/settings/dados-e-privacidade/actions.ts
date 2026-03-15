"use server";

/**
 * Server actions for Dados e Privacidade settings.
 *
 * Re-auth flow (v1 stub):
 * - confirmBackupAuthAction: sets "psivault_backup_auth" cookie with current timestamp
 * - exportPatientAuthAction: sets "psivault_export_auth" cookie with current timestamp
 *
 * Both cookies are scoped for 10 minutes (consistent with SENSITIVE_ACTION_REAUTH_WINDOW_MS).
 * Password verification is a stub in v1 (always passes for in-memory store).
 * Production: replace stub with real credential verification before setting the cookie.
 */

import { cookies } from "next/headers";

const REAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Confirms backup re-auth and sets the "psivault_backup_auth" cookie.
 *
 * v1 stub: password is accepted as-is (no real verification).
 * Production: verify password against stored credentials before setting cookie.
 */
export async function confirmBackupAuthAction(input: {
  password: string;
}): Promise<ActionResult> {
  // v1 stub: accept any non-empty password
  // Production: verify input.password against stored credentials
  if (!input.password) {
    return { ok: false, error: "Senha obrigatória." };
  }

  const cookieStore = await cookies();
  cookieStore.set("psivault_backup_auth", String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return { ok: true };
}

/**
 * Confirms patient export re-auth and sets the "psivault_export_auth" cookie.
 *
 * v1 stub: password is accepted as-is (no real verification).
 * Production: verify password against stored credentials before setting cookie.
 */
export async function exportPatientAuthAction(input: {
  password: string;
}): Promise<ActionResult> {
  // v1 stub: accept any non-empty password
  // Production: verify input.password against stored credentials
  if (!input.password) {
    return { ok: false, error: "Senha obrigatória." };
  }

  const cookieStore = await cookies();
  cookieStore.set("psivault_export_auth", String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return { ok: true };
}
