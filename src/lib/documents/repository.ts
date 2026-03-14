/**
 * PracticeDocument repository — workspace-scoped persistence contract.
 *
 * The in-memory implementation uses a Map keyed by document id so save/findById
 * are O(1). listByPatient and listActiveByPatient iterate values and filter
 * by workspaceId so they are O(n) — acceptable for the in-memory phase.
 */

import type { PracticeDocument } from "./model";

export interface PracticeDocumentRepository {
  save(doc: PracticeDocument): PracticeDocument;
  findById(id: string, workspaceId: string): PracticeDocument | null;
  listByPatient(patientId: string, workspaceId: string): PracticeDocument[];
  listActiveByPatient(patientId: string, workspaceId: string): PracticeDocument[];
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
    save(doc: PracticeDocument): PracticeDocument {
      store.set(doc.id, doc);
      return doc;
    },

    findById(id: string, workspaceId: string): PracticeDocument | null {
      const doc = store.get(id);
      if (!doc || doc.workspaceId !== workspaceId) return null;
      return doc;
    },

    listByPatient(patientId: string, workspaceId: string): PracticeDocument[] {
      return Array.from(store.values()).filter(
        (doc) => doc.patientId === patientId && doc.workspaceId === workspaceId,
      );
    },

    listActiveByPatient(patientId: string, workspaceId: string): PracticeDocument[] {
      return Array.from(store.values()).filter(
        (doc) =>
          doc.patientId === patientId &&
          doc.workspaceId === workspaceId &&
          doc.archivedAt === null,
      );
    },
  };
}
