"use client";

/**
 * NoteComposerForm — client component for clinical note creation and editing.
 *
 * Handles:
 * - Form state and dirty tracking (isDirty)
 * - Controlled freeText with localStorage auto-save (2 s debounce)
 * - Draft restore on mount (new notes only)
 * - Template selector (SOAP / BIRP)
 * - Focus mode toggle (collapses vault sidebar)
 * - Unsaved-draft guard: beforeunload event for browser tab/window close
 * - In-app cancel guard: confirm dialog on the cancel link when isDirty
 * - Switches between createAction / updateAction based on whether an existing note exists
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClinicalNote } from "../../../../../../lib/clinical/model";
import { SubmitButton } from "@/components/ui/submit-button";

interface NoteComposerFormProps {
  existingNote: ClinicalNote | null;
  appointmentId: string;
  patientId: string;
  backHref: string;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}

const TEMPLATES = {
  livre: "",
  soap: "**S (Subjetivo):**\n\n**O (Objetivo):**\n\n**A (Avaliação):**\n\n**P (Plano):**\n",
  birp: "**B (Comportamento):**\n\n**I (Intervenção):**\n\n**R (Resposta):**\n\n**P (Plano):**\n",
} as const;

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  return `há ${minutes} min`;
}

export function NoteComposerForm({
  existingNote,
  appointmentId,
  patientId,
  backHref,
  createAction,
  updateAction,
}: NoteComposerFormProps) {
  const [freeTextValue, setFreeTextValue] = useState(existingNote?.freeText ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  // Tracks interval for auto-save indicator re-renders
  const indicatorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Draft restore on mount (new notes only)
  useEffect(() => {
    if (!existingNote) {
      const draft = localStorage.getItem(`note-draft-${appointmentId}`);
      if (draft) setFreeTextValue(draft);
    }
  }, [appointmentId, existingNote]);

  // Auto-save debounce
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => {
      localStorage.setItem(`note-draft-${appointmentId}`, freeTextValue);
      setLastSaved(new Date());
    }, 2000);
    return () => clearTimeout(t);
  }, [freeTextValue, isDirty, appointmentId]);

  // Re-render indicator every 30 s so relative time stays accurate
  useEffect(() => {
    if (!lastSaved) return;
    if (indicatorTimerRef.current) clearInterval(indicatorTimerRef.current);
    indicatorTimerRef.current = setInterval(() => {
      setLastSaved((d) => (d ? new Date(d) : null));
    }, 30_000);
    return () => {
      if (indicatorTimerRef.current) clearInterval(indicatorTimerRef.current);
    };
  }, [lastSaved]);

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

  const action = existingNote ? updateAction : createAction;
  const submitLabel = existingNote ? "Atualizar prontuário" : "Salvar prontuário";

  function handleFreeTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setFreeTextValue(e.target.value);
    setIsDirty(true);
  }

  function handleChange() {
    setIsDirty(true);
  }

  function handleSubmitStart() {
    // Reset dirty flag before submission so beforeunload doesn't fire on redirect
    setIsDirty(false);
    localStorage.removeItem(`note-draft-${appointmentId}`);
  }

  function handleCancelClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!isDirty) return;
    const confirmed = window.confirm(
      "Você tem alterações não salvas. Deseja sair?",
    );
    if (!confirmed) {
      event.preventDefault();
    }
  }

  function handleToggleFocusMode() {
    setFocusMode((f) => !f);
    const sidebar = document.querySelector<HTMLElement>(".vault-sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  }

  return (
    <form action={action} onSubmit={handleSubmitStart} style={formStyle}>
      {/* Hidden fields */}
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      {existingNote && (
        <input type="hidden" name="noteId" value={existingNote.id} />
      )}

      {/* Toolbar: focus mode */}
      <div style={toolbarStyle}>
        <button
          type="button"
          onClick={handleToggleFocusMode}
          style={focusButtonStyle}
        >
          {focusMode ? "Sair do modo foco" : "Modo foco"}
        </button>
      </div>

      {/* Primary free-text area */}
      <div style={fieldGroupStyle}>
        <label htmlFor="freeText" style={labelStyle}>
          Registro principal do prontuário
        </label>

        {/* Template selector */}
        <div style={{ marginBottom: "0.5rem" }}>
          <label
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-2, #57534e)",
              marginRight: "0.5rem",
            } satisfies React.CSSProperties}
          >
            Template:
          </label>
          <select
            style={{
              fontSize: "0.8rem",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 8,
              padding: "0.25rem 0.5rem",
              background: "transparent",
            } satisfies React.CSSProperties}
            onChange={(e) => {
              const t = TEMPLATES[e.target.value as keyof typeof TEMPLATES];
              if (!t) return;
              if (!isDirty || window.confirm("Isso substituirá o texto atual. Confirmar?")) {
                setFreeTextValue(t);
                setIsDirty(true);
                e.target.value = "livre";
              }
            }}
          >
            <option value="livre">Evolução livre</option>
            <option value="soap">SOAP</option>
            <option value="birp">BIRP</option>
          </select>
        </div>

        <textarea
          id="freeText"
          name="freeText"
          value={freeTextValue}
          placeholder="Escreva o registro clínico que deve compor o prontuário."
          onChange={handleFreeTextChange}
          style={primaryTextareaStyle}
          required
        />

        {lastSaved && (
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.75rem",
              color: "var(--color-text-3)",
            } satisfies React.CSSProperties}
          >
            ✓ Auto-salvo {formatRelativeTime(lastSaved)}
          </p>
        )}
      </div>

      {/* Optional structured fields */}
      <section style={optionalSectionStyle}>
        <h2 style={optionalSectionHeadingStyle}>Campos opcionais</h2>

        <div style={optionalFieldsGridStyle}>
          <div style={fieldGroupStyle}>
            <label htmlFor="demand" style={labelStyle}>
              Demanda / queixa
            </label>
            <textarea
              id="demand"
              name="demand"
              defaultValue={existingNote?.demand ?? ""}
              placeholder="O que trouxe o paciente nesta sessão..."
              onChange={handleChange}
              rows={3}
              style={secondaryTextareaStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="observedMood" style={labelStyle}>
              Humor observado
            </label>
            <textarea
              id="observedMood"
              name="observedMood"
              defaultValue={existingNote?.observedMood ?? ""}
              placeholder="Como o paciente se apresentou emocionalmente..."
              onChange={handleChange}
              rows={3}
              style={secondaryTextareaStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="themes" style={labelStyle}>
              Temas trabalhados
            </label>
            <textarea
              id="themes"
              name="themes"
              defaultValue={existingNote?.themes ?? ""}
              placeholder="Principais assuntos abordados na sessão..."
              onChange={handleChange}
              rows={3}
              style={secondaryTextareaStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="clinicalEvolution" style={labelStyle}>
              Evolução clínica
            </label>
            <textarea
              id="clinicalEvolution"
              name="clinicalEvolution"
              defaultValue={existingNote?.clinicalEvolution ?? ""}
              placeholder="Como o paciente progrediu em relação ao objetivo terapêutico..."
              onChange={handleChange}
              rows={3}
              style={secondaryTextareaStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="nextSteps" style={labelStyle}>
              Próximos passos
            </label>
            <textarea
              id="nextSteps"
              name="nextSteps"
              defaultValue={existingNote?.nextSteps ?? ""}
              placeholder="O que ficou combinado ou será retomado na próxima sessão..."
              onChange={handleChange}
              rows={3}
              style={secondaryTextareaStyle}
            />
          </div>
        </div>
      </section>

      {/* Form actions */}
      <div style={formActionsStyle}>
        <SubmitButton label={submitLabel} style={submitButtonStyle} />
        <Link href={backHref} style={cancelLinkStyle} onClick={handleCancelClick}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const toolbarStyle = {
  display: "flex",
  justifyContent: "flex-end",
} satisfies React.CSSProperties;

const focusButtonStyle = {
  background: "transparent",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 8,
  padding: "0.35rem 0.75rem",
  fontSize: "0.8rem",
  cursor: "pointer",
  color: "var(--color-text-2, #57534e)",
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

const primaryTextareaStyle = {
  width: "100%",
  minHeight: "180px",
  padding: "0.875rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  fontSize: "0.95rem",
  color: "#1c1917",
  resize: "vertical" as const,
  fontFamily: "inherit",
  lineHeight: "1.6",
  outline: "none",
  boxSizing: "border-box" as const,
} satisfies React.CSSProperties;

const optionalSectionStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.25rem",
  borderRadius: "16px",
  background: "rgba(248, 250, 252, 0.6)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
} satisfies React.CSSProperties;

const optionalSectionHeadingStyle = {
  margin: 0,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#a8a29e",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
} satisfies React.CSSProperties;

const optionalFieldsGridStyle = {
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const secondaryTextareaStyle = {
  width: "100%",
  padding: "0.75rem 0.875rem",
  borderRadius: "10px",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  background: "rgba(255, 252, 247, 0.9)",
  fontSize: "0.875rem",
  color: "#1c1917",
  resize: "vertical" as const,
  fontFamily: "inherit",
  lineHeight: "1.55",
  outline: "none",
  boxSizing: "border-box" as const,
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

const cancelLinkStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-3)",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;
