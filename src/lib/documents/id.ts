import { randomBytes } from "crypto";

/**
 * Generate a consistent document ID with the `doc_` prefix.
 * Uses 16 bytes (32 hex characters) for uniqueness.
 */
export function createDocumentId(): string {
  return "doc_" + randomBytes(16).toString("hex");
}
