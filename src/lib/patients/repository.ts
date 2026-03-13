/**
 * Patient repository contract.
 *
 * Active vs archived selectors are kept explicit so scheduling and other
 * downstream domains can safely exclude archived patients without losing
 * linked history.
 */

import type { Patient } from "./model";

export interface PatientRepository {
  /** Persist or update a patient record. */
  save(patient: Patient): Patient;

  /** Find a patient by id within a workspace. Returns null if not found. */
  findById(id: string, workspaceId: string): Patient | null;

  /** All non-archived patients scoped to a workspace, ordered by fullName. */
  listActive(workspaceId: string): Patient[];

  /** All archived patients scoped to a workspace, ordered by archivedAt desc. */
  listArchived(workspaceId: string): Patient[];
}

export function createInMemoryPatientRepository(seed: Patient[] = []): PatientRepository {
  const store = new Map<string, Patient>(seed.map((p) => [p.id, p]));

  return {
    save(patient) {
      store.set(patient.id, patient);
      return patient;
    },

    findById(id, workspaceId) {
      const patient = store.get(id);
      if (!patient || patient.workspaceId !== workspaceId) return null;
      return patient;
    },

    listActive(workspaceId) {
      return [...store.values()]
        .filter((p) => p.workspaceId === workspaceId && p.archivedAt === null)
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
    },

    listArchived(workspaceId) {
      return [...store.values()]
        .filter((p) => p.workspaceId === workspaceId && p.archivedAt !== null)
        .sort((a, b) => {
          const aTime = a.archivedAt!.getTime();
          const bTime = b.archivedAt!.getTime();
          return bTime - aTime;
        });
    },
  };
}
