"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useFocusMode } from "../../../../../../components/focus-mode-context";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import Link from "next/link";

interface DocumentEditorFormProps {
  initialHtml: string;
  documentId: string;
  patientId: string;
  patientName: string;
  backHref: string;
  updateAction: (formData: FormData) => Promise<void>;
}

export function DocumentEditorForm({
  initialHtml, documentId, patientId, patientName, backHref, updateAction,
}: DocumentEditorFormProps) {
  const { focusMode, toggleFocusMode } = useFocusMode();
  const [content, setContent] = useState(initialHtml);

  return (
    <form action={updateAction} style={{ display: "grid", gap: "1.25rem" }}>
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="content" value={content} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-2)" }}>Editar documento</span>
        <button type="button" onClick={toggleFocusMode} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "0.3rem 0.65rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--color-text-2)" }}>
          {focusMode ? "Sair do modo foco" : "Modo foco"}
        </button>
      </div>

      {focusMode && patientName && (
        <div style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-3)", textAlign: "center", padding: "0.5rem 0" }}>
          <span>{patientName}</span>
        </div>
      )}

      <RichTextEditor
        name="contentEditable"
        initialHtml={initialHtml}
        minHeight={480}
        onContentChange={(html) => setContent(html)}
        focusMode={focusMode}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", paddingTop: "0.5rem" }}>
        <Link href={backHref} style={{ padding: "0.75rem 1.5rem", borderRadius: "var(--radius-lg)", background: "var(--color-surface-0)", color: "var(--color-text-2)", border: "1px solid rgba(146, 64, 14, 0.2)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", cursor: "pointer", fontFamily: "inherit" }}>
          Voltar
        </Link>
        <FormSubmitButton label="Salvar alterações" pendingLabel="Salvando..." style={{ padding: "0.75rem 1.5rem", borderRadius: "var(--radius-lg)", background: "var(--color-accent)", color: "var(--color-surface-0)", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit" }} />
      </div>
    </form>
  );
}
