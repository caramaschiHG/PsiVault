import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryExpenseCategoryRepository } from "@/lib/expense-categories/repository";
import { createExpenseCategory } from "@/lib/expense-categories/model";

const NOW = new Date("2025-01-01T10:00:00Z");
let counter = 0;
function nextId() {
  return `cat_${++counter}`;
}

function makeCategory(workspaceId: string, name: string) {
  return createExpenseCategory({ workspaceId, name }, { now: NOW, createId: nextId });
}

describe("InMemoryExpenseCategoryRepository", () => {
  let repo: InMemoryExpenseCategoryRepository;

  beforeEach(() => {
    repo = new InMemoryExpenseCategoryRepository();
  });

  it("create + findById returns the created category", async () => {
    const cat = makeCategory("ws_1", "Aluguel");
    await repo.create(cat);
    const found = await repo.findById("ws_1", cat.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(cat.id);
    expect(found?.name).toBe("Aluguel");
  });

  it("findById returns null for wrong workspace", async () => {
    const cat = makeCategory("ws_1", "Aluguel");
    await repo.create(cat);
    const found = await repo.findById("ws_2", cat.id);
    expect(found).toBeNull();
  });

  it("findByWorkspace isolates by workspace", async () => {
    const cat1 = makeCategory("ws_1", "Aluguel");
    const cat2 = makeCategory("ws_2", "Energia");
    await repo.create(cat1);
    await repo.create(cat2);

    const ws1Results = await repo.findByWorkspace("ws_1");
    expect(ws1Results).toHaveLength(1);
    expect(ws1Results[0].id).toBe(cat1.id);
  });

  it("softDelete marks deletedAt and deletedByAccountId", async () => {
    const cat = makeCategory("ws_1", "Internet");
    await repo.create(cat);
    const deleteTime = new Date("2025-06-01T00:00:00Z");
    await repo.softDelete("ws_1", cat.id, "acct_99", deleteTime);

    // Must use direct findById to inspect state — we can use update path
    const found = await repo.findById("ws_1", cat.id);
    // findById doesn't filter soft-deleted in our implementation
    expect(found?.deletedAt).toEqual(deleteTime);
    expect(found?.deletedByAccountId).toBe("acct_99");
  });

  it("findByWorkspace excludes soft-deleted categories", async () => {
    const cat = makeCategory("ws_1", "Transporte");
    await repo.create(cat);
    await repo.softDelete("ws_1", cat.id, "acct_1", new Date());
    const results = await repo.findByWorkspace("ws_1");
    expect(results).toHaveLength(0);
  });

  it("findActiveByWorkspace excludes archived categories", async () => {
    const cat = makeCategory("ws_1", "Água");
    const archived = createExpenseCategory(
      { workspaceId: "ws_1", name: "Telefone" },
      { now: NOW, createId: nextId },
    );
    await repo.create(cat);
    await repo.create({ ...archived, archived: true });
    const results = await repo.findActiveByWorkspace("ws_1");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(cat.id);
  });

  it("findActiveByWorkspace excludes soft-deleted categories", async () => {
    const cat = makeCategory("ws_1", "Luz");
    await repo.create(cat);
    await repo.softDelete("ws_1", cat.id, "acct_1", new Date());
    const results = await repo.findActiveByWorkspace("ws_1");
    expect(results).toHaveLength(0);
  });

  it("update patches the category", async () => {
    const cat = makeCategory("ws_1", "Gás");
    await repo.create(cat);
    const newTime = new Date("2025-07-01T00:00:00Z");
    const updated = await repo.update("ws_1", cat.id, { name: "Gás Natural", updatedAt: newTime });
    expect(updated.name).toBe("Gás Natural");
    expect(updated.updatedAt).toEqual(newTime);
  });
});
