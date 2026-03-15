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
  save(charge: SessionCharge): void;
  findById(id: string): SessionCharge | null;
  findByAppointmentId(appointmentId: string): SessionCharge | null;
  listByPatient(patientId: string, workspaceId: string): SessionCharge[];
  listByMonth(workspaceId: string, patientId: string, year: number, month: number): SessionCharge[];
  listByWorkspaceAndMonth(workspaceId: string, year: number, month: number): SessionCharge[];
}

export function createInMemorySessionChargeRepository(): SessionChargeRepository {
  const store = new Map<string, SessionCharge>();

  return {
    save(charge: SessionCharge): void {
      store.set(charge.id, charge);
    },

    findById(id: string): SessionCharge | null {
      return store.get(id) ?? null;
    },

    findByAppointmentId(appointmentId: string): SessionCharge | null {
      for (const charge of store.values()) {
        if (charge.appointmentId === appointmentId) {
          return charge;
        }
      }
      return null;
    },

    listByPatient(patientId: string, workspaceId: string): SessionCharge[] {
      const result: SessionCharge[] = [];
      for (const charge of store.values()) {
        if (charge.patientId === patientId && charge.workspaceId === workspaceId) {
          result.push(charge);
        }
      }
      return result;
    },

    listByMonth(workspaceId: string, patientId: string, year: number, month: number): SessionCharge[] {
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
      return result;
    },

    listByWorkspaceAndMonth(workspaceId: string, year: number, month: number): SessionCharge[] {
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
      return result;
    },
  };
}
