// Wave 0 scaffold — implementation created in Plan 06-02 (aggregation)

/**
 * Dashboard aggregation unit tests.
 *
 * Coverage requirements:
 * - DASH-01: today's session filter (appointments in current day UTC bucket)
 * - DASH-02: pending charge count, monthly session count, active patient count
 *
 * These tests will FAIL with import errors until Plan 06-02 creates
 * src/lib/dashboard/aggregation.ts. That is the expected Wave 0 state.
 */

import { describe, it, expect } from "vitest";
import {
  filterTodayAppointments,
  countPendingCharges,
} from "../src/lib/dashboard/aggregation";
import type { Appointment } from "../src/lib/appointments/model";
import type { SessionCharge } from "../src/lib/finance/model";

// ─── fixtures ───────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-15T00:00:00Z"); // midnight UTC anchor for "today"
const TODAY_NOON = new Date("2026-03-15T12:00:00Z");
const TOMORROW_MIDNIGHT = new Date("2026-03-16T00:00:00Z");
const YESTERDAY_NOON = new Date("2026-03-14T12:00:00Z");

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "appt_1",
    workspaceId: "ws_1",
    patientId: "pat_1",
    startsAt: TODAY_NOON,
    endsAt: new Date(TODAY_NOON.getTime() + 50 * 60_000),
    durationMinutes: 50,
    careMode: "IN_PERSON",
    status: "SCHEDULED",
    seriesId: null,
    seriesIndex: null,
    rescheduledFromId: null,
    canceledAt: null,
    canceledByAccountId: null,
    confirmedAt: null,
    completedAt: null,
    noShowAt: null,
    priceInCents: 20000,
    meetingLink: null,
    remoteIssueNote: null,
    createdAt: TODAY,
    updatedAt: TODAY,
    ...overrides,
  };
}

function makeCharge(overrides: Partial<SessionCharge> = {}): SessionCharge {
  return {
    id: "charge_1",
    workspaceId: "ws_1",
    patientId: "pat_1",
    appointmentId: "appt_1",
    status: "pendente",
    amountInCents: 20000,
    paymentMethod: null,
    paidAt: null,
    createdAt: TODAY,
    updatedAt: TODAY,
    ...overrides,
  };
}

// ─── filterTodayAppointments ─────────────────────────────────────────────────

describe("filterTodayAppointments", () => {
  it("includes appointment with startsAt in [today-midnight UTC, tomorrow-midnight UTC)", () => {
    const appt = makeAppointment({ startsAt: TODAY_NOON });
    const result = filterTodayAppointments([appt], TODAY);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(appt.id);
  });

  it("includes appointment at exactly today-midnight UTC (inclusive lower bound)", () => {
    const appt = makeAppointment({ startsAt: TODAY });
    const result = filterTodayAppointments([appt], TODAY);
    expect(result).toHaveLength(1);
  });

  it("excludes appointment at exactly tomorrow-midnight UTC (exclusive upper bound)", () => {
    const appt = makeAppointment({ startsAt: TOMORROW_MIDNIGHT });
    const result = filterTodayAppointments([appt], TODAY);
    expect(result).toHaveLength(0);
  });

  it("excludes appointment before today (yesterday)", () => {
    const appt = makeAppointment({ startsAt: YESTERDAY_NOON });
    const result = filterTodayAppointments([appt], TODAY);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    const result = filterTodayAppointments([], TODAY);
    expect(result).toHaveLength(0);
  });

  it("filters multiple appointments, returning only today's", () => {
    const todayAppt = makeAppointment({ id: "appt_today", startsAt: TODAY_NOON });
    const yesterdayAppt = makeAppointment({ id: "appt_yesterday", startsAt: YESTERDAY_NOON });
    const tomorrowAppt = makeAppointment({ id: "appt_tomorrow", startsAt: TOMORROW_MIDNIGHT });
    const result = filterTodayAppointments([todayAppt, yesterdayAppt, tomorrowAppt], TODAY);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("appt_today");
  });
});

// ─── countPendingCharges ─────────────────────────────────────────────────────

describe("countPendingCharges", () => {
  it("counts charges with status 'pendente'", () => {
    const charge = makeCharge({ status: "pendente" });
    expect(countPendingCharges([charge])).toBe(1);
  });

  it("counts charges with status 'atrasado'", () => {
    const charge = makeCharge({ status: "atrasado" });
    expect(countPendingCharges([charge])).toBe(1);
  });

  it("excludes charges with status 'pago'", () => {
    const charge = makeCharge({ status: "pago" });
    expect(countPendingCharges([charge])).toBe(0);
  });

  it("counts both pendente and atrasado charges", () => {
    const pendente = makeCharge({ id: "c1", status: "pendente" });
    const atrasado = makeCharge({ id: "c2", status: "atrasado" });
    const pago = makeCharge({ id: "c3", status: "pago" });
    expect(countPendingCharges([pendente, atrasado, pago])).toBe(2);
  });

  it("returns 0 for empty array", () => {
    expect(countPendingCharges([])).toBe(0);
  });

  it("returns 0 when all charges are pago", () => {
    const c1 = makeCharge({ id: "c1", status: "pago" });
    const c2 = makeCharge({ id: "c2", status: "pago" });
    expect(countPendingCharges([c1, c2])).toBe(0);
  });
});
