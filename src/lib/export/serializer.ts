/**
 * Export serializer — pure functions for per-patient export and workspace backup.
 *
 * SECU-03: buildPatientExport — per-patient JSON export
 * SECU-04: buildWorkspaceBackup + validateBackupSchema — full backup and verification
 *
 * All functions are pure (no side effects, no I/O). Callers are responsible
 * for scoping data to the correct workspace/patient before calling these functions.
 */

import type { Patient } from "../patients/model";
import type { Appointment } from "../appointments/model";
import type { ClinicalNote } from "../clinical/model";
import type { PracticeDocument } from "../documents/model";
import type { SessionCharge } from "../finance/model";
import type { AuditEvent } from "../audit/events";
import { canIncludeDocumentInPatientExports } from "../documents/presenter";

// ─── Exported types ──────────────────────────────────────────────────────────

export interface PatientExport {
  exportedAt: string;   // ISO timestamp
  version: "1.0";
  patient: Patient;
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  documents: PracticeDocument[];
  charges: SessionCharge[];
}

export interface WorkspaceBackup {
  exportedAt: string;   // ISO timestamp
  version: "1.0";
  workspaceId: string;
  patients: Patient[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  documents: PracticeDocument[];
  charges: SessionCharge[];
  auditEvents: AuditEvent[];
}

// ─── Serializer functions ────────────────────────────────────────────────────

/**
 * Build a per-patient export object.
 * Caller is responsible for passing only records that belong to the target patient.
 */
export function buildPatientExport(input: {
  patient: Patient;
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  documents: PracticeDocument[];
  charges: SessionCharge[];
  now: Date;
}): PatientExport {
  return {
    version: "1.0",
    exportedAt: input.now.toISOString(),
    patient: input.patient,
    appointments: input.appointments,
    clinicalNotes: input.clinicalNotes,
    documents: input.documents.filter((document) => canIncludeDocumentInPatientExports(document.type)),
    charges: input.charges,
  };
}

/**
 * Build a full workspace backup object.
 * Caller is responsible for passing all workspace-scoped records.
 */
export function buildWorkspaceBackup(input: {
  workspaceId: string;
  patients: Patient[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  documents: PracticeDocument[];
  charges: SessionCharge[];
  auditEvents: AuditEvent[];
  now: Date;
}): WorkspaceBackup {
  return {
    version: "1.0",
    exportedAt: input.now.toISOString(),
    workspaceId: input.workspaceId,
    patients: input.patients,
    appointments: input.appointments,
    clinicalNotes: input.clinicalNotes,
    documents: input.documents.filter((document) => canIncludeDocumentInPatientExports(document.type)),
    charges: input.charges,
    auditEvents: input.auditEvents,
  };
}

// ─── Backup validation ───────────────────────────────────────────────────────

const REQUIRED_ARRAY_KEYS = [
  "patients",
  "appointments",
  "clinicalNotes",
  "documents",
  "charges",
] as const;

/**
 * Validate that an unknown value has the structural shape of a WorkspaceBackup.
 *
 * Returns true if:
 * - data is a non-null, non-array object
 * - has "version" key (string presence)
 * - has "workspaceId" key (string presence)
 * - patients, appointments, clinicalNotes, documents, charges are all arrays
 *
 * Returns false for any missing key, wrong type, or non-object input.
 * Does NOT validate the content of nested records — structural check only.
 */
export function validateBackupSchema(data: unknown): boolean {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!("version" in obj)) return false;
  if (!("workspaceId" in obj)) return false;

  for (const key of REQUIRED_ARRAY_KEYS) {
    if (!Array.isArray(obj[key])) return false;
  }

  return true;
}
