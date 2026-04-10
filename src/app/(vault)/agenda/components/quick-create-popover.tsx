"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
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

const POPOVER_HEIGHT = 420; // px approx
const POPOVER_WIDTH = 280;

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
  const [mounted, setMounted] = useState(false);
  const [openingUpward, setOpeningUpward] = useState(false);

  // Smart positioning: open upward if near bottom of viewport
  useEffect(() => {
    setMounted(true);
    const viewportBottom = window.innerHeight;
    const spaceBelow = viewportBottom - position.top;
    const needsUpward = spaceBelow < POPOVER_HEIGHT + 20;
    setOpeningUpward(needsUpward);
  }, [position.top]);

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
    const timer = setTimeout(() => window.addEventListener("click", onClick), 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", onClick);
    };
  }, [onClose]);

  const displayTime = formatTimeISO(defaultStartsAt);

  const handleSubmit = useCallback((formData: FormData) => {
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
  }, [onCreate, toast, router, onClose]);

  // Clamp left to keep popover in viewport
  const safeLeft = mounted
    ? Math.min(position.left, window.innerWidth - POPOVER_WIDTH - 8)
    : position.left;

  const safeTop = mounted
    ? (openingUpward
        ? Math.max(8, position.top - POPOVER_HEIGHT)
        : position.top + 8)
    : position.top;

  return (
    <div
      ref={popoverRef}
      className={`quick-create-popover${mounted ? " open" : ""}`}
      style={{
        ...popoverStyle,
        top: safeTop,
        left: Math.max(8, safeLeft),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={headerStyle}>
        <span style={headerTitleStyle}>Nova sessão</span>
        <button
          type="button"
          onClick={onClose}
          className="quick-create-close"
          style={closeButtonStyle}
          aria-label="Fechar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form action={handleSubmit} style={formStyle}>
        <input type="hidden" name="startsAt" value={defaultStartsAt} />

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

        <label style={labelStyle}>
          Horário
          <input
            type="text"
            value={displayTime}
            readOnly
            style={{ ...inputStyle, background: "var(--color-surface-0)", color: "var(--color-text-2)" }}
          />
        </label>

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

        {error && <p style={errorStyle} role="alert">{error}</p>}

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
  width: `${POPOVER_WIDTH}px`,
  maxWidth: "calc(100vw - 16px)",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-md)",
  padding: "var(--space-4)",
  zIndex: "var(--z-dropdown)",
  fontSize: "var(--font-size-meta)",
  opacity: 0,
  transform: "scale(0.95)",
  transformOrigin: "top left",
  transition: "opacity 180ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "var(--space-3)",
} satisfies React.CSSProperties;

const headerTitleStyle = {
  fontWeight: 600,
  fontSize: "var(--font-size-body-sm)",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const closeButtonStyle = {
  width: "2.75rem",
  height: "2.75rem",
  minWidth: "44px",
  minHeight: "44px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-text-3)",
  borderRadius: "var(--radius-xs)",
  transition: "background 100ms ease, color 100ms ease",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "var(--space-2)",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "var(--space-1)",
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const selectStyle = {
  padding: "var(--space-1.5) var(--space-2)",
  fontSize: "var(--font-size-sm)",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const inputStyle = {
  padding: "var(--space-1.5) var(--space-2)",
  fontSize: "var(--font-size-sm)",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--color-border-med)",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const careModeToggleStyle = {
  display: "flex",
  gap: "var(--space-1)",
} satisfies React.CSSProperties;

const careModeOptionStyle = {
  flex: 1,
  padding: "var(--space-1.5) var(--space-2)",
  fontSize: "var(--font-size-sm)",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  textAlign: "center" as const,
  cursor: "pointer",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const careModeSelectedStyle = {
  background: "var(--color-accent-light)",
  borderColor: "var(--color-brown-mid)",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const errorStyle = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-error-text)",
  margin: 0,
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "grid",
  gap: "var(--space-1.5)",
  marginTop: "var(--space-1)",
} satisfies React.CSSProperties;

const submitButtonStyle = {
  padding: "var(--space-2) var(--space-3)",
  borderRadius: "var(--radius-sm)",
  border: "none",
  background: "var(--color-accent)",
  color: "var(--color-surface-0)",
  fontSize: "var(--font-size-meta)",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background 100ms ease, opacity 100ms ease",
} satisfies React.CSSProperties;

const fullFormLinkStyle = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-3)",
  textDecoration: "underline",
  textAlign: "center" as const,
} satisfies React.CSSProperties;
