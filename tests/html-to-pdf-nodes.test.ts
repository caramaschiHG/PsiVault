import { describe, expect, it } from "vitest";
import { htmlToPdfNodes } from "../src/lib/documents/html-to-pdf-nodes";

describe("htmlToPdfNodes", () => {
  it("produces Text node inside View for simple paragraph", () => {
    const nodes = htmlToPdfNodes("<p>Hello</p>");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "view",
      style: { marginBottom: 6 },
    });
    expect((nodes[0] as any).children).toHaveLength(1);
    expect((nodes[0] as any).children[0]).toMatchObject({
      type: "text",
      text: "Hello",
    });
  });

  it("produces correct style flags for bold and italic", () => {
    const nodes = htmlToPdfNodes("<strong>Bold</strong> and <em>italic</em>");
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toMatchObject({
      type: "text",
      text: "Bold",
      style: { fontFamily: "Helvetica-Bold", fontWeight: 700 },
    });
    expect(nodes[1]).toMatchObject({ type: "text", text: " and " });
    expect(nodes[2]).toMatchObject({
      type: "text",
      text: "italic",
      style: { fontFamily: "Helvetica-Oblique" },
    });
  });

  it("produces bulleted list with two items", () => {
    const nodes = htmlToPdfNodes("<ul><li>One</li><li>Two</li></ul>");
    expect(nodes).toHaveLength(1);
    const ul = nodes[0] as any;
    expect(ul.type).toBe("view");
    expect(ul.children).toHaveLength(2);
    expect(ul.children[0].children[0]).toMatchObject({ type: "text", text: "\u2022 " });
    expect(ul.children[0].children[1]).toMatchObject({ type: "text", text: "One" });
    expect(ul.children[1].children[0]).toMatchObject({ type: "text", text: "\u2022 " });
    expect(ul.children[1].children[1]).toMatchObject({ type: "text", text: "Two" });
  });

  it("produces h1 with larger font and bold", () => {
    const nodes = htmlToPdfNodes("<h1>Title</h1>");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "view",
      style: { marginBottom: 10, fontSize: 18, fontFamily: "Helvetica-Bold" },
    });
  });

  it("passes text-align style through", () => {
    const nodes = htmlToPdfNodes("<p style='text-align:center'>Center</p>");
    expect(nodes[0]).toMatchObject({
      type: "view",
      style: { marginBottom: 6, textAlign: "center" },
    });
  });

  it("ignores script tag and keeps safe content", () => {
    const nodes = htmlToPdfNodes("<script>alert(1)</script><p>Safe</p>");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "view",
      style: { marginBottom: 6 },
    });
    expect((nodes[0] as any).children[0]).toMatchObject({
      type: "text",
      text: "Safe",
    });
  });

  it("returns empty array for empty string", () => {
    expect(htmlToPdfNodes("")).toEqual([]);
    expect(htmlToPdfNodes("   ")).toEqual([]);
  });

  it("handles ordered lists with numbering", () => {
    const nodes = htmlToPdfNodes("<ol><li>First</li><li>Second</li></ol>");
    const ol = nodes[0] as any;
    expect(ol.children[0].children[0]).toMatchObject({ type: "text", text: "1. " });
    expect(ol.children[1].children[0]).toMatchObject({ type: "text", text: "2. " });
  });

  it("handles nested bold + italic", () => {
    const nodes = htmlToPdfNodes("<strong><em>Both</em></strong>");
    expect(nodes[0]).toMatchObject({
      type: "text",
      text: "Both",
      style: { fontFamily: "Helvetica-BoldOblique", fontWeight: 700 },
    });
  });

  it("handles blockquote with border styling", () => {
    const nodes = htmlToPdfNodes("<blockquote>Quote</blockquote>");
    expect(nodes[0]).toMatchObject({
      type: "view",
      style: {
        marginLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: "#ccc",
        paddingLeft: 8,
        marginBottom: 6,
      },
    });
  });

  it("handles hr as horizontal rule", () => {
    const nodes = htmlToPdfNodes("<hr>");
    expect(nodes[0]).toMatchObject({
      type: "view",
      style: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 8 },
    });
  });

  it("handles anchor with href", () => {
    const nodes = htmlToPdfNodes('<a href="https://example.com">Link</a>');
    expect(nodes[0]).toMatchObject({
      type: "text",
      text: "https://example.com",
      style: { color: "#2563eb", textDecoration: "underline" },
    });
  });

  it("handles underline tag", () => {
    const nodes = htmlToPdfNodes("<u>Underlined</u>");
    expect(nodes[0]).toMatchObject({
      type: "text",
      text: "Underlined",
      style: { textDecoration: "underline" },
    });
  });

  it("handles br as newline", () => {
    const nodes = htmlToPdfNodes("Line1<br>Line2");
    expect(nodes[1]).toMatchObject({ type: "text", text: "\n" });
  });
});
