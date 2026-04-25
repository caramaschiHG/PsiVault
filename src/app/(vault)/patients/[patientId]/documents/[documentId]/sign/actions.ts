"use server";

import { redirect } from "next/navigation";
import { signDocument } from "../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../lib/documents/audit";
import { getAuditRepository } from "../../../../../../lib/documents/audit";
import { resolveSession } from "../../../../../../lib/supabase/session";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function signDocumentAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");

  let shouldRedirect = false;
  let guardRedirect = false;

  try {
    const repo = getDocumentRepository();
    const doc = await repo.findById(documentId, workspaceId);
    if (!doc || doc.patientId !== patientId || doc.status !== "finalized") {
      guardRedirect = true;
    } else {
      const now = new Date();
      const signed = signDocument(doc, accountId, { now });
      await repo.save(signed);

      const auditRepo = getAuditRepository();
      const auditEvent = createDocumentAuditEvent(
        {
          type: "document.signed",
          document: signed,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      );
      auditRepo.append(auditEvent);

      shouldRedirect = true;
    }
  } catch (err) {
    console.error("[signDocumentAction]", err);
    return;
  }

  if (guardRedirect || shouldRedirect) redirect(`/patients/${patientId}`);
}
