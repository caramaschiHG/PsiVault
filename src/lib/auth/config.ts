export const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
export const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
export const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
export const MFA_TIME_STEP_SECONDS = 30;

export const AUTH_ROUTE_PATHS = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  resetPassword: "/reset-password",
  mfaSetup: "/mfa-setup",
  vaultSetup: "/vault/setup",
} as const;

export const VAULT_ROUTE_PREFIXES = ["/vault", "/setup"] as const;

export function isVaultRoute(pathname: string) {
  return VAULT_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

