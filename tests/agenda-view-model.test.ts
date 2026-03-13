import { describe, it, expect } from "vitest";
import type { Appointment } from "../src/lib/appointments/model";

function makeAppointment(overrides: Partial<Appointment> & { id: string }): Appointment {
  const startsAt = overrides.startsAt ?? new Date("2026-03-16T09:00:00.000Z");
  const durationMinutes = overrides.durationMinutes ?? 50;
  const endsAt =
    overrides.endsAt ?? new Date(startsAt.getTime() + durationMinutes * 60_000);

  return {
    id: overrides.id,
    workspaceId: overrides.workspaceId ?? "ws_1",
    patientId: overrides.patientId ?? "pat_1",
    startsAt,
    endsAt,
    durationMinutes,
    careMode: overrides.careMode ?? "IN_PERSON",
    status: overrides.status ?? "SCHEDULED",
    seriesId: overrides.seriesId ?? null,
    seriesIndex: overrides.seriesIndex ?? null,
    rescheduledFromId: overrides.rescheduledFromId ?? null,
    canceledAt: overrides.canceledAt ?? null,
    canceledByAccountId: overrides.canceledByAccountId ?? null,
    confirmedAt: overrides.confirmedAt ?? null,
    completedAt: overrides.completedAt ?? null,
    noShowAt: overrides.noShowAt ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-03-01T00:00:00.000Z"),
  };
}

