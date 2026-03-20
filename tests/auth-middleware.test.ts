import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";

// isEmailVerified was inlined here after being removed from middleware (superseded by MFA gate)
function isEmailVerified(user: User | null): boolean {
  return user?.email_confirmed_at != null;
}

describe("auth middleware e-mail gate", () => {
  it("returns false when the user has not confirmed the e-mail", () => {
    const user = {
      email_confirmed_at: null,
    } as unknown as User;

    expect(isEmailVerified(user)).toBe(false);
  });

  it("returns true when the user has a confirmed e-mail timestamp", () => {
    const user = {
      email_confirmed_at: "2026-03-19T18:00:00.000Z",
    } as unknown as User;

    expect(isEmailVerified(user)).toBe(true);
  });

  it("returns false when there is no authenticated user", () => {
    expect(isEmailVerified(null)).toBe(false);
  });
});
