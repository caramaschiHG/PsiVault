/**
 * Appointment repository contract.
 *
 * Selectors stay explicit so conflict checks, agenda views, and recurrence
 * expansion can query by workspace and date range without scattering filter
 * logic across call sites.
 */

import type { Appointment } from "./model";

export interface AppointmentRepository {
  /** Persist or update an appointment occurrence. */
  save(appointment: Appointment): Appointment;

  /** Find a single appointment by id within a workspace. Returns null if not found. */
  findById(id: string, workspaceId: string): Appointment | null;

  /**
   * All appointments in a workspace that start within [from, to).
   * Includes all statuses — callers filter by status when needed.
   */
  listByDateRange(workspaceId: string, from: Date, to: Date): Appointment[];

  /** All appointments belonging to a recurrence series. */
  listBySeries(seriesId: string, workspaceId: string): Appointment[];

  /** All appointments for a specific patient in a workspace, most recent first. */
  listByPatient(patientId: string, workspaceId: string): Appointment[];
}

export function createInMemoryAppointmentRepository(
  seed: Appointment[] = [],
): AppointmentRepository {
  const store = new Map<string, Appointment>(seed.map((a) => [a.id, a]));

  return {
    save(appointment) {
      store.set(appointment.id, appointment);
      return appointment;
    },

    findById(id, workspaceId) {
      const appt = store.get(id);
      if (!appt || appt.workspaceId !== workspaceId) return null;
      return appt;
    },

    listByDateRange(workspaceId, from, to) {
      return [...store.values()]
        .filter(
          (a) =>
            a.workspaceId === workspaceId &&
            a.startsAt >= from &&
            a.startsAt < to,
        )
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    },

    listBySeries(seriesId, workspaceId) {
      return [...store.values()]
        .filter(
          (a) => a.workspaceId === workspaceId && a.seriesId === seriesId,
        )
        .sort((a, b) => {
          const indexDiff = (a.seriesIndex ?? 0) - (b.seriesIndex ?? 0);
          if (indexDiff !== 0) return indexDiff;
          return a.startsAt.getTime() - b.startsAt.getTime();
        });
    },

    listByPatient(patientId, workspaceId) {
      return [...store.values()]
        .filter(
          (a) => a.workspaceId === workspaceId && a.patientId === patientId,
        )
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
    },
  };
}
