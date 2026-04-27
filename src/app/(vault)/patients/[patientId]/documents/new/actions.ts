"use server";

import { redirect } from "next/navigation";
import { createDraftDocument, finalizeDocument, updatePracticeDocument } from "../../../../../../lib/documents/model";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { createDocumentAuditEvent } from "../../../../../../lib/documents/audit";
import { getAuditRepository } from "../../../../../../lib/audit/store";
import { getPracticeProfileSnapshot } from "../../../../../../lib/setup/profile";
import type { DocumentType } from "../../../../../../lib/documents/model";
import { resolveSession } from "../../../../../../lib/supabase/session";
import { getAppointmentRepository } from "../../../../../../lib/appointments/store";
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
 * Empty strings (blank content) are treated as "not filled" → null.
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
  const draftId = String(formData.get("draftId") ?? "");
  const rawAppointmentId = nullCoerce(formData.get("appointmentId"));
  const rawFrom = nullCoerce(formData.get("from"));

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

    // Validate appointment link
    let appointmentId: string | null = null;
    if (rawAppointmentId) {
      const apptRepo = getAppointmentRepository();
      const appt = await apptRepo.findById(rawAppointmentId, workspaceId);
      if (!appt || appt.patientId !== patientId) {
        throw new Error("Atendimento inválido ou não pertence a este paciente");
      }
      appointmentId = appt.id;
    }

    // APPT-03: declaration_of_attendance requires appointment link
    if (type === "declaration_of_attendance" && !appointmentId) {
      throw new Error("Declaração de comparecimento deve ser criada a partir de um atendimento específico");
    }

    const repo = getDocumentRepository();
    const now = new Date();

    let doc;
    if (draftId) {
      // Finalize existing draft
      const existing = await repo.findById(draftId, workspaceId);
      if (!existing || existing.patientId !== patientId || existing.status !== "draft") {
        throw new Error("Draft not found or invalid");
      }
      // Update content first (in case it changed since last auto-save)
      const updated = updatePracticeDocument(existing, { content }, { now });
      doc = finalizeDocument(updated, { now });
    } else {
      // Create and immediately finalize (no auto-save used)
      const profile = await getPracticeProfileSnapshot(accountId, workspaceId);
      doc = createDraftDocument(
        {
          workspaceId: workspaceId,
          patientId,
          type,
          content,
          createdByAccountId: accountId,
          createdByName: profile.fullName ?? "",
          appointmentId,
        },
        { now, createId: generateId },
      );
      doc = finalizeDocument(doc, { now });
    }

    await repo.save(doc);

    // Fire-and-forget audit (SECU-05: metadata contains only documentType)
    const auditRepo = getAuditRepository();
    const auditEvent = createDocumentAuditEvent(
      {
        type: "document.finalized",
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

  // Safe redirect: validate `from` to prevent open redirect
  const redirectTarget =
    rawFrom && rawFrom.startsWith("/") && !rawFrom.startsWith("//") && !/[\r\n]/.test(rawFrom)
      ? rawFrom
      : `/patients/${patientId}?tab=documentos`;

  if (shouldRedirect) redirect(redirectTarget);
}
