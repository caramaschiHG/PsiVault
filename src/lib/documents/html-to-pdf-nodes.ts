export interface PdfTextNode {
  type: "text";
  text: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    color?: string;
    textDecoration?: string;
    textAlign?: "left" | "center" | "right";
  };
}

export interface PdfViewNode {
  type: "view";
  style?: Record<string, unknown>;
  children?: PdfNode[];
}

export type PdfNode = PdfTextNode | PdfViewNode;

interface ParserState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align?: "left" | "center" | "right";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function parseStyleAttribute(rawStyle: string): Record<string, string> {
  const result: Record<string, string> = {};
  const declarations = rawStyle.split(";");
  for (const decl of declarations) {
    const [prop, val] = decl.split(":");
    if (prop && val) {
      result[prop.trim().toLowerCase()] = val.trim().toLowerCase();
    }
  }
  return result;
}

function parseAlign(rawStyle: string): "left" | "center" | "right" | undefined {
  const style = parseStyleAttribute(rawStyle);
  const align = style["text-align"];
  if (align === "center" || align === "right" || align === "left") {
    return align;
  }
  return undefined;
}

function createTextNode(
  text: string,
  state: ParserState,
): PdfTextNode {
  const style: PdfTextNode["style"] = {};

  if (state.bold) {
    style.fontFamily = "Helvetica-Bold";
    style.fontWeight = 700;
  }
  if (state.italic) {
    style.fontFamily = style.fontFamily
      ? "Helvetica-BoldOblique"
      : "Helvetica-Oblique";
  }
  if (state.underline) {
    style.textDecoration = "underline";
  }
  if (state.align) {
    style.textAlign = state.align;
  }

  const hasStyle = Object.keys(style).length > 0;
  return {
    type: "text",
    text: decodeHtmlEntities(text),
    ...(hasStyle ? { style } : {}),
  };
}

function pushTextNodes(
  parentChildren: PdfNode[],
  text: string,
  state: ParserState,
) {
  if (!text) return;
  parentChildren.push(createTextNode(text, state));
}

