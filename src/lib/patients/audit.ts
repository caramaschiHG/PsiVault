/**
 * Patient lifecycle audit helpers.
 *
 * Plugs into the existing Phase 1 audit contract (createAuditEvent) so
 * patient lifecycle events share the same shape as security events.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { Patient } from "./model";

export type PatientAuditEventType =
  | "patient.created"
  | "patient.updated"
  | "patient.archived"
  | "patient.recovered";

interface CreatePatientAuditEventInput {
  type: PatientAuditEventType;
  patient: Patient;
  actor: AuditActor;
  metadata?: Record<string, unknown>;
}

interface CreatePatientAuditEventDeps {
  now: Date;
  createId: () => string;
}

const AUDIT_SUMMARIES: Record<PatientAuditEventType, string> = {
  "patient.created": "Paciente criado no vault.",
  "patient.updated": "Dados do paciente atualizados.",
  "patient.archived": "Paciente arquivado.",
  "patient.recovered": "Paciente reativado.",
};

export function createPatientAuditEvent(
  input: CreatePatientAuditEventInput,
  deps: CreatePatientAuditEventDeps,
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: {
        kind: "patient",
        id: input.patient.id,
        // Do not include fullName in audit subject to avoid sensitive-data leakage
        // in log surfaces. The patient id is sufficient for traceability.
      },
      summary: AUDIT_SUMMARIES[input.type],
      metadata: input.metadata ?? {},
    },
    {
      now: deps.now,
      createId: deps.createId,
    },
  );
}
