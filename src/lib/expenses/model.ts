export type ExpenseRecurrencePattern = "MENSAL" | "QUINZENAL";
export type SeriesScope = "this" | "this_and_future" | "all";

export interface Expense {
  id: string;
  workspaceId: string;
  categoryId: string;
  description: string;
  amountInCents: number;
  dueDate: Date;
  recurrencePattern: ExpenseRecurrencePattern | null;
  seriesId: string | null;
  seriesIndex: number | null;
  receiptStorageKey: string | null;
  receiptFileName: string | null;
  receiptMimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdByAccountId: string;
  deletedAt: Date | null;
  deletedByAccountId: string | null;
}

export interface CreateExpenseInput {
  workspaceId: string;
  categoryId: string;
  description: string;
  amountInCents: number;
  dueDate: Date;
  recurrencePattern?: ExpenseRecurrencePattern | null;
  seriesId?: string | null;
  seriesIndex?: number | null;
  receiptStorageKey?: string | null;
  receiptFileName?: string | null;
  receiptMimeType?: string | null;
  createdByAccountId: string;
}

export interface CreateExpenseDeps {
  now: Date;
  createId: () => string;
}

export function createExpense(input: CreateExpenseInput, deps: CreateExpenseDeps): Expense {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    categoryId: input.categoryId,
    description: input.description.trim(),
    amountInCents: input.amountInCents,
    dueDate: input.dueDate,
    recurrencePattern: input.recurrencePattern ?? null,
    seriesId: input.seriesId ?? null,
    seriesIndex: input.seriesIndex ?? null,
    receiptStorageKey: input.receiptStorageKey ?? null,
    receiptFileName: input.receiptFileName ?? null,
    receiptMimeType: input.receiptMimeType ?? null,
    createdAt: deps.now,
    updatedAt: deps.now,
    createdByAccountId: input.createdByAccountId,
    deletedAt: null,
    deletedByAccountId: null,
  };
}

export function updateExpense(
  expense: Expense,
  patch: Partial<Pick<Expense, "description" | "amountInCents" | "dueDate" | "categoryId" | "recurrencePattern">>,
  deps: { now: Date },
): Expense {
  return { ...expense, ...patch, updatedAt: deps.now };
}
