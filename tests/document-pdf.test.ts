import { describe, expect, it } from "vitest";
import { renderPracticeDocumentPdf } from "../src/lib/documents/pdf";

describe("document PDF rendering", () => {
  it("renders a PDF buffer for patient record summaries", async () => {
    const pdf = await renderPracticeDocumentPdf({
      title: "Resumo de Prontuário",
      patientName: "Maria Oliveira",
      professionalName: "Dra. Ana Souza",
      crp: "CRP 06/12345",
      generatedAtLabel: "24 de março de 2026",
      content: "RESUMO DE PRONTUÁRIO PSICOLÓGICO\n\nSíntese do acompanhamento.",
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});
