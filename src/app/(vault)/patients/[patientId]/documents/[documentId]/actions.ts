"use server";

import { redirect } from "next/navigation";
import { archivePracticeDocument } from "../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../lib/documents/audit";
import { getAuditRepository } from "../../../../../../lib/audit/store";
import { resolveSession } from "../../../../../../lib/supabase/session";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function archiveDocumentAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");

  let shouldRedirect = false;
  let notFoundRedirect = false;

  try {
    const repo = getDocumentRepository();
    const doc = await repo.findById(documentId, workspaceId);
    if (!doc || doc.patientId !== patientId) {
      // Already archived or not found — redirect silently
      notFoundRedirect = true;
    } else {
      const now = new Date();
      const archived = archivePracticeDocument(doc, accountId, { now });
      await repo.save(archived);

      const auditRepo = getAuditRepository();
      const auditEvent = createDocumentAuditEvent(
        {
          type: "document.archived",
          document: archived,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      );
      auditRepo.append(auditEvent);

      shouldRedirect = true;
    }
  } catch (err) {
    console.error("[archiveDocumentAction]", err);
    return;
  }

  if (notFoundRedirect || shouldRedirect) redirect(`/patients/${patientId}`);
}
