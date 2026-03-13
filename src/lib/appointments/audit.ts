/**
 * Appointment lifecycle audit helpers.
 *
 * Plugs into the Phase 1 audit contract (createAuditEvent) so appointment
 * lifecycle events share the same shape as patient and security events.
 *
 * Appointment ids are sufficient for traceability — patient name and timing
 * are deliberately excluded from audit subjects to avoid sensitive-data
 * leakage in log surfaces.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { Appointment } from "./model";

export type AppointmentAuditEventType =
  | "appointment.created"
  | "appointment.confirmed"
  | "appointment.completed"
  | "appointment.canceled"
  | "appointment.no_show"
  | "appointment.rescheduled"
  | "appointment.series_edited";

interface CreateAppointmentAuditEventInput {
  type: AppointmentAuditEventType;
  appointment: Appointment;
  actor: AuditActor;
  metadata?: Record<string, unknown>;
}

interface CreateAppointmentAuditEventDeps {
  now: Date;
  createId: () => string;
}

const AUDIT_SUMMARIES: Record<AppointmentAuditEventType, string> = {
  "appointment.created": "Consulta criada na agenda.",
  "appointment.confirmed": "Consulta confirmada.",
  "appointment.completed": "Consulta concluída.",
  "appointment.canceled": "Consulta cancelada.",
  "appointment.no_show": "Paciente não compareceu.",
  "appointment.rescheduled": "Consulta reagendada.",
  "appointment.series_edited": "Série de consultas editada.",
};

export function createAppointmentAuditEvent(
  input: CreateAppointmentAuditEventInput,
  deps: CreateAppointmentAuditEventDeps,
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: {
        kind: "appointment",
        id: input.appointment.id,
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
