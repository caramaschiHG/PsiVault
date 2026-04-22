/**
 * ExpenseCategory lifecycle audit helpers.
 *
 * Security policy (SECU-05):
 * - Only categoryId and name are safe for audit metadata.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { ExpenseCategory } from "./model";

export type ExpenseCategoryAuditEventType =
  | "expense_category.created"
  | "expense_category.renamed"
  | "expense_category.archived";

interface CreateExpenseCategoryAuditEventInput {
  type: ExpenseCategoryAuditEventType;
  category: ExpenseCategory;
  actor: AuditActor;
}

interface CreateExpenseCategoryAuditEventDeps {
  now: Date;
  createId: () => string;
}

const SUMMARIES: Record<ExpenseCategoryAuditEventType, string> = {
  "expense_category.created": "Categoria de despesa criada.",
  "expense_category.renamed": "Categoria de despesa renomeada.",
  "expense_category.archived": "Categoria de despesa arquivada.",
};

export function createExpenseCategoryAuditEvent(
  input: CreateExpenseCategoryAuditEventInput,
  deps: CreateExpenseCategoryAuditEventDeps,
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: { kind: "expense_category", id: input.category.id },
      summary: SUMMARIES[input.type],
      metadata: {
        categoryId: input.category.id,
        name: input.category.name,
      },
    },
    { now: deps.now, createId: deps.createId },
  );
}
