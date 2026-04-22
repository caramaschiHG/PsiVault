import { describe, it, expect } from "vitest";
import { createExpenseAuditEvent, type ExpenseAuditEventType } from "@/lib/expenses/audit";
import type { Expense } from "@/lib/expenses/model";

const FORBIDDEN_KEYS = ["amountInCents", "amount", "description", "value", "receiptFileName"];
const ALL_TYPES: ExpenseAuditEventType[] = [
  "expense.created",
  "expense.updated",
  "expense.deleted",
  "expense.receipt_attached",
  "expense.receipt_replaced",
  "expense.receipt_removed",
  "expense.series_updated",
  "expense.scope_changed",
];

const mockExpense: Expense = {
  id: "exp_test",
  workspaceId: "ws_test",
  categoryId: "excat_test",
  description: "conta secreta com valor 99999",
  amountInCents: 99999,
  dueDate: new Date("2026-01-15"),
  recurrencePattern: null,
  seriesId: null,
  seriesIndex: null,
  receiptStorageKey: null,
  receiptFileName: "nota-fiscal-secreta.pdf",
  receiptMimeType: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  createdByAccountId: "acct_test",
  deletedAt: null,
  deletedByAccountId: null,
};

describe("SECU-05: expense audit metadata never leaks sensitive fields", () => {
  for (const type of ALL_TYPES) {
    it(`${type} metadata excludes ${FORBIDDEN_KEYS.join(", ")}`, () => {
      const event = createExpenseAuditEvent(
        {
          type,
          expense: mockExpense,
          actor: { accountId: "acct_test", workspaceId: "ws_test" },
          scope: "all",
        },
        { now: new Date(), createId: () => "audit_test" },
      );
      for (const key of FORBIDDEN_KEYS) {
        expect(event.metadata, `${type} leaked ${key}`).not.toHaveProperty(key);
      }
    });
  }
});
