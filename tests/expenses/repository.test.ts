import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryExpenseRepository } from "@/lib/expenses/repository";
import { createExpense } from "@/lib/expenses/model";
import type { Expense } from "@/lib/expenses/model";

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return createExpense(
    {
      workspaceId: "ws_1",
      categoryId: "excat_1",
      description: "Teste",
      amountInCents: 10000,
      dueDate: new Date("2026-01-15"),
      createdByAccountId: "acct_1",
      ...overrides,
    },
    {
      now: new Date("2026-01-01"),
      createId: () => overrides.id ?? "exp_default",
    },
  );
}

let repo: InMemoryExpenseRepository;

beforeEach(() => {
  repo = new InMemoryExpenseRepository();
});

describe("InMemoryExpenseRepository", () => {
  it("create + findById works", async () => {
    const e = makeExpense({ id: "exp_1" });
    await repo.create(e);
    const found = await repo.findById("ws_1", "exp_1");
    expect(found).not.toBeNull();
    expect(found?.id).toBe("exp_1");
  });

  it("workspace isolation: findById returns null for wrong workspace", async () => {
    const e = makeExpense({ id: "exp_2" });
    await repo.create(e);
    const found = await repo.findById("ws_other", "exp_2");
    expect(found).toBeNull();
  });

  it("softDelete marks deletedAt and deletedByAccountId", async () => {
    const e = makeExpense({ id: "exp_3" });
    await repo.create(e);
    const now = new Date("2026-06-01");
    await repo.softDelete("ws_1", "exp_3", "acct_actor", now);
    // findByWorkspace should not return deleted records
    const list = await repo.findByWorkspace("ws_1");
    expect(list.find((x) => x.id === "exp_3")).toBeUndefined();
    // verify via direct findById the fields are set
    const deleted = await repo.findById("ws_1", "exp_3");
    expect(deleted?.deletedAt).toEqual(now);
    expect(deleted?.deletedByAccountId).toBe("acct_actor");
  });

  it("findBySeries returns only the requested series", async () => {
    const s1e1 = { ...makeExpense({ id: "exp_s1_0" }), seriesId: "series_A", seriesIndex: 0 };
    const s1e2 = { ...makeExpense({ id: "exp_s1_1" }), seriesId: "series_A", seriesIndex: 1 };
    const s2e1 = { ...makeExpense({ id: "exp_s2_0" }), seriesId: "series_B", seriesIndex: 0 };
    await repo.createMany([s1e1, s1e2, s2e1]);
    const result = await repo.findBySeries("ws_1", "series_A");
    expect(result).toHaveLength(2);
    expect(result.every((o) => o.seriesId === "series_A")).toBe(true);
  });

  it('softDeleteWithScope "this" only deletes 1 expense', async () => {
    const expenses = Array.from({ length: 3 }, (_, i) => ({
      ...makeExpense({ id: `exp_sc_${i}` }),
      seriesId: "series_SC",
      seriesIndex: i,
    }));
    await repo.createMany(expenses);
    const now = new Date("2026-06-01");
    await repo.softDeleteWithScope("ws_1", "exp_sc_1", "this", "acct_1", now);
    const remaining = await repo.findBySeries("ws_1", "series_SC");
    expect(remaining).toHaveLength(2);
    expect(remaining.find((e) => e.id === "exp_sc_1")).toBeUndefined();
  });

  it('softDeleteWithScope "this_and_future" affects from index onwards', async () => {
    const expenses = Array.from({ length: 5 }, (_, i) => ({
      ...makeExpense({ id: `exp_sf_${i}` }),
      seriesId: "series_SF",
      seriesIndex: i,
    }));
    await repo.createMany(expenses);
    const now = new Date("2026-06-01");
    await repo.softDeleteWithScope("ws_1", "exp_sf_2", "this_and_future", "acct_1", now);
    const remaining = await repo.findBySeries("ws_1", "series_SF");
    expect(remaining).toHaveLength(2);
    expect(remaining.map((e) => e.seriesIndex)).toEqual([0, 1]);
  });

  it('softDeleteWithScope "all" deletes all 12 in series', async () => {
    const expenses = Array.from({ length: 12 }, (_, i) => ({
      ...makeExpense({ id: `exp_all_${i}` }),
      seriesId: "series_ALL",
      seriesIndex: i,
    }));
    await repo.createMany(expenses);
    const now = new Date("2026-06-01");
    await repo.softDeleteWithScope("ws_1", "exp_all_0", "all", "acct_1", now);
    const remaining = await repo.findBySeries("ws_1", "series_ALL");
    expect(remaining).toHaveLength(0);
  });
});
