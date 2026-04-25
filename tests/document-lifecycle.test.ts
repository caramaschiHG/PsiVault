import { describe, it, expect } from "vitest";
import {
  createPracticeDocument,
  createDraftDocument,
  updatePracticeDocument,
  archivePracticeDocument,
  finalizeDocument,
  signDocument,
  deliverDocument,
  canEditDocument,
  canFinalizeDocument,
  canSignDocument,
  canDeliverDocument,
  canArchiveDocument,
  type DocumentStatus,
} from "../src/lib/documents/model";
import { createDocumentId } from "../src/lib/documents/id";

const now = new Date("2026-04-25T14:00:00Z");
const createId = createDocumentId;

function baseInput() {
  return {
    workspaceId: "ws_test",
    patientId: "pat_test",
    type: "session_record" as const,
    content: "<p>Conteúdo de teste</p>",
    createdByAccountId: "acct_test",
    createdByName: "Dra. Teste",
  };
}

describe("document lifecycle — Phase 37", () => {
  describe("createPracticeDocument", () => {
    it("creates with status finalized by default", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      expect(doc.status).toBe("finalized");
      expect(doc.appointmentId).toBeNull();
      expect(doc.signedAt).toBeNull();
      expect(doc.deliveredAt).toBeNull();
    });

    it("creates with appointmentId when provided", () => {
      const doc = createPracticeDocument(
        { ...baseInput(), appointmentId: "appt_123" },
        { now, createId },
      );
      expect(doc.appointmentId).toBe("appt_123");
    });

    it("generates id with doc_ prefix", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      expect(doc.id).toMatch(/^doc_[a-f0-9]{32}$/);
    });
  });

  describe("createDraftDocument", () => {
    it("creates with status draft", () => {
      const doc = createDraftDocument(baseInput(), { now, createId });
      expect(doc.status).toBe("draft");
      expect(doc.archivedAt).toBeNull();
    });
  });

  describe("archivePracticeDocument", () => {
    it("sets status to archived", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      const archived = archivePracticeDocument(doc, "acct_test", { now });
      expect(archived.status).toBe("archived");
      expect(archived.archivedAt).toEqual(now);
    });
  });

  describe("state transitions", () => {
    it("draft → finalized", () => {
      const doc = createDraftDocument(baseInput(), { now, createId });
      const finalized = finalizeDocument(doc, { now });
      expect(finalized.status).toBe("finalized");
    });

    it("finalized → signed", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      const signed = signDocument(doc, "acct_test", { now });
      expect(signed.status).toBe("signed");
      expect(signed.signedAt).toEqual(now);
      expect(signed.signedByAccountId).toBe("acct_test");
    });

    it("signed → delivered", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      const signed = signDocument(doc, "acct_test", { now });
      const delivered = deliverDocument(
        signed,
        "acct_test",
        { to: "paciente@email.com", via: "email" },
        { now },
      );
      expect(delivered.status).toBe("delivered");
      expect(delivered.deliveredTo).toBe("paciente@email.com");
      expect(delivered.deliveredVia).toBe("email");
    });

    it("throws on invalid transition: finalized → delivered", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      expect(() =>
        deliverDocument(
          doc,
          "acct_test",
          { to: "x", via: "email" },
          { now },
        ),
      ).toThrow("signed");
    });

    it("throws on invalid transition: draft → signed", () => {
      const doc = createDraftDocument(baseInput(), { now, createId });
      expect(() => signDocument(doc, "acct_test", { now })).toThrow("finalized");
    });

    it("throws on invalid transition: signed → finalized", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      const signed = signDocument(doc, "acct_test", { now });
      expect(() => finalizeDocument(signed, { now })).toThrow("draft");
    });
  });

  describe("guards", () => {
    it("canEditDocument allows draft and finalized", () => {
      const draft = createDraftDocument(baseInput(), { now, createId });
      const finalized = createPracticeDocument(baseInput(), { now, createId });
      const signed = signDocument(finalized, "acct_test", { now });

      expect(canEditDocument(draft)).toBe(true);
      expect(canEditDocument(finalized)).toBe(true);
      expect(canEditDocument(signed)).toBe(false);
    });

    it("canFinalizeDocument only for draft", () => {
      const draft = createDraftDocument(baseInput(), { now, createId });
      const finalized = createPracticeDocument(baseInput(), { now, createId });

      expect(canFinalizeDocument(draft)).toBe(true);
      expect(canFinalizeDocument(finalized)).toBe(false);
    });

    it("canSignDocument only for finalized", () => {
      const finalized = createPracticeDocument(baseInput(), { now, createId });
      const signed = signDocument(finalized, "acct_test", { now });

      expect(canSignDocument(finalized)).toBe(true);
      expect(canSignDocument(signed)).toBe(false);
    });

    it("canDeliverDocument only for signed", () => {
      const finalized = createPracticeDocument(baseInput(), { now, createId });
      const signed = signDocument(finalized, "acct_test", { now });
      const delivered = deliverDocument(
        signed,
        "acct_test",
        { to: "x", via: "email" },
        { now },
      );

      expect(canDeliverDocument(signed)).toBe(true);
      expect(canDeliverDocument(delivered)).toBe(false);
    });

    it("canArchiveDocument blocks archived", () => {
      const doc = createPracticeDocument(baseInput(), { now, createId });
      const archived = archivePracticeDocument(doc, "acct_test", { now });

      expect(canArchiveDocument(doc)).toBe(true);
      expect(canArchiveDocument(archived)).toBe(false);
    });
  });
});
