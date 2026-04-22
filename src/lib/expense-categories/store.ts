import { createPrismaExpenseCategoryRepository } from "./repository.prisma";
import type { ExpenseCategoryRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultExpenseCategory__: ExpenseCategoryRepository | undefined;
}

export function getExpenseCategoryStore(): { repository: ExpenseCategoryRepository } {
  globalThis.__psivaultExpenseCategory__ ??= createPrismaExpenseCategoryRepository();
  return { repository: globalThis.__psivaultExpenseCategory__ };
}

export function setExpenseCategoryRepositoryForTest(repo: ExpenseCategoryRepository): void {
  globalThis.__psivaultExpenseCategory__ = repo;
}
