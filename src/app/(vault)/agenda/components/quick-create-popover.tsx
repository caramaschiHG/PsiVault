"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/ui/toast-provider";

interface QuickCreatePopoverProps {
  patients: Array<{ id: string; fullName: string; socialName?: string }>;
  defaultStartsAt: string; // ISO
  defaultDurationMinutes: number;
  defaultCareMode: "IN_PERSON" | "ONLINE";
  onCreate: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  fullFormHref: string;
  onClose: () => void;
  /** Position: top/left in px relative to viewport */
  position: { top: number; left: number };
}

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "50 min", value: 50 },
  { label: "60 min", value: 60 },
];

export function QuickCreatePopover({
  patients,
  defaultStartsAt,
  defaultDurationMinutes,
  defaultCareMode,
  onCreate,
  fullFormHref,
  onClose,
  position,
}: QuickCreatePopoverProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay to avoid triggering on the click that opened this
    const timer = setTimeout(() => window.addEventListener("click", onClick), 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", onClick);
    };
  }, [onClose]);

  // Format startsAt for display
  const displayTime = formatTimeISO(defaultStartsAt);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await onCreate(formData);
      if (result.success) {
        toast("Sessão agendada");
        router.refresh();
        onClose();
      } else {
        setError(result.error ?? "Erro ao agendar sessão");
      }
    });
  }

  return (
    <div
      ref={popoverRef}
      style={{
        ...popoverStyle,
        top: position.top,
        left: Math.min(position.left, window.innerWidth - 300),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={headerStyle}>
        <span style={headerTitleStyle}>Nova sessão</span>
        <button type="button" onClick={onClose} style={closeButtonStyle} aria-label="Fechar">
          ×
        </button>
      </div>

      <form
        action={handleSubmit}
        style={formStyle}
      >
        {/* Hidden: startsAt */}
        <input type="hidden" name="startsAt" value={defaultStartsAt} />

        {/* Patient select */}
        <label style={labelStyle}>
          Paciente
          <select name="patientId" required style={selectStyle} defaultValue="">
            <option value="" disabled>
              Selecione um paciente
            </option>
            {patients
              .sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName}
                </option>
              ))}
          </select>
        </label>

        {/* Time display (readonly) */}
        <label style={labelStyle}>
          Horário
          <input
            type="text"
            value={displayTime}
            readOnly
            style={{ ...inputStyle, background: "var(--color-surface-0)", color: "var(--color-text-2)" }}
          />
        </label>

        {/* Duration */}
        <label style={labelStyle}>
          Duração
          <select name="durationMinutes" defaultValue={defaultDurationMinutes} style={selectStyle}>
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        {/* Care mode */}
        <label style={labelStyle}>
          Modalidade
          <div style={careModeToggleStyle}>
            {(["IN_PERSON", "ONLINE"] as const).map((mode) => (
              <label
                key={mode}
                style={{
                  ...careModeOptionStyle,
                  ...(mode === defaultCareMode ? careModeSelectedStyle : {}),
                }}
              >
                <input
                  type="radio"
                  name="careMode"
                  value={mode}
                  defaultChecked={mode === defaultCareMode}
                  style={{ display: "none" }}
                />
                {mode === "IN_PERSON" ? "Presencial" : "Online"}
              </label>
            ))}
          </div>
        </label>

        {/* Error */}
        {error && <p style={errorStyle}>{error}</p>}

        {/* Actions */}
        <div style={actionsStyle}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              ...submitButtonStyle,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Agendando..." : "Agendar"}
          </button>
          <a href={fullFormHref} style={fullFormLinkStyle}>
            Formulário completo
          </a>
        </div>
      </form>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTimeISO(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const popoverStyle = {
  position: "fixed",
  width: "280px",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-md)",
  padding: "1rem",
  zIndex: "var(--z-dropdown)",
  fontSize: "0.85rem",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.75rem",
} satisfies React.CSSProperties;

const headerTitleStyle = {
  fontWeight: 600,
  fontSize: "0.9rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const closeButtonStyle = {
  width: "1.5rem",
  height: "1.5rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  color: "var(--color-text-3)",
  borderRadius: "4px",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.25rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const selectStyle = {
  padding: "0.35rem 0.5rem",
  fontSize: "0.82rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const inputStyle = {
  padding: "0.35rem 0.5rem",
  fontSize: "0.82rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border-med)",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const careModeToggleStyle = {
  display: "flex",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const careModeOptionStyle = {
  flex: 1,
  padding: "0.3rem 0.5rem",
  fontSize: "0.78rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  textAlign: "center" as const,
  cursor: "pointer",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const careModeSelectedStyle = {
  background: "rgba(154, 52, 18, 0.1)",
  borderColor: "var(--color-brown-mid)",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const errorStyle = {
  fontSize: "0.75rem",
  color: "#dc2626",
  margin: 0,
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "grid",
  gap: "0.35rem",
  marginTop: "0.25rem",
} satisfies React.CSSProperties;

const submitButtonStyle = {
  padding: "0.45rem 0.75rem",
  borderRadius: "8px",
  border: "none",
  background: "var(--color-accent)",
  color: "#fff7ed",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const fullFormLinkStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
  textDecoration: "underline",
  textAlign: "center" as const,
} satisfies React.CSSProperties;
