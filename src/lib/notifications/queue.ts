import type { WorkspaceSmtpConfig } from "./smtp-config";
import { computeReminderSchedules, createNotificationJob } from "./model";
import { getNotificationJobRepository } from "./store";

export type QueueEventType = "CREATED" | "RESCHEDULED" | "CANCELED";

interface QueueInput {
  workspaceId: string;
  appointmentId: string;
  patientId: string;
  recipientEmail: string;
  startsAt: Date;
  type: QueueEventType;
  smtpPrefs: WorkspaceSmtpConfig | null;
  now: Date;
  createId: () => string;
}

export async function queueAppointmentNotifications(input: QueueInput): Promise<void> {
  const { workspaceId, appointmentId, patientId, recipientEmail, startsAt, type, smtpPrefs, now, createId } = input;

  // Skip silently if no email or no SMTP config
  if (!recipientEmail || !smtpPrefs) return;

  const repo = getNotificationJobRepository();

  async function enqueue(
    jobType: "REMINDER_24H" | "REMINDER_1H" | "CONFIRMATION" | "CANCELLATION",
    scheduledFor: Date,
  ) {
    const key = `${appointmentId}:${jobType}`;
    const existing = await repo.findByIdempotencyKey(key);
    if (existing) return; // idempotent

    const job = createNotificationJob(
      { workspaceId, appointmentId, patientId, recipientEmail, type: jobType, scheduledFor, idempotencyKey: key },
      { now, createId },
    );
    await repo.save(job);
  }

  if (type === "CANCELED") {
    await repo.cancelByAppointment(appointmentId);
    if (smtpPrefs.sendCancellation) {
      await enqueue("CANCELLATION", now);
    }
    return;
  }

  if (type === "RESCHEDULED") {
    await repo.cancelByAppointment(appointmentId);
    // Fall through to re-enqueue as CREATED for new startsAt
  }

  // CREATED or RESCHEDULED → enqueue confirmation + reminders
  if (smtpPrefs.sendConfirmation) {
    await enqueue("CONFIRMATION", now);
  }

  const { reminder24h, reminder1h } = computeReminderSchedules(startsAt);

  if (smtpPrefs.sendReminder24h && reminder24h > now) {
    await enqueue("REMINDER_24H", reminder24h);
  }

  if (smtpPrefs.sendReminder1h && reminder1h > now) {
    await enqueue("REMINDER_1H", reminder1h);
  }
}
