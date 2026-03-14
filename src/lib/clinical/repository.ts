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
  save(note: ClinicalNote): ClinicalNote;
  findById(id: string, workspaceId: string): ClinicalNote | null;
  findByAppointmentId(appointmentId: string, workspaceId: string): ClinicalNote | null;
  listByPatient(patientId: string, workspaceId: string): ClinicalNote[];
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
    save(note: ClinicalNote): ClinicalNote {
      store.set(note.id, note);
      return note;
    },

    findById(id: string, workspaceId: string): ClinicalNote | null {
      const note = store.get(id);
      if (!note || note.workspaceId !== workspaceId) return null;
      return note;
    },

    findByAppointmentId(appointmentId: string, workspaceId: string): ClinicalNote | null {
      for (const note of store.values()) {
        if (note.appointmentId === appointmentId && note.workspaceId === workspaceId) {
          return note;
        }
      }
      return null;
    },

    listByPatient(patientId: string, workspaceId: string): ClinicalNote[] {
      return Array.from(store.values())
        .filter((note) => note.patientId === patientId && note.workspaceId === workspaceId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
  };
}
