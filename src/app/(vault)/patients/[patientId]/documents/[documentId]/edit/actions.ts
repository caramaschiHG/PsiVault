"use server";

import { redirect } from "next/navigation";
import { updatePracticeDocument } from "../../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../../lib/documents/audit";
import { createInMemoryAuditRepository } from "../../../../../../../lib/audit/repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultDocumentAudit__: ReturnType<typeof createInMemoryAuditRepository> | undefined;
}

function getAuditRepository() {
  globalThis.__psivaultDocumentAudit__ ??= createInMemoryAuditRepository();
  return globalThis.__psivaultDocumentAudit__;
}

const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function updateDocumentAction(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  const repo = getDocumentRepository();
  const doc = repo.findById(documentId, WORKSPACE_ID);
  if (!doc || doc.patientId !== patientId || doc.archivedAt !== null) {
    redirect(`/patients/${patientId}`);
  }

  const now = new Date();
  const updated = updatePracticeDocument(doc, { content }, { now });
  repo.save(updated);

  const auditRepo = getAuditRepository();
  const auditEvent = createDocumentAuditEvent(
    {
      type: "document.updated",
      document: updated,
      actor: { accountId: ACCOUNT_ID, workspaceId: WORKSPACE_ID },
    },
    { now, createId: generateId },
  );
  auditRepo.append(auditEvent);

  redirect(`/patients/${patientId}/documents/${documentId}`);
}
