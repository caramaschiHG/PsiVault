/**
 * Reminder repository — workspace-scoped persistence contract.
 *
 * Mirrors the SessionChargeRepository shape from src/lib/finance/repository.ts.
 * The in-memory implementation uses a Map keyed by reminder id so save/findById
 * are O(1). List methods iterate values and filter by workspaceId — O(n),
 * acceptable for the in-memory phase.
 */

import type { Reminder } from "./model";

export interface ReminderRepository {
  save(reminder: Reminder): void;
  findById(id: string, workspaceId: string): Reminder | null;
  listActive(workspaceId: string): Reminder[];
  listCompleted(workspaceId: string): Reminder[];
  listActiveByPatient(patientId: string, workspaceId: string): Reminder[];
  listCompletedByPatient(patientId: string, workspaceId: string): Reminder[];
}

export function createInMemoryReminderRepository(): ReminderRepository {
  const store = new Map<string, Reminder>();

  return {
    save(reminder: Reminder): void {
      store.set(reminder.id, reminder);
    },

    findById(id: string, workspaceId: string): Reminder | null {
      const reminder = store.get(id);
      if (!reminder || reminder.workspaceId !== workspaceId) return null;
      return reminder;
    },

    listActive(workspaceId: string): Reminder[] {
      const result: Reminder[] = [];
      for (const reminder of store.values()) {
        if (reminder.workspaceId === workspaceId && reminder.completedAt === null) {
          result.push(reminder);
        }
      }
      return result;
    },

    listCompleted(workspaceId: string): Reminder[] {
      const result: Reminder[] = [];
      for (const reminder of store.values()) {
        if (reminder.workspaceId === workspaceId && reminder.completedAt !== null) {
          result.push(reminder);
        }
      }
      return result;
    },

    listActiveByPatient(patientId: string, workspaceId: string): Reminder[] {
      const result: Reminder[] = [];
      for (const reminder of store.values()) {
        if (
          reminder.workspaceId === workspaceId &&
          reminder.completedAt === null &&
          reminder.link?.type === "patient" &&
          reminder.link.id === patientId
        ) {
          result.push(reminder);
        }
      }
      return result;
    },

    listCompletedByPatient(patientId: string, workspaceId: string): Reminder[] {
      const result: Reminder[] = [];
      for (const reminder of store.values()) {
        if (
          reminder.workspaceId === workspaceId &&
          reminder.completedAt !== null &&
          reminder.link?.type === "patient" &&
          reminder.link.id === patientId
        ) {
          result.push(reminder);
        }
      }
      return result;
    },
  };
}
