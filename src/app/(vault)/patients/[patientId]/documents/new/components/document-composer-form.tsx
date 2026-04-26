"use client";

/**
 * DocumentComposerForm — redesigned: unified RichTextEditor for ALL types.
 *
 * Improvements:
 * - ALL document types use RichTextEditor (consistent experience)
 * - Server-side auto-save (no localStorage)
 * - Word count
 * - Cleaner layout
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DocumentType } from "../../../../../../../lib/documents/model";
import { DOCUMENT_TYPE_LABELS } from "../../../../../../../lib/documents/presenter";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { useDocumentAutoSave } from "@/hooks/use-document-auto-save";

interface DocumentComposerFormProps {
  defaultContent: string;
  patientId: string;
  documentType: DocumentType;
  createDocumentAction: (formData: FormData) => Promise<void>;
  appointmentId: string | null;
  from: string | null;
}

export function DocumentComposerForm({
  defaultContent, patientId, documentType, createDocumentAction,
  appointmentId, from,
}: DocumentComposerFormProps) {
  const typeLabel = DOCUMENT_TYPE_LABELS[documentType];
  const isSessionRecord = documentType === "session_record";

  const [contentValue, setContentValue] = useState(defaultContent);
  const [wordCount, setWordCount] = useState(0);
  const { status, lastSaved, isDirty, markDirty, documentId: autoSaveDocId } = useDocumentAutoSave(
    contentValue,
    { patientId, documentType, debounceMs: 3000 },
  );

  const draftId = autoSaveDocId ?? "";

  // Warn on browser close
  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  function handleSubmitStart() {
    // markDirty is no-op here since we're submitting
  }

  return (
    <form action={createDocumentAction} onSubmit={handleSubmitStart} style={formStyle}>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="documentType" value={documentType} />
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="appointmentId" value={appointmentId ?? ""} />
      <input type="hidden" name="from" value={from ?? ""} />

      {/* Appointment link indicator */}
      {appointmentId && (
        <div style={linkIndicatorStyle}>
          Vinculado ao atendimento
        </div>
      )}

      {/* Hidden field with content for form submission */}
      <input type="hidden" name="content" value={contentValue} />

      {/* Toolbar: type label + auto-save + word count */}
      <div style={toolbarStyle}>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-2)" }}>
          {typeLabel}
          {isSessionRecord && (
            <span style={{
              display: "inline-block", marginLeft: "0.4rem", padding: "0.08rem 0.4rem",
              borderRadius: "var(--radius-pill)", background: "rgba(146,64,14,0.1)", color: "var(--color-warning-text)",
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
        <Link
          href={from ?? `/patients/${patientId}?tab=documentos`}
          style={backButtonStyle}
        >
          Voltar
        </Link>
        <FormSubmitButton
          label="Salvar documento"
          pendingLabel="Salvando..."
          style={submitButtonStyle}
        />
      </div>
    </form>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle: React.CSSProperties = { display: "grid", gap: "1.25rem" };
const toolbarStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "rgba(248,250,252,0.5)" };
const fieldGroupStyle: React.CSSProperties = { display: "grid", gap: "0.5rem" };
const formActionsStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "1.25rem", paddingTop: "0.5rem" };
const submitButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem", borderRadius: "var(--radius-lg)", background: "var(--color-accent)", color: "var(--color-surface-0)",
  border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit",
};

const backButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem", borderRadius: "var(--radius-lg)", background: "var(--color-surface-0)", color: "var(--color-text-2)",
  border: "1px solid rgba(146, 64, 14, 0.2)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none",
  cursor: "pointer", fontFamily: "inherit",
};

const linkIndicatorStyle: React.CSSProperties = {
  fontSize: "0.75rem", color: "var(--color-text-3)", fontWeight: 500, padding: "0.25rem 0",
};
