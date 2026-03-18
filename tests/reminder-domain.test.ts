import { describe, it, expect } from "vitest";
import {
  createReminder,
  completeReminder,
} from "../src/lib/reminders/model";
import { createInMemoryReminderRepository } from "../src/lib/reminders/repository";
import { createReminderAuditEvent } from "../src/lib/reminders/audit";

let counter = 0;
const makeId = () => `id_${++counter}`;
const NOW = new Date("2026-01-15T10:00:00Z");

const BASE_INPUT = {
  workspaceId: "ws_1",
  title: "Ligar para paciente",
};

describe("reminder domain", () => {
  describe("createReminder", () => {
    it("sets completedAt to null", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.completedAt).toBeNull();
    });

    it("sets createdAt and updatedAt to deps.now", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.createdAt).toEqual(NOW);
      expect(reminder.updatedAt).toEqual(NOW);
    });

    it("copies title from input", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.title).toBe("Ligar para paciente");
    });

    it("copies workspaceId from input", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.workspaceId).toBe("ws_1");
    });

    it("sets id from createId()", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.id).toBeTruthy();
    });

    it("sets dueAt to null when not provided", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.dueAt).toBeNull();
    });

    it("sets dueAt from input when provided", () => {
      const dueAt = new Date("2026-02-01T09:00:00Z");
      const reminder = createReminder({ ...BASE_INPUT, dueAt }, { now: NOW, createId: makeId });
      expect(reminder.dueAt).toEqual(dueAt);
    });

    it("sets link to null when not provided", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      expect(reminder.link).toBeNull();
    });

    it("copies link from input when provided", () => {
      const link = { type: "patient" as const, id: "pat_1" };
      const reminder = createReminder({ ...BASE_INPUT, link }, { now: NOW, createId: makeId });
      expect(reminder.link).toEqual(link);
    });

    it("accepts null dueAt explicitly", () => {
      const reminder = createReminder({ ...BASE_INPUT, dueAt: null }, { now: NOW, createId: makeId });
      expect(reminder.dueAt).toBeNull();
    });

    it("accepts null link explicitly", () => {
      const reminder = createReminder({ ...BASE_INPUT, link: null }, { now: NOW, createId: makeId });
      expect(reminder.link).toBeNull();
    });

    it("accepts all ReminderLink types", () => {
      const types = ["patient", "appointment", "document", "charge"] as const;
      for (const type of types) {
        const reminder = createReminder(
          { ...BASE_INPUT, link: { type, id: "some_id" } },
          { now: NOW, createId: makeId },
        );
        expect(reminder.link?.type).toBe(type);
      }
    });
  });

  describe("completeReminder", () => {
    it("sets completedAt to deps.now", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const completedNow = new Date("2026-01-16T10:00:00Z");
      const completed = completeReminder(reminder, { now: completedNow });
      expect(completed.completedAt).toEqual(completedNow);
    });

    it("sets updatedAt to deps.now", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const completedNow = new Date("2026-01-16T10:00:00Z");
      const completed = completeReminder(reminder, { now: completedNow });
      expect(completed.updatedAt).toEqual(completedNow);
    });

    it("does NOT mutate the original reminder", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const originalCompletedAt = reminder.completedAt;
      completeReminder(reminder, { now: new Date("2026-01-16T10:00:00Z") });
      expect(reminder.completedAt).toBe(originalCompletedAt);
    });

    it("preserves all other fields from original reminder", () => {
      const link = { type: "patient" as const, id: "pat_1" };
      const dueAt = new Date("2026-02-01T09:00:00Z");
      const reminder = createReminder(
        { ...BASE_INPUT, link, dueAt },
        { now: NOW, createId: makeId },
      );
      const completed = completeReminder(reminder, { now: new Date("2026-01-16T10:00:00Z") });
      expect(completed.id).toBe(reminder.id);
      expect(completed.workspaceId).toBe(reminder.workspaceId);
      expect(completed.title).toBe(reminder.title);
      expect(completed.dueAt).toEqual(reminder.dueAt);
      expect(completed.link).toEqual(reminder.link);
      expect(completed.createdAt).toEqual(reminder.createdAt);
    });

    it("is idempotent — sets completedAt to new now even if already completed", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const firstCompleted = completeReminder(reminder, { now: new Date("2026-01-16T10:00:00Z") });
      const secondCompletedNow = new Date("2026-01-17T10:00:00Z");
      const secondCompleted = completeReminder(firstCompleted, { now: secondCompletedNow });
      expect(secondCompleted.completedAt).toEqual(secondCompletedNow);
    });
  });

  describe("ReminderRepository", () => {
    it("save + findById returns the saved reminder", async () => {
      const repo = createInMemoryReminderRepository();
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(reminder);
      const found = await repo.findById(reminder.id, "ws_1");
      expect(found).not.toBeNull();
      expect(found?.id).toBe(reminder.id);
    });

    it("findById returns null for wrong workspaceId", async () => {
      const repo = createInMemoryReminderRepository();
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(reminder);
      const found = await repo.findById(reminder.id, "ws_other");
      expect(found).toBeNull();
    });

    it("findById returns null when id not in store", async () => {
      const repo = createInMemoryReminderRepository();
      const found = await repo.findById("nonexistent_id", "ws_1");
      expect(found).toBeNull();
    });

    it("save with same id overwrites existing entry", async () => {
      const repo = createInMemoryReminderRepository();
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(reminder);
      const updatedReminder = { ...reminder, title: "Titulo atualizado" };
      await repo.save(updatedReminder);
      const found = await repo.findById(reminder.id, "ws_1");
      expect(found?.title).toBe("Titulo atualizado");
    });

    it("listActive returns only reminders with completedAt === null for workspace", async () => {
      const repo = createInMemoryReminderRepository();
      const active = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const completed = completeReminder(
        createReminder(BASE_INPUT, { now: NOW, createId: makeId }),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      await repo.save(active);
      await repo.save(completed);
      const result = await repo.listActive("ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(active.id);
    });

    it("listActive excludes reminders from other workspaces", async () => {
      const repo = createInMemoryReminderRepository();
      const ws1Reminder = createReminder({ ...BASE_INPUT, workspaceId: "ws_1" }, { now: NOW, createId: makeId });
      const ws2Reminder = createReminder({ ...BASE_INPUT, workspaceId: "ws_2" }, { now: NOW, createId: makeId });
      await repo.save(ws1Reminder);
      await repo.save(ws2Reminder);
      const result = await repo.listActive("ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(ws1Reminder.id);
    });

    it("listCompleted returns only reminders with completedAt !== null for workspace", async () => {
      const repo = createInMemoryReminderRepository();
      const active = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const completed = completeReminder(
        createReminder(BASE_INPUT, { now: NOW, createId: makeId }),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      await repo.save(active);
      await repo.save(completed);
      const result = await repo.listCompleted("ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(completed.id);
    });

    it("listCompleted excludes reminders from other workspaces", async () => {
      const repo = createInMemoryReminderRepository();
      const ws1 = completeReminder(
        createReminder({ ...BASE_INPUT, workspaceId: "ws_1" }, { now: NOW, createId: makeId }),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      const ws2 = completeReminder(
        createReminder({ ...BASE_INPUT, workspaceId: "ws_2" }, { now: NOW, createId: makeId }),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      await repo.save(ws1);
      await repo.save(ws2);
      const result = await repo.listCompleted("ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(ws1.id);
    });

    it("listActiveByPatient returns active reminders where link.type === 'patient' and link.id === patientId", async () => {
      const repo = createInMemoryReminderRepository();
      const patientReminder = createReminder(
        { ...BASE_INPUT, link: { type: "patient", id: "pat_1" } },
        { now: NOW, createId: makeId },
      );
      const otherPatientReminder = createReminder(
        { ...BASE_INPUT, link: { type: "patient", id: "pat_2" } },
        { now: NOW, createId: makeId },
      );
      const appointmentReminder = createReminder(
        { ...BASE_INPUT, link: { type: "appointment", id: "pat_1" } },
        { now: NOW, createId: makeId },
      );
      const freeStandingReminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(patientReminder);
      await repo.save(otherPatientReminder);
      await repo.save(appointmentReminder);
      await repo.save(freeStandingReminder);
      const result = await repo.listActiveByPatient("pat_1", "ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(patientReminder.id);
    });

    it("listActiveByPatient excludes completed reminders", async () => {
      const repo = createInMemoryReminderRepository();
      const completed = completeReminder(
        createReminder(
          { ...BASE_INPUT, link: { type: "patient", id: "pat_1" } },
          { now: NOW, createId: makeId },
        ),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      await repo.save(completed);
      const result = await repo.listActiveByPatient("pat_1", "ws_1");
      expect(result).toHaveLength(0);
    });

    it("listCompletedByPatient returns completed reminders for patient", async () => {
      const repo = createInMemoryReminderRepository();
      const completed = completeReminder(
        createReminder(
          { ...BASE_INPUT, link: { type: "patient", id: "pat_1" } },
          { now: NOW, createId: makeId },
        ),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      const active = createReminder(
        { ...BASE_INPUT, link: { type: "patient", id: "pat_1" } },
        { now: NOW, createId: makeId },
      );
      await repo.save(completed);
      await repo.save(active);
      const result = await repo.listCompletedByPatient("pat_1", "ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(completed.id);
    });

    it("listCompletedByPatient excludes reminders from other workspaces", async () => {
      const repo = createInMemoryReminderRepository();
      const ws1 = completeReminder(
        createReminder(
          { workspaceId: "ws_1", title: "R1", link: { type: "patient", id: "pat_1" } },
          { now: NOW, createId: makeId },
        ),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      const ws2 = completeReminder(
        createReminder(
          { workspaceId: "ws_2", title: "R2", link: { type: "patient", id: "pat_1" } },
          { now: NOW, createId: makeId },
        ),
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      await repo.save(ws1);
      await repo.save(ws2);
      const result = await repo.listCompletedByPatient("pat_1", "ws_1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(ws1.id);
    });
  });

  describe("createReminderAuditEvent (SECU-05)", () => {
    it("metadata contains reminderId and workspaceId only", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const event = createReminderAuditEvent(
        {
          eventType: "reminder.created",
          reminderId: reminder.id,
          workspaceId: "ws_1",
          accountId: "acct_1",
          now: NOW,
        },
      );
      expect(event.metadata).toHaveProperty("reminderId");
      expect(event.metadata).toHaveProperty("workspaceId");
      expect(event.metadata).not.toHaveProperty("title");
    });

    it("metadata does NOT include title (SECU-05)", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const event = createReminderAuditEvent(
        {
          eventType: "reminder.created",
          reminderId: reminder.id,
          workspaceId: "ws_1",
          accountId: "acct_1",
          now: NOW,
        },
      );
      expect(event.metadata).not.toHaveProperty("title");
    });

    it("type is 'reminder.created' or 'reminder.completed'", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const created = createReminderAuditEvent(
        {
          eventType: "reminder.created",
          reminderId: reminder.id,
          workspaceId: "ws_1",
          accountId: "acct_1",
          now: NOW,
        },
      );
      expect(created.type).toBe("reminder.created");

      const completed = createReminderAuditEvent(
        {
          eventType: "reminder.completed",
          reminderId: reminder.id,
          workspaceId: "ws_1",
          accountId: "acct_1",
          now: NOW,
        },
      );
      expect(completed.type).toBe("reminder.completed");
    });

    it("subject.kind is 'reminder'", () => {
      const reminder = createReminder(BASE_INPUT, { now: NOW, createId: makeId });
      const event = createReminderAuditEvent(
        {
          eventType: "reminder.created",
          reminderId: reminder.id,
          workspaceId: "ws_1",
          accountId: "acct_1",
          now: NOW,
        },
      );
      expect(event.subject?.kind).toBe("reminder");
    });
  });
});
