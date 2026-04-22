import { createPrismaExpenseRepository } from "./repository.prisma";
import type { ExpenseRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultExpense__: ExpenseRepository | undefined;
}

export function getExpenseStore(): { repository: ExpenseRepository } {
  globalThis.__psivaultExpense__ ??= createPrismaExpenseRepository();
  return { repository: globalThis.__psivaultExpense__ };
}

export function setExpenseRepositoryForTest(repo: ExpenseRepository): void {
  globalThis.__psivaultExpense__ = repo;
}
