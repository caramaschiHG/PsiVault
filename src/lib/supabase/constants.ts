export const AUTH_ROUTE_PATHS = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  verifyEmail: "/verify-email",
  resetPassword: "/reset-password",
  mfaSetup: "/mfa-setup",
  mfaVerify: "/mfa-verify",
};

export function isVaultRoute(pathname: string): boolean {
  return pathname.startsWith("/patients") ||
         pathname.startsWith("/agenda") ||
         pathname.startsWith("/sessions") ||
         pathname.startsWith("/financeiro") ||
         pathname.startsWith("/settings") ||
         pathname.startsWith("/setup") ||
         pathname === "/inicio" ||
         pathname === "/";
}
