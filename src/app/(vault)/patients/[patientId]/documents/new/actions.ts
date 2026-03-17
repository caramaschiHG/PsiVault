"use server";

import { redirect } from "next/navigation";
import { createPracticeDocument } from "../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../lib/documents/audit";
import { createInMemoryAuditRepository } from "../../../../../../lib/audit/repository";
import { getPracticeProfileSnapshot } from "../../../../../../lib/setup/profile";
import type { DocumentType } from "../../../../../../lib/documents/model";

// ─── Module-level audit repository ────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __psivaultDocumentAudit__:
    | ReturnType<typeof createInMemoryAuditRepository>
    | undefined;
}

function getAuditRepository() {
  globalThis.__psivaultDocumentAudit__ ??= createInMemoryAuditRepository();
  return globalThis.__psivaultDocumentAudit__;
}

// ─── Stub identity (real resolution comes from session in production) ──────────

const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";

const VALID_TYPES = new Set<DocumentType>([
  "declaration_of_attendance",
  "receipt",
  "anamnesis",
  "psychological_report",
  "consent_and_service_contract",
]);

// ─── Null coercion helper ──────────────────────────────────────────────────────

/**
 * Converts a FormData entry to string | null.
 * Empty strings (blank textareas) are treated as "not filled" → null.
 * Security: document content must never leak into audit metadata (SECU-05).
 */
function nullCoerce(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

// ─── ID generator ─────────────────────────────────────────────────────────────

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return (
    "doc_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

// ─── Create document action ────────────────────────────────────────────────────

export async function createDocumentAction(formData: FormData) {
  const patientId = String(formData.get("patientId") ?? "");
  const rawType = String(formData.get("documentType") ?? "");
  const content = nullCoerce(formData.get("content")) ?? "";

  // Validate type
  if (!VALID_TYPES.has(rawType as DocumentType)) {
    throw new Error("Invalid document type");
  }
  const type = rawType as DocumentType;

  // Get professional name for provenance snapshot
  const profile = getPracticeProfileSnapshot(ACCOUNT_ID, WORKSPACE_ID);

  const now = new Date();
  const doc = createPracticeDocument(
    {
      workspaceId: WORKSPACE_ID,
      patientId,
      type,
      content,
      createdByAccountId: ACCOUNT_ID,
      createdByName: profile.fullName ?? "",
    },
    { now, createId: generateId },
  );

  const repo = getDocumentRepository();
  await repo.save(doc);

  // Fire-and-forget audit (SECU-05: metadata contains only documentType)
  const auditRepo = getAuditRepository();
  const auditEvent = createDocumentAuditEvent(
    {
      type: "document.created",
      document: doc,
      actor: { accountId: ACCOUNT_ID, workspaceId: WORKSPACE_ID },
    },
    { now, createId: generateId },
  );
  auditRepo.append(auditEvent);

  redirect(`/patients/${patientId}`);
}
