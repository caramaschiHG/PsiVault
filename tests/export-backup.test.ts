// Wave 0 scaffold — implementation created in Plan 06-04 (export)

/**
 * Tests for export serializer: buildPatientExport, buildWorkspaceBackup, validateBackupSchema
 *
 * Coverage requirements:
 * - SECU-03: per-patient data export
 * - SECU-04: full workspace backup + backup verification
 *
 * These tests will FAIL with import errors until Plan 06-04 creates
 * src/lib/export/serializer.ts. That is the expected Wave 0 state.
 */

import { describe, it, expect } from "vitest";
import {
  buildPatientExport,
  buildWorkspaceBackup,
  validateBackupSchema,
} from "../src/lib/export/serializer";
import type { Patient } from "../src/lib/patients/model";
import type { Appointment } from "../src/lib/appointments/model";
import type { ClinicalNote } from "../src/lib/clinical/model";
import type { PracticeDocument } from "../src/lib/documents/model";
import type { SessionCharge } from "../src/lib/finance/model";
import type { AuditEvent } from "../src/lib/audit/events";

// ─── fixtures ───────────────────────────────────────────────────────────────

const now = new Date("2026-03-15T10:00:00.000Z");

const patient: Patient = {
  id: "pat_1",
  workspaceId: "ws_1",
  fullName: "Ana Lima",
  socialName: null,
  email: "ana@example.com",
  phone: null,
  reminderPhone: null,
  preferredReminderTime: null,
  guardianName: null,
  guardianPhone: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  importantObservations: null,
  archivedAt: null,
  archivedByAccountId: null,
  createdAt: now,
  updatedAt: now,
  sessionPriceInCents: null,
};

const appointment: Appointment = {
  id: "appt_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  startsAt: now,
  endsAt: new Date(now.getTime() + 50 * 60_000),
  durationMinutes: 50,
  careMode: "IN_PERSON",
  status: "COMPLETED",
  seriesId: null,
  seriesIndex: null,
  rescheduledFromId: null,
  canceledAt: null,
  canceledByAccountId: null,
  canceledBy: null,
  seriesPattern: null,
  seriesDaysOfWeek: [],
  confirmedAt: null,
  completedAt: now,
  noShowAt: null,
  priceInCents: 20000,
  meetingLink: null,
  remoteIssueNote: null,
  createdAt: now,
  updatedAt: now,
};

const note: ClinicalNote = {
  id: "note_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  appointmentId: "appt_1",
  freeText: "Paciente relatou melhora.",
  demand: null,
  observedMood: null,
  themes: null,
  clinicalEvolution: null,
  nextSteps: null,
  createdAt: now,
  updatedAt: now,
  editedAt: null,
};

const document: PracticeDocument = {
  id: "doc_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  type: "receipt",
  content: "Recibo de sessão",
  createdByAccountId: "acct_1",
  createdByName: "Dra. Silva",
  createdAt: now,
  updatedAt: now,
  editedAt: null,
  archivedAt: null,
  archivedByAccountId: null,
  status: "finalized",
  appointmentId: null,
  signedAt: null,
  signedByAccountId: null,
  deliveredAt: null,
  deliveredTo: null,
  deliveredVia: null,
};

const charge: SessionCharge = {
  id: "charge_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  appointmentId: "appt_1",
  status: "pago",
  amountInCents: 20000,
  paymentMethod: "pix",
  paidAt: now,
  createdAt: now,
  updatedAt: now,
};

const auditEvent: AuditEvent = {
  id: "audit_1",
  type: "security.session.revoked",
  occurredAt: now,
  actor: { accountId: "acct_1", workspaceId: "ws_1", sessionId: "sess_1" },
  summary: "Sessão encerrada.",
  metadata: {},
};

// ─── buildPatientExport ──────────────────────────────────────────────────────

describe("buildPatientExport", () => {
  it("returns version 1.0", () => {
    const result = buildPatientExport({
      patient,
      appointments: [appointment],
      clinicalNotes: [note],
      documents: [document],
      charges: [charge],
      now,
    });
    expect(result.version).toBe("1.0");
  });

  it("sets exportedAt to now.toISOString()", () => {
    const result = buildPatientExport({
      patient,
      appointments: [],
      clinicalNotes: [],
      documents: [],
      charges: [],
      now,
    });
    expect(result.exportedAt).toBe(now.toISOString());
  });

  it("passes through all domain arrays unchanged", () => {
    const result = buildPatientExport({
      patient,
      appointments: [appointment],
      clinicalNotes: [note],
      documents: [document],
      charges: [charge],
      now,
    });
    expect(result.patient).toBe(patient);
    expect(result.appointments).toEqual([appointment]);
    expect(result.clinicalNotes).toEqual([note]);
    expect(result.documents).toEqual([document]);
    expect(result.charges).toEqual([charge]);
  });

  it("excludes private session records from patient export", () => {
    const privateDocument: PracticeDocument = {
      ...document,
      id: "doc_private_1",
      type: "session_record",
      content: "<p>Privado</p>",
    };

    const result = buildPatientExport({
      patient,
      appointments: [appointment],
      clinicalNotes: [note],
      documents: [document, privateDocument],
      charges: [charge],
      now,
    });

    expect(result.documents).toEqual([document]);
  });

  it("works with empty arrays", () => {
    const result = buildPatientExport({
      patient,
      appointments: [],
      clinicalNotes: [],
      documents: [],
      charges: [],
      now,
    });
    expect(result.appointments).toEqual([]);
    expect(result.clinicalNotes).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.charges).toEqual([]);
  });

  it("result has no extra fields beyond PatientExport interface", () => {
    const result = buildPatientExport({
      patient,
      appointments: [],
      clinicalNotes: [],
      documents: [],
      charges: [],
      now,
    });
    const keys = Object.keys(result).sort();
    expect(keys).toEqual(
      ["appointments", "charges", "clinicalNotes", "documents", "exportedAt", "patient", "version"].sort(),
    );
  });
});

