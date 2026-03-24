"use server";

import { redirect } from "next/navigation";
import { createPracticeDocument } from "../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../lib/documents/audit";
import { getAuditRepository } from "../../../../../../lib/audit/store";
import { getPracticeProfileSnapshot } from "../../../../../../lib/setup/profile";
import type { DocumentType } from "../../../../../../lib/documents/model";
import { resolveSession } from "../../../../../../lib/supabase/session";
import {
  isMeaningfulDocumentContent,
  normalizeDocumentContent,
} from "../../../../../../lib/documents/rich-text";

const VALID_TYPES = new Set<DocumentType>([
  "declaration_of_attendance",
  "receipt",
  "anamnesis",
  "psychological_report",
  "consent_and_service_contract",
  "session_note",
  "session_record",
  "referral_letter",
  "patient_record_summary",
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

export async function createDocumentAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const patientId = String(formData.get("patientId") ?? "");
  const rawType = String(formData.get("documentType") ?? "");
  const rawContent = String(formData.get("content") ?? "");

  let shouldRedirect = false;

  try {
    // Validate type
    if (!VALID_TYPES.has(rawType as DocumentType)) {
      throw new Error("Invalid document type");
    }
    const type = rawType as DocumentType;
    const content = normalizeDocumentContent(type, rawContent);

    if (!isMeaningfulDocumentContent(type, content)) {
      throw new Error("Document content is required");
    }

    // Get professional name for provenance snapshot
    const profile = await getPracticeProfileSnapshot(accountId, workspaceId);

    const now = new Date();
    const doc = createPracticeDocument(
      {
        workspaceId: workspaceId,
        patientId,
        type,
        content,
        createdByAccountId: accountId,
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
        actor: { accountId: accountId, workspaceId: workspaceId },
      },
      { now, createId: generateId },
    );
    auditRepo.append(auditEvent);

    shouldRedirect = true;
  } catch (err) {
    console.error("[createDocumentAction]", err);
    return;
  }

  if (shouldRedirect) redirect(`/patients/${patientId}`);
}
