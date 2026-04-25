"use server";

import { createDraftDocument, updatePracticeDocument } from "./model";
import { getDocumentRepository } from "./store";
import { createDocumentAuditEvent } from "./audit";
import { getAuditRepository } from "../audit/store";
import { getPracticeProfileSnapshot } from "../setup/profile";
import { resolveSession } from "../supabase/session";
import type { DocumentType } from "./model";
import {
  isMeaningfulDocumentContent,
  normalizeDocumentContent,
} from "./rich-text";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export interface SaveDraftResult {
  documentId: string;
  savedAt: string;
}

export async function saveDraftAction(formData: FormData): Promise<SaveDraftResult> {
  const { accountId, workspaceId } = await resolveSession();
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const rawType = String(formData.get("documentType") ?? "");
  const rawContent = String(formData.get("content") ?? "");

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

  if (!VALID_TYPES.has(rawType as DocumentType)) {
    throw new Error("Invalid document type");
  }
  const type = rawType as DocumentType;
  const content = normalizeDocumentContent(type, rawContent);

  if (!isMeaningfulDocumentContent(type, content)) {
    throw new Error("Document content is required");
  }

  const repo = getDocumentRepository();
  const now = new Date();

  let doc;
  let isNew = false;

  if (documentId) {
    // Update existing draft
    const existing = await repo.findById(documentId, workspaceId);
    if (!existing || existing.patientId !== patientId) {
      throw new Error("Document not found");
    }
    if (existing.status !== "draft") {
      throw new Error("Cannot auto-save: document is not a draft");
    }
    doc = updatePracticeDocument(existing, { content }, { now });
  } else {
    // Create new draft
    isNew = true;
    const profile = await getPracticeProfileSnapshot(accountId, workspaceId);
    doc = createDraftDocument(
      {
        workspaceId,
        patientId,
        type,
        content,
        createdByAccountId: accountId,
        createdByName: profile.fullName ?? "",
      },
      { now, createId: generateId },
    );
  }

  await repo.save(doc);

  // Audit throttled: only emit on new draft creation, not every auto-save
  if (isNew) {
    const auditRepo = getAuditRepository();
    const auditEvent = createDocumentAuditEvent(
      {
        type: "document.draft_saved",
        document: doc,
        actor: { accountId: accountId, workspaceId: workspaceId },
      },
      { now, createId: generateId },
    );
    auditRepo.append(auditEvent);
  }

  return { documentId: doc.id, savedAt: now.toISOString() };
}
