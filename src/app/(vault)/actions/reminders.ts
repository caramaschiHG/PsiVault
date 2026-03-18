"use server";

/**
 * Reminder server actions — create and complete reminders.
 *
 * Follows the appointments/actions.ts pattern:
 * - crypto.getRandomValues for ID generation
 * - audit event on every state change
 * - revalidatePath to refresh dashboard and patient profile
 *
 * Security policy (SECU-05):
 * - Reminder title is never passed to createReminderAuditEvent — only
 *   reminderId and workspaceId appear in audit metadata.
 */

import { revalidatePath } from "next/cache";
import { createReminder, completeReminder } from "../../../lib/reminders/model";
import { getReminderRepository } from "../../../lib/reminders/store";
import { createReminderAuditEvent } from "../../../lib/reminders/audit";
import { createInMemoryAuditRepository } from "../../../lib/audit/repository";

// ─── Module-level audit repository ────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __psivaultReminderAudit__: ReturnType<typeof createInMemoryAuditRepository> | undefined;
}

function getAuditRepository() {
  globalThis.__psivaultReminderAudit__ ??= createInMemoryAuditRepository();
  return globalThis.__psivaultReminderAudit__;
}

// ─── Stub identity (real resolution comes from session in production) ──────────

const DEFAULT_WORKSPACE_ID = "ws_1";
const DEFAULT_ACCOUNT_ID = "acct_1";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "rem_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

// ─── createReminderAction ─────────────────────────────────────────────────────

export async function createReminderAction(formData: FormData): Promise<void> {
  const repo = getReminderRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return; // client validation should prevent this, but guard anyway

  const dueAtRaw = String(formData.get("dueAt") ?? "").trim();
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;

  // Optional patient link — present when creating from a patient profile
  const patientId = String(formData.get("patientId") ?? "").trim() || null;

  const reminder = createReminder(
    {
      workspaceId: DEFAULT_WORKSPACE_ID,
      title,
      dueAt,
      link: patientId ? { type: "patient", id: patientId } : null,
    },
    { now, createId: generateId },
  );

  await repo.save(reminder);

  audit.append(
    createReminderAuditEvent({
      eventType: "reminder.created",
      reminderId: reminder.id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      accountId: DEFAULT_ACCOUNT_ID,
      now,
    }),
  );

  // Always revalidate dashboard
  revalidatePath("/inicio");

  // If linked to a patient, also revalidate their profile
  if (patientId) {
    revalidatePath(`/patients/${patientId}`);
  }
}

// ─── completeReminderAction ───────────────────────────────────────────────────

export async function completeReminderAction(reminderId: string): Promise<void> {
  const repo = getReminderRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const existing = await repo.findById(reminderId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const completed = completeReminder(existing, { now });
  await repo.save(completed);

  audit.append(
    createReminderAuditEvent({
      eventType: "reminder.completed",
      reminderId: completed.id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      accountId: DEFAULT_ACCOUNT_ID,
      now,
    }),
  );

  revalidatePath("/inicio");

  // If reminder was linked to a patient, revalidate their profile too
  if (completed.link?.type === "patient") {
    revalidatePath(`/patients/${completed.link.id}`);
  }
}
