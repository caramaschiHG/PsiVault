// Wave 0 scaffold — implementation created in Plan 06-03 (search)

/**
 * Search domain unit tests.
 *
 * Coverage requirements:
 * - SRCH-01: patient search by partial name (case-insensitive)
 * - SRCH-02: cross-entity search (sessions, documents, charges) scoped to workspace
 * - SECU-05: sensitive fields must NOT appear in search results
 *   (freeText absent from session results, amountInCents absent from charge results,
 *    document body absent from document results)
 *
 * These tests will FAIL with import errors until Plan 06-03 creates
 * src/lib/search/search.ts. That is the expected Wave 0 state.
 */

import { describe, it, expect } from "vitest";
import { searchAll } from "../src/lib/search/search";
import type { SearchResultItem } from "../src/lib/search/search";
import type { Patient } from "../src/lib/patients/model";
import type { Appointment } from "../src/lib/appointments/model";
import type { ClinicalNote } from "../src/lib/clinical/model";
import type { PracticeDocument } from "../src/lib/documents/model";
import type { SessionCharge } from "../src/lib/finance/model";

// ─── fixtures ───────────────────────────────────────────────────────────────

const NOW = new Date("2026-03-15T10:00:00Z");

const patient: Patient = {
  id: "pat_1",
  workspaceId: "ws_1",
  fullName: "Ana Lima",
  socialName: null,
  email: "ana@example.com",
  phone: null,
  guardianName: null,
  guardianPhone: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  importantObservations: null,
  archivedAt: null,
  archivedByAccountId: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const patient2: Patient = {
  ...patient,
  id: "pat_2",
  fullName: "Carlos Souza",
  email: null,
};

const appointment: Appointment = {
  id: "appt_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  startsAt: NOW,
  endsAt: new Date(NOW.getTime() + 50 * 60_000),
  durationMinutes: 50,
  careMode: "IN_PERSON",
  status: "COMPLETED",
  seriesId: null,
  seriesIndex: null,
  rescheduledFromId: null,
  canceledAt: null,
  canceledByAccountId: null,
  confirmedAt: null,
  completedAt: NOW,
  noShowAt: null,
  priceInCents: 20000,
  meetingLink: null,
  remoteIssueNote: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const note: ClinicalNote = {
  id: "note_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  appointmentId: "appt_1",
  freeText: "Paciente relatou melhora significativa.",
  demand: null,
  observedMood: null,
  themes: null,
  clinicalEvolution: null,
  nextSteps: null,
  createdAt: NOW,
  updatedAt: NOW,
  editedAt: null,
};

const document: PracticeDocument = {
  id: "doc_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  type: "receipt",
  content: "Recibo de sessão confidencial",
  createdByAccountId: "acct_1",
  createdByName: "Dra. Silva",
  createdAt: NOW,
  updatedAt: NOW,
  editedAt: null,
  archivedAt: null,
  archivedByAccountId: null,
};

const charge: SessionCharge = {
  id: "charge_1",
  workspaceId: "ws_1",
  patientId: "pat_1",
  appointmentId: "appt_1",
  status: "pago",
  amountInCents: 20000,
  paymentMethod: "pix",
  paidAt: NOW,
  createdAt: NOW,
  updatedAt: NOW,
};

const DATA = {
  workspaceId: "ws_1",
  patients: [patient, patient2],
  appointments: [appointment],
  clinicalNotes: [note],
  documents: [document],
  charges: [charge],
};

// ─── searchAll ───────────────────────────────────────────────────────────────

describe("searchAll", () => {
  it("returns empty results array for empty query", () => {
    const result = searchAll({ ...DATA, query: "" });
    expect(result).toEqual([]);
  });

  it("returns empty results array for whitespace-only query", () => {
    const result = searchAll({ ...DATA, query: "   " });
    expect(result).toEqual([]);
  });

  describe("patient search", () => {
    it("returns patient match for partial name (case-insensitive)", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const patientResults = result.filter((r: SearchResultItem) => r.type === "patient");
      expect(patientResults.length).toBeGreaterThan(0);
      expect(patientResults[0].id).toBe("pat_1");
    });

    it("returns patient match for uppercase query", () => {
      const result = searchAll({ ...DATA, query: "ANA" });
      const patientResults = result.filter((r: SearchResultItem) => r.type === "patient");
      expect(patientResults.length).toBeGreaterThan(0);
    });

    it("does NOT return patient whose name does not match query", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const patientResults = result.filter((r: SearchResultItem) => r.type === "patient");
      const ids = patientResults.map((r: SearchResultItem) => r.id);
      expect(ids).not.toContain("pat_2");
    });

    it("returns multiple patients when multiple match", () => {
      const result = searchAll({ ...DATA, query: "a" }); // matches "Ana" and "Carlos"
      const patientResults = result.filter((r: SearchResultItem) => r.type === "patient");
      expect(patientResults.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("session search (SECU-05)", () => {
    it("returns session result when query matches patient name", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const sessionResults = result.filter((r: SearchResultItem) => r.type === "session");
      expect(sessionResults.length).toBeGreaterThan(0);
    });

    it("freeText field is absent from session search results (SECU-05)", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const sessionResults = result.filter((r: SearchResultItem) => r.type === "session");
      for (const item of sessionResults) {
        expect(item).not.toHaveProperty("freeText");
      }
    });

    it("clinical content does not appear in session result metadata (SECU-05)", () => {
      const result = searchAll({ ...DATA, query: "melhora" }); // word from freeText
      // Should NOT find sessions by clinical note content
      const sessionResults = result.filter((r: SearchResultItem) => r.type === "session");
      // If no sessions found for clinical content query — that is correct behavior
      // If sessions are found, they must be for a different reason (e.g., patient name match)
      for (const item of sessionResults) {
        expect(item).not.toHaveProperty("freeText");
        expect(item).not.toHaveProperty("demand");
        expect(item).not.toHaveProperty("clinicalEvolution");
      }
    });
  });

  describe("document search (SECU-05)", () => {
    it("returns document result when query matches patient name", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const documentResults = result.filter((r: SearchResultItem) => r.type === "document");
      expect(documentResults.length).toBeGreaterThan(0);
    });

    it("document body (content) is absent from document search results (SECU-05)", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const documentResults = result.filter((r: SearchResultItem) => r.type === "document");
      for (const item of documentResults) {
        expect(item).not.toHaveProperty("content");
      }
    });

    it("returns document result when query matches psychoanalytic case study label", () => {
      const result = searchAll({
        ...DATA,
        query: "psicanalítico",
        documents: [
          {
            ...document,
            id: "doc_case_1",
            type: "case_study_psychoanalytic",
          },
        ],
      });

      const documentResults = result.filter((r: SearchResultItem) => r.type === "document");
      expect(documentResults).toHaveLength(1);
      expect(documentResults[0]?.label).toBe("Estudo de caso psicanalítico");
    });
  });

  describe("charge search (SECU-05)", () => {
    it("returns charge result when query matches patient name", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const chargeResults = result.filter((r: SearchResultItem) => r.type === "charge");
      expect(chargeResults.length).toBeGreaterThan(0);
    });

    it("amountInCents is absent from charge search results (SECU-05)", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const chargeResults = result.filter((r: SearchResultItem) => r.type === "charge");
      for (const item of chargeResults) {
        expect(item).not.toHaveProperty("amountInCents");
      }
    });

    it("paymentMethod is absent from charge search results (SECU-05)", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const chargeResults = result.filter((r: SearchResultItem) => r.type === "charge");
      for (const item of chargeResults) {
        expect(item).not.toHaveProperty("paymentMethod");
      }
    });
  });

  describe("result shape", () => {
    it("every result item has at minimum: id, type, label", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      for (const item of result) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("label");
      }
    });

    it("results are grouped — type field identifies each item's domain", () => {
      const result = searchAll({ ...DATA, query: "ana" });
      const types = new Set(result.map((r: SearchResultItem) => r.type));
      // With query "ana", we expect at least patient type to be present
      expect(types.has("patient")).toBe(true);
    });
  });
});
