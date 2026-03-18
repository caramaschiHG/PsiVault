/**
 * Reminder repository — workspace-scoped persistence contract.
 *
 * Mirrors the SessionChargeRepository shape from src/lib/finance/repository.ts.
 * The in-memory implementation uses a Map keyed by reminder id so save/findById
 * are O(1). listActive, listCompleted and patient-scoped variants iterate
 * and filter by workspaceId — O(n).
 */

import type { Reminder } from "./model";

export interface ReminderRepository {
  save(reminder: Reminder): Promise<Reminder>;
  findById(id: string, workspaceId: string): Promise<Reminder | null>;
  listActive(workspaceId: string): Promise<Reminder[]>;
  listCompleted(workspaceId: string): Promise<Reminder[]>;
  listActiveByPatient(patientId: string, workspaceId: string): Promise<Reminder[]>;
  listCompletedByPatient(patientId: string, workspaceId: string): Promise<Reminder[]>;
}

export function createInMemoryReminderRepository(): ReminderRepository {
  const store = new Map<string, Reminder>();

  return {
    save(reminder: Reminder): Promise<Reminder> {
      store.set(reminder.id, reminder);
      return Promise.resolve(reminder);
    },

    findById(id: string, workspaceId: string): Promise<Reminder | null> {
      const reminder = store.get(id);
      if (!reminder || reminder.workspaceId !== workspaceId) return Promise.resolve(null);
      return Promise.resolve(reminder);
    },

    listActive(workspaceId: string): Promise<Reminder[]> {
      const result: Reminder[] = [];
      for (const reminder of store.values()) {
        if (reminder.workspaceId === workspaceId && reminder.completedAt === null) {
          result.push(reminder);
        }
      }
      return Promise.resolve(result);
    },

    listCompleted(workspaceId: string): Promise<Reminder[]> {
      const result: Reminder[] = [];
      for (const reminder of store.values()) {
        if (reminder.workspaceId === workspaceId && reminder.completedAt !== null) {
          result.push(reminder);
        }
      }
      return Promise.resolve(result);
    },

    listActiveByPatient(patientId: string, workspaceId: string): Promise<Reminder[]> {
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
      return Promise.resolve(result);
    },

    listCompletedByPatient(patientId: string, workspaceId: string): Promise<Reminder[]> {
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
      return Promise.resolve(result);
    },
  };
}
