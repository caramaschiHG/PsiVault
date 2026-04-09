"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface RichTextEditorProps {
  name: string;
  initialHtml: string;
  placeholder?: string;
  minHeight?: number;
  onDirtyChange?: (dirty: boolean) => void;
  onWordCountChange?: (count: number) => void;
  onContentChange?: (html: string) => void;
}

type ToolbarAction =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "blockquote"
  | "h1"
  | "h2"
  | "paragraph"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "insertHorizontalRule"
  | "undo"
  | "redo"
  | "removeFormat"
  | "createLink";

const ICONS: Record<ToolbarAction, React.ReactNode> = {
  bold: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  underline: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  insertUnorderedList: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="18" r="1" fill="currentColor"/></svg>,
  insertOrderedList: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif">1</text><text x="3" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif">2</text><text x="3" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif">3</text></svg>,
  blockquote: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6"><path d="M10 8c-.6-.8-1.2-1.2-2-1.3C6.4 6.5 5 7.8 5 10v4h10V8h-5zm10 0c-.6-.8-1.2-1.2-2-1.3-1.6-.2-3 1.1-3 3.3v4h10V8h-5z"/></svg>,
  h1: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><text x="15" y="13" fontSize="8" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif" fontWeight="700">1</text></svg>,
  h2: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><text x="15" y="13" fontSize="8" fill="currentColor" stroke="none" fontFamily="IBM Plex Sans, sans-serif" fontWeight="700">2</text></svg>,
  paragraph: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M17 4H10.7a2 2 0 0 0-1.4.6 2 2 0 0 0 0 2.8c.4.4.9.6 1.4.6H17"/></svg>,
  createLink: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  justifyLeft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
  justifyCenter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  justifyRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>,
  insertHorizontalRule: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  removeFormat: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 12H3"/><path d="M8 4v1"/><path d="M13 4v2"/><path d="M10 4v1"/><path d="M16 4v2"/><path d="M4.5 7h10a2 2 0 0 1 2 2v1"/><path d="M15 17l4 4"/><path d="M19 17l-4 4"/></svg>,
  undo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  redo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>,
};

const BUTTONS: Array<{ action: ToolbarAction; title: string }> = [
  { action: "bold", title: "Negrito (Ctrl+B)" },
  { action: "italic", title: "It\u00E1lico (Ctrl+I)" },
  { action: "underline", title: "Sublinhado (Ctrl+U)" },
  { action: "h1", title: "T\u00EDtulo grande" },
  { action: "h2", title: "T\u00EDtulo m\u00E9dio" },
  { action: "paragraph", title: "Par\u00E1grafo" },
  { action: "insertUnorderedList", title: "Lista com marcadores" },
  { action: "insertOrderedList", title: "Lista numerada" },
  { action: "blockquote", title: "Cita\u00E7\u00E3o" },
  { action: "createLink", title: "Inserir link" },
  { action: "justifyLeft", title: "Alinhar \u00E0 esquerda" },
  { action: "justifyCenter", title: "Centralizar" },
  { action: "justifyRight", title: "Alinhar \u00E0 direita" },
  { action: "insertHorizontalRule", title: "Divisor" },
  { action: "removeFormat", title: "Limpar formata\u00E7\u00E3o" },
  { action: "undo", title: "Desfazer (Ctrl+Z)" },
  { action: "redo", title: "Refazer (Ctrl+Y)" },
];

function getPlainText(html: string): string {
  return html
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|blockquote|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\u2022 ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function countWords(html: string): number {
  const text = getPlainText(html);
  return text ? text.split(/\s+/).length : 0;
}

export function RichTextEditor({
  name,
  initialHtml,
  placeholder = "Escreva aqui...",
  minHeight = 360,
  onDirtyChange,
  onContentChange,
  onWordCountChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialHtml);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (editor.innerHTML !== initialHtml) {
      editor.innerHTML = initialHtml;
    }

    setHtml(initialHtml);
  }, [initialHtml]);

  useEffect(() => {
    onWordCountChange?.(countWords(html));
  }, [html, onWordCountChange]);

  const editorStyle = useMemo<React.CSSProperties>(
    () => ({
      minHeight: `${minHeight}px`,
    }),
    [minHeight],
  );

  function syncHtml() {
    const nextHtml = editorRef.current?.innerHTML ?? "";
    setHtml(nextHtml);
    onDirtyChange?.(true);
    onContentChange?.(nextHtml);
  }

  function exec(action: ToolbarAction) {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    if (action === "h1") {
      document.execCommand("formatBlock", false, "h1");
    } else if (action === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (action === "paragraph") {
      document.execCommand("formatBlock", false, "p");
    } else if (action === "blockquote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else if (action === "createLink") {
      const href = window.prompt("Cole o link");
      if (!href) return;
      document.execCommand("createLink", false, href);
    } else {
      document.execCommand(action, false);
    }

    syncHtml();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncHtml();
  }

  return (
    <div style={rootStyle}>
      <div style={toolbarStyle}>
        {BUTTONS.map((button) => (
          <button
            key={button.action}
            type="button"
            title={button.title}
            style={toolbarButtonStyle}
            onClick={() => exec(button.action)}
            aria-label={button.title}
          >
            {ICONS[button.action]}
          </button>
        ))}
      </div>

      <input type="hidden" name={name} value={html} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        style={{ ...editorShellStyle, ...editorStyle }}
        data-placeholder={placeholder}
        onInput={syncHtml}
        onPaste={handlePaste}
      />
    </div>
  );
}

const rootStyle = {
  display: "grid",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const toolbarStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "0.35rem",
  padding: "0.55rem 0.6rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(248, 245, 241, 0.96)",
  border: "1px solid rgba(120, 53, 15, 0.1)",
} satisfies React.CSSProperties;

const toolbarButtonStyle = {
  padding: "0.4rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid rgba(120, 53, 15, 0.12)",
  background: "rgba(255, 253, 250, 0.98)",
  color: "var(--color-text-2)",
  cursor: "pointer",
  fontFamily: "inherit",
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 120ms ease, background-color 120ms ease, border-color 120ms ease",
} satisfies React.CSSProperties;

const editorShellStyle = {
  width: "100%",
  padding: "1.2rem 1.3rem",
  borderRadius: "var(--radius-lg)",
  border: "1px solid rgba(120, 53, 15, 0.12)",
  background: "linear-gradient(180deg, rgba(255, 253, 250, 0.99) 0%, rgba(252, 249, 246, 0.99) 100%)",
  fontSize: "0.95rem",
  color: "var(--color-text-1)",
  lineHeight: "1.75",
  outline: "none",
  boxSizing: "border-box" as const,
  overflowY: "auto" as const,
} satisfies React.CSSProperties;
