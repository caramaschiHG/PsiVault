import { describe, it, expect } from "vitest";

describe("appointment recurrence", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // weekly recurrence scopes
  // ──────────────────────────────────────────────────────────────────────────
  describe("weekly recurrence scopes", () => {
    // ── Generation ──────────────────────────────────────────────────────────

    it("generates N weekly occurrences from a seed appointment", async () => {
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      const seed = {
        workspaceId: "ws_1",
        patientId: "pat_1",
        startsAt: new Date("2026-03-17T09:00:00.000Z"), // Tuesday
        durationMinutes: 50,
        careMode: "IN_PERSON" as const,
      };

      let idCounter = 0;
      const occurrences = generateWeeklySeries(seed, { count: 4 }, {
        createId: () => `appt_${++idCounter}`,
        createSeriesId: () => "series_1",
        now: new Date("2026-03-13T10:00:00.000Z"),
      });

      expect(occurrences).toHaveLength(4);

      // First occurrence — same week
      expect(occurrences[0].startsAt).toEqual(new Date("2026-03-17T09:00:00.000Z"));
      expect(occurrences[0].seriesIndex).toBe(0);

      // Second occurrence — one week later
      expect(occurrences[1].startsAt).toEqual(new Date("2026-03-24T09:00:00.000Z"));
      expect(occurrences[1].seriesIndex).toBe(1);

      // Fourth occurrence
      expect(occurrences[3].startsAt).toEqual(new Date("2026-04-07T09:00:00.000Z"));
      expect(occurrences[3].seriesIndex).toBe(3);
    });

    it("all occurrences in a series share the same seriesId", async () => {
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON" as const,
        },
        { count: 3 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_abc",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      expect(occurrences.every((o) => o.seriesId === "series_abc")).toBe(true);
    });

    it("each occurrence has SCHEDULED status after generation", async () => {
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "ONLINE" as const,
        },
        { count: 3 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_2",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      expect(occurrences.every((o) => o.status === "SCHEDULED")).toBe(true);
    });

    // ── Edit scope: this occurrence ─────────────────────────────────────────

    it("edit scope 'this' updates only the targeted occurrence", async () => {
      const { applySeriesEdit } = await import("../src/lib/appointments/recurrence");
      const { createInMemoryAppointmentRepository } = await import("../src/lib/appointments/repository");
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON" as const,
        },
        { count: 4 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_3",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      const repo = createInMemoryAppointmentRepository(occurrences);

      const target = occurrences[1]; // second occurrence
      const updated = applySeriesEdit(
        {
          scope: "THIS",
          targetId: target.id,
          changes: { durationMinutes: 90, careMode: "ONLINE" as const },
        },
        repo,
        {
          workspaceId: "ws_1",
          now: new Date("2026-03-13T12:00:00.000Z"),
          createId: () => `appt_${++idCounter}`,
        },
      );

      // Only the targeted occurrence was changed
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe(target.id);
      expect(updated[0].durationMinutes).toBe(90);
      expect(updated[0].careMode).toBe("ONLINE");

      // Other occurrences remain untouched in the repo
      const first = repo.findById(occurrences[0].id, "ws_1");
      expect(first?.durationMinutes).toBe(60);
      expect(first?.careMode).toBe("IN_PERSON");
    });

    // ── Edit scope: this and future ─────────────────────────────────────────

    it("edit scope 'this and future' updates target and all subsequent occurrences", async () => {
      const { applySeriesEdit } = await import("../src/lib/appointments/recurrence");
      const { createInMemoryAppointmentRepository } = await import("../src/lib/appointments/repository");
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON" as const,
        },
        { count: 5 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_4",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      const repo = createInMemoryAppointmentRepository(occurrences);

      const target = occurrences[2]; // third occurrence (index 2)
      const updated = applySeriesEdit(
        {
          scope: "THIS_AND_FUTURE",
          targetId: target.id,
          changes: { durationMinutes: 45 },
        },
        repo,
        {
          workspaceId: "ws_1",
          now: new Date("2026-03-13T12:00:00.000Z"),
          createId: () => `appt_${++idCounter}`,
        },
      );

      // Occurrences at index 2, 3, 4 are updated
      expect(updated).toHaveLength(3);
      expect(updated.every((o) => o.durationMinutes === 45)).toBe(true);

      // Occurrences at index 0 and 1 remain untouched
      const first = repo.findById(occurrences[0].id, "ws_1");
      const second = repo.findById(occurrences[1].id, "ws_1");
      expect(first?.durationMinutes).toBe(60);
      expect(second?.durationMinutes).toBe(60);
    });

    // ── Edit scope: whole series ────────────────────────────────────────────

    it("edit scope 'all' updates all SCHEDULED and CONFIRMED occurrences in the series", async () => {
      const { applySeriesEdit } = await import("../src/lib/appointments/recurrence");
      const { createInMemoryAppointmentRepository } = await import("../src/lib/appointments/repository");
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON" as const,
        },
        { count: 4 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_5",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      const repo = createInMemoryAppointmentRepository(occurrences);

      const updated = applySeriesEdit(
        {
          scope: "ALL",
          targetId: occurrences[0].id,
          changes: { careMode: "ONLINE" as const },
        },
        repo,
        {
          workspaceId: "ws_1",
          now: new Date("2026-03-13T12:00:00.000Z"),
          createId: () => `appt_${++idCounter}`,
        },
      );

      expect(updated).toHaveLength(4);
      expect(updated.every((o) => o.careMode === "ONLINE")).toBe(true);
    });

    // ── Finalized occurrences must not be overwritten ───────────────────────

    it("'all' scope does not overwrite COMPLETED occurrences", async () => {
      const { applySeriesEdit } = await import("../src/lib/appointments/recurrence");
      const { createInMemoryAppointmentRepository } = await import("../src/lib/appointments/repository");
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON" as const,
        },
        { count: 3 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_6",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      // Mark first occurrence as completed
      const completedFirst = {
        ...occurrences[0],
        status: "COMPLETED" as const,
        completedAt: new Date("2026-03-17T10:00:00.000Z"),
        updatedAt: new Date("2026-03-17T10:00:00.000Z"),
      };

      const repo = createInMemoryAppointmentRepository([
        completedFirst,
        occurrences[1],
        occurrences[2],
      ]);

      const updated = applySeriesEdit(
        {
          scope: "ALL",
          targetId: occurrences[0].id,
          changes: { careMode: "ONLINE" as const },
        },
        repo,
        {
          workspaceId: "ws_1",
          now: new Date("2026-03-17T12:00:00.000Z"),
          createId: () => `appt_${++idCounter}`,
        },
      );

      // Only the two non-finalized occurrences are updated
      expect(updated).toHaveLength(2);
      expect(updated.every((o) => o.careMode === "ONLINE")).toBe(true);

      // The completed occurrence retains its original care mode
      const first = repo.findById(occurrences[0].id, "ws_1");
      expect(first?.careMode).toBe("IN_PERSON");
    });

    it("'this and future' scope does not overwrite CANCELED occurrences in the range", async () => {
      const { applySeriesEdit } = await import("../src/lib/appointments/recurrence");
      const { createInMemoryAppointmentRepository } = await import("../src/lib/appointments/repository");
      const { generateWeeklySeries } = await import("../src/lib/appointments/recurrence");

      let idCounter = 0;
      const occurrences = generateWeeklySeries(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-03-17T09:00:00.000Z"),
          durationMinutes: 60,
          careMode: "IN_PERSON" as const,
        },
        { count: 4 },
        {
          createId: () => `appt_${++idCounter}`,
          createSeriesId: () => "series_7",
          now: new Date("2026-03-13T10:00:00.000Z"),
        },
      );

      // Occurrence at index 2 was individually canceled
      const canceledThird = {
        ...occurrences[2],
        status: "CANCELED" as const,
        canceledAt: new Date("2026-03-24T09:00:00.000Z"),
        canceledByAccountId: "acct_1",
        updatedAt: new Date("2026-03-24T09:00:00.000Z"),
      };

      const repo = createInMemoryAppointmentRepository([
        occurrences[0],
        occurrences[1],
        canceledThird,
        occurrences[3],
      ]);

      const updated = applySeriesEdit(
        {
          scope: "THIS_AND_FUTURE",
          targetId: occurrences[1].id, // from index 1 onwards
          changes: { durationMinutes: 45 },
        },
        repo,
        {
          workspaceId: "ws_1",
          now: new Date("2026-03-24T12:00:00.000Z"),
          createId: () => `appt_${++idCounter}`,
        },
      );

      // index 1 and 3 are updated; index 2 (canceled) is preserved
      expect(updated).toHaveLength(2);

      const canceledInRepo = repo.findById(occurrences[2].id, "ws_1");
      expect(canceledInRepo?.status).toBe("CANCELED");
      expect(canceledInRepo?.durationMinutes).toBe(60);
    });
  });
});
