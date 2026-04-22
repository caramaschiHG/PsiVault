import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryExpenseRepository } from "@/lib/expenses/repository";
import { InMemoryExpenseCategoryRepository } from "@/lib/expense-categories/repository";
import { setExpenseRepositoryForTest } from "@/lib/expenses/store";
import { setExpenseCategoryRepositoryForTest } from "@/lib/expense-categories/store";
import type { ExpenseCategory } from "@/lib/expense-categories/model";

// Mock resolveSession
vi.mock("@/lib/supabase/session", () => ({
  resolveSession: vi.fn().mockResolvedValue({ accountId: "acct_1", workspaceId: "ws_a" }),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("expense actions — workspace scoping", () => {
  let expenseRepo: InMemoryExpenseRepository;
  let categoryRepo: InMemoryExpenseCategoryRepository;

  beforeEach(() => {
    expenseRepo = new InMemoryExpenseRepository();
    categoryRepo = new InMemoryExpenseCategoryRepository();
    setExpenseRepositoryForTest(expenseRepo);
    setExpenseCategoryRepositoryForTest(categoryRepo);
  });

  it("createExpenseCategoryAction sets correct workspaceId", async () => {
    const { createExpenseCategoryAction } = await import("@/app/(vault)/financeiro/actions");
    const fd = new FormData();
    fd.set("name", "Aluguel");
    const result = await createExpenseCategoryAction(null, fd);
    expect(result.error).toBeUndefined();
    const categories = await categoryRepo.findByWorkspace("ws_a");
    expect(categories).toHaveLength(1);
    expect(categories[0].workspaceId).toBe("ws_a");
  });

  it("createExpenseAction rejects category from different workspace", async () => {
    const otherCategory: ExpenseCategory = {
      id: "excat_other",
      workspaceId: "ws_b",
      name: "Outro",
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      deletedByAccountId: null,
    };
    await categoryRepo.create(otherCategory);

    const { createExpenseAction } = await import("@/app/(vault)/financeiro/actions");
    const fd = new FormData();
    fd.set("description", "Teste");
    fd.set("amount", "100,00");
    fd.set("categoryId", "excat_other"); // belongs to ws_b, not ws_a
    fd.set("dueDate", "2026-01-15");
    const result = await createExpenseAction(null, fd);
    expect(result.error).toBeDefined();
  });

  it("createExpenseAction creates expense with correct workspaceId", async () => {
    const { createExpenseCategoryAction, createExpenseAction } = await import("@/app/(vault)/financeiro/actions");
    const catFd = new FormData();
    catFd.set("name", "Aluguel");
    const catResult = await createExpenseCategoryAction(null, catFd);
    expect(catResult.categoryId).toBeDefined();

    const fd = new FormData();
    fd.set("description", "Aluguel mensal");
    fd.set("amount", "1500,00");
    fd.set("categoryId", catResult.categoryId!);
    fd.set("dueDate", "2026-01-15");
    const result = await createExpenseAction(null, fd);
    expect(result.error).toBeUndefined();
    const expenses = await expenseRepo.findByWorkspace("ws_a");
    expect(expenses).toHaveLength(1);
    expect(expenses[0].workspaceId).toBe("ws_a");
  });
});