function parseHtmlRecursive(
  html: string,
  state: ParserState,
  parentTag?: string,
  listCounter?: { count: number },
): PdfNode[] {
  const nodes: PdfNode[] = [];
  let i = 0;

  while (i < html.length) {
    const tagOpen = html.indexOf("<", i);

    if (tagOpen === -1) {
      const remaining = html.slice(i);
      if (remaining) {
        pushTextNodes(nodes, remaining, state);
      }
      break;
    }

    if (tagOpen > i) {
      pushTextNodes(nodes, html.slice(i, tagOpen), state);
    }

    const tagClose = html.indexOf(">", tagOpen);
    if (tagClose === -1) {
      break;
    }

    const fullTag = html.slice(tagOpen, tagClose + 1);
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>") || /^<(br|hr)\b/i.test(fullTag);

    const tagMatch = fullTag.match(/^<\/?([a-zA-Z0-9-]+)(?:\s|>|\/)/);
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";

    if (isClosing) {
      if (tagName === parentTag) {
        return nodes;
      }
      i = tagClose + 1;
      continue;
    }

    if (tagName === "br") {
      nodes.push({ type: "text", text: "\n" });
      i = tagClose + 1;
      continue;
    }

    if (tagName === "hr") {
      nodes.push({
        type: "view",
        style: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 8 },
      });
      i = tagClose + 1;
      continue;
    }

    const styleMatch = fullTag.match(/style\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const rawStyle = styleMatch ? (styleMatch[1] ?? styleMatch[2]) : "";

    const childState: ParserState = { ...state };
    if (rawStyle) {
      const align = parseAlign(rawStyle);
      if (align) childState.align = align;
    }

    if (isSelfClosing) {
      i = tagClose + 1;
      continue;
    }

    const endTag = `</${tagName}>`;
    const endIndex = html.indexOf(endTag, tagClose + 1);
    if (endIndex === -1) {
      i = tagClose + 1;
      continue;
    }

    const innerHtml = html.slice(tagClose + 1, endIndex);

    switch (tagName) {
      case "p": {
        const align = parseAlign(rawStyle);
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 6, ...(align ? { textAlign: align } : {}) },
          children: parseHtmlRecursive(innerHtml, childState, "p"),
        };
        nodes.push(viewNode);
        break;
      }
      case "h1": {
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 10, fontSize: 18, fontFamily: "Helvetica-Bold" },
          children: parseHtmlRecursive(innerHtml, { ...childState, bold: true }, "h1"),
        };
        nodes.push(viewNode);
        break;
      }
      case "h2": {
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 8, fontSize: 14, fontFamily: "Helvetica-Bold" },
          children: parseHtmlRecursive(innerHtml, { ...childState, bold: true }, "h2"),
        };
        nodes.push(viewNode);
        break;
      }
      case "h3": {
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 6, fontSize: 12, fontFamily: "Helvetica-Bold" },
          children: parseHtmlRecursive(innerHtml, { ...childState, bold: true }, "h3"),
        };
        nodes.push(viewNode);
        break;
      }
      case "strong": {
        nodes.push(
          ...parseHtmlRecursive(innerHtml, { ...childState, bold: true }, "strong"),
        );
        break;
      }
      case "em": {
        nodes.push(
          ...parseHtmlRecursive(innerHtml, { ...childState, italic: true }, "em"),
        );
        break;
      }
      case "u": {
        nodes.push(
          ...parseHtmlRecursive(innerHtml, { ...childState, underline: true }, "u"),
        );
        break;
      }
      case "ul": {
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 6 },
          children: parseHtmlRecursive(innerHtml, childState, "ul", { count: 0 }),
        };
        nodes.push(viewNode);
        break;
      }
      case "ol": {
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 6 },
          children: parseHtmlRecursive(innerHtml, childState, "ol", { count: 0 }),
        };
        nodes.push(viewNode);
        break;
      }
      case "li": {
        const prefix = parentTag === "ol"
          ? `${(listCounter ? ++listCounter.count : 1)}. `
          : "\u2022 ";
        const viewNode: PdfViewNode = {
          type: "view",
          style: { marginBottom: 2 },
          children: [
            { type: "text", text: prefix },
            ...parseHtmlRecursive(innerHtml, childState, "li"),
          ],
        };
        nodes.push(viewNode);
        break;
      }
      case "blockquote": {
        const viewNode: PdfViewNode = {
          type: "view",
          style: {
            marginLeft: 12,
            borderLeftWidth: 2,
            borderLeftColor: "#ccc",
            paddingLeft: 8,
            marginBottom: 6,
          },
          children: parseHtmlRecursive(innerHtml, childState, "blockquote"),
        };
        nodes.push(viewNode);
        break;
      }
      case "a": {
        const hrefMatch = fullTag.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
        const href = hrefMatch ? (hrefMatch[1] ?? hrefMatch[2]) : "";
        const linkNodes = parseHtmlRecursive(innerHtml, childState, "a");
        if (linkNodes.length === 1 && linkNodes[0].type === "text") {
          nodes.push({
            type: "text",
            text: href || linkNodes[0].text,
            style: {
              color: "#2563eb",
              textDecoration: "underline",
              ...linkNodes[0].style,
            },
          });
        } else {
          nodes.push(...linkNodes);
        }
        break;
      }
      case "div": {
        const align = parseAlign(rawStyle);
        const viewNode: PdfViewNode = {
          type: "view",
          style: { ...(align ? { textAlign: align } : {}) },
          children: parseHtmlRecursive(innerHtml, childState, "div"),
        };
        nodes.push(viewNode);
        break;
      }
      default:
        break;
    }

    i = endIndex + endTag.length;
  }

  return nodes;
}

export function htmlToPdfNodes(html: string): PdfNode[] {
  if (!html || !html.trim()) return [];
  return parseHtmlRecursive(html, { bold: false, italic: false, underline: false });
}
