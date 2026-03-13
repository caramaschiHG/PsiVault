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
