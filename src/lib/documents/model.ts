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
  | "session_record"
  | "referral_letter"
  | "patient_record_summary";

export const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "declaration_of_attendance",
  "receipt",
  "anamnesis",
  "psychological_report",
  "consent_and_service_contract",
  "session_note",
  "session_record",
  "referral_letter",
  "patient_record_summary",
];

export type DocumentStatus =
  | "draft"
  | "finalized"
  | "signed"
  | "delivered"
  | "archived";

export const VALID_STATUSES: DocumentStatus[] = [
  "draft",
  "finalized",
  "signed",
  "delivered",
  "archived",
];

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

  // Phase 37: lifecycle status
  status: DocumentStatus;

  // Phase 37: optional appointment linkage
  appointmentId: string | null;

  // Phase 37: signing snapshot (immutable after signed)
  signedAt: Date | null;
  signedByAccountId: string | null;

  // Phase 37: delivery record (immutable after delivered)
  deliveredAt: Date | null;
  deliveredTo: string | null;
  deliveredVia: string | null;
}

export interface CreatePracticeDocumentInput {
  workspaceId: string;
  patientId: string;
  type: DocumentType;
  content: string;
  createdByAccountId: string;
  createdByName: string;
  appointmentId?: string | null;
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
    status: "finalized",
    appointmentId: input.appointmentId ?? null,
    signedAt: null,
    signedByAccountId: null,
    deliveredAt: null,
    deliveredTo: null,
    deliveredVia: null,
  };
}

export function createDraftDocument(
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
    status: "draft",
    appointmentId: input.appointmentId ?? null,
    signedAt: null,
    signedByAccountId: null,
    deliveredAt: null,
    deliveredTo: null,
    deliveredVia: null,
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
    status: "archived",
    updatedAt: deps.now,
  };
}

// ── State transition factories ──────────────────────────────────────────────

interface StateTransitionDeps {
  now: Date;
}

export function finalizeDocument(
  existing: PracticeDocument,
  deps: StateTransitionDeps,
): PracticeDocument {
  if (existing.status !== "draft") {
    throw new Error(
      `Cannot finalize document with status '${existing.status}'. Only 'draft' can be finalized.`,
    );
  }
  return {
    ...existing,
    status: "finalized",
    updatedAt: deps.now,
  };
}

export function signDocument(
  existing: PracticeDocument,
  signedByAccountId: string,
  deps: StateTransitionDeps,
): PracticeDocument {
  if (existing.status !== "finalized") {
    throw new Error(
      `Cannot sign document with status '${existing.status}'. Only 'finalized' can be signed.`,
    );
  }
  return {
    ...existing,
    status: "signed",
    signedAt: deps.now,
    signedByAccountId,
    updatedAt: deps.now,
  };
}

export interface DeliverDocumentInput {
  to: string;
  via: "whatsapp" | "email" | "print" | "in_person";
}

export function deliverDocument(
  existing: PracticeDocument,
  deliveredByAccountId: string,
  input: DeliverDocumentInput,
  deps: StateTransitionDeps,
): PracticeDocument {
  if (existing.status !== "signed") {
    throw new Error(
      `Cannot deliver document with status '${existing.status}'. Only 'signed' can be delivered.`,
    );
  }
  return {
    ...existing,
    status: "delivered",
    deliveredAt: deps.now,
    deliveredTo: input.to,
    deliveredVia: input.via,
    updatedAt: deps.now,
  };
}

// ── Guards ──────────────────────────────────────────────────────────────────

export function canEditDocument(doc: PracticeDocument): boolean {
  return doc.status === "draft" || doc.status === "finalized";
}

export function canFinalizeDocument(doc: PracticeDocument): boolean {
  return doc.status === "draft";
}

export function canSignDocument(doc: PracticeDocument): boolean {
  return doc.status === "finalized";
}

export function canDeliverDocument(doc: PracticeDocument): boolean {
  return doc.status === "signed";
}

export function canArchiveDocument(doc: PracticeDocument): boolean {
  return doc.status !== "archived";
}
