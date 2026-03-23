/**
 * SessionCharge repository — interface and in-memory implementation.
 *
 * listByMonth uses UTC boundaries:
 *   from = Date.UTC(year, month-1, 1) — inclusive
 *   to   = Date.UTC(year, month, 1)   — exclusive
 *
 * listByWorkspaceAndMonth: same UTC boundaries but workspace-scoped (no patientId filter).
 * Used by DASH-02 dashboard aggregation to sum all charges in a calendar month.
 */

import type { SessionCharge } from "./model";

export interface SessionChargeRepository {
  save(charge: SessionCharge): Promise<SessionCharge>;
  findById(id: string, workspaceId: string): Promise<SessionCharge | null>;
  findByAppointmentId(appointmentId: string): Promise<SessionCharge | null>;
  listByPatient(patientId: string, workspaceId: string): Promise<SessionCharge[]>;
  listByMonth(workspaceId: string, patientId: string, year: number, month: number): Promise<SessionCharge[]>;
  listByWorkspaceAndMonth(workspaceId: string, year: number, month: number): Promise<SessionCharge[]>;
}

export function createInMemorySessionChargeRepository(): SessionChargeRepository {
  const store = new Map<string, SessionCharge>();

  return {
    save(charge: SessionCharge): Promise<SessionCharge> {
      store.set(charge.id, charge);
      return Promise.resolve(charge);
    },

    findById(id: string, workspaceId: string): Promise<SessionCharge | null> {
      const charge = store.get(id) ?? null;
      if (!charge || charge.workspaceId !== workspaceId) return Promise.resolve(null);
      return Promise.resolve(charge);
    },

    findByAppointmentId(appointmentId: string): Promise<SessionCharge | null> {
      for (const charge of store.values()) {
        if (charge.appointmentId === appointmentId) {
          return Promise.resolve(charge);
        }
      }
      return Promise.resolve(null);
    },

    listByPatient(patientId: string, workspaceId: string): Promise<SessionCharge[]> {
      const result: SessionCharge[] = [];
      for (const charge of store.values()) {
        if (charge.patientId === patientId && charge.workspaceId === workspaceId) {
          result.push(charge);
        }
      }
      return Promise.resolve(result);
    },

    listByMonth(workspaceId: string, patientId: string, year: number, month: number): Promise<SessionCharge[]> {
      const from = Date.UTC(year, month - 1, 1);
      const to = Date.UTC(year, month, 1);
      const result: SessionCharge[] = [];
      for (const charge of store.values()) {
        if (charge.workspaceId !== workspaceId || charge.patientId !== patientId) {
          continue;
        }
        const createdMs = charge.createdAt.getTime();
        if (createdMs >= from && createdMs < to) {
          result.push(charge);
        }
      }
      return Promise.resolve(result);
    },

    listByWorkspaceAndMonth(workspaceId: string, year: number, month: number): Promise<SessionCharge[]> {
      const from = Date.UTC(year, month - 1, 1);
      const to = Date.UTC(year, month, 1);
      const result: SessionCharge[] = [];
      for (const charge of store.values()) {
        if (charge.workspaceId !== workspaceId) {
          continue;
        }
        const createdMs = charge.createdAt.getTime();
        if (createdMs >= from && createdMs < to) {
          result.push(charge);
        }
      }
      return Promise.resolve(result);
    },
  };
}