describe("day and week agenda", () => {
  describe("deriveAgendaCard — privacy-safe appointment card inputs", () => {
    it("produces a card with time, status, care mode and patient id — no sensitive fields", async () => {
      const { deriveAgendaCard } = await import("../src/lib/appointments/agenda");
      const appt = makeAppointment({ id: "appt_1" });
      const card = deriveAgendaCard(appt);

      expect(card.appointmentId).toBe("appt_1");
      expect(card.patientId).toBe("pat_1");
      expect(card.startsAt).toEqual(appt.startsAt);
      expect(card.endsAt).toEqual(appt.endsAt);
      expect(card.durationMinutes).toBe(50);
      expect(card.status).toBe("SCHEDULED");
      expect(card.careMode).toBe("IN_PERSON");

      // Must not expose sensitive fields or note content
      expect((card as Record<string, unknown>).importantObservations).toBeUndefined();
      expect((card as Record<string, unknown>).notes).toBeUndefined();
    });

    it("generates a human-readable status label in pt-BR", async () => {
      const { deriveAgendaCard } = await import("../src/lib/appointments/agenda");

      const scheduled = deriveAgendaCard(makeAppointment({ id: "a1", status: "SCHEDULED" }));
      const confirmed = deriveAgendaCard(makeAppointment({ id: "a2", status: "CONFIRMED" }));
      const completed = deriveAgendaCard(makeAppointment({ id: "a3", status: "COMPLETED" }));
      const canceled = deriveAgendaCard(makeAppointment({ id: "a4", status: "CANCELED" }));
      const noShow = deriveAgendaCard(makeAppointment({ id: "a5", status: "NO_SHOW" }));

      expect(scheduled.statusLabel).toBe("Agendada");
      expect(confirmed.statusLabel).toBe("Confirmada");
      expect(completed.statusLabel).toBe("Concluída");
      expect(canceled.statusLabel).toBe("Cancelada");
      expect(noShow.statusLabel).toBe("Não compareceu");
    });

    it("generates a human-readable care mode label in pt-BR", async () => {
      const { deriveAgendaCard } = await import("../src/lib/appointments/agenda");

      const inPerson = deriveAgendaCard(makeAppointment({ id: "a1", careMode: "IN_PERSON" }));
      const online = deriveAgendaCard(makeAppointment({ id: "a2", careMode: "ONLINE" }));

      expect(inPerson.careModeLabel).toBe("Presencial");
      expect(online.careModeLabel).toBe("Online");
    });
  });

  describe("deriveDayAgenda — ordered and grouped by day", () => {
    it("returns an empty list when no appointments fall on the date", async () => {
      const { deriveDayAgenda } = await import("../src/lib/appointments/agenda");

      const result = deriveDayAgenda([], new Date("2026-03-16T00:00:00.000Z"), "America/Sao_Paulo");

      expect(result.date).toEqual(new Date("2026-03-16T00:00:00.000Z"));
      expect(result.cards).toHaveLength(0);
    });

    it("includes only appointments that start on the given date (UTC offset-aware)", async () => {
      const { deriveDayAgenda } = await import("../src/lib/appointments/agenda");

      // Monday Mar 16 09:00 UTC = 06:00 Sao Paulo (UTC-3) — still Mar 16 in São Paulo
      const inDay = makeAppointment({
        id: "in_day",
        startsAt: new Date("2026-03-16T09:00:00.000Z"),
      });
      // Mar 17 at 00:00 UTC = Mar 16 21:00 Sao Paulo — still Mar 16 in São Paulo
      const alsoInDay = makeAppointment({
        id: "also_in_day",
        startsAt: new Date("2026-03-17T00:00:00.000Z"),
      });
      // Mar 17 at 03:00 UTC = Mar 17 00:00 Sao Paulo — Mar 17 in São Paulo
      const outOfDay = makeAppointment({
        id: "out_of_day",
        startsAt: new Date("2026-03-17T03:00:00.000Z"),
      });

      const result = deriveDayAgenda(
        [inDay, alsoInDay, outOfDay],
        new Date("2026-03-16T00:00:00.000Z"),
        "America/Sao_Paulo",
      );

      const ids = result.cards.map((c) => c.appointmentId);
      expect(ids).toContain("in_day");
      expect(ids).toContain("also_in_day");
      expect(ids).not.toContain("out_of_day");
    });

    it("orders appointments by startsAt ascending within the day", async () => {
      const { deriveDayAgenda } = await import("../src/lib/appointments/agenda");

      const a14 = makeAppointment({
        id: "a14",
        startsAt: new Date("2026-03-16T14:00:00.000Z"),
      });
      const a09 = makeAppointment({
        id: "a09",
        startsAt: new Date("2026-03-16T09:00:00.000Z"),
      });
      const a11 = makeAppointment({
        id: "a11",
        startsAt: new Date("2026-03-16T11:00:00.000Z"),
      });

      const result = deriveDayAgenda(
        [a14, a09, a11],
        new Date("2026-03-16T00:00:00.000Z"),
        "America/Sao_Paulo",
      );

      expect(result.cards[0].appointmentId).toBe("a09");
      expect(result.cards[1].appointmentId).toBe("a11");
      expect(result.cards[2].appointmentId).toBe("a14");
    });
  });

  describe("deriveWeekAgenda — grouped by weekday", () => {
    it("returns 7 day slots for a given week start", async () => {
      const { deriveWeekAgenda } = await import("../src/lib/appointments/agenda");

      // Week starting Monday Mar 16 2026
      const result = deriveWeekAgenda(
        [],
        new Date("2026-03-16T00:00:00.000Z"),
        "America/Sao_Paulo",
      );

      expect(result.days).toHaveLength(7);
    });

    it("places each appointment into its correct weekday slot", async () => {
      const { deriveWeekAgenda } = await import("../src/lib/appointments/agenda");

      const monday = makeAppointment({
        id: "monday_appt",
        // Mar 16 (Monday) at 09:00 UTC = 06:00 BRT
        startsAt: new Date("2026-03-16T09:00:00.000Z"),
      });
      const wednesday = makeAppointment({
        id: "wednesday_appt",
        // Mar 18 (Wednesday) at 14:00 UTC = 11:00 BRT
        startsAt: new Date("2026-03-18T14:00:00.000Z"),
      });

      const result = deriveWeekAgenda(
        [monday, wednesday],
        new Date("2026-03-16T00:00:00.000Z"),
        "America/Sao_Paulo",
      );

      const mondaySlot = result.days[0];
      const wednesdaySlot = result.days[2];

      expect(mondaySlot.cards.map((c) => c.appointmentId)).toContain("monday_appt");
      expect(wednesdaySlot.cards.map((c) => c.appointmentId)).toContain("wednesday_appt");
    });

    it("excludes appointments outside the 7-day window", async () => {
      const { deriveWeekAgenda } = await import("../src/lib/appointments/agenda");

      const inWindow = makeAppointment({
        id: "in_window",
        startsAt: new Date("2026-03-20T09:00:00.000Z"), // Friday
      });
      const outsideWindow = makeAppointment({
        id: "outside_window",
        startsAt: new Date("2026-03-23T09:00:00.000Z"), // Following Monday
      });

      const result = deriveWeekAgenda(
        [inWindow, outsideWindow],
        new Date("2026-03-16T00:00:00.000Z"),
        "America/Sao_Paulo",
      );

      const allIds = result.days.flatMap((d) => d.cards.map((c) => c.appointmentId));
      expect(allIds).toContain("in_window");
      expect(allIds).not.toContain("outside_window");
    });

    it("week result exposes the week start date and ordered days", async () => {
      const { deriveWeekAgenda } = await import("../src/lib/appointments/agenda");

      const weekStart = new Date("2026-03-16T00:00:00.000Z");
      const result = deriveWeekAgenda([], weekStart, "America/Sao_Paulo");

      expect(result.weekStart).toEqual(weekStart);
      // Days should be in order Mon-Sun
      for (let i = 1; i < result.days.length; i++) {
        expect(result.days[i].date.getTime()).toBeGreaterThan(result.days[i - 1].date.getTime());
      }
    });
  });
});
