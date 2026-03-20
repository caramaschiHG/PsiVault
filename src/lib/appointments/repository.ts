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
  save(appointment: Appointment): Promise<Appointment>;

  /** Find a single appointment by id within a workspace. Returns null if not found. */
  findById(id: string, workspaceId: string): Promise<Appointment | null>;

  /**
   * All appointments in a workspace that start within [from, to).
   * Includes all statuses — callers filter by status when needed.
   */
  listByDateRange(workspaceId: string, from: Date, to: Date): Promise<Appointment[]>;

  /** All appointments belonging to a recurrence series. */
  listBySeries(seriesId: string, workspaceId: string): Promise<Appointment[]>;

  /** All appointments for a specific patient in a workspace, most recent first. */
  listByPatient(patientId: string, workspaceId: string): Promise<Appointment[]>;

  /** Future active (SCHEDULED | CONFIRMED) appointments for a patient, from a given date, oldest first. */
  listFutureActiveByPatient(patientId: string, workspaceId: string, from: Date): Promise<Appointment[]>;

  /** Persist multiple appointments atomically. Fails all-or-nothing. */
  saveBatch(appointments: Appointment[]): Promise<void>;
}

export function createInMemoryAppointmentRepository(
  seed: Appointment[] = [],
): AppointmentRepository {
  const store = new Map<string, Appointment>(seed.map((a) => [a.id, a]));

  return {
    async save(appointment) {
      store.set(appointment.id, appointment);
      return appointment;
    },

    async findById(id, workspaceId) {
      const appt = store.get(id);
      if (!appt || appt.workspaceId !== workspaceId) return null;
      return appt;
    },

    async listByDateRange(workspaceId, from, to) {
      return [...store.values()]
        .filter(
          (a) =>
            a.workspaceId === workspaceId &&
            a.startsAt >= from &&
            a.startsAt < to,
        )
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    },

    async listBySeries(seriesId, workspaceId) {
      return [...store.values()]
        .filter(
          (a) =>
            a.workspaceId === workspaceId &&
            a.seriesId === seriesId,
        )
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    },

    async listByPatient(patientId, workspaceId) {
      return [...store.values()]
        .filter(
          (a) =>
            a.workspaceId === workspaceId &&
            a.patientId === patientId,
        )
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
    },

    async listFutureActiveByPatient(patientId, workspaceId, from) {
      return [...store.values()]
        .filter(
          (a) =>
            a.workspaceId === workspaceId &&
            a.patientId === patientId &&
            (a.status === "SCHEDULED" || a.status === "CONFIRMED") &&
            a.startsAt >= from,
        )
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    },

    async saveBatch(appointments) {
      for (const a of appointments) await this.save(a);
    },
  };
}
