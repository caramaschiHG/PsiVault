/**
 * SessionCharge lifecycle audit helpers.
 *
 * Plugs into the Phase 1 audit contract (createAuditEvent) so charge events
 * share the same shape as patient, appointment, and document events.
 *
 * Security policy (SECU-05):
 * - amountInCents and paymentMethod must NEVER appear in audit metadata.
 * - Only chargeId, appointmentId, and (for updates) newStatus are safe.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { SessionCharge, ChargeStatus } from "./model";

export type ChargeAuditEventType = "charge.created" | "charge.updated";

interface CreateChargeAuditEventInput {
  type: ChargeAuditEventType;
  charge: SessionCharge;
  actor: AuditActor;
  /** Required for charge.updated — the new status after the update. */
  newStatus?: ChargeStatus | string;
}

interface CreateChargeAuditEventDeps {
  now: Date;
  createId: () => string;
}

const AUDIT_SUMMARIES: Record<ChargeAuditEventType, string> = {
  "charge.created": "Cobrança registrada.",
  "charge.updated": "Cobrança atualizada.",
};

export function createChargeAuditEvent(
  input: CreateChargeAuditEventInput,
  deps: CreateChargeAuditEventDeps,
): AuditEvent {
  // SECU-05: metadata must never include amountInCents or paymentMethod
  const metadata: Record<string, unknown> = {
    chargeId: input.charge.id,
    appointmentId: input.charge.appointmentId,
  };

  if (input.type === "charge.updated" && input.newStatus !== undefined) {
    metadata.newStatus = input.newStatus;
  }

  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: {
        kind: "session_charge",
        id: input.charge.id,
      },
      summary: AUDIT_SUMMARIES[input.type],
      metadata,
    },
    {
      now: deps.now,
      createId: deps.createId,
    },
  );
}
