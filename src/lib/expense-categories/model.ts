export interface ExpenseCategory {
  id: string;
  workspaceId: string;
  name: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedByAccountId: string | null;
}

export interface CreateExpenseCategoryInput {
  workspaceId: string;
  name: string;
}

export interface CreateExpenseCategoryDeps {
  now: Date;
  createId: () => string;
}

export function createExpenseCategory(
  input: CreateExpenseCategoryInput,
  deps: CreateExpenseCategoryDeps,
): ExpenseCategory {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    name: input.name.trim(),
    archived: false,
    createdAt: deps.now,
    updatedAt: deps.now,
    deletedAt: null,
    deletedByAccountId: null,
  };
}

export function renameExpenseCategory(
  category: ExpenseCategory,
  newName: string,
  deps: { now: Date },
): ExpenseCategory {
  return { ...category, name: newName.trim(), updatedAt: deps.now };
}

export function archiveExpenseCategory(
  category: ExpenseCategory,
  deps: { now: Date },
): ExpenseCategory {
  return { ...category, archived: true, updatedAt: deps.now };
}
