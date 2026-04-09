/**
 * RecurrenceScopeDialog — inline scope selector for series edits.
 *
 * Used when a recurring appointment mutation (reschedule, cancel, edit) requires
 * the professional to decide how far the change should propagate:
 *
 *   THIS           — only this occurrence
 *   THIS_AND_FUTURE — this occurrence and all future ones in the series
 *   ALL            — every occurrence in the series
 *
 * This is a pure presentational component that renders as a form section.
 * It does not manage its own open/close state so server-rendered pages can
 * compose it inline without client-side JS.
 *
 * The selected scope is submitted as `recurrenceScope` hidden input with
 * the parent form action handling it.
 */

export type RecurrenceEditScope = "THIS" | "THIS_AND_FUTURE" | "ALL";

const SCOPE_OPTIONS: {
  value: RecurrenceEditScope;
  label: string;
  description: string;
}[] = [
  {
    value: "THIS",
    label: "Somente esta sessão",
    description: "Apenas esta ocorrência será alterada. As demais permanecem inalteradas.",
  },
  {
    value: "THIS_AND_FUTURE",
    label: "Esta e as próximas",
    description: "Esta sessão e todas as futuras na série serão alteradas.",
  },
  {
    value: "ALL",
    label: "Toda a série",
    description: "Todas as sessões agendadas e confirmadas na série serão alteradas.",
  },
];

interface RecurrenceScopeDialogProps {
  /** Default selected scope. */
  defaultScope?: RecurrenceEditScope;
  /** Action verb shown in the heading (e.g., "reagendar", "cancelar"). */
  verb?: string;
}

export function RecurrenceScopeDialog({
  defaultScope = "THIS",
  verb = "alterar",
}: RecurrenceScopeDialogProps) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeadingStyle}>
        <p style={eyebrowStyle}>Série recorrente</p>
        <h2 style={sectionTitleStyle}>O que você quer {verb}?</h2>
        <p style={sectionCopyStyle}>
          Esta consulta faz parte de uma série semanal. Escolha o escopo da alteração.
        </p>
      </div>

      <div style={optionsListStyle}>
        {SCOPE_OPTIONS.map((option) => (
          <label key={option.value} style={optionLabelStyle}>
            <input
              defaultChecked={defaultScope === option.value}
              name="recurrenceScope"
              style={{ marginTop: "0.2rem" }}
              type="radio"
              value={option.value}
            />
            <div>
              <p style={optionNameStyle}>{option.label}</p>
              <p style={optionDescStyle}>{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "var(--radius-xl)",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 8px 24px rgba(120, 53, 15, 0.06)",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.25rem",
} satisfies React.CSSProperties;

const sectionCopyStyle = {
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const optionsListStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const optionLabelStyle = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-start",
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-lg)",
  border: "1px solid rgba(120, 53, 15, 0.12)",
  background: "var(--color-surface-0)",
  cursor: "pointer",
} satisfies React.CSSProperties;

const optionNameStyle = {
  margin: 0,
  fontWeight: 600,
  fontSize: "0.95rem",
} satisfies React.CSSProperties;

const optionDescStyle = {
  margin: 0,
  marginTop: "0.2rem",
  fontSize: "0.86rem",
  color: "var(--color-text-3)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;
