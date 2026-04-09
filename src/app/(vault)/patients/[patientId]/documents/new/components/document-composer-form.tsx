"use client";

/**
 * DocumentComposerForm — redesigned: unified RichTextEditor for ALL types.
 *
 * Improvements:
 * - ALL document types use RichTextEditor (consistent experience)
 * - Visible auto-save indicator
 * - Word count
 * - Cleaner layout
 */

import { useEffect, useRef, useState } from "react";
import type { DocumentType } from "../../../../../../../lib/documents/model";
import { DOCUMENT_TYPE_LABELS } from "../../../../../../../lib/documents/presenter";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AutoSaveIndicator, useAutoSave } from "@/components/ui/auto-save-indicator";

interface DocumentComposerFormProps {
  defaultContent: string;
  patientId: string;
  documentType: DocumentType;
  createDocumentAction: (formData: FormData) => Promise<void>;
}

export function DocumentComposerForm({
  defaultContent, patientId, documentType, createDocumentAction,
}: DocumentComposerFormProps) {
  const typeLabel = DOCUMENT_TYPE_LABELS[documentType];
  const isSessionRecord = documentType === "session_record";

  const [contentValue, setContentValue] = useState(defaultContent);
  const [wordCount, setWordCount] = useState(0);
  const { status, lastSaved, markDirty } = useAutoSave(
    `doc-draft-${patientId}-${documentType}`,
    contentValue,
    2000,
  );

  // Warn on browser close
  const isDirty = status !== "idle";
  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  function handleSubmitStart() {
    markDirty(); // Reset indicator
  }

  return (
    <form action={createDocumentAction} onSubmit={handleSubmitStart} style={formStyle}>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="documentType" value={documentType} />

      {/* Hidden field with content for form submission */}
      <input type="hidden" name="content" value={contentValue} />

      {/* Toolbar: type label + auto-save + word count */}
      <div style={toolbarStyle}>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-2)" }}>
          {typeLabel}
          {isSessionRecord && (
            <span style={{
              display: "inline-block", marginLeft: "0.4rem", padding: "0.08rem 0.4rem",
              borderRadius: "999px", background: "rgba(146,64,14,0.1)", color: "#92400e",
              fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase",
            }}>Privado</span>
          )}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <AutoSaveIndicator status={status} lastSaved={lastSaved} />
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-3)" }}>{wordCount} palavras</span>
        </div>
      </div>

      {/* Rich text editor for ALL types */}
      <div style={fieldGroupStyle}>
        <RichTextEditor
          name="content"
          initialHtml={defaultContent}
          placeholder={
            isSessionRecord
              ? "Escreva livremente o que for necessário para seu uso clínico privado."
              : `Escreva o conteúdo do(a) ${typeLabel}...`
          }
          minHeight={480}
          onWordCountChange={setWordCount}
          onContentChange={(html) => { setContentValue(html); markDirty(); }}
        />
      </div>

      {/* Submit */}
      <div style={formActionsStyle}>
        <button type="submit" style={submitButtonStyle}>Salvar documento</button>
      </div>
    </form>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle: React.CSSProperties = { display: "grid", gap: "1.25rem" };
const toolbarStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", padding: "0.5rem 0.75rem", borderRadius: "12px", background: "rgba(248,250,252,0.5)" };
const fieldGroupStyle: React.CSSProperties = { display: "grid", gap: "0.5rem" };
const formActionsStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "1.25rem", paddingTop: "0.5rem" };
const submitButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem", borderRadius: "16px", background: "#9a3412", color: "#fff7ed",
  border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit",
};
