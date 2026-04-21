/**
 * SessionCharge aggregate — workspace-scoped finance entity.
 *
 * Security policy (SECU-05):
 * - amountInCents and paymentMethod must NEVER appear in audit metadata.
 * - Only chargeId, appointmentId, and newStatus are safe for audit surfaces.
 *
 * Status lifecycle:
 *   pendente -> pago
 *   pendente -> atrasado
 *   atrasado -> pago
 *   pago -> pendente  (correction)
 */

import type { FinancialStatus } from "../patients/summary";

export type ChargeStatus = "pendente" | "pago" | "atrasado";

export type PaymentMethod = "pix" | "transferencia" | "dinheiro" | "cartao" | "cheque";

export interface SessionCharge {
  id: string;
  workspaceId: string;
  patientId: string;
  appointmentId: string | null;

  status: ChargeStatus;

  /** Amount in cents. Null if not yet defined at creation time. */
  amountInCents: number | null;

  /** Payment method. Null until payment is confirmed. */
  paymentMethod: PaymentMethod | string | null;

  /** When payment was confirmed. Set when status transitions to "pago". */
  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionChargeInput {
  workspaceId: string;
  patientId: string;
  appointmentId?: string | null;
  amountInCents?: number | null;
}

interface CreateSessionChargeDeps {
  now: Date;
  createId: () => string;
}

export function createSessionCharge(
  input: CreateSessionChargeInput,
  deps: CreateSessionChargeDeps,
): SessionCharge {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    patientId: input.patientId,
    appointmentId: input.appointmentId ?? null,
    status: "pendente",
    amountInCents: input.amountInCents ?? null,
    paymentMethod: null,
    paidAt: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

export interface UpdateSessionChargeInput {
  status?: ChargeStatus;
  amountInCents?: number | null;
  paymentMethod?: PaymentMethod | string | null;
}

interface UpdateSessionChargeDeps {
  now: Date;
}

export function updateSessionCharge(
  charge: SessionCharge,
  input: UpdateSessionChargeInput,
  deps: UpdateSessionChargeDeps,
): SessionCharge {
  const newStatus = input.status ?? charge.status;
  const newAmount = input.amountInCents !== undefined ? input.amountInCents : charge.amountInCents;
  const newPaymentMethod =
    input.paymentMethod !== undefined ? input.paymentMethod : charge.paymentMethod;

  // Track paidAt transitions
  let paidAt = charge.paidAt;
  if (newStatus === "pago" && charge.status !== "pago") {
    paidAt = deps.now;
  } else if (newStatus !== "pago" && charge.status === "pago") {
    paidAt = null;
  }

  return {
    ...charge,
    status: newStatus,
    amountInCents: newAmount,
    paymentMethod: newPaymentMethod,
    paidAt,
    updatedAt: deps.now,
  };
}

/**
 * Derive the overall financial status for a patient given their charges.
 * Priority: overdue > pending_payment > up_to_date > no_data
 */
export function deriveFinancialStatus(charges: SessionCharge[]): FinancialStatus {
  if (charges.length === 0) return "no_data";

  const hasOverdue = charges.some((c) => c.status === "atrasado");
  if (hasOverdue) return "overdue";

  const hasPending = charges.some((c) => c.status === "pendente");
  if (hasPending) return "pending_payment";

  return "up_to_date";
}

export interface MonthlyFinancialSummary {
  totalSessions: number;
  totalReceivedCents: number;
  totalPendingCents: number;
}

/**
 * Compute monthly totals from a list of charges (already filtered by month).
 *
 * - totalSessions: count of all charges
 * - totalReceivedCents: sum of amountInCents for charges with status "pago" (non-null amounts only)
 * - totalPendingCents: sum of amountInCents for charges with status "pendente" or "atrasado" (non-null amounts only)
 */
export function deriveMonthlyFinancialSummary(charges: SessionCharge[]): MonthlyFinancialSummary {
  let totalReceivedCents = 0;
  let totalPendingCents = 0;

  for (const charge of charges) {
    if (charge.amountInCents === null) continue;

    if (charge.status === "pago") {
      totalReceivedCents += charge.amountInCents;
    } else if (charge.status === "pendente" || charge.status === "atrasado") {
      totalPendingCents += charge.amountInCents;
    }
  }

  return {
    totalSessions: charges.length,
    totalReceivedCents,
    totalPendingCents,
  };
}

/**
 * Enrich charges with auto-computed overdue status.
 *
 * If a charge has an associated appointment whose startsAt is in the past
 * and the charge status is still "pendente", it is marked as "atrasado".
 *
 * This is a pure transformation — does not persist to the database.
 * The returned charges have the correct status for display purposes.
 */
export function autoMarkOverdue(
  charges: SessionCharge[],
  appointmentDateMap: Map<string, Date>,
  now: Date = new Date(),
): SessionCharge[] {
  return charges.map((charge) => {
    if (charge.status !== "pendente" || !charge.appointmentId) {
      return charge;
    }
    const appointmentDate = appointmentDateMap.get(charge.appointmentId);
    if (appointmentDate && appointmentDate < now) {
      return { ...charge, status: "atrasado" as const };
    }
    return charge;
  });
}

/**
 * Compute overdue status for a single charge (used in patient profile).
 */
export function isChargeOverdue(
  charge: SessionCharge,
  appointmentDate: Date | null,
  now: Date = new Date(),
): boolean {
  if (charge.status !== "pendente" || !appointmentDate) return false;
  return appointmentDate < now;
}
