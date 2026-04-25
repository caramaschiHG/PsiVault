"use server";

import { redirect } from "next/navigation";
import { deliverDocument } from "@/lib/documents/model";
import { getDocumentRepository } from "@/lib/documents/store";
import { createDocumentAuditEvent } from "@/lib/documents/audit";
import { getAuditRepository } from "@/lib/audit/store";
import { resolveSession } from "@/lib/supabase/session";
import type { DeliverDocumentInput } from "@/lib/documents/model";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "doc_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function deliverDocumentAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const documentId = String(formData.get("documentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const deliveredTo = String(formData.get("deliveredTo") ?? "");
  const deliveredVia = String(formData.get("deliveredVia") ?? "") as DeliverDocumentInput["via"];

  let shouldRedirect = false;
  let guardRedirect = false;

  try {
    const repo = getDocumentRepository();
    const doc = await repo.findById(documentId, workspaceId);
    if (!doc || doc.patientId !== patientId || doc.status !== "signed") {
      guardRedirect = true;
    } else {
      const now = new Date();
      const delivered = deliverDocument(
        doc,
        accountId,
        { to: deliveredTo, via: deliveredVia },
        { now },
      );
      await repo.save(delivered);

      const auditRepo = getAuditRepository();
      const auditEvent = createDocumentAuditEvent(
        {
          type: "document.delivered",
          document: delivered,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      );
      auditRepo.append(auditEvent);

      shouldRedirect = true;
    }
  } catch (err) {
    console.error("[deliverDocumentAction]", err);
    return;
  }

  if (guardRedirect || shouldRedirect) redirect(`/patients/${patientId}`);
}
