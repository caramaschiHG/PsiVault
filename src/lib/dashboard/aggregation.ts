/**
 * Dashboard aggregation utilities.
 *
 * Pure functions — no side effects, no I/O. Designed for use in the /inicio
 * server component where all repos are loaded at the top and then aggregated.
 *
 * Security policy (SECU-05):
 * - countPendingCharges returns only a COUNT — never amounts.
 * - deriveMonthlySnapshot exposes receivedAmountCents/pendingAmountCents for
 *   trusted backup/export surfaces only. The /inicio page MUST NOT render
 *   those fields — only use pendingChargeCount (integer badge).
 */

import type { Appointment } from "../appointments/model";
import type { SessionCharge } from "../finance/model";
import type { Patient } from "../patients/model";
import { deriveMonthlyFinancialSummary } from "../finance/model";

// ─── filterTodayAppointments ─────────────────────────────────────────────────

/**
 * Filter appointments to those starting on "today" using UTC day boundaries.
 *
 * @param appointments - full list of loaded appointments
 * @param from         - UTC midnight of today (inclusive lower bound)
 *
 * The exclusive upper bound (tomorrow midnight) is derived internally as
 * from + 24 h so callers only need to pass the single "today midnight" anchor.
 */
export function filterTodayAppointments(
  appointments: Appointment[],
  from: Date,
): Appointment[] {
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  return appointments.filter(
    (a) => a.startsAt >= from && a.startsAt < to,
  );
}

// ─── countPendingCharges ─────────────────────────────────────────────────────

/**
 * Count charges with status "pendente" or "atrasado".
 *
 * SECU-05: returns only a count integer — never amounts.
 */
export function countPendingCharges(charges: SessionCharge[]): number {
  return charges.filter(
    (c) => c.status === "pendente" || c.status === "atrasado",
  ).length;
}

// ─── deriveMonthlySnapshot ───────────────────────────────────────────────────

export interface MonthlySnapshot {
  activePatientCount: number;
  completedSessionCount: number;
  /** For trusted backup/export context only — MUST NOT be displayed on /inicio. */
  receivedAmountCents: number;
  /** For trusted backup/export context only — MUST NOT be displayed on /inicio. */
  pendingAmountCents: number;
}

export interface DeriveMonthlySnapshotInput {
  activePatients: Patient[];
  monthlyCharges: SessionCharge[];
  monthlyAppointments: Appointment[];
}

/**
 * Derive a practice health snapshot for the current month.
 *
 * - activePatientCount: number of currently active (non-archived) patients.
 * - completedSessionCount: appointments with status "COMPLETED" in the month.
 * - receivedAmountCents / pendingAmountCents: from deriveMonthlyFinancialSummary.
 *
 * The /inicio dashboard page MUST display only activePatientCount,
 * completedSessionCount, and a pendingCharge COUNT badge — never amounts.
 */
export function deriveMonthlySnapshot(
  input: DeriveMonthlySnapshotInput,
): MonthlySnapshot {
  const { activePatients, monthlyCharges, monthlyAppointments } = input;

  const activePatientCount = activePatients.length;

  const completedSessionCount = monthlyAppointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  const financialSummary = deriveMonthlyFinancialSummary(monthlyCharges);

  return {
    activePatientCount,
    completedSessionCount,
    receivedAmountCents: financialSummary.totalReceivedCents,
    pendingAmountCents: financialSummary.totalPendingCents,
  };
}
