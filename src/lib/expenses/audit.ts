/**
 * Expense lifecycle audit helpers.
 *
 * Security policy (SECU-05):
 * - amountInCents and description must NEVER appear in audit metadata.
 * - description pode conter valores em texto livre — tratar como sensível.
 * - Apenas IDs, categoryId, recurrencePattern, seriesScope são seguros.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { Expense, SeriesScope } from "./model";

export type ExpenseAuditEventType =
  | "expense.created"
  | "expense.updated"
  | "expense.deleted"
  | "expense.receipt_attached"
  | "expense.receipt_replaced"
  | "expense.receipt_removed"
  | "expense.series_updated"
  | "expense.scope_changed";

interface CreateExpenseAuditEventInput {
  type: ExpenseAuditEventType;
  expense: Expense;
  actor: AuditActor;
  scope?: SeriesScope;
}

interface CreateExpenseAuditEventDeps {
  now: Date;
  createId: () => string;
}

const SUMMARIES: Record<ExpenseAuditEventType, string> = {
  "expense.created": "Despesa registrada.",
  "expense.updated": "Despesa atualizada.",
  "expense.deleted": "Despesa removida.",
  "expense.receipt_attached": "Comprovante anexado à despesa.",
  "expense.receipt_replaced": "Comprovante substituído.",
  "expense.receipt_removed": "Comprovante removido.",
  "expense.series_updated": "Série de despesas atualizada.",
  "expense.scope_changed": "Escopo de edição da série alterado.",
};

export function createExpenseAuditEvent(
  input: CreateExpenseAuditEventInput,
  deps: CreateExpenseAuditEventDeps,
): AuditEvent {
  // SECU-05: NUNCA incluir amountInCents, description, receiptFileName em metadata
  const metadata: Record<string, unknown> = {
    expenseId: input.expense.id,
    categoryId: input.expense.categoryId,
    recurrencePattern: input.expense.recurrencePattern,
    seriesId: input.expense.seriesId,
  };

  if (input.scope) metadata.seriesScope = input.scope;

  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: { kind: "expense", id: input.expense.id },
      summary: SUMMARIES[input.type],
      metadata,
    },
    { now: deps.now, createId: deps.createId },
  );
}
