/**
 * Clinical note repository — workspace-scoped persistence contract.
 *
 * Mirrors the AppointmentRepository shape from src/lib/appointments/repository.ts.
 * The in-memory implementation uses a Map keyed by note id so save/findById
 * are O(1). listByPatient and findByAppointmentId iterate values and filter
 * by workspaceId so they are O(n) — acceptable for the in-memory phase.
 */

import type { ClinicalNote } from "./model";

export interface ClinicalNoteRepository {
  save(note: ClinicalNote): Promise<ClinicalNote>;
  findById(id: string, workspaceId: string): Promise<ClinicalNote | null>;
  findByAppointmentId(appointmentId: string, workspaceId: string): Promise<ClinicalNote | null>;
  findByAppointmentIds(ids: string[], workspaceId: string): Promise<Set<string>>;
  listByPatient(patientId: string, workspaceId: string): Promise<ClinicalNote[]>;
}

export function createInMemoryClinicalRepository(
  seed?: ClinicalNote[],
): ClinicalNoteRepository {
  const store = new Map<string, ClinicalNote>();

  if (seed) {
    for (const note of seed) {
      store.set(note.id, note);
    }
  }

  return {
    async save(note: ClinicalNote): Promise<ClinicalNote> {
      store.set(note.id, note);
      return note;
    },

    async findById(id: string, workspaceId: string): Promise<ClinicalNote | null> {
      const note = store.get(id);
      if (!note || note.workspaceId !== workspaceId) return null;
      return note;
    },

    async findByAppointmentId(appointmentId: string, workspaceId: string): Promise<ClinicalNote | null> {
      for (const note of store.values()) {
        if (note.appointmentId === appointmentId && note.workspaceId === workspaceId) {
          return note;
        }
      }
      return null;
    },

    async findByAppointmentIds(ids: string[], workspaceId: string): Promise<Set<string>> {
      const result = new Set<string>();
      const idSet = new Set(ids);
      for (const note of store.values()) {
        if (note.workspaceId === workspaceId && note.appointmentId && idSet.has(note.appointmentId)) {
          result.add(note.appointmentId);
        }
      }
      return result;
    },

    async listByPatient(patientId: string, workspaceId: string): Promise<ClinicalNote[]> {
      return Array.from(store.values())
        .filter((note) => note.patientId === patientId && note.workspaceId === workspaceId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
  };
}
