/**
 * PracticeDocument repository — workspace-scoped persistence contract.
 *
 * The in-memory implementation uses a Map keyed by document id so save/findById
 * are O(1). listByPatient and listActiveByPatient iterate values and filter
 * by workspaceId so they are O(n) — acceptable for the in-memory phase.
 */

import type { DocumentStatus, PracticeDocument } from "./model";

export interface PracticeDocumentRepository {
  save(doc: PracticeDocument): Promise<PracticeDocument>;
  findById(id: string, workspaceId: string): Promise<PracticeDocument | null>;
  listByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]>;
  listActiveByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]>;

  // Phase 37: lifecycle queries
  listByStatus(
    workspaceId: string,
    patientId: string,
    status: DocumentStatus,
  ): Promise<PracticeDocument[]>;
  listDraftsByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]>;
  findByAppointmentId(
    workspaceId: string,
    appointmentId: string,
  ): Promise<PracticeDocument[]>;
}

export function createInMemoryDocumentRepository(
  seed?: PracticeDocument[],
): PracticeDocumentRepository {
  const store = new Map<string, PracticeDocument>();

  if (seed) {
    for (const doc of seed) {
      store.set(doc.id, doc);
    }
  }

  return {
    async save(doc: PracticeDocument): Promise<PracticeDocument> {
      store.set(doc.id, doc);
      return doc;
    },

    async findById(id: string, workspaceId: string): Promise<PracticeDocument | null> {
      const doc = store.get(id);
      if (!doc || doc.workspaceId !== workspaceId) return null;
      return doc;
    },

    async listByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]> {
      return Array.from(store.values()).filter(
        (doc) => doc.patientId === patientId && doc.workspaceId === workspaceId,
      );
    },

    async listActiveByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]> {
      return Array.from(store.values()).filter(
        (doc) =>
          doc.patientId === patientId &&
          doc.workspaceId === workspaceId &&
          doc.archivedAt === null,
      );
    },

    async listByStatus(
      workspaceId: string,
      patientId: string,
      status: DocumentStatus,
    ): Promise<PracticeDocument[]> {
      return Array.from(store.values()).filter(
        (doc) =>
          doc.patientId === patientId &&
          doc.workspaceId === workspaceId &&
          doc.status === status,
      );
    },

    async listDraftsByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]> {
      return Array.from(store.values()).filter(
        (doc) =>
          doc.patientId === patientId &&
          doc.workspaceId === workspaceId &&
          doc.status === "draft",
      );
    },

    async findByAppointmentId(
      workspaceId: string,
      appointmentId: string,
    ): Promise<PracticeDocument[]> {
      return Array.from(store.values()).filter(
        (doc) =>
          doc.workspaceId === workspaceId &&
          doc.appointmentId === appointmentId,
      );
    },
  };
}
