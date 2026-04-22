import { describe, it, expect } from "vitest";
import { buildExpenseReceiptStorageKey } from "@/lib/expenses/storage";

describe("buildExpenseReceiptStorageKey", () => {
  it("key starts with workspaceId/expenseId/", () => {
    const key = buildExpenseReceiptStorageKey({ workspaceId: "ws_a", expenseId: "exp_1", fileName: "nota.pdf" });
    expect(key).toMatch(/^ws_a\/exp_1\//);
  });

  it("key ends with -nota.pdf", () => {
    const key = buildExpenseReceiptStorageKey({ workspaceId: "ws_a", expenseId: "exp_1", fileName: "nota.pdf" });
    expect(key).toMatch(/-nota\.pdf$/);
  });

  it("sanitizes special characters in fileName", () => {
    const key = buildExpenseReceiptStorageKey({ workspaceId: "ws_a", expenseId: "exp_1", fileName: "nota fiscal #1.pdf" });
    expect(key).not.toContain(" ");
    expect(key).not.toContain("#");
  });

  it("generates unique keys for each call", () => {
    const keys = new Set(
      Array.from({ length: 100 }, () =>
        buildExpenseReceiptStorageKey({ workspaceId: "ws_a", expenseId: "exp_1", fileName: "nota.pdf" })
      )
    );
    expect(keys.size).toBe(100);
  });
});
