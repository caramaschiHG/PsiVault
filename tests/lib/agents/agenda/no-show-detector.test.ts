import { describe, it, expect } from "vitest";
import { hasConsecutiveNoShows } from "../../../../src/lib/agents/agenda/no-show-detector";
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
    completedAt: null,
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

describe("hasConsecutiveNoShows", () => {
  it("returns false for empty history", () => {
    expect(hasConsecutiveNoShows([])).toBe(false);
  });

  it("returns false for 1 NO_SHOW", () => {
    const appts = [makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z"))];
    expect(hasConsecutiveNoShows(appts)).toBe(false);
  });

  it("returns true for 2 consecutive NO_SHOWs (most recent)", () => {
    const appts = [
      makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-20T10:00:00Z")),
    ];
    expect(hasConsecutiveNoShows(appts)).toBe(true);
  });

  it("returns false when COMPLETED is between NO_SHOWs", () => {
    const appts = [
      makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z")),
      makeAppt("COMPLETED", new Date("2026-04-20T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-13T10:00:00Z")),
    ];
    expect(hasConsecutiveNoShows(appts)).toBe(false);
  });

  it("returns true for 3 NO_SHOWs", () => {
    const appts = [
      makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-20T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-13T10:00:00Z")),
    ];
    expect(hasConsecutiveNoShows(appts)).toBe(true);
  });

  it("returns true when streak is at top with older COMPLETED below", () => {
    const appts = [
      makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-20T10:00:00Z")),
      makeAppt("COMPLETED", new Date("2026-04-13T10:00:00Z")),
    ];
    expect(hasConsecutiveNoShows(appts)).toBe(true);
  });

  it("ignores CANCELED and SCHEDULED in streak calculation", () => {
    const appts = [
      makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z")),
      makeAppt("CANCELED", new Date("2026-04-25T10:00:00Z")),
      makeAppt("SCHEDULED", new Date("2026-04-23T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-20T10:00:00Z")),
    ];
    expect(hasConsecutiveNoShows(appts)).toBe(true);
  });

  it("returns false when CONFIRMED breaks the streak", () => {
    const appts = [
      makeAppt("NO_SHOW", new Date("2026-04-27T10:00:00Z")),
      makeAppt("CONFIRMED", new Date("2026-04-20T10:00:00Z")),
      makeAppt("NO_SHOW", new Date("2026-04-13T10:00:00Z")),
    ];
    expect(hasConsecutiveNoShows(appts)).toBe(false);
  });
});
