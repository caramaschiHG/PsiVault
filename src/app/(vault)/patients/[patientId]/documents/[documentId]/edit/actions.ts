"use server";

import { redirect } from "next/navigation";
import { updatePracticeDocument } from "../../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../../lib/documents/audit";
import { getAuditRepository } from "../../../../../../../lib/audit/store";
import { resolveSession } from "../../../../../../../lib/supabase/session";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function updateDocumentAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  let shouldRedirect = false;
  let guardRedirect = false;

  try {
    const repo = getDocumentRepository();
    const doc = await repo.findById(documentId, workspaceId);
    if (!doc || doc.patientId !== patientId || doc.archivedAt !== null) {
      guardRedirect = true;
    } else {
      const now = new Date();
      const updated = updatePracticeDocument(doc, { content }, { now });
      await repo.save(updated);

      const auditRepo = getAuditRepository();
      const auditEvent = createDocumentAuditEvent(
        {
          type: "document.updated",
          document: updated,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      );
      auditRepo.append(auditEvent);

      shouldRedirect = true;
    }
  } catch (err) {
    console.error("[updateDocumentAction]", err);
    return;
  }

  if (guardRedirect) redirect(`/patients/${patientId}`);
  if (shouldRedirect) redirect(`/patients/${patientId}/documents/${documentId}`);
}
