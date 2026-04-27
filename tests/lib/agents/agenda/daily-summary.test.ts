import { describe, it, expect } from "vitest";
import { generateDailySummary, isLastAppointmentOfDay, buildDailySummaryIdempotencyKey } from "../../../../src/lib/agents/agenda/daily-summary";
import type { Appointment } from "../../../../src/lib/appointments/model";

function makeAppt(status: Appointment["status"], startsAt: Date): Appointment {
  return {
    id: `appt_${startsAt.getTime()}`,
    workspaceId: "ws_1",
    patientId: "pat_1",
    startsAt,
    endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
    durationMinutes: 60,
    careMode: "IN_PERSON",
    status,
    seriesId: null,
    seriesIndex: null,
    rescheduledFromId: null,
    canceledAt: null,
    canceledByAccountId: null,
    canceledBy: null,
    confirmedAt: null,
    completedAt: status === "COMPLETED" ? startsAt : null,
    noShowAt: null,
    seriesPattern: null,
    seriesDaysOfWeek: [],
    priceInCents: null,
    meetingLink: null,
    remoteIssueNote: null,
    createdAt: startsAt,
    updatedAt: startsAt,
  };
}

describe("generateDailySummary", () => {
  it("formats title with pt-BR date", () => {
    const result = generateDailySummary({
      date: new Date("2026-04-27T10:00:00Z"),
      workspaceId: "ws_1",
      accountId: "acct_1",
      noShowsDetected: 2,
      remindersSent: 3,
      suggestionsGenerated: 1,
    });
    expect(result.title).toContain("Resumo do dia");
    expect(result.title).toContain("27");
  });

  it("includes all activity counts in description", () => {
    const result = generateDailySummary({
      date: new Date("2026-04-27T10:00:00Z"),
      workspaceId: "ws_1",
      accountId: "acct_1",
      noShowsDetected: 2,
      remindersSent: 3,
      suggestionsGenerated: 1,
    });
    expect(result.description).toContain("2 faltas detectadas");
    expect(result.description).toContain("3 lembretes enviados");
    expect(result.description).toContain("1 sugestão de horário gerada");
    expect(result.description).toContain("·");
  });

  it("returns fallback when no activity", () => {
    const result = generateDailySummary({
      date: new Date("2026-04-27T10:00:00Z"),
      workspaceId: "ws_1",
      accountId: "acct_1",
      noShowsDetected: 0,
      remindersSent: 0,
      suggestionsGenerated: 0,
    });
    expect(result.description).toBe("Nenhuma atividade da agenda hoje.");
  });
});

describe("isLastAppointmentOfDay", () => {
  it("returns true when completing the last appointment", () => {
    const appts = [
      makeAppt("SCHEDULED", new Date("2026-04-27T10:00:00Z")),
      makeAppt("COMPLETED", new Date("2026-04-27T14:00:00Z")),
    ];
    expect(isLastAppointmentOfDay(appts[1], appts)).toBe(true);
  });

  it("returns false when there is a later appointment", () => {
    const appts = [
      makeAppt("SCHEDULED", new Date("2026-04-27T14:00:00Z")),
      makeAppt("COMPLETED", new Date("2026-04-27T10:00:00Z")),
    ];
    expect(isLastAppointmentOfDay(appts[1], appts)).toBe(false);
  });

  it("ignores CANCELED appointments when checking for later ones", () => {
    const appts = [
      makeAppt("CANCELED", new Date("2026-04-27T14:00:00Z")),
      makeAppt("COMPLETED", new Date("2026-04-27T10:00:00Z")),
    ];
    expect(isLastAppointmentOfDay(appts[1], appts)).toBe(true);
  });
});

describe("buildDailySummaryIdempotencyKey", () => {
  it("produces deterministic key with date", () => {
    const key = buildDailySummaryIdempotencyKey("ws_1", "acct_1", new Date("2026-04-27T10:00:00Z"));
    expect(key).toBe("agenda:daily-summary:ws_1:acct_1:2026-04-27");
  });
});
