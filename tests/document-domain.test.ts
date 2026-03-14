import { describe, it, expect } from "vitest";
import { createPracticeDocument, updatePracticeDocument, archivePracticeDocument } from "../src/lib/documents/model";
import { createInMemoryDocumentRepository } from "../src/lib/documents/repository";
import { buildDocumentContent } from "../src/lib/documents/templates";
import { createDocumentAuditEvent } from "../src/lib/documents/audit";

let counter = 0;
const makeId = () => `id_${++counter}`;
const NOW = new Date("2026-01-15T10:00:00Z");

describe("document domain", () => {
  describe("createPracticeDocument", () => {
    it("creates document with all required fields set correctly", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "anamnesis",
          content: "Conteúdo da anamnese.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      expect(doc.workspaceId).toBe("ws_1");
      expect(doc.patientId).toBe("pat_1");
      expect(doc.type).toBe("anamnesis");
      expect(doc.content).toBe("Conteúdo da anamnese.");
      expect(doc.createdByAccountId).toBe("acct_1");
      expect(doc.createdByName).toBe("Dra. Ana Silva");
      expect(doc.id).toBeTruthy();
    });

    it("editedAt is null on creation", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "receipt",
          content: "Recibo.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      expect(doc.editedAt).toBeNull();
    });

    it("archivedAt and archivedByAccountId are null on creation", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "psychological_report",
          content: "Laudo.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      expect(doc.archivedAt).toBeNull();
      expect(doc.archivedByAccountId).toBeNull();
    });

    it("createdAt and updatedAt both set to deps.now", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "consent_and_service_contract",
          content: "Contrato.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      expect(doc.createdAt).toEqual(NOW);
      expect(doc.updatedAt).toEqual(NOW);
    });
  });

  describe("updatePracticeDocument", () => {
    it("returns new document with updated content", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "anamnesis",
          content: "Conteúdo original.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      const updated = updatePracticeDocument(doc, { content: "Conteúdo atualizado." }, { now: new Date("2026-01-16T10:00:00Z") });

      expect(updated.content).toBe("Conteúdo atualizado.");
    });

    it("sets editedAt to deps.now (not null after update)", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "anamnesis",
          content: "Original.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      const editTime = new Date("2026-01-16T10:00:00Z");
      const updated = updatePracticeDocument(doc, { content: "Editado." }, { now: editTime });

      expect(updated.editedAt).toEqual(editTime);
    });

    it("does not change createdAt", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "anamnesis",
          content: "Original.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      const updated = updatePracticeDocument(doc, { content: "Editado." }, { now: new Date("2026-01-16T10:00:00Z") });

      expect(updated.createdAt).toEqual(NOW);
    });
  });

  describe("archivePracticeDocument", () => {
    it("sets archivedAt to deps.now", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "receipt",
          content: "Recibo.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      const archiveTime = new Date("2026-01-20T10:00:00Z");
      const archived = archivePracticeDocument(doc, "acct_2", { now: archiveTime });

      expect(archived.archivedAt).toEqual(archiveTime);
    });

    it("sets archivedByAccountId to provided accountId", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "receipt",
          content: "Recibo.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      const archived = archivePracticeDocument(doc, "acct_2", { now: new Date("2026-01-20T10:00:00Z") });

      expect(archived.archivedByAccountId).toBe("acct_2");
    });

    it("does not change content or createdAt", () => {
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "receipt",
          content: "Recibo original.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana Silva",
        },
        { now: NOW, createId: makeId },
      );

      const archived = archivePracticeDocument(doc, "acct_2", { now: new Date("2026-01-20T10:00:00Z") });

      expect(archived.content).toBe("Recibo original.");
      expect(archived.createdAt).toEqual(NOW);
    });
  });

  describe("createInMemoryDocumentRepository", () => {
    it("save + findById returns saved document scoped by workspaceId", () => {
      const repo = createInMemoryDocumentRepository();
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "anamnesis",
          content: "Anamnese.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana",
        },
        { now: NOW, createId: makeId },
      );
      repo.save(doc);

      const found = repo.findById(doc.id, "ws_1");
      expect(found).not.toBeNull();
      expect(found?.id).toBe(doc.id);
    });

    it("findById returns null for different workspaceId (workspace isolation)", () => {
      const repo = createInMemoryDocumentRepository();
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          type: "anamnesis",
          content: "Anamnese.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana",
        },
        { now: NOW, createId: makeId },
      );
      repo.save(doc);

      const notFound = repo.findById(doc.id, "ws_2");
      expect(notFound).toBeNull();
    });

    it("listByPatient returns all docs for patient (including archived)", () => {
      const repo = createInMemoryDocumentRepository();
      const active = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_2",
          type: "receipt",
          content: "Recibo.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana",
        },
        { now: NOW, createId: makeId },
      );
      const archived = archivePracticeDocument(
        createPracticeDocument(
          {
            workspaceId: "ws_1",
            patientId: "pat_2",
            type: "anamnesis",
            content: "Anamnese arquivada.",
            createdByAccountId: "acct_1",
            createdByName: "Dra. Ana",
          },
          { now: NOW, createId: makeId },
        ),
        "acct_1",
        { now: new Date("2026-01-20T10:00:00Z") },
      );

      repo.save(active);
      repo.save(archived);

      const list = repo.listByPatient("pat_2", "ws_1");
      expect(list).toHaveLength(2);
    });

    it("listActiveByPatient returns only docs with archivedAt === null", () => {
      const repo = createInMemoryDocumentRepository();
      const active = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_3",
          type: "receipt",
          content: "Recibo ativo.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana",
        },
        { now: NOW, createId: makeId },
      );
      const archived = archivePracticeDocument(
        createPracticeDocument(
          {
            workspaceId: "ws_1",
            patientId: "pat_3",
            type: "anamnesis",
            content: "Anamnese arquivada.",
            createdByAccountId: "acct_1",
            createdByName: "Dra. Ana",
          },
          { now: NOW, createId: makeId },
        ),
        "acct_1",
        { now: new Date("2026-01-20T10:00:00Z") },
      );

      repo.save(active);
      repo.save(archived);

      const activeList = repo.listActiveByPatient("pat_3", "ws_1");
      expect(activeList).toHaveLength(1);
      expect(activeList[0].id).toBe(active.id);
    });

    it("listActiveByPatient excludes archived docs", () => {
      const repo = createInMemoryDocumentRepository();
      const doc = createPracticeDocument(
        {
          workspaceId: "ws_1",
          patientId: "pat_4",
          type: "declaration_of_attendance",
          content: "Declaração.",
          createdByAccountId: "acct_1",
          createdByName: "Dra. Ana",
        },
        { now: NOW, createId: makeId },
      );
      const archivedDoc = archivePracticeDocument(doc, "acct_1", { now: new Date("2026-01-20T10:00:00Z") });
      repo.save(archivedDoc);

      const activeList = repo.listActiveByPatient("pat_4", "ws_1");
      expect(activeList).toHaveLength(0);
    });
  });

  describe("buildDocumentContent", () => {
    const ctx = {
      patientFullName: "João da Silva",
      professionalName: "Dra. Ana Oliveira",
      crp: "CRP 06/12345",
      todayLabel: "15 de janeiro de 2026",
      sessionCount: 10,
      sessionDateRange: "01/03/2025 a 15/01/2026",
      intakeDate: "01/03/2025",
      amountLabel: null,
      paymentMethod: null,
    };

    it("returns non-empty string for 'declaration_of_attendance' and includes required fields", () => {
      const content = buildDocumentContent("declaration_of_attendance", ctx);
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain(ctx.patientFullName);
      expect(content).toContain(ctx.professionalName);
      expect(content).toContain(ctx.crp);
      expect(content).toContain(ctx.todayLabel);
      expect(content).toContain(String(ctx.sessionCount));
      expect(content).toContain(ctx.sessionDateRange!);
    });

    it("returns non-empty string for 'receipt' and includes required fields", () => {
      const content = buildDocumentContent("receipt", ctx);
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain(ctx.patientFullName);
      expect(content).toContain(ctx.professionalName);
      expect(content).toContain(ctx.crp);
      expect(content).toContain(ctx.todayLabel);
      expect(content).toContain("R$ ________");
    });

    it("returns non-empty string for 'anamnesis' and includes intakeDate", () => {
      const content = buildDocumentContent("anamnesis", ctx);
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain(ctx.intakeDate!);
    });

    it("returns non-empty string for 'psychological_report' and includes patientFullName, professionalName, crp", () => {
      const content = buildDocumentContent("psychological_report", ctx);
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain(ctx.patientFullName);
      expect(content).toContain(ctx.professionalName);
      expect(content).toContain(ctx.crp);
    });

    it("returns non-empty string for 'consent_and_service_contract' and includes patientFullName, professionalName, crp", () => {
      const content = buildDocumentContent("consent_and_service_contract", ctx);
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain(ctx.patientFullName);
      expect(content).toContain(ctx.professionalName);
      expect(content).toContain(ctx.crp);
    });
  });

  describe("createDocumentAuditEvent (SECU-05)", () => {
    const doc = {
      id: "doc_1",
      workspaceId: "ws_1",
      patientId: "pat_1",
      type: "anamnesis" as const,
      content: "Conteúdo sensível do documento.",
      createdByAccountId: "acct_1",
      createdByName: "Dra. Ana",
      createdAt: NOW,
      updatedAt: NOW,
      editedAt: null,
      archivedAt: null,
      archivedByAccountId: null,
    };

    it("metadata contains documentType", () => {
      const event = createDocumentAuditEvent(
        {
          type: "document.created",
          document: doc,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now: NOW, createId: makeId },
      );

      expect(event.metadata).toHaveProperty("documentType", "anamnesis");
    });

    it("metadata does NOT contain document content", () => {
      const event = createDocumentAuditEvent(
        {
          type: "document.updated",
          document: doc,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now: NOW, createId: makeId },
      );

      expect(event.metadata).not.toHaveProperty("content");
    });

    it("subject.kind is 'practice_document'", () => {
      const event = createDocumentAuditEvent(
        {
          type: "document.created",
          document: doc,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now: NOW, createId: makeId },
      );

      expect(event.subject?.kind).toBe("practice_document");
    });

    it("type is 'document.created' | 'document.updated' | 'document.archived'", () => {
      const eventCreated = createDocumentAuditEvent(
        { type: "document.created", document: doc, actor: { accountId: "acct_1", workspaceId: "ws_1" } },
        { now: NOW, createId: makeId },
      );
      const eventUpdated = createDocumentAuditEvent(
        { type: "document.updated", document: doc, actor: { accountId: "acct_1", workspaceId: "ws_1" } },
        { now: NOW, createId: makeId },
      );
      const eventArchived = createDocumentAuditEvent(
        { type: "document.archived", document: doc, actor: { accountId: "acct_1", workspaceId: "ws_1" } },
        { now: NOW, createId: makeId },
      );

      expect(eventCreated.type).toBe("document.created");
      expect(eventUpdated.type).toBe("document.updated");
      expect(eventArchived.type).toBe("document.archived");
    });
  });
});
