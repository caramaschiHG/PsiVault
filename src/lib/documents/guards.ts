import type { PracticeDocument } from "./model";

/**
 * Assert that a document belongs to the expected patient.
 * Throws if the document is null or belongs to a different patient.
 */
export function assertDocumentBelongsToPatient(
  doc: PracticeDocument | null,
  patientId: string,
): asserts doc is PracticeDocument {
  if (!doc) {
    throw new Error("Documento não encontrado.");
  }
  if (doc.patientId !== patientId) {
    throw new Error("Documento não pertence a este paciente.");
  }
}

/**
 * Assert that a document is not archived.
 * Throws if the document is archived.
 */
export function assertDocumentNotArchived(
  doc: PracticeDocument,
): void {
  if (doc.archivedAt !== null || doc.status === "archived") {
    throw new Error("Documento está arquivado e não pode ser modificado.");
  }
}

/**
 * Assert that a document belongs to the expected workspace.
 * Throws if workspace IDs do not match.
 */
export function assertDocumentBelongsToWorkspace(
  doc: PracticeDocument,
  workspaceId: string,
): void {
  if (doc.workspaceId !== workspaceId) {
    throw new Error("Documento não pertence a este workspace.");
  }
}

/**
 * Combined guard for mutations: validates workspace, patient, and archive status.
 * Returns the document if all checks pass; throws otherwise.
 */
export function assertCanMutateDocument(
  doc: PracticeDocument | null,
  patientId: string,
  workspaceId: string,
): PracticeDocument {
  assertDocumentBelongsToPatient(doc, patientId);
  assertDocumentBelongsToWorkspace(doc, workspaceId);
  assertDocumentNotArchived(doc);
  return doc;
}
