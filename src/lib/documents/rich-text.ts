import type { DocumentType } from "./model";

const ALLOWED_TAGS = new Set([
  "a",
  "blockquote",
  "br",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "hr",
  "li",
  "ol",
  "p",
  "strong",
  "u",
  "ul",
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function sanitizeHref(rawHref: string): string | null {
  const href = rawHref.trim();
  if (!href) return null;
  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  ) {
    return href;
  }
  return null;
}

function sanitizeStyle(rawStyle: string): string | null {
  const match = rawStyle.match(/text-align\s*:\s*(left|center|right)/i);
  return match ? `text-align:${match[1].toLowerCase()}` : null;
}

export function sanitizeRichTextHtml(input: string): string {
  let html = input.trim();

  if (!html) return "";

  html = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\sclass=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  html = html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    if (full.startsWith("</")) {
      return `</${tag}>`;
    }

    if (tag === "br" || tag === "hr") {
      return `<${tag}>`;
    }

    const safeAttrs: string[] = [];

    if (tag === "a") {
      const hrefMatch = rawAttrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "";
      const safeHref = sanitizeHref(decodeEntities(href));
      if (safeHref) {
        safeAttrs.push(`href="${escapeHtml(safeHref)}"`);
        safeAttrs.push('rel="noreferrer noopener"');
        if (/^https?:\/\//i.test(safeHref)) {
          safeAttrs.push('target="_blank"');
        }
      }
    }

    const styleMatch = rawAttrs.match(/style\s*=\s*("([^"]*)"|'([^']*)')/i);
    const style = styleMatch?.[2] ?? styleMatch?.[3] ?? "";
    const safeStyle = sanitizeStyle(style);
    if (safeStyle) {
      safeAttrs.push(`style="${safeStyle}"`);
    }

    return safeAttrs.length > 0 ? `<${tag} ${safeAttrs.join(" ")}>` : `<${tag}>`;
  });

  return html.trim();
}

export function richTextHtmlToPlainText(input: string): string {
  const withLineBreaks = input
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|blockquote|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");

  return decodeEntities(withLineBreaks)
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeDocumentContent(type: DocumentType, rawContent: string): string {
  if (type === "session_record") {
    return sanitizeRichTextHtml(rawContent);
  }

  return rawContent.trim();
}

export function isMeaningfulDocumentContent(type: DocumentType, rawContent: string): boolean {
  if (type === "session_record") {
    return richTextHtmlToPlainText(normalizeDocumentContent(type, rawContent)).trim().length > 0;
  }

  return rawContent.trim().length > 0;
}
