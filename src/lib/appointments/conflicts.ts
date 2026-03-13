/**
 * Appointment conflict detection — pure domain, no I/O.
 *
 * Hard-block rule: SCHEDULED and CONFIRMED appointments are opaque time blocks.
 * Any new or rescheduled occurrence that overlaps them is rejected before commit.
 *
 * Adjacent appointments (end equals start) are allowed — exact boundary sharing
 * does not constitute an overlap.
 *
 * Finalized statuses (COMPLETED, CANCELED, NO_SHOW) are transparent — they do
 * not block new scheduling in the same time window.
 */

import type { AppointmentStatus } from "./model";

/** Statuses that create hard-block conflicts. */
const BLOCKING_STATUSES: AppointmentStatus[] = ["SCHEDULED", "CONFIRMED"];

export interface ConflictCandidate {
  id: string;
  startsAt: Date;
  endsAt: Date;
}

export interface ExistingAppointment {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingIds: string[];
}

/**
 * Check whether a candidate appointment overlaps any blocking existing appointments.
 *
 * The candidate's own id is excluded from collision checks to support
 * reschedule scenarios where the updated occurrence re-uses the same slot.
 */
export function checkConflicts(
  candidate: ConflictCandidate,
  existing: ExistingAppointment[],
): ConflictResult {
  const conflictingIds: string[] = [];

  for (const appt of existing) {
    // Skip self-comparison (reschedule scenario)
    if (appt.id === candidate.id) continue;

    // Only block against scheduling-active statuses
    if (!BLOCKING_STATUSES.includes(appt.status)) continue;

    // Overlap condition: candidate.startsAt < appt.endsAt && candidate.endsAt > appt.startsAt
    // Adjacent (candidate.startsAt === appt.endsAt) is NOT an overlap — use strict inequality
    const overlaps =
      candidate.startsAt.getTime() < appt.endsAt.getTime() &&
      candidate.endsAt.getTime() > appt.startsAt.getTime();

    if (overlaps) {
      conflictingIds.push(appt.id);
    }
  }

  return {
    hasConflict: conflictingIds.length > 0,
    conflictingIds,
  };
}

export interface SchedulablePatient {
  id: string;
  workspaceId: string;
  archivedAt: Date | null;
}

/**
 * Assert that the patient is active (not archived) before creating an appointment.
 * Throws with a descriptive message if the patient is archived.
 */
export function assertPatientSchedulable(patient: SchedulablePatient): void {
  if (patient.archivedAt !== null) {
    throw new Error(
      `Cannot schedule appointment for archived patient "${patient.id}". ` +
        `Recover the patient first to resume scheduling.`,
    );
  }
}
