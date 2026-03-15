/**
 * Reminder lifecycle audit helpers.
 *
 * Plugs into the Phase 1 audit contract (createAuditEvent) so reminder events
 * share the same shape as patient, appointment, document, and charge events.
 *
 * Security policy (SECU-05):
 * - Reminder title must NEVER appear in audit metadata.
 * - Whitelist: only reminderId and workspaceId are safe to include.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditEvent } from "../audit/events";

export type ReminderAuditEventType = "reminder.created" | "reminder.completed";

interface CreateReminderAuditEventInput {
  eventType: ReminderAuditEventType;
  reminderId: string;
  workspaceId: string;
  accountId: string;
  now: Date;
}

const AUDIT_SUMMARIES: Record<ReminderAuditEventType, string> = {
  "reminder.created": "Lembrete criado.",
  "reminder.completed": "Lembrete concluído.",
};

export function createReminderAuditEvent(
  input: CreateReminderAuditEventInput,
): AuditEvent {
  // SECU-05: metadata must never include title — only reminderId and workspaceId
  const metadata: Record<string, unknown> = {
    reminderId: input.reminderId,
    workspaceId: input.workspaceId,
  };

  return createAuditEvent(
    {
      type: input.eventType,
      actor: {
        accountId: input.accountId,
        workspaceId: input.workspaceId,
      },
      subject: {
        kind: "reminder",
        id: input.reminderId,
      },
      summary: AUDIT_SUMMARIES[input.eventType],
      metadata,
    },
    {
      now: input.now,
    },
  );
}
