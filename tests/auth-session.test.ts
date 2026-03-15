import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("auth/session migration", () => {
  const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");

  it("defines the core identity and workspace models", () => {
    expect(schema).toContain("model Account");
    expect(schema).toContain("model Workspace");
    expect(schema).toContain("model MfaEnrollment");
  });

  it("pruned unnecessary models handled by Supabase", () => {
    expect(schema).not.toContain("model Session");
    expect(schema).not.toContain("model VerificationToken");
    expect(schema).not.toContain("model PasswordResetToken");
  });

  it("mapped all models to snake_case table names", () => {
    expect(schema).toContain('@@map("accounts")');
    expect(schema).toContain('@@map("workspaces")');
    expect(schema).toContain('@@map("mfa_enrollments")');
  });
});
