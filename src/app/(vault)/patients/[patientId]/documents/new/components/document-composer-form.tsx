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

import { useEffect, useState } from "react";
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

  // Unsaved-draft guard: warn on browser close / refresh
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Modern browsers show their own message; setting returnValue triggers the dialog
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function handleChange() {
    setIsDirty(true);
  }

  function handleSubmitStart() {
    // Reset dirty flag before submission so beforeunload doesn't fire on redirect
    setIsDirty(false);
  }

  return (
    <form action={createDocumentAction} onSubmit={handleSubmitStart} style={formStyle}>
      {/* Hidden fields */}
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="documentType" value={documentType} />

      {/* Main document content area */}
      <div style={fieldGroupStyle}>
        <label htmlFor="content" style={labelStyle}>
          Conteúdo do documento
        </label>
        <textarea
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const fieldGroupStyle = {
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const labelStyle = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#1c1917",
  letterSpacing: "0.01em",
} satisfies React.CSSProperties;

const composerTextareaStyle = {
  width: "100%",
  padding: "1rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  fontSize: "0.9rem",
  color: "#1c1917",
  resize: "vertical" as const,
  fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  lineHeight: "1.65",
  outline: "none",
  boxSizing: "border-box" as const,
  whiteSpace: "pre-wrap" as const,
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