// ─── buildWorkspaceBackup ────────────────────────────────────────────────────

describe("buildWorkspaceBackup", () => {
  it("returns version 1.0", () => {
    const result = buildWorkspaceBackup({
      workspaceId: "ws_1",
      patients: [patient],
      appointments: [appointment],
      clinicalNotes: [note],
      documents: [document],
      charges: [charge],
      auditEvents: [auditEvent],
      now,
    });
    expect(result.version).toBe("1.0");
  });

  it("sets exportedAt to now.toISOString()", () => {
    const result = buildWorkspaceBackup({
      workspaceId: "ws_1",
      patients: [],
      appointments: [],
      clinicalNotes: [],
      documents: [],
      charges: [],
      auditEvents: [],
      now,
    });
    expect(result.exportedAt).toBe(now.toISOString());
  });

  it("includes workspaceId", () => {
    const result = buildWorkspaceBackup({
      workspaceId: "ws_1",
      patients: [],
      appointments: [],
      clinicalNotes: [],
      documents: [],
      charges: [],
      auditEvents: [],
      now,
    });
    expect(result.workspaceId).toBe("ws_1");
  });

  it("passes through all domain arrays including auditEvents", () => {
    const result = buildWorkspaceBackup({
      workspaceId: "ws_1",
      patients: [patient],
      appointments: [appointment],
      clinicalNotes: [note],
      documents: [document],
      charges: [charge],
      auditEvents: [auditEvent],
      now,
    });
    expect(result.patients).toEqual([patient]);
    expect(result.appointments).toEqual([appointment]);
    expect(result.clinicalNotes).toEqual([note]);
    expect(result.documents).toEqual([document]);
    expect(result.charges).toEqual([charge]);
    expect(result.auditEvents).toEqual([auditEvent]);
  });

  it("excludes private session records from workspace backup", () => {
    const privateDocument: PracticeDocument = {
      ...document,
      id: "doc_private_backup",
      type: "session_record",
      content: "<p>Privado</p>",
    };

    const result = buildWorkspaceBackup({
      workspaceId: "ws_1",
      patients: [patient],
      appointments: [appointment],
      clinicalNotes: [note],
      documents: [document, privateDocument],
      charges: [charge],
      auditEvents: [auditEvent],
      now,
    });

    expect(result.documents).toEqual([document]);
  });
});

// ─── validateBackupSchema ────────────────────────────────────────────────────

describe("validateBackupSchema", () => {
  const validBackup = {
    version: "1.0",
    exportedAt: now.toISOString(),
    workspaceId: "ws_1",
    patients: [],
    appointments: [],
    clinicalNotes: [],
    documents: [],
    charges: [],
    auditEvents: [],
  };

  it("returns true for a valid WorkspaceBackup shape", () => {
    expect(validateBackupSchema(validBackup)).toBe(true);
  });

  it("returns false for null", () => {
    expect(validateBackupSchema(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(validateBackupSchema(undefined)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(validateBackupSchema("not a backup")).toBe(false);
  });

  it("returns false for a number", () => {
    expect(validateBackupSchema(42)).toBe(false);
  });

  it("returns false for an array", () => {
    expect(validateBackupSchema([])).toBe(false);
  });

  it("returns false when version is missing", () => {
    const { version: _v, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when workspaceId is missing", () => {
    const { workspaceId: _w, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when patients is missing", () => {
    const { patients: _p, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when appointments is missing", () => {
    const { appointments: _a, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when clinicalNotes is missing", () => {
    const { clinicalNotes: _cn, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when documents is missing", () => {
    const { documents: _d, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when charges is missing", () => {
    const { charges: _c, ...rest } = validBackup;
    expect(validateBackupSchema(rest)).toBe(false);
  });

  it("returns false when patients is not an array", () => {
    expect(validateBackupSchema({ ...validBackup, patients: "[]" })).toBe(false);
  });

  it("returns false when appointments is not an array", () => {
    expect(validateBackupSchema({ ...validBackup, appointments: null })).toBe(false);
  });

  it("returns false when clinicalNotes is not an array", () => {
    expect(validateBackupSchema({ ...validBackup, clinicalNotes: {} })).toBe(false);
  });

  it("returns false when documents is not an array", () => {
    expect(validateBackupSchema({ ...validBackup, documents: 0 })).toBe(false);
  });

  it("returns false when charges is not an array", () => {
    expect(validateBackupSchema({ ...validBackup, charges: false })).toBe(false);
  });

  it("does NOT validate content of nested objects — structural check only", () => {
    // Even with nonsense values inside arrays, should pass structural check
    expect(
      validateBackupSchema({
        ...validBackup,
        patients: [{ id: "wrong_shape" }],
        appointments: [42, "bad"],
      }),
    ).toBe(true);
  });
});
