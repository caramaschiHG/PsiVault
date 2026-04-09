"use client";

/**
 * NoteComposerForm — redesigned with visible auto-save, template cards, word count.
 *
 * Improvements:
 * - AutoSaveIndicator visible at top toolbar
 * - Template cards (SOAP/BIRP/Livre) as clickable cards, not dropdown
 * - Word count display
 * - Focus mode toggle
 * - Dirty tracking + localStorage auto-save
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClinicalNote } from "../../../../../../lib/clinical/model";
import { SubmitButton } from "@/components/ui/submit-button";
import { AutoSaveIndicator, useAutoSave } from "@/components/ui/auto-save-indicator";

const TEMPLATES = [
  { id: "livre", label: "Livre", desc: "Texto livre" },
  { id: "soap", label: "SOAP", desc: "Subjetivo · Objetivo · Avaliação · Plano" },
  { id: "birp", label: "BIRP", desc: "Comportamento · Intervenção · Resposta · Plano" },
] as const;

const TEMPLATE_CONTENT: Record<string, string> = {
  livre: "",
  soap: "**S (Subjetivo):**\n\n**O (Objetivo):**\n\n**A (Avaliação):**\n\n**P (Plano):**\n",
  birp: "**B (Comportamento):**\n\n**I (Intervenção):**\n\n**R (Resposta):**\n\n**P (Plano):**\n",
};

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

interface NoteComposerFormProps {
  existingNote: ClinicalNote | null;
  appointmentId: string;
  patientId: string;
  backHref: string;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}

export function NoteComposerForm({
  existingNote, appointmentId, patientId, backHref, createAction, updateAction,
}: NoteComposerFormProps) {
  const [freeTextValue, setFreeTextValue] = useState(existingNote?.freeText ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!existingNote?.freeText);

  const { status, lastSaved, markDirty } = useAutoSave(
    `note-draft-${appointmentId}`,
    freeTextValue,
    2000,
  );

  // Restore draft on mount
  useEffect(() => {
    if (!existingNote) {
      const draft = localStorage.getItem(`note-draft-${appointmentId}`);
      if (draft) { setFreeTextValue(draft); setIsDirty(true); }
    }
  }, [appointmentId, existingNote]);

  // Warn on browser close
  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  const action = existingNote ? updateAction : createAction;
  const submitLabel = existingNote ? "Atualizar prontuário" : "Salvar prontuário";
  const wordCount = countWords(freeTextValue);

  function handleFreeTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setFreeTextValue(e.target.value);
    markDirty();
  }

  function handleSubmitStart() {
    setIsDirty(false);
    localStorage.removeItem(`note-draft-${appointmentId}`);
  }

  function handleCancelClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!isDirty) return;
    if (!window.confirm("Você tem alterações não salvas. Deseja sair?")) event.preventDefault();
  }

  function applyTemplate(templateId: string) {
    const content = TEMPLATE_CONTENT[templateId];
    if (!content && isDirty && !window.confirm("Isso substituirá o texto atual. Confirmar?")) return;
    setFreeTextValue(content ?? "");
    markDirty();
    setShowTemplates(false);
  }

  return (
    <form action={action} onSubmit={handleSubmitStart} style={formStyle}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      {existingNote && <input type="hidden" name="noteId" value={existingNote.id} />}

      {/* Toolbar: auto-save + focus mode */}
      <div style={toolbarStyle}>
        <AutoSaveIndicator status={status} lastSaved={lastSaved} />
        <span style={{ fontSize: "0.72rem", color: "var(--color-text-3)" }}>{wordCount} palavras</span>
        <button type="button" onClick={() => { setFocusMode((f) => !f); document.querySelector<HTMLElement>(".vault-sidebar")?.classList.toggle("collapsed"); }} style={focusBtnStyle}>
          {focusMode ? "Sair do modo foco" : "Modo foco"}
        </button>
      </div>

      {/* Template cards (shown when empty or on click) */}
      {showTemplates && (
        <div style={templateGridStyle}>
          <p style={{ gridColumn: "1/-1", margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Escolha um template
          </p>
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => applyTemplate(t.id)} style={templateCardStyle}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-1)" }}>{t.label}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--color-text-3)" }}>{t.desc}</span>
            </button>
          ))}
          {!existingNote && (
            <button type="button" onClick={() => setShowTemplates(false)} style={{ ...templateCardStyle, opacity: 0.6 }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-2)" }}>Começar em branco</span>
            </button>
          )}
        </div>
      )}

      {/* Primary free-text area */}
      <div style={fieldGroupStyle}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem" }}>
          <label htmlFor="freeText" style={labelStyle}>Registro principal do prontuário</label>
          {!showTemplates && existingNote && (
            <button type="button" onClick={() => setShowTemplates(true)} style={{ fontSize: "0.75rem", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
              Templates
            </button>
          )}
        </div>

        <textarea
          id="freeText" name="freeText" value={freeTextValue}
          placeholder="Escreva o registro clínico que deve compor o prontuário."
          onChange={handleFreeTextChange}
          style={primaryTextareaStyle}
          required
        />
      </div>

      {/* Optional structured fields */}
      <section style={optionalSectionStyle}>
        <h2 style={optionalSectionHeadingStyle}>Campos opcionais</h2>
        <div style={optionalFieldsGridStyle}>
          {[
            { id: "demand", label: "Demanda / queixa", placeholder: "O que trouxe o paciente nesta sessão...", default: existingNote?.demand },
            { id: "observedMood", label: "Humor observado", placeholder: "Como o paciente se apresentou emocionalmente...", default: existingNote?.observedMood },
            { id: "themes", label: "Temas trabalhados", placeholder: "Principais assuntos abordados na sessão...", default: existingNote?.themes },
            { id: "clinicalEvolution", label: "Evolução clínica", placeholder: "Como o paciente progrediu em relação ao objetivo terapêutico...", default: existingNote?.clinicalEvolution },
            { id: "nextSteps", label: "Próximos passos", placeholder: "O que ficou combinado ou será retomado na próxima sessão...", default: existingNote?.nextSteps },
          ].map((f) => (
            <div key={f.id} style={fieldGroupStyle}>
              <label htmlFor={f.id} style={labelStyle}>{f.label}</label>
              <textarea id={f.id} name={f.id} defaultValue={f.default ?? ""} placeholder={f.placeholder} onChange={() => markDirty()} rows={3} style={secondaryTextareaStyle} />
            </div>
          ))}
        </div>
      </section>

      {/* Form actions */}
      <div style={formActionsStyle}>
        <SubmitButton label={submitLabel} />
        <Link href={backHref} style={cancelLinkStyle} onClick={handleCancelClick}>Cancelar</Link>
      </div>
    </form>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle: React.CSSProperties = { display: "grid", gap: "1.25rem" };
const toolbarStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" };
const focusBtnStyle: React.CSSProperties = { background: "transparent", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "0.3rem 0.65rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--color-text-2)" };

const templateGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", padding: "1rem", borderRadius: "14px", background: "rgba(248,250,252,0.6)", border: "1px solid rgba(226,232,240,0.7)" };
const templateCardStyle: React.CSSProperties = { display: "grid", gap: "0.15rem", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid rgba(146,64,14,0.15)", background: "rgba(255,252,247,0.95)", cursor: "pointer", textAlign: "left", transition: "border-color 120ms ease, box-shadow 120ms ease" };

const fieldGroupStyle: React.CSSProperties = { display: "grid", gap: "0.4rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-1)" };
const primaryTextareaStyle: React.CSSProperties = { width: "100%", minHeight: "200px", padding: "0.875rem 1rem", borderRadius: "12px", border: "1px solid rgba(146,64,14,0.2)", background: "rgba(255,252,247,0.95)", fontSize: "0.95rem", color: "var(--color-text-1)", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", outline: "none", boxSizing: "border-box" };

const optionalSectionStyle: React.CSSProperties = { display: "grid", gap: "1rem", padding: "1.25rem", borderRadius: "16px", background: "rgba(248,250,252,0.6)", border: "1px solid rgba(226,232,240,0.8)" };
const optionalSectionHeadingStyle: React.CSSProperties = { margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-4)", textTransform: "uppercase", letterSpacing: "0.1em" };
const optionalFieldsGridStyle: React.CSSProperties = { display: "grid", gap: "1rem" };
const secondaryTextareaStyle: React.CSSProperties = { width: "100%", padding: "0.75rem 0.875rem", borderRadius: "10px", border: "1px solid rgba(146,64,14,0.15)", background: "rgba(255,252,247,0.9)", fontSize: "0.875rem", color: "var(--color-text-1)", resize: "vertical", fontFamily: "inherit", lineHeight: "1.55", outline: "none", boxSizing: "border-box" };

const formActionsStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "1.25rem", paddingTop: "0.5rem" };
const cancelLinkStyle: React.CSSProperties = { fontSize: "0.9rem", color: "var(--color-text-3)", textDecoration: "none", fontWeight: 500 };
