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
import { getAuditRepository } from "../../../lib/audit/store";
import { resolveSession } from "../../../lib/supabase/session";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "rem_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

// ─── createReminderAction ─────────────────────────────────────────────────────

export async function createReminderAction(
  _prevState: { success: boolean } | null,
  formData: FormData,
): Promise<{ success: boolean }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getReminderRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { success: false };

  const dueAtRaw = String(formData.get("dueAt") ?? "").trim();
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;

  // Optional patient link — present when creating from a patient profile
  const patientId = String(formData.get("patientId") ?? "").trim() || null;

  const reminder = createReminder(
    {
      workspaceId: workspaceId,
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
      workspaceId: workspaceId,
      accountId: accountId,
      now,
    }),
  );

  // Always revalidate dashboard
  revalidatePath("/inicio", "page");

  // If linked to a patient, also revalidate their profile
  if (patientId) {
    revalidatePath(`/patients/${patientId}`, "page");
  }

  return { success: true };
}

// ─── completeReminderAction ───────────────────────────────────────────────────

export async function completeReminderAction(reminderId: string): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getReminderRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const existing = await repo.findById(reminderId, workspaceId);
  if (!existing) return;

  const completed = completeReminder(existing, { now });
  await repo.save(completed);

  audit.append(
    createReminderAuditEvent({
      eventType: "reminder.completed",
      reminderId: completed.id,
      workspaceId: workspaceId,
      accountId: accountId,
      now,
    }),
  );

  revalidatePath("/inicio", "page");

  // If reminder was linked to a patient, revalidate their profile too
  if (completed.link?.type === "patient") {
    revalidatePath(`/patients/${completed.link.id}`, "page");
  }
}
