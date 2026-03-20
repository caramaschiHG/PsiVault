/**
 * AES-256-GCM encryption for SMTP passwords stored in the database.
 * Key must be a 64-character hex string (32 bytes) in SMTP_ENCRYPTION_KEY env var.
 */

function getKey(): Buffer {
  const hex = process.env.SMTP_ENCRYPTION_KEY ?? "";
  if (hex.length !== 64) {
    throw new Error("SMTP_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }
  return Buffer.from(hex, "hex");
}

export function encryptSmtpPassword(plaintext: string): string {
  const crypto = require("crypto") as typeof import("crypto");
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv(hex):authTag(hex):ciphertext(hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSmtpPassword(ciphertext: string): string {
  const crypto = require("crypto") as typeof import("crypto");
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format.");
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}
