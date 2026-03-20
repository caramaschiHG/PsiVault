export type NotificationJobType =
  | "REMINDER_24H"
  | "REMINDER_1H"
  | "CONFIRMATION"
  | "CANCELLATION";

export type NotificationJobStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "CANCELED";

export interface NotificationJob {
  id: string;
  workspaceId: string;
  appointmentId: string;
  patientId: string;
  recipientEmail: string;
  type: NotificationJobType;
  status: NotificationJobStatus;
  scheduledFor: Date;
  sentAt: Date | null;
  failedAt: Date | null;
  errorNote: string | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateNotificationJobDeps {
  now: Date;
  createId: () => string;
}

export function createNotificationJob(
  input: Omit<NotificationJob, "id" | "status" | "sentAt" | "failedAt" | "errorNote" | "createdAt" | "updatedAt">,
  deps: CreateNotificationJobDeps,
): NotificationJob {
  return {
    ...input,
    id: deps.createId(),
    status: "PENDING",
    sentAt: null,
    failedAt: null,
    errorNote: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

/** Computes scheduledFor for REMINDER_24H and REMINDER_1H relative to appointment start */
export function computeReminderSchedules(startsAt: Date): {
  reminder24h: Date;
  reminder1h: Date;
} {
  return {
    reminder24h: new Date(startsAt.getTime() - 24 * 60 * 60 * 1000),
    reminder1h: new Date(startsAt.getTime() - 60 * 60 * 1000),
  };
}
