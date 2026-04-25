import { describe, expect, it } from "vitest";
import { renderPracticeDocumentPdf } from "../src/lib/documents/pdf";

describe("renderPracticeDocumentPdf", () => {
  const baseInput = {
    title: "Test Document",
    patientName: "Patient Name",
    professionalName: "Professional Name",
    crp: "06/123456",
    generatedAtLabel: "25 de abril de 2026",
    content: "Plain text content for testing PDF generation.",
  };

  it("generates PDF for plain text content", async () => {
    const pdf = await renderPracticeDocumentPdf({ ...baseInput, isRichText: false });
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdf.toString("binary", 0, 4)).toBe("%PDF");
  });

  it("generates PDF for rich text content", async () => {
    const html = "<p>Hello <strong>world</strong></p><ul><li>One</li><li>Two</li></ul>";
    const pdf = await renderPracticeDocumentPdf({ ...baseInput, content: html, isRichText: true });
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdf.toString("binary", 0, 4)).toBe("%PDF");
  });

  it("generates PDF with signature", async () => {
    // Minimal valid 1x1 transparent PNG in base64
    const testPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const pdf = await renderPracticeDocumentPdf({ ...baseInput, signatureDataUri: testPng });
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("generates PDF for empty content", async () => {
    const pdf = await renderPracticeDocumentPdf({ ...baseInput, content: "" });
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdf.toString("binary", 0, 4)).toBe("%PDF");
  });
});
