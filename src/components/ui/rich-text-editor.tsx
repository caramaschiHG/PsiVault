"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface RichTextEditorProps {
  name: string;
  initialHtml: string;
  placeholder?: string;
  minHeight?: number;
  onDirtyChange?: (dirty: boolean) => void;
  onWordCountChange?: (count: number) => void;
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

function getPlainText(html: string): string {
  return html
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|blockquote|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
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

const BUTTONS: Array<{ label: string; action: ToolbarAction; title: string }> = [
  { label: "B", action: "bold", title: "Negrito" },
  { label: "I", action: "italic", title: "Itálico" },
  { label: "U", action: "underline", title: "Sublinhado" },
  { label: "H1", action: "h1", title: "Título grande" },
  { label: "H2", action: "h2", title: "Título médio" },
  { label: "P", action: "paragraph", title: "Parágrafo" },
  { label: "• Lista", action: "insertUnorderedList", title: "Lista com marcadores" },
  { label: "1. Lista", action: "insertOrderedList", title: "Lista numerada" },
  { label: "“”", action: "blockquote", title: "Citação" },
  { label: "Link", action: "createLink", title: "Inserir link" },
  { label: "↤", action: "justifyLeft", title: "Alinhar à esquerda" },
  { label: "↔", action: "justifyCenter", title: "Centralizar" },
  { label: "↦", action: "justifyRight", title: "Alinhar à direita" },
  { label: "—", action: "insertHorizontalRule", title: "Divisor" },
  { label: "Limpar", action: "removeFormat", title: "Limpar formatação" },
  { label: "↺", action: "undo", title: "Desfazer" },
  { label: "↻", action: "redo", title: "Refazer" },
];

export function RichTextEditor({
  name,
  initialHtml,
  placeholder = "Escreva aqui...",
  minHeight = 360,
  onDirtyChange,
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
          >
            {button.label}
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
  borderRadius: "14px",
  background: "rgba(248, 245, 241, 0.96)",
  border: "1px solid rgba(120, 53, 15, 0.1)",
} satisfies React.CSSProperties;

const toolbarButtonStyle = {
  padding: "0.35rem 0.62rem",
  borderRadius: "10px",
  border: "1px solid rgba(120, 53, 15, 0.12)",
  background: "rgba(255, 253, 250, 0.98)",
  color: "#57534e",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  lineHeight: 1.4,
  letterSpacing: "0.01em",
} satisfies React.CSSProperties;

const editorShellStyle = {
  width: "100%",
  padding: "1.2rem 1.3rem",
  borderRadius: "18px",
  border: "1px solid rgba(120, 53, 15, 0.12)",
  background: "linear-gradient(180deg, rgba(255, 253, 250, 0.99) 0%, rgba(252, 249, 246, 0.99) 100%)",
  fontSize: "0.95rem",
  color: "#1c1917",
  lineHeight: "1.75",
  outline: "none",
  boxSizing: "border-box" as const,
  overflowY: "auto" as const,
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
} satisfies React.CSSProperties;
