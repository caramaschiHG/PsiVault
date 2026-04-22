import { describe, it, expect } from "vitest";
import {
  createExpenseCategory,
  renameExpenseCategory,
  archiveExpenseCategory,
} from "@/lib/expense-categories/model";

const NOW = new Date("2025-01-01T10:00:00Z");

describe("createExpenseCategory", () => {
  it("uses createId for the id", () => {
    const cat = createExpenseCategory(
      { workspaceId: "ws_1", name: "Aluguel" },
      { now: NOW, createId: () => "cat_test" },
    );
    expect(cat.id).toBe("cat_test");
  });

  it("trims whitespace from name", () => {
    const cat = createExpenseCategory(
      { workspaceId: "ws_1", name: "  Aluguel  " },
      { now: NOW, createId: () => "cat_1" },
    );
    expect(cat.name).toBe("Aluguel");
  });

  it("sets archived to false by default", () => {
    const cat = createExpenseCategory(
      { workspaceId: "ws_1", name: "Energia" },
      { now: NOW, createId: () => "cat_2" },
    );
    expect(cat.archived).toBe(false);
  });

  it("sets deletedAt to null by default", () => {
    const cat = createExpenseCategory(
      { workspaceId: "ws_1", name: "Água" },
      { now: NOW, createId: () => "cat_3" },
    );
    expect(cat.deletedAt).toBeNull();
  });
});

describe("renameExpenseCategory", () => {
  it("updates name and updatedAt", () => {
    const cat = createExpenseCategory(
      { workspaceId: "ws_1", name: "Antigo" },
      { now: NOW, createId: () => "cat_4" },
    );
    const later = new Date("2025-06-01T10:00:00Z");
    const renamed = renameExpenseCategory(cat, "  Novo  ", { now: later });
    expect(renamed.name).toBe("Novo");
    expect(renamed.updatedAt).toBe(later);
    expect(renamed.createdAt).toBe(NOW);
  });
});

describe("archiveExpenseCategory", () => {
  it("sets archived to true", () => {
    const cat = createExpenseCategory(
      { workspaceId: "ws_1", name: "Internet" },
      { now: NOW, createId: () => "cat_5" },
    );
    const later = new Date("2025-06-01T10:00:00Z");
    const archived = archiveExpenseCategory(cat, { now: later });
    expect(archived.archived).toBe(true);
    expect(archived.updatedAt).toBe(later);
  });
});
