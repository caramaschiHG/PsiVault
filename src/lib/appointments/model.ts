/**
 * Appointment occurrence aggregate — workspace-scoped canonical shape.
 *
 * Care mode policy:
 * - Only IN_PERSON and ONLINE are valid booking values.
 * - HYBRID is a practice-profile preference, not a per-appointment mode.
 *
 * Status lifecycle:
 *   SCHEDULED -> CONFIRMED -> COMPLETED
 *                          -> NO_SHOW
 *            -> CANCELED
 *
 * Reschedule semantics:
 * - A reschedule creates a new occurrence linked via rescheduledFromId.
 * - The original occurrence stays immutable in history.
 * - Only SCHEDULED and CONFIRMED appointments can be rescheduled.
 */

export type AppointmentCareMode = "IN_PERSON" | "ONLINE";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

const VALID_CARE_MODES: AppointmentCareMode[] = ["IN_PERSON", "ONLINE"];
const RESCHEDULABLE_STATUSES: AppointmentStatus[] = ["SCHEDULED", "CONFIRMED"];
const COMPLETABLE_STATUSES: AppointmentStatus[] = ["SCHEDULED", "CONFIRMED"];
const CONFIRMABLE_STATUSES: AppointmentStatus[] = ["SCHEDULED"];

export interface Appointment {
  id: string;
  workspaceId: string;
  patientId: string;

  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;

  careMode: AppointmentCareMode;
  status: AppointmentStatus;

  // Recurrence linkage (null for standalone appointments)
  seriesId: string | null;
  seriesIndex: number | null;

  // Reschedule linkage — preserves visible history
  rescheduledFromId: string | null;

  // Lifecycle timestamps
  canceledAt: Date | null;
  canceledByAccountId: string | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  noShowAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentInput {
  workspaceId: string;
  patientId: string;
  startsAt: Date;
  durationMinutes: number;
  careMode: AppointmentCareMode;
  seriesId?: string | null;
  seriesIndex?: number | null;
  rescheduledFromId?: string | null;
}

interface CreateAppointmentDeps {
  now: Date;
  createId: () => string;
}

export function createAppointment(
  input: CreateAppointmentInput,
  deps: CreateAppointmentDeps,
): Appointment {
  if (!VALID_CARE_MODES.includes(input.careMode)) {
    throw new Error(
      `Invalid care mode "${input.careMode}". Appointments must use IN_PERSON or ONLINE.`,
    );
  }

  const endsAt = new Date(input.startsAt.getTime() + input.durationMinutes * 60_000);

  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    patientId: input.patientId,
    startsAt: input.startsAt,
    endsAt,
    durationMinutes: input.durationMinutes,
    careMode: input.careMode,
    status: "SCHEDULED",
    seriesId: input.seriesId ?? null,
    seriesIndex: input.seriesIndex ?? null,
    rescheduledFromId: input.rescheduledFromId ?? null,
    canceledAt: null,
    canceledByAccountId: null,
    confirmedAt: null,
    completedAt: null,
    noShowAt: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

export interface RescheduleInput {
  startsAt: Date;
  durationMinutes: number;
  careMode?: AppointmentCareMode;
}

export function rescheduleAppointment(
  appointment: Appointment,
  input: RescheduleInput,
  deps: CreateAppointmentDeps,
): Appointment {
  if (!RESCHEDULABLE_STATUSES.includes(appointment.status)) {
    throw new Error(
      `Cannot reschedule appointment with status "${appointment.status}". ` +
        `Only SCHEDULED and CONFIRMED appointments can be rescheduled.`,
    );
  }

  const careMode = input.careMode ?? appointment.careMode;
  const endsAt = new Date(input.startsAt.getTime() + input.durationMinutes * 60_000);

  return {
    id: deps.createId(),
    workspaceId: appointment.workspaceId,
    patientId: appointment.patientId,
    startsAt: input.startsAt,
    endsAt,
    durationMinutes: input.durationMinutes,
    careMode,
    status: "SCHEDULED",
    seriesId: appointment.seriesId,
    seriesIndex: appointment.seriesIndex,
    rescheduledFromId: appointment.id,
    canceledAt: null,
    canceledByAccountId: null,
    confirmedAt: null,
    completedAt: null,
    noShowAt: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

export function cancelAppointment(
  appointment: Appointment,
  deps: { now: Date; canceledByAccountId: string },
): Appointment {
  return {
    ...appointment,
    status: "CANCELED",
    canceledAt: deps.now,
    canceledByAccountId: deps.canceledByAccountId,
    updatedAt: deps.now,
  };
}

export function confirmAppointment(
  appointment: Appointment,
  deps: { now: Date },
): Appointment {
  if (!CONFIRMABLE_STATUSES.includes(appointment.status)) {
    throw new Error(
      `Cannot confirm appointment with status "${appointment.status}". ` +
        `Only SCHEDULED appointments can be confirmed.`,
    );
  }

  return {
    ...appointment,
    status: "CONFIRMED",
    confirmedAt: deps.now,
    updatedAt: deps.now,
  };
}

export function completeAppointment(
  appointment: Appointment,
  deps: { now: Date },
): Appointment {
  if (!COMPLETABLE_STATUSES.includes(appointment.status)) {
    throw new Error(
      `Cannot complete appointment with status "${appointment.status}". ` +
        `Only SCHEDULED and CONFIRMED appointments can be completed.`,
    );
  }

  return {
    ...appointment,
    status: "COMPLETED",
    completedAt: deps.now,
    updatedAt: deps.now,
  };
}

export function noShowAppointment(
  appointment: Appointment,
  deps: { now: Date },
): Appointment {
  if (!COMPLETABLE_STATUSES.includes(appointment.status)) {
    throw new Error(
      `Cannot mark no-show for appointment with status "${appointment.status}". ` +
        `Only SCHEDULED and CONFIRMED appointments can be marked as no-show.`,
    );
  }

  return {
    ...appointment,
    status: "NO_SHOW",
    noShowAt: deps.now,
    updatedAt: deps.now,
  };
}
