"use client";

/**
 * DocumentComposerForm — client component for document composition.
 *
 * Handles:
 * - Pre-filled textarea with defaultContent (generated server-side from template)
 * - Dirty tracking (isDirty) to guard against unsaved drafts
 * - Unsaved-draft guard: beforeunload event for browser tab/window close
 * - Submit via server action (createDocumentAction)
 * - Hidden fields: patientId, documentType passed through form
 */

import { useEffect, useRef, useState } from "react";
import type { DocumentType } from "../../../../../../../lib/documents/model";

interface DocumentComposerFormProps {
  defaultContent: string;
  patientId: string;
  documentType: DocumentType;
  createDocumentAction: (formData: FormData) => Promise<void>;
}

export function DocumentComposerForm({
  defaultContent,
  patientId,
  documentType,
  createDocumentAction,
}: DocumentComposerFormProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [wordCount, setWordCount] = useState(() => countWords(defaultContent));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Unsaved-draft guard: warn on browser close / refresh
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setIsDirty(true);
    setWordCount(countWords(e.target.value));
    autoResize(e.target);
  }

  function handleSubmitStart() {
    setIsDirty(false);
  }

  function applyToolbar(action: "uppercase" | "separator" | "bullet" | "indent") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (action === "uppercase") {
      const selected = value.slice(start, end);
      if (!selected) return;
      textarea.setRangeText(selected.toUpperCase(), start, end, "select");
    } else if (action === "separator") {
      textarea.setRangeText("\n\n————————————————————\n\n", start, end, "end");
    } else if (action === "bullet") {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      textarea.setRangeText("• ", lineStart, lineStart, "end");
    } else if (action === "indent") {
      textarea.setRangeText("    ", start, start, "end");
    }

    setIsDirty(true);
    setWordCount(countWords(textarea.value));
    textarea.focus();
  }

  return (
    <form action={createDocumentAction} onSubmit={handleSubmitStart} style={formStyle}>
      {/* Hidden fields */}
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="documentType" value={documentType} />

      {/* Main document content area */}
      <div style={fieldGroupStyle}>
        <div style={labelRowStyle}>
          <label htmlFor="content" style={labelStyle}>
            Conteúdo do documento
          </label>
          <span style={wordCountStyle}>{wordCount} palavras</span>
        </div>

        {/* Toolbar */}
        <div style={toolbarStyle}>
          <button
            type="button"
            title="Converter seleção para maiúsculas"
            style={toolbarBtnStyle}
            onClick={() => applyToolbar("uppercase")}
          >
            A→A↑
          </button>
          <button
            type="button"
            title="Inserir separador"
            style={toolbarBtnStyle}
            onClick={() => applyToolbar("separator")}
          >
            ———
          </button>
          <button
            type="button"
            title="Inserir item com marcador"
            style={toolbarBtnStyle}
            onClick={() => applyToolbar("bullet")}
          >
            •
          </button>
          <button
            type="button"
            title="Indentar (4 espaços)"
            style={toolbarBtnStyle}
            onClick={() => applyToolbar("indent")}
          >
            ⇥
          </button>
        </div>

        <textarea
          ref={textareaRef}
          id="content"
          name="content"
          defaultValue={defaultContent}
          rows={24}
          onChange={handleChange}
          required
          style={composerTextareaStyle}
        />
      </div>

      {/* Form actions */}
      <div style={formActionsStyle}>
        <button type="submit" style={submitButtonStyle}>
          Salvar documento
        </button>
      </div>
    </form>
  );
}

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const fieldGroupStyle = {
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const labelRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const labelStyle = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#1c1917",
  letterSpacing: "0.01em",
} satisfies React.CSSProperties;

const wordCountStyle = {
  fontSize: "0.75rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const toolbarStyle = {
  display: "flex",
  gap: "0.35rem",
  padding: "0.4rem 0.5rem",
  borderRadius: "8px 8px 0 0",
  background: "rgba(255, 247, 237, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  borderBottom: "none",
} satisfies React.CSSProperties;

const toolbarBtnStyle = {
  padding: "0.25rem 0.6rem",
  borderRadius: "5px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.9)",
  color: "#78350f",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "ui-monospace, monospace",
  lineHeight: 1.4,
} satisfies React.CSSProperties;

const composerTextareaStyle = {
  width: "100%",
  padding: "1rem 1.25rem",
  borderRadius: "0 0 12px 12px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  fontSize: "0.95rem",
  color: "#1c1917",
  resize: "vertical" as const,
  fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  lineHeight: "1.7",
  outline: "none",
  boxSizing: "border-box" as const,
  whiteSpace: "pre-wrap" as const,
  overflowY: "auto" as const,
} satisfies React.CSSProperties;

const formActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  paddingTop: "0.5rem",
} satisfies React.CSSProperties;

const submitButtonStyle = {
  padding: "0.75rem 1.5rem",
  borderRadius: "16px",
  background: "#9a3412",
  color: "#fff7ed",
  border: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;
