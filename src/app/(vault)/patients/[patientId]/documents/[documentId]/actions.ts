"use server";

import { redirect } from "next/navigation";
import { archivePracticeDocument } from "../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../lib/documents/audit";
import { getAuditRepository } from "../../../../../../lib/audit/store";

const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function archiveDocumentAction(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");

  const repo = getDocumentRepository();
  const doc = await repo.findById(documentId, WORKSPACE_ID);
  if (!doc || doc.patientId !== patientId) {
    // Already archived or not found — redirect silently
    redirect(`/patients/${patientId}`);
  }

  const now = new Date();
  const archived = archivePracticeDocument(doc, ACCOUNT_ID, { now });
  await repo.save(archived);

  const auditRepo = getAuditRepository();
  const auditEvent = createDocumentAuditEvent(
    {
      type: "document.archived",
      document: archived,
      actor: { accountId: ACCOUNT_ID, workspaceId: WORKSPACE_ID },
    },
    { now, createId: generateId },
  );
  auditRepo.append(auditEvent);

  redirect(`/patients/${patientId}`);
}
