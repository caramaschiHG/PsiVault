// Notification type constants
export const NOTIFICATION_TYPES = {
  UPDATE: "update",
  SESSION_REMINDER: "session_reminder",
  PAYMENT_PENDING: "payment_pending",
  PATIENT_NOSHOW: "patient_noshow",
  BIRTHDAY: "birthday",
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Base interface shared by all notifications
export interface NotificationBase {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: number;
}

// Type-specific data interfaces
export interface UpdateNotificationData {
  type: "update";
  version?: string;
  changelog?: string;
}

export interface SessionReminderData {
  type: "session_reminder";
  patientId: string;
  patientName: string;
  startsAt: string; // ISO date string
}

export interface PaymentPendingData {
  type: "payment_pending";
  patientId: string;
  patientName: string;
  amount?: number;
}

export interface PatientNoshowData {
  type: "patient_noshow";
  patientId: string;
  patientName: string;
  scheduledAt: string; // ISO date string
}

export interface BirthdayData {
  type: "birthday";
  patientId: string;
  patientName: string;
  birthDate: string; // ISO date string
}

// Discriminated union — use switch(notification.type) for type narrowing
export type AppNotification = NotificationBase & (
  | UpdateNotificationData
  | SessionReminderData
  | PaymentPendingData
  | PatientNoshowData
  | BirthdayData
);

// Input type for creating new notifications (id, read, createdAt are auto-generated)
export type CreateNotificationInput = Omit<AppNotification, "id" | "read" | "createdAt">;
