/**
 * Patient operational summary contract.
 *
 * This module defines the stable summary shape required by PATI-03.
 * All session-derived fields (lastSession, nextSession) default to null
 * so the profile surface is safe before the scheduling domain (02-02)
 * provides real appointment occurrences.
 *
 * Hydration contract: 02-02 will extend derivePatientSummary inputs to
 * accept lastSession/nextSession from appointment queries without changing
 * the output shape or the consumer components.
 */

import { hasConsecutiveNoShows } from "../agents/agenda/no-show-detector";

export type FinancialStatus = "no_data" | "up_to_date" | "pending_payment" | "overdue";

export interface PatientOperationalSummary {
  patientId: string;

  /** Date of the most recent completed session. Null until 02-02 hydrates. */
  lastSession: Date | null;

  /** Date of the next scheduled session. Null until 02-02 hydrates. */
  nextSession: Date | null;

  /** Count of open/pending items (documents to sign, payments pending). */
  pendingItemsCount: number;

  /** Total document count associated with this patient. */
  documentCount: number;

  /** High-level financial state — no_data until finance domain provides data. */
  financialStatus: FinancialStatus;

  /** True when patient has 2+ consecutive no-shows (AGEND-01). */
  noShowAlert?: boolean;
}

export interface DerivePatientSummaryInput {
  patientId: string;

  /** Provided by scheduling domain once 02-02 is complete. */
  lastSession?: Date | null;

  /** Provided by scheduling domain once 02-02 is complete. */
  nextSession?: Date | null;

  /** Provided by document domain once it is complete. */
  documentCount?: number;

  /** Provided by clinical/finance domain once complete. */
  pendingItemsCount?: number;

  /** Provided by finance domain once complete. */
  financialStatus?: FinancialStatus;
}

export function derivePatientSummary(input: DerivePatientSummaryInput): PatientOperationalSummary {
  return {
    patientId: input.patientId,
    lastSession: input.lastSession ?? null,
    nextSession: input.nextSession ?? null,
    pendingItemsCount: input.pendingItemsCount ?? 0,
    documentCount: input.documentCount ?? 0,
    financialStatus: input.financialStatus ?? "no_data",
  };
}

// ---------------------------------------------------------------------------
// Scheduling-domain hydration (02-03)
// ---------------------------------------------------------------------------

/**
 * Minimal appointment shape required for patient summary hydration.
 * Uses a structural subset so this function does not import from the
 * appointments domain — avoiding circular dependency.
 */
export interface AppointmentForSummary {
  id: string;
  patientId: string;
  workspaceId: string;
  startsAt: Date;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
}

export interface DerivePatientSummaryFromAppointmentsInput {
  patientId: string;
  /** All appointments for this patient (any status). */
  appointments: AppointmentForSummary[];
  /** Reference point for "future" comparisons. Defaults to Date.now(). */
  now?: Date;
  /** Provided by document domain once complete. */
  documentCount?: number;
  /** Provided by finance domain once complete. */
  financialStatus?: FinancialStatus;
}

/**
 * Derive a PatientOperationalSummary hydrated from real appointment data.
 *
 * - lastSession: most recent COMPLETED appointment (highest startsAt)
 * - nextSession: earliest future SCHEDULED or CONFIRMED appointment
 * - pendingItemsCount: count of future SCHEDULED appointments (upcoming
 *   appointments that still need confirmation — actionable scheduling pendency)
 * - noShowAlert: true when 2+ consecutive NO_SHOWs detected
 */
export function derivePatientSummaryFromAppointments(
  input: DerivePatientSummaryFromAppointmentsInput,
): PatientOperationalSummary {
  const now = input.now ?? new Date();

  // Last completed session
  const completedAppointments = input.appointments
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  const lastSession = completedAppointments[0]?.startsAt ?? null;

  // Next scheduled/confirmed session (earliest future occurrence)
  const upcomingAppointments = input.appointments
    .filter(
      (a) =>
        (a.status === "SCHEDULED" || a.status === "CONFIRMED") &&
        a.startsAt.getTime() > now.getTime(),
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const nextSession = upcomingAppointments[0]?.startsAt ?? null;

  // Pending items: future SCHEDULED appointments still needing confirmation
  const pendingItemsCount = input.appointments.filter(
    (a) =>
      a.status === "SCHEDULED" &&
      a.startsAt.getTime() > now.getTime(),
  ).length;

  // No-show alert: 2+ consecutive NO_SHOWs
  const noShowAlert = hasConsecutiveNoShows(input.appointments);

  return {
    patientId: input.patientId,
    lastSession,
    nextSession,
    pendingItemsCount,
    documentCount: input.documentCount ?? 0,
    financialStatus: input.financialStatus ?? "no_data",
    noShowAlert,
  };
}

// ---------------------------------------------------------------------------
// Label helpers for UI rendering

type SummaryLabelKey = "lastSession" | "nextSession" | "financialStatus";

type SummaryLabelValue =
  | Date
  | null
  | FinancialStatus;

const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  no_data: "Sem dados financeiros",
  up_to_date: "Em dia",
  pending_payment: "Pagamento pendente",
  overdue: "Em atraso",
};

export function getSummaryLabel(key: "lastSession", value: Date | null): string;
export function getSummaryLabel(key: "nextSession", value: Date | null): string;
export function getSummaryLabel(key: "financialStatus", value: FinancialStatus): string;
export function getSummaryLabel(key: SummaryLabelKey, value: SummaryLabelValue): string {
  if (key === "lastSession") {
    if (value === null) return "Nenhuma sessão ainda";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value as Date);
  }

  if (key === "nextSession") {
    if (value === null) return "Sem próxima sessão agendada";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value as Date);
  }

  if (key === "financialStatus") {
    return FINANCIAL_STATUS_LABELS[value as FinancialStatus];
  }

  return "";
}
