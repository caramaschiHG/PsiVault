import { describe, it, expect } from "vitest";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAppointment(
  overrides: Partial<{
    id: string;
    workspaceId: string;
    patientId: string;
    startsAt: Date;
    endsAt: Date;
    durationMinutes: number;
    careMode: string;
    status: string;
    seriesId: string | null;
    seriesIndex: number | null;
    rescheduledFromId: string | null;
    canceledAt: Date | null;
    canceledByAccountId: string | null;
    confirmedAt: Date | null;
    completedAt: Date | null;
    noShowAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  const now = new Date("2026-03-13T10:00:00.000Z");
  return {
    id: "appt_1",
    workspaceId: "ws_1",
    patientId: "pat_1",
    startsAt: new Date("2026-03-17T09:00:00.000Z"),
    endsAt: new Date("2026-03-17T10:00:00.000Z"),
    durationMinutes: 60,
    careMode: "IN_PERSON" as const,
    status: "SCHEDULED" as const,
    seriesId: null,
    seriesIndex: null,
    rescheduledFromId: null,
    canceledAt: null,
    canceledByAccountId: null,
    confirmedAt: null,
    completedAt: null,
    noShowAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("appointment domain", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // create appointment occurrence
  // ──────────────────────────────────────────────────────────────────────────
  describe("create appointment occurrence", () => {
    it("creates an appointment with required fields", async () => {
      const { createAppointment } = await import("../src/lib/appointments/model");

      const now = new Date("2026-03-13T10:00:00.000Z");
      const startsAt = new Date("2026-03-17T09:00:00.000Z");
      const appt = createAppointment(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt,
          durationMinutes: 60,
          careMode: "IN_PERSON",
        },
        { now, createId: () => "appt_1" },
      );

      expect(appt.id).toBe("appt_1");
      expect(appt.workspaceId).toBe("ws_1");
      expect(appt.patientId).toBe("pat_1");
      expect(appt.startsAt).toEqual(startsAt);
      expect(appt.durationMinutes).toBe(60);
      expect(appt.careMode).toBe("IN_PERSON");
      expect(appt.status).toBe("SCHEDULED");
    });

    it("derives endsAt from startsAt and durationMinutes", async () => {
      const { createAppointment } = await import("../src/lib/appointments/model");

      const startsAt = new Date("2026-03-17T09:00:00.000Z");
      const appt = createAppointment(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt,
          durationMinutes: 50,
          careMode: "ONLINE",
        },
        { now: new Date(), createId: () => "appt_2" },
      );

      const expectedEndsAt = new Date("2026-03-17T09:50:00.000Z");
      expect(appt.endsAt).toEqual(expectedEndsAt);
    });

    it("rejects invalid care mode values", async () => {
      const { createAppointment } = await import("../src/lib/appointments/model");

      expect(() =>
        createAppointment(
          {
            workspaceId: "ws_1",
            patientId: "pat_1",
            startsAt: new Date("2026-03-17T09:00:00.000Z"),
            durationMinutes: 60,
            careMode: "HYBRID" as never, // HYBRID is a practice setting, not a booking value
          },
          { now: new Date(), createId: () => "appt_3" },
        ),
      ).toThrow();
    });

    it("new appointment starts with SCHEDULED status", async () => {
      const { createAppointment } = await import("../src/lib/appointments/model");

      const appt = createAppointment(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON",
        },
        { now: new Date(), createId: () => "appt_4" },
      );

      expect(appt.status).toBe("SCHEDULED");
      expect(appt.confirmedAt).toBeNull();
      expect(appt.completedAt).toBeNull();
      expect(appt.canceledAt).toBeNull();
      expect(appt.noShowAt).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // hard block overlaps
  // ──────────────────────────────────────────────────────────────────────────
  describe("hard block overlaps", () => {
    it("rejects an appointment that starts inside an existing scheduled appointment", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const existing = makeAppointment({
        id: "appt_existing",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "SCHEDULED",
      });

      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T09:30:00.000Z"),
        endsAt: new Date("2026-03-17T10:30:00.000Z"),
      };

      const result = checkConflicts(candidate, [existing]);
      expect(result.hasConflict).toBe(true);
    });

    it("rejects an appointment that wraps an existing confirmed appointment", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const existing = makeAppointment({
        id: "appt_existing",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "CONFIRMED",
      });

      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T08:30:00.000Z"),
        endsAt: new Date("2026-03-17T10:30:00.000Z"),
      };

      const result = checkConflicts(candidate, [existing]);
      expect(result.hasConflict).toBe(true);
    });

    it("allows adjacent appointments (end equals start)", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const existing = makeAppointment({
        id: "appt_existing",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "SCHEDULED",
      });

      // Starts exactly when the previous one ends — adjacent, not overlapping
      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T10:00:00.000Z"),
        endsAt: new Date("2026-03-17T11:00:00.000Z"),
      };

      const result = checkConflicts(candidate, [existing]);
      expect(result.hasConflict).toBe(false);
    });

    it("does not block against canceled appointments", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const canceled = makeAppointment({
        id: "appt_canceled",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "CANCELED",
      });

      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T09:30:00.000Z"),
        endsAt: new Date("2026-03-17T10:30:00.000Z"),
      };

      const result = checkConflicts(candidate, [canceled]);
      expect(result.hasConflict).toBe(false);
    });

    it("does not block against completed appointments", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const completed = makeAppointment({
        id: "appt_completed",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "COMPLETED",
      });

      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
      };

      const result = checkConflicts(candidate, [completed]);
      expect(result.hasConflict).toBe(false);
    });

    it("does not block against no-show appointments", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const noShow = makeAppointment({
        id: "appt_no_show",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "NO_SHOW",
      });

      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
      };

      const result = checkConflicts(candidate, [noShow]);
      expect(result.hasConflict).toBe(false);
    });

    it("does not block an appointment against itself (for reschedule)", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const existing = makeAppointment({
        id: "appt_self",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "SCHEDULED",
      });

      const candidate = {
        id: "appt_self", // Same id — should be ignored
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
      };

      const result = checkConflicts(candidate, [existing]);
      expect(result.hasConflict).toBe(false);
    });

    it("returns the conflicting appointment ids", async () => {
      const { checkConflicts } = await import("../src/lib/appointments/conflicts");

      const existing1 = makeAppointment({
        id: "appt_a",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "SCHEDULED",
      });

      const existing2 = makeAppointment({
        id: "appt_b",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "CONFIRMED",
      });

      const candidate = {
        id: "appt_new",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
      };

      const result = checkConflicts(candidate, [existing1, existing2]);
      expect(result.hasConflict).toBe(true);
      expect(result.conflictingIds).toContain("appt_a");
      expect(result.conflictingIds).toContain("appt_b");
    });

    it("blocks scheduling for archived patients", async () => {
      const { assertPatientSchedulable } = await import("../src/lib/appointments/conflicts");

      const archivedPatient = {
        id: "pat_archived",
        workspaceId: "ws_1",
        archivedAt: new Date("2026-03-01T10:00:00.000Z"),
      };

      expect(() => assertPatientSchedulable(archivedPatient)).toThrow();
    });

    it("allows scheduling for active patients", async () => {
      const { assertPatientSchedulable } = await import("../src/lib/appointments/conflicts");

      const activePatient = {
        id: "pat_active",
        workspaceId: "ws_1",
        archivedAt: null,
      };

      expect(() => assertPatientSchedulable(activePatient)).not.toThrow();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // reschedule and cancel
  // ──────────────────────────────────────────────────────────────────────────
  describe("reschedule and cancel", () => {
    it("reschedules an appointment, preserving a link to original context", async () => {
      const { rescheduleAppointment } = await import("../src/lib/appointments/model");

      const now = new Date("2026-03-13T10:00:00.000Z");
      const original = makeAppointment({
        id: "appt_original",
        startsAt: new Date("2026-03-17T09:00:00.000Z"),
        endsAt: new Date("2026-03-17T10:00:00.000Z"),
        status: "SCHEDULED",
      });

      const newStartsAt = new Date("2026-03-24T10:00:00.000Z");
      const rescheduled = rescheduleAppointment(
        original,
        { startsAt: newStartsAt, durationMinutes: 60 },
        { now, createId: () => "appt_reschedule" },
      );

      expect(rescheduled.id).toBe("appt_reschedule");
      expect(rescheduled.startsAt).toEqual(newStartsAt);
      expect(rescheduled.rescheduledFromId).toBe("appt_original");
      expect(rescheduled.status).toBe("SCHEDULED");
    });

    it("cancels an appointment with timestamp and actor", async () => {
      const { cancelAppointment } = await import("../src/lib/appointments/model");

      const now = new Date("2026-03-13T10:00:00.000Z");
      const original = makeAppointment({
        id: "appt_cancel_me",
        status: "SCHEDULED",
      });

      const canceled = cancelAppointment(original, { now, canceledByAccountId: "acct_1" });

      expect(canceled.status).toBe("CANCELED");
      expect(canceled.canceledAt).toEqual(now);
      expect(canceled.canceledByAccountId).toBe("acct_1");
    });

    it("cannot reschedule a canceled appointment", async () => {
      const { rescheduleAppointment } = await import("../src/lib/appointments/model");

      const canceled = makeAppointment({
        id: "appt_already_canceled",
        status: "CANCELED",
        canceledAt: new Date("2026-03-13T10:00:00.000Z"),
        canceledByAccountId: "acct_1",
      });

      expect(() =>
        rescheduleAppointment(
          canceled,
          { startsAt: new Date("2026-03-24T10:00:00.000Z"), durationMinutes: 60 },
          { now: new Date(), createId: () => "appt_new" },
        ),
      ).toThrow();
    });

    it("cannot reschedule a completed appointment", async () => {
      const { rescheduleAppointment } = await import("../src/lib/appointments/model");

      const completed = makeAppointment({
        id: "appt_completed",
        status: "COMPLETED",
        completedAt: new Date("2026-03-17T10:00:00.000Z"),
      });

      expect(() =>
        rescheduleAppointment(
          completed,
          { startsAt: new Date("2026-03-24T10:00:00.000Z"), durationMinutes: 60 },
          { now: new Date(), createId: () => "appt_new" },
        ),
      ).toThrow();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // appointment statuses
  // ──────────────────────────────────────────────────────────────────────────
  describe("appointment statuses", () => {
    it("confirms a scheduled appointment", async () => {
      const { confirmAppointment } = await import("../src/lib/appointments/model");

      const appt = makeAppointment({ status: "SCHEDULED" });
      const now = new Date("2026-03-17T08:00:00.000Z");
      const confirmed = confirmAppointment(appt, { now });

      expect(confirmed.status).toBe("CONFIRMED");
      expect(confirmed.confirmedAt).toEqual(now);
    });

    it("marks an appointment as completed", async () => {
      const { completeAppointment } = await import("../src/lib/appointments/model");

      const appt = makeAppointment({ status: "CONFIRMED" });
      const now = new Date("2026-03-17T10:00:00.000Z");
      const completed = completeAppointment(appt, { now });

      expect(completed.status).toBe("COMPLETED");
      expect(completed.completedAt).toEqual(now);
    });

    it("marks an appointment as no-show", async () => {
      const { noShowAppointment } = await import("../src/lib/appointments/model");

      const appt = makeAppointment({ status: "SCHEDULED" });
      const now = new Date("2026-03-17T10:00:00.000Z");
      const noShow = noShowAppointment(appt, { now });

      expect(noShow.status).toBe("NO_SHOW");
      expect(noShow.noShowAt).toEqual(now);
    });

    it("cannot complete an already canceled appointment", async () => {
      const { completeAppointment } = await import("../src/lib/appointments/model");

      const canceled = makeAppointment({ status: "CANCELED", canceledAt: new Date() });

      expect(() => completeAppointment(canceled, { now: new Date() })).toThrow();
    });

    it("cannot confirm a canceled appointment", async () => {
      const { confirmAppointment } = await import("../src/lib/appointments/model");

      const canceled = makeAppointment({ status: "CANCELED", canceledAt: new Date() });

      expect(() => confirmAppointment(canceled, { now: new Date() })).toThrow();
    });

    it("completing a scheduled appointment (not yet confirmed) is allowed", async () => {
      const { completeAppointment } = await import("../src/lib/appointments/model");

      // Psychologist may complete a session that was never explicitly confirmed
      const scheduled = makeAppointment({ status: "SCHEDULED" });
      const now = new Date("2026-03-17T10:00:00.000Z");

      expect(() => completeAppointment(scheduled, { now })).not.toThrow();
      const completed = completeAppointment(scheduled, { now });
      expect(completed.status).toBe("COMPLETED");
    });
  });
});
