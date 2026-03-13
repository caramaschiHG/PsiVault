import { describe, it, expect } from "vitest";

describe("patient domain", () => {
  describe("create patient profile", () => {
    it("creates a patient with essential identity fields", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "Ana Clara Silva",
          email: "ana@example.com",
          phone: "+55 11 91234-5678",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_1" },
      );

      expect(patient).toMatchObject({
        id: "pat_1",
        workspaceId: "ws_1",
        fullName: "Ana Clara Silva",
        email: "ana@example.com",
        phone: "+55 11 91234-5678",
        archivedAt: null,
      });
      expect(patient.createdAt).toEqual(new Date("2026-03-13T10:00:00.000Z"));
    });

    it("trims whitespace from string fields on creation", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "  Ana Clara Silva  ",
          email: "  ana@example.com  ",
          phone: "  +55 11 91234-5678  ",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_2" },
      );

      expect(patient.fullName).toBe("Ana Clara Silva");
      expect(patient.email).toBe("ana@example.com");
      expect(patient.phone).toBe("+55 11 91234-5678");
    });
  });

  describe("optional patient fields", () => {
    it("creates a patient with optional social name", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "Carlos Eduardo Santos",
          socialName: "Carol",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_3" },
      );

      expect(patient.socialName).toBe("Carol");
    });

    it("creates a patient with optional guardian info", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "João Menor",
          guardianName: "Maria Santos",
          guardianPhone: "+55 11 98765-4321",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_4" },
      );

      expect(patient.guardianName).toBe("Maria Santos");
      expect(patient.guardianPhone).toBe("+55 11 98765-4321");
    });

    it("creates a patient with emergency contact", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "Pedro Alves",
          emergencyContactName: "Lucia Alves",
          emergencyContactPhone: "+55 11 97654-3210",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_5" },
      );

      expect(patient.emergencyContactName).toBe("Lucia Alves");
      expect(patient.emergencyContactPhone).toBe("+55 11 97654-3210");
    });

    it("creates a patient with important observations", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "Mariana Ferreira",
          importantObservations: "Paciente com ansiedade severa.",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_6" },
      );

      expect(patient.importantObservations).toBe("Paciente com ansiedade severa.");
    });

    it("sets optional fields to null when not provided", async () => {
      const { createPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        {
          workspaceId: "ws_1",
          fullName: "Minimal Patient",
        },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_7" },
      );

      expect(patient.socialName).toBeNull();
      expect(patient.guardianName).toBeNull();
      expect(patient.guardianPhone).toBeNull();
      expect(patient.emergencyContactName).toBeNull();
      expect(patient.emergencyContactPhone).toBeNull();
      expect(patient.importantObservations).toBeNull();
      expect(patient.email).toBeNull();
      expect(patient.phone).toBeNull();
    });
  });

  describe("archive and recover", () => {
    it("archives a patient with archive metadata", async () => {
      const { createPatient, archivePatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        { workspaceId: "ws_1", fullName: "Ana Clara Silva" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_8" },
      );

      const archived = archivePatient(patient, {
        now: new Date("2026-03-13T15:00:00.000Z"),
        archivedByAccountId: "acct_1",
      });

      expect(archived.archivedAt).toEqual(new Date("2026-03-13T15:00:00.000Z"));
      expect(archived.archivedByAccountId).toBe("acct_1");
      expect(archived.id).toBe("pat_8");
      expect(archived.fullName).toBe("Ana Clara Silva");
    });

    it("recovers an archived patient and clears archive metadata", async () => {
      const { createPatient, archivePatient, recoverPatient } = await import("../src/lib/patients/model");

      const patient = createPatient(
        { workspaceId: "ws_1", fullName: "Ana Clara Silva" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_9" },
      );

      const archived = archivePatient(patient, {
        now: new Date("2026-03-13T15:00:00.000Z"),
        archivedByAccountId: "acct_1",
      });

      const recovered = recoverPatient(archived, {
        now: new Date("2026-03-13T16:00:00.000Z"),
      });

      expect(recovered.archivedAt).toBeNull();
      expect(recovered.archivedByAccountId).toBeNull();
    });

    it("repository separates active from archived patients", async () => {
      const { createPatient, archivePatient } = await import("../src/lib/patients/model");
      const { createInMemoryPatientRepository } = await import("../src/lib/patients/repository");

      const repo = createInMemoryPatientRepository();

      const active1 = createPatient(
        { workspaceId: "ws_1", fullName: "Active Patient" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_10" },
      );

      const toArchive = createPatient(
        { workspaceId: "ws_1", fullName: "To Archive" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_11" },
      );

      repo.save(active1);
      repo.save(toArchive);

      const archived = archivePatient(toArchive, {
        now: new Date("2026-03-13T15:00:00.000Z"),
        archivedByAccountId: "acct_1",
      });
      repo.save(archived);

      const activeList = repo.listActive("ws_1");
      const archivedList = repo.listArchived("ws_1");

      expect(activeList).toHaveLength(1);
      expect(activeList[0].id).toBe("pat_10");
      expect(archivedList).toHaveLength(1);
      expect(archivedList[0].id).toBe("pat_11");
    });

    it("repository finds a patient by id", async () => {
      const { createPatient } = await import("../src/lib/patients/model");
      const { createInMemoryPatientRepository } = await import("../src/lib/patients/repository");

      const repo = createInMemoryPatientRepository();
      const patient = createPatient(
        { workspaceId: "ws_1", fullName: "Find Me" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_12" },
      );
      repo.save(patient);

      const found = repo.findById("pat_12", "ws_1");
      expect(found).not.toBeNull();
      expect(found?.fullName).toBe("Find Me");
    });

    it("repository is scoped to workspace", async () => {
      const { createPatient } = await import("../src/lib/patients/model");
      const { createInMemoryPatientRepository } = await import("../src/lib/patients/repository");

      const repo = createInMemoryPatientRepository();
      const ws1Patient = createPatient(
        { workspaceId: "ws_1", fullName: "WS1 Patient" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_13" },
      );
      const ws2Patient = createPatient(
        { workspaceId: "ws_2", fullName: "WS2 Patient" },
        { now: new Date("2026-03-13T10:00:00.000Z"), createId: () => "pat_14" },
      );
      repo.save(ws1Patient);
      repo.save(ws2Patient);

      const ws1List = repo.listActive("ws_1");
      expect(ws1List).toHaveLength(1);
      expect(ws1List[0].id).toBe("pat_13");
    });
  });

  describe("patient audit helpers", () => {
    it("creates a patient.created audit event", async () => {
      const { createPatient } = await import("../src/lib/patients/model");
      const { createPatientAuditEvent } = await import("../src/lib/patients/audit");

      const now = new Date("2026-03-13T10:00:00.000Z");
      const patient = createPatient(
        { workspaceId: "ws_1", fullName: "Ana Clara Silva" },
        { now, createId: () => "pat_15" },
      );

      const event = createPatientAuditEvent(
        {
          type: "patient.created",
          patient,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now, createId: () => "audit_p1" },
      );

      expect(event).toMatchObject({
        id: "audit_p1",
        type: "patient.created",
        actor: { accountId: "acct_1", workspaceId: "ws_1" },
        subject: { kind: "patient", id: "pat_15" },
      });
    });

    it("creates a patient.archived audit event", async () => {
      const { createPatient, archivePatient } = await import("../src/lib/patients/model");
      const { createPatientAuditEvent } = await import("../src/lib/patients/audit");

      const now = new Date("2026-03-13T10:00:00.000Z");
      const archiveNow = new Date("2026-03-13T15:00:00.000Z");
      const patient = createPatient(
        { workspaceId: "ws_1", fullName: "Ana Clara Silva" },
        { now, createId: () => "pat_16" },
      );
      const archived = archivePatient(patient, {
        now: archiveNow,
        archivedByAccountId: "acct_1",
      });

      const event = createPatientAuditEvent(
        {
          type: "patient.archived",
          patient: archived,
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now: archiveNow, createId: () => "audit_p2" },
      );

      expect(event.type).toBe("patient.archived");
      expect(event.subject?.kind).toBe("patient");
      expect(event.subject?.id).toBe("pat_16");
    });

    it("creates a patient.recovered audit event", async () => {
      const { createPatientAuditEvent } = await import("../src/lib/patients/audit");

      const now = new Date("2026-03-13T16:00:00.000Z");
      const event = createPatientAuditEvent(
        {
          type: "patient.recovered",
          patient: {
            id: "pat_17",
            workspaceId: "ws_1",
            fullName: "Ana Clara Silva",
            socialName: null,
            email: null,
            phone: null,
            guardianName: null,
            guardianPhone: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
            importantObservations: null,
            archivedAt: null,
            archivedByAccountId: null,
            createdAt: new Date("2026-03-13T10:00:00.000Z"),
            updatedAt: new Date("2026-03-13T16:00:00.000Z"),
          },
          actor: { accountId: "acct_1", workspaceId: "ws_1" },
        },
        { now, createId: () => "audit_p3" },
      );

      expect(event.type).toBe("patient.recovered");
    });
  });
});
