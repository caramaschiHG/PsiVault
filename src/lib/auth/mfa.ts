import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { MFA_TIME_STEP_SECONDS } from "./config";

export interface TotpEnrollmentRecord {
  id: string;
  accountId: string;
  method: "TOTP";
  secret: string;
  recoveryCodesHash: string[];
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EnrollmentDependencies {
  now: Date;
  createId?: () => string;
  createSecret?: () => string;
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function randomValue() {
  return randomBytes(10).toString("hex");
}

function createBase32Secret() {
  return Buffer.from(randomBytes(20))
    .toString("base64")
    .replace(/=+/g, "")
    .replace(/[+/]/g, "A")
    .slice(0, 32)
    .toUpperCase();
}

function base32ToBuffer(input: string) {
  const normalized = input.replace(/=+$/g, "").toUpperCase();
  let bits = "";

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);

    if (index === -1) {
      throw new Error(`Invalid base32 character: ${char}`);
    }

    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];

  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }

  return Buffer.from(bytes);
}

function dynamicTruncate(digest: Buffer) {
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return binary % 1_000_000;
}

function codeForStep(secret: string, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", base32ToBuffer(secret)).update(counter).digest();

  return dynamicTruncate(digest).toString().padStart(6, "0");
}

export function createTotpEnrollment(
  input: { accountId: string },
  deps: EnrollmentDependencies,
): TotpEnrollmentRecord {
  const createId = deps.createId ?? randomValue;
  const createSecret = deps.createSecret ?? createBase32Secret;

  return {
    id: createId(),
    accountId: input.accountId,
    method: "TOTP",
    secret: createSecret(),
    recoveryCodesHash: [],
    verifiedAt: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

export function generateTotpCode(secret: string, now: Date) {
  const step = Math.floor(now.getTime() / 1000 / MFA_TIME_STEP_SECONDS);
  return codeForStep(secret, step);
}

export function verifyTotpCode(
  enrollment: Pick<TotpEnrollmentRecord, "secret">,
  code: string,
  now: Date,
) {
  const currentStep = Math.floor(now.getTime() / 1000 / MFA_TIME_STEP_SECONDS);

  for (let offset = -1; offset <= 1; offset += 1) {
    const candidate = codeForStep(enrollment.secret, currentStep + offset);

    if (
      timingSafeEqual(
        Buffer.from(candidate, "utf8"),
        Buffer.from(code.padStart(6, "0"), "utf8"),
      )
    ) {
      return true;
    }
  }

  return false;
}

