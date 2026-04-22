"use client";

import { useEffect, useRef, useState } from "react";
import type { SeriesScope } from "@/lib/expenses/model";

interface RecurrenceScopeDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "edit" | "delete";
  onConfirm: (scope: SeriesScope) => void;
}

const SCOPE_OPTIONS: { value: SeriesScope; title: string; description: string }[] = [
  { value: "this", title: "Apenas esta", description: "A alteração afeta somente esta ocorrência." },
  { value: "this_and_future", title: "Esta e as próximas", description: "A alteração afeta esta ocorrência e todas as futuras desta série." },
  { value: "all", title: "Toda a série", description: "A alteração afeta todas as ocorrências, inclusive as anteriores." },
];

export function RecurrenceScopeDialog({ open, onOpenChange, mode, onConfirm }: RecurrenceScopeDialogProps) {
  const [selected, setSelected] = useState<SeriesScope>("this");
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "recurrence-scope-title";

  useEffect(() => {
    if (!open) return;
    setSelected("this");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onOpenChange(false); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => { dialogRef.current?.focus(); });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const title = mode === "edit" ? "Aplicar alteração a:" : "Excluir despesas:";

  return (
    <div
      style={overlayStyle}
      onClick={() => onOpenChange(false)}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 id={titleId} style={titleStyle}>{title}</h2>

        <div style={optionsStyle}>
          {SCOPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              style={selected === opt.value ? selectedCardStyle : cardStyle}
            >
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                style={radioStyle}
              />
              <div>
                <p style={optTitleStyle}>{opt.title}</p>
                <p style={optDescStyle}>{opt.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div style={footerStyle}>
          <button className="btn-ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </button>
          <button
            className={mode === "delete" ? "btn-danger" : "btn-primary"}
            type="button"
            onClick={() => { onConfirm(selected); onOpenChange(false); }}
          >
            {mode === "edit" ? "Aplicar" : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.18)",
  zIndex: "var(--z-modal)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} satisfies React.CSSProperties;

const dialogStyle = {
  background: "var(--color-surface-1)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-xl)",
  width: "min(440px, calc(100vw - 2rem))",
  padding: "var(--space-6)",
  outline: "none",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: "0 0 var(--space-4)",
  fontSize: "var(--font-size-h2)",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const optionsStyle = {
  display: "grid",
  gap: "var(--space-2)",
} satisfies React.CSSProperties;

const cardBase = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--space-3)",
  padding: "var(--space-3) var(--space-4)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  minHeight: "56px",
} satisfies React.CSSProperties;

const cardStyle = {
  ...cardBase,
  border: "1px solid var(--color-border)",
  background: "transparent",
} satisfies React.CSSProperties;

const selectedCardStyle = {
  ...cardBase,
  border: "1.5px solid var(--color-accent)",
  background: "var(--color-accent-light)",
} satisfies React.CSSProperties;

const radioStyle = {
  marginTop: "2px",
  flexShrink: 0,
  accentColor: "var(--color-accent)",
} satisfies React.CSSProperties;

const optTitleStyle = {
  margin: 0,
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const optDescStyle = {
  margin: "2px 0 0",
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "var(--space-6)",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;
