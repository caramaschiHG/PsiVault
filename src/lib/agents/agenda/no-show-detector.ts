import type { Appointment, AppointmentStatus } from "../../appointments/model";

const RELEVANT_STATUSES: AppointmentStatus[] = ["COMPLETED", "CONFIRMED", "NO_SHOW"];

export interface NoShowCheckAppointment {
  startsAt: Date;
  status: AppointmentStatus;
}

/**
 * Detect whether a patient has `threshold` consecutive NO_SHOW appointments
 * in their recent history, with no COMPLETED or CONFIRMED appointment in between.
 *
 * CANCELED and SCHEDULED appointments are ignored for streak calculation.
 */
export function hasConsecutiveNoShows(
  appointments: NoShowCheckAppointment[],
  threshold = 2,
): boolean {
  const relevant = appointments
    .filter((a) => RELEVANT_STATUSES.includes(a.status))
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  let count = 0;
  for (const appt of relevant) {
    if (appt.status === "NO_SHOW") {
      count++;
      if (count >= threshold) return true;
    } else if (appt.status === "COMPLETED" || appt.status === "CONFIRMED") {
      return false;
    }
  }
  return false;
}

/**
 * Compute the no-show alert flag for a single patient by fetching their
 * appointment history and scanning for consecutive no-shows.
 */
export async function computeNoShowAlertForPatient(
  patientId: string,
  workspaceId: string,
  listByPatient: (patientId: string, workspaceId: string) => Promise<Appointment[]>,
): Promise<boolean> {
  const history = await listByPatient(patientId, workspaceId);
  return hasConsecutiveNoShows(history);
}
