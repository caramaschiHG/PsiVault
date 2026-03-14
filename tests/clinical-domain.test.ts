import { describe, it, expect } from "vitest";

describe("clinical domain", () => {
  describe("CLIN-01: createClinicalNote — basic creation", () => {
    it("creates a note with createdAt equal to updatedAt and editedAt null", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");

      const now = new Date("2026-03-14T10:00:00.000Z");
      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_1",
          freeText: "Paciente relatou melhora do humor.",
        },
        { now, createId: () => "note_1" },
      );

      expect(note.id).toBe("note_1");
      expect(note.workspaceId).toBe("ws_1");
      expect(note.patientId).toBe("pat_1");
      expect(note.appointmentId).toBe("appt_1");
      expect(note.freeText).toBe("Paciente relatou melhora do humor.");
      expect(note.createdAt).toEqual(now);
      expect(note.updatedAt).toEqual(now);
      expect(note.editedAt).toBeNull();
    });
  });

  describe("CLIN-02: createClinicalNote — structured fields default to null", () => {
    it("produces null for all structured fields when only freeText is provided", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");

      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_2",
          freeText: "Sessão produtiva.",
        },
        { now: new Date("2026-03-14T10:00:00.000Z"), createId: () => "note_2" },
      );

      expect(note.demand).toBeNull();
      expect(note.observedMood).toBeNull();
      expect(note.themes).toBeNull();
      expect(note.clinicalEvolution).toBeNull();
      expect(note.nextSteps).toBeNull();
    });
  });

  describe("CLIN-03: createClinicalNote — all structured fields provided", () => {
    it("persists each structured field as a non-null string", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");

      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_3",
          freeText: "Sessão completa com todas as seções preenchidas.",
          demand: "Ansiedade generalizada.",
          observedMood: "Humor ansioso, levemente agitado.",
          themes: "Trabalho, relacionamentos.",
          clinicalEvolution: "Melhora gradual com técnicas de respiração.",
          nextSteps: "Continuar exercícios de mindfulness.",
        },
        { now: new Date("2026-03-14T10:00:00.000Z"), createId: () => "note_3" },
      );

      expect(note.demand).toBe("Ansiedade generalizada.");
      expect(note.observedMood).toBe("Humor ansioso, levemente agitado.");
      expect(note.themes).toBe("Trabalho, relacionamentos.");
      expect(note.clinicalEvolution).toBe("Melhora gradual com técnicas de respiração.");
      expect(note.nextSteps).toBe("Continuar exercícios de mindfulness.");
    });
  });

  describe("CLIN-04: updateClinicalNote", () => {
    it("sets editedAt and updatedAt to now while leaving createdAt unchanged", async () => {
      const { createClinicalNote, updateClinicalNote } = await import("../src/lib/clinical/model");

      const createdAt = new Date("2026-03-14T09:00:00.000Z");
      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_4",
          freeText: "Texto inicial.",
        },
        { now: createdAt, createId: () => "note_4" },
      );

      const editedAt = new Date("2026-03-14T11:00:00.000Z");
      const updated = updateClinicalNote(
        note,
        { freeText: "Texto atualizado." },
        { now: editedAt },
      );

      expect(updated.freeText).toBe("Texto atualizado.");
      expect(updated.editedAt).toEqual(editedAt);
      expect(updated.updatedAt).toEqual(editedAt);
      expect(updated.createdAt).toEqual(createdAt);
      expect(updated.id).toBe("note_4");
    });

    it("update preserves unmodified structured fields", async () => {
      const { createClinicalNote, updateClinicalNote } = await import("../src/lib/clinical/model");

      const now = new Date("2026-03-14T09:00:00.000Z");
      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_5",
          freeText: "Sessão.",
          demand: "Ansiedade.",
        },
        { now, createId: () => "note_5" },
      );

      const updated = updateClinicalNote(
        note,
        { observedMood: "Calmo." },
        { now: new Date("2026-03-14T12:00:00.000Z") },
      );

      expect(updated.demand).toBe("Ansiedade.");
      expect(updated.observedMood).toBe("Calmo.");
    });
  });

  describe("CLIN-04: audit event for note update", () => {
    it("creates audit event with type clinical.note.updated and metadata contains only appointmentId", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createClinicalNoteAuditEvent } = await import("../src/lib/clinical/audit");

      const now = new Date("2026-03-14T10:00:00.000Z");
      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_6",
          freeText: "Conteúdo clínico confidencial.",
          demand: "Dado sensível.",
        },
        { now, createId: () => "note_6" },
      );

      const event = createClinicalNoteAuditEvent(
        {
          type: "clinical.note.updated",
          note,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now, createId: () => "audit_1" },
      );

      expect(event.type).toBe("clinical.note.updated");
      expect(event.subject).toMatchObject({ kind: "clinical_note", id: "note_6" });
      // SECU-05: no clinical content in metadata
      expect(event.metadata).toMatchObject({ appointmentId: "appt_6" });
      expect(event.metadata).not.toHaveProperty("freeText");
      expect(event.metadata).not.toHaveProperty("demand");
      expect(event.metadata).not.toHaveProperty("observedMood");
      expect(event.metadata).not.toHaveProperty("themes");
      expect(event.metadata).not.toHaveProperty("clinicalEvolution");
      expect(event.metadata).not.toHaveProperty("nextSteps");
    });

    it("creates audit event with type clinical.note.created", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createClinicalNoteAuditEvent } = await import("../src/lib/clinical/audit");

      const now = new Date("2026-03-14T10:00:00.000Z");
      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_7",
          freeText: "Primeira evolução.",
        },
        { now, createId: () => "note_7" },
      );

      const event = createClinicalNoteAuditEvent(
        {
          type: "clinical.note.created",
          note,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now, createId: () => "audit_2" },
      );

      expect(event.type).toBe("clinical.note.created");
      expect(event.subject?.kind).toBe("clinical_note");
      expect(event.subject?.id).toBe("note_7");
    });
  });

  describe("CLIN-03/CLIN-04: repository — findByAppointmentId and listByPatient", () => {
    it("saves and retrieves a note by appointmentId", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createInMemoryClinicalRepository } = await import("../src/lib/clinical/repository");

      const repo = createInMemoryClinicalRepository();
      const now = new Date("2026-03-14T10:00:00.000Z");

      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_8",
          freeText: "Evolução da sessão.",
        },
        { now, createId: () => "note_8" },
      );
      repo.save(note);

      const found = repo.findByAppointmentId("appt_8", "ws_1");
      expect(found).not.toBeNull();
      expect(found?.id).toBe("note_8");
      expect(found?.freeText).toBe("Evolução da sessão.");
    });

    it("findByAppointmentId returns null when no note exists for appointmentId", async () => {
      const { createInMemoryClinicalRepository } = await import("../src/lib/clinical/repository");

      const repo = createInMemoryClinicalRepository();
      const found = repo.findByAppointmentId("no-such-appt", "ws_1");
      expect(found).toBeNull();
    });

    it("findByAppointmentId is scoped to workspaceId", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createInMemoryClinicalRepository } = await import("../src/lib/clinical/repository");

      const repo = createInMemoryClinicalRepository();
      const now = new Date("2026-03-14T10:00:00.000Z");

      const note = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          appointmentId: "appt_9",
          freeText: "Nota no workspace 1.",
        },
        { now, createId: () => "note_9" },
      );
      repo.save(note);

      // Different workspace — should not see note
      const found = repo.findByAppointmentId("appt_9", "ws_2");
      expect(found).toBeNull();
    });

    it("listByPatient returns notes sorted by createdAt descending (most recent first)", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createInMemoryClinicalRepository } = await import("../src/lib/clinical/repository");

      const repo = createInMemoryClinicalRepository();

      const oldest = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_2",
          appointmentId: "appt_10",
          freeText: "Primeira sessão.",
        },
        { now: new Date("2026-03-10T10:00:00.000Z"), createId: () => "note_10" },
      );
      const middle = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_2",
          appointmentId: "appt_11",
          freeText: "Segunda sessão.",
        },
        { now: new Date("2026-03-11T10:00:00.000Z"), createId: () => "note_11" },
      );
      const newest = createClinicalNote(
        {
          workspaceId: "ws_1",
          patientId: "pat_2",
          appointmentId: "appt_12",
          freeText: "Terceira sessão.",
        },
        { now: new Date("2026-03-12T10:00:00.000Z"), createId: () => "note_12" },
      );

      repo.save(oldest);
      repo.save(newest);
      repo.save(middle);

      const list = repo.listByPatient("pat_2", "ws_1");
      expect(list).toHaveLength(3);
      expect(list[0].id).toBe("note_12");
      expect(list[1].id).toBe("note_11");
      expect(list[2].id).toBe("note_10");
    });

    it("listByPatient is scoped to workspaceId", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createInMemoryClinicalRepository } = await import("../src/lib/clinical/repository");

      const repo = createInMemoryClinicalRepository();
      const now = new Date("2026-03-14T10:00:00.000Z");

      const ws1Note = createClinicalNote(
        { workspaceId: "ws_1", patientId: "pat_3", appointmentId: "appt_13", freeText: "WS1." },
        { now, createId: () => "note_13" },
      );
      const ws2Note = createClinicalNote(
        { workspaceId: "ws_2", patientId: "pat_3", appointmentId: "appt_14", freeText: "WS2." },
        { now, createId: () => "note_14" },
      );

      repo.save(ws1Note);
      repo.save(ws2Note);

      const ws1List = repo.listByPatient("pat_3", "ws_1");
      expect(ws1List).toHaveLength(1);
      expect(ws1List[0].id).toBe("note_13");
    });

    it("findById retrieves a note by id and workspaceId", async () => {
      const { createClinicalNote } = await import("../src/lib/clinical/model");
      const { createInMemoryClinicalRepository } = await import("../src/lib/clinical/repository");

      const repo = createInMemoryClinicalRepository();
      const now = new Date("2026-03-14T10:00:00.000Z");

      const note = createClinicalNote(
        { workspaceId: "ws_1", patientId: "pat_1", appointmentId: "appt_15", freeText: "Nota." },
        { now, createId: () => "note_15" },
      );
      repo.save(note);

      const found = repo.findById("note_15", "ws_1");
      expect(found).not.toBeNull();
      expect(found?.id).toBe("note_15");

      const notFound = repo.findById("note_15", "ws_2");
      expect(notFound).toBeNull();
    });
  });
});
