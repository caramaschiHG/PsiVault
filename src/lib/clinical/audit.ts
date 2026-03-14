/**
 * Clinical note lifecycle audit helpers.
 *
 * Plugs into the Phase 1 audit contract (createAuditEvent) so clinical note
 * events share the same shape as patient and appointment events.
 *
 * Security policy (SECU-05):
 * - Clinical content (freeText, demand, observedMood, themes, clinicalEvolution,
 *   nextSteps) must NEVER appear in audit metadata.
 * - Only the appointmentId is included in metadata for traceability.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { ClinicalNote } from "./model";

export type ClinicalNoteAuditEventType =
  | "clinical.note.created"
  | "clinical.note.updated";

interface CreateClinicalNoteAuditEventInput {
  type: ClinicalNoteAuditEventType;
  note: ClinicalNote;
  actor: AuditActor;
  metadata?: Record<string, unknown>;
}

interface CreateClinicalNoteAuditEventDeps {
  now: Date;
  createId: () => string;
}

const AUDIT_SUMMARIES: Record<ClinicalNoteAuditEventType, string> = {
  "clinical.note.created": "Evolução clínica registrada.",
  "clinical.note.updated": "Evolução clínica editada.",
};

export function createClinicalNoteAuditEvent(
  input: CreateClinicalNoteAuditEventInput,
  deps: CreateClinicalNoteAuditEventDeps,
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: {
        kind: "clinical_note",
        id: input.note.id,
      },
      summary: AUDIT_SUMMARIES[input.type],
      // SECU-05: only appointmentId in metadata — never clinical content
      metadata: {
        appointmentId: input.note.appointmentId,
        ...input.metadata,
      },
    },
    {
      now: deps.now,
      createId: deps.createId,
    },
  );
}
