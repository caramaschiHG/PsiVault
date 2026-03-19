/**
 * PracticeDocument aggregate — workspace-scoped canonical shape.
 *
 * Security policy (SECU-05):
 * - Document content must NEVER appear in audit metadata, logs, or any
 *   non-document surface.
 *
 * Lifecycle:
 * - editedAt is null on first creation and set to now on every update.
 * - archivedAt and archivedByAccountId are null until explicitly archived.
 */

export type DocumentType =
  | "declaration_of_attendance"
  | "receipt"
  | "anamnesis"
  | "psychological_report"
  | "consent_and_service_contract"
  | "session_note"
  | "referral_letter";

export interface PracticeDocument {
  id: string;
  workspaceId: string;
  patientId: string;
  type: DocumentType;
  content: string;
  createdByAccountId: string;
  createdByName: string; // snapshot of professional name at creation time
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null; // null on first creation, set on every subsequent update
  archivedAt: Date | null;
  archivedByAccountId: string | null;
}

export interface CreatePracticeDocumentInput {
  workspaceId: string;
  patientId: string;
  type: DocumentType;
  content: string;
  createdByAccountId: string;
  createdByName: string;
}

interface CreatePracticeDocumentDeps {
  now: Date;
  createId: () => string;
}

export function createPracticeDocument(
  input: CreatePracticeDocumentInput,
  deps: CreatePracticeDocumentDeps,
): PracticeDocument {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    patientId: input.patientId,
    type: input.type,
    content: input.content,
    createdByAccountId: input.createdByAccountId,
    createdByName: input.createdByName,
    createdAt: deps.now,
    updatedAt: deps.now,
    editedAt: null,
    archivedAt: null,
    archivedByAccountId: null,
  };
}

export interface UpdatePracticeDocumentInput {
  content: string;
}

interface UpdatePracticeDocumentDeps {
  now: Date;
}

export function updatePracticeDocument(
  existing: PracticeDocument,
  updates: UpdatePracticeDocumentInput,
  deps: UpdatePracticeDocumentDeps,
): PracticeDocument {
  return {
    ...existing,
    content: updates.content,
    updatedAt: deps.now,
    editedAt: deps.now,
  };
}

interface ArchivePracticeDocumentDeps {
  now: Date;
}

export function archivePracticeDocument(
  existing: PracticeDocument,
  archivedByAccountId: string,
  deps: ArchivePracticeDocumentDeps,
): PracticeDocument {
  return {
    ...existing,
    archivedAt: deps.now,
    archivedByAccountId,
    updatedAt: deps.now,
  };
}
