import { describe, it, expect } from "vitest";
import { validateReceiptFile, MAX_RECEIPT_SIZE_BYTES } from "@/lib/expenses/upload-validation";

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

describe("validateReceiptFile", () => {
  it("returns ok for valid PDF 1MB", () => {
    const file = makeFile("nota.pdf", "application/pdf", 1024 * 1024);
    expect(validateReceiptFile(file)).toEqual({ ok: true });
  });

  it("returns error for invalid MIME type", () => {
    const file = makeFile("nota.txt", "text/plain", 1024);
    const result = validateReceiptFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Formato não suportado");
  });

  it("returns ok for file exactly at 10MB limit", () => {
    const file = makeFile("nota.pdf", "application/pdf", MAX_RECEIPT_SIZE_BYTES);
    expect(validateReceiptFile(file)).toEqual({ ok: true });
  });

  it("returns error for file 1 byte over 10MB", () => {
    const file = makeFile("nota.pdf", "application/pdf", MAX_RECEIPT_SIZE_BYTES + 1);
    const result = validateReceiptFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Arquivo muito grande");
  });

  it("returns error for empty file", () => {
    const file = makeFile("nota.pdf", "application/pdf", 0);
    const result = validateReceiptFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Arquivo vazio.");
  });
});
