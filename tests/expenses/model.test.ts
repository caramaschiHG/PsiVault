import { describe, it, expect } from "vitest";
import { createExpense, updateExpense } from "@/lib/expenses/model";
import type { CreateExpenseInput, CreateExpenseDeps } from "@/lib/expenses/model";

const baseInput: CreateExpenseInput = {
  workspaceId: "ws_1",
  categoryId: "excat_1",
  description: "  Aluguel do consultório  ",
  amountInCents: 150000,
  dueDate: new Date("2026-03-01"),
  createdByAccountId: "acct_1",
};

const baseDeps: CreateExpenseDeps = {
  now: new Date("2026-01-01T10:00:00Z"),
  createId: () => "exp_fixed",
};

describe("createExpense", () => {
  it("uses the id from createId", () => {
    const e = createExpense(baseInput, baseDeps);
    expect(e.id).toBe("exp_fixed");
  });

  it("trims description", () => {
    const e = createExpense(baseInput, baseDeps);
    expect(e.description).toBe("Aluguel do consultório");
  });

  it("all optional fields default to null", () => {
    const e = createExpense(baseInput, baseDeps);
    expect(e.recurrencePattern).toBeNull();
    expect(e.seriesId).toBeNull();
    expect(e.seriesIndex).toBeNull();
    expect(e.receiptStorageKey).toBeNull();
    expect(e.receiptFileName).toBeNull();
    expect(e.receiptMimeType).toBeNull();
    expect(e.deletedAt).toBeNull();
    expect(e.deletedByAccountId).toBeNull();
  });

  it("sets createdAt and updatedAt from deps.now", () => {
    const e = createExpense(baseInput, baseDeps);
    expect(e.createdAt).toEqual(baseDeps.now);
    expect(e.updatedAt).toEqual(baseDeps.now);
  });
});

describe("updateExpense", () => {
  it("applies patch and updates updatedAt", () => {
    const e = createExpense(baseInput, baseDeps);
    const now2 = new Date("2026-02-01T10:00:00Z");
    const updated = updateExpense(e, { amountInCents: 200000, description: "Novo valor" }, { now: now2 });
    expect(updated.amountInCents).toBe(200000);
    expect(updated.description).toBe("Novo valor");
    expect(updated.updatedAt).toEqual(now2);
    expect(updated.createdAt).toEqual(baseDeps.now);
  });
});
