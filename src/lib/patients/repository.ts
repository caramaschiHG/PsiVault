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
  save(patient: Patient): Promise<Patient>;

  /** Find a patient by id within a workspace. Returns null if not found. */
  findById(id: string, workspaceId: string): Promise<Patient | null>;

  /** All non-archived patients scoped to a workspace, ordered by fullName. */
  listActive(workspaceId: string): Promise<Patient[]>;

  /** All archived patients scoped to a workspace, ordered by archivedAt desc. */
  listArchived(workspaceId: string): Promise<Patient[]>;

  /** All patients (active and archived) scoped to a workspace, with full data. For backup/export use only. */
  listAllByWorkspace(workspaceId: string): Promise<Patient[]>;

  /** Search patients by name, social name, email, or phone. Excludes sensitive fields. */
  searchByName(workspaceId: string, query: string): Promise<Patient[]>;
}

export function createInMemoryPatientRepository(seed: Patient[] = []): PatientRepository {
  const store = new Map<string, Patient>(seed.map((p) => [p.id, p]));

  return {
    async save(patient) {
      store.set(patient.id, patient);
      return patient;
    },

    async findById(id, workspaceId) {
      const patient = store.get(id);
      if (!patient || patient.workspaceId !== workspaceId) return null;
      return patient;
    },

    async listActive(workspaceId) {
      return [...store.values()]
        .filter((p) => p.workspaceId === workspaceId && p.archivedAt === null)
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"))
        .map((p) => ({ ...p, importantObservations: null }));
    },

    async listArchived(workspaceId) {
      return [...store.values()]
        .filter((p) => p.workspaceId === workspaceId && p.archivedAt !== null)
        .sort((a, b) => {
          const aTime = a.archivedAt!.getTime();
          const bTime = b.archivedAt!.getTime();
          return bTime - aTime;
        })
        .map((p) => ({ ...p, importantObservations: null }));
    },

    async listAllByWorkspace(workspaceId) {
      return [...store.values()].filter((p) => p.workspaceId === workspaceId);
    },

    async searchByName(workspaceId, query) {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return [...store.values()]
        .filter((p) =>
          p.workspaceId === workspaceId &&
          p.archivedAt === null &&
          (
            p.fullName.toLowerCase().includes(q) ||
            p.socialName?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.phone?.toLowerCase().includes(q)
          )
        )
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"))
        .map((p) => ({ ...p, importantObservations: null }));
    },
  };
}
