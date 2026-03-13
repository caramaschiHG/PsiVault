import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("auth/session baseline", () => {
  const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");

  it("defines the auth persistence primitives", () => {
    expect(schema).toContain("model Account");
    expect(schema).toContain("model Session");
    expect(schema).toContain("model VerificationToken");
    expect(schema).toContain("model PasswordResetToken");
    expect(schema).toContain("model MfaEnrollment");
  });

  it.todo("signup flow");
  it.todo("session persistence");
  it.todo("mfa gate");
  it.todo("password recovery");
  it.todo("account boundary");
});

