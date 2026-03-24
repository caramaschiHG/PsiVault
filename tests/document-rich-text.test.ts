import { describe, expect, it } from "vitest";
import {
  isMeaningfulDocumentContent,
  normalizeDocumentContent,
  richTextHtmlToPlainText,
  sanitizeRichTextHtml,
} from "../src/lib/documents/rich-text";

describe("document rich text helpers", () => {
  it("sanitizes session_record html by stripping scripts and event handlers", () => {
    const result = sanitizeRichTextHtml(
      `<p onclick="alert(1)">Seguro</p><script>alert("x")</script><a href="javascript:alert(1)">link</a>`,
    );

    expect(result).toContain("<p>Seguro</p>");
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("javascript:");
  });

  it("preserves safe alignment and external links", () => {
    const result = sanitizeRichTextHtml(
      `<div style="text-align: center; color: red">Centro</div><a href="https://example.com">Abrir</a>`,
    );

    expect(result).toContain(`style="text-align:center"`);
    expect(result).toContain(`href="https://example.com"`);
    expect(result).toContain(`target="_blank"`);
  });

  it("converts rich text html to plain text", () => {
    const result = richTextHtmlToPlainText("<h1>Titulo</h1><p>Corpo</p><ul><li>Item</li></ul>");
    expect(result).toContain("Titulo");
    expect(result).toContain("Corpo");
    expect(result).toContain("• Item");
  });

  it("normalizes plain text documents by trimming only", () => {
    expect(normalizeDocumentContent("anamnesis", "  teste  ")).toBe("teste");
  });

  it("requires meaningful text for session_record content", () => {
    expect(isMeaningfulDocumentContent("session_record", "<div><br></div>")).toBe(false);
    expect(isMeaningfulDocumentContent("session_record", "<p>Registro clínico privado</p>")).toBe(true);
  });
});
