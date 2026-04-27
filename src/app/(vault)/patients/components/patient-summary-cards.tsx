/**
 * PatientSummaryCards — operational summary block.
 *
 * Renders the stable summary contract immediately below the identity header.
 * All fields show safe fallback copy when the scheduling/finance/document
 * domains have not yet provided real data.
 *
 * This surface is intentionally inert until 02-02 hydrates session fields.
 * The layout and fallback state is fully defined here so other domains
 * can slot in real values without changing the component structure.
 */

import type { PatientOperationalSummary } from "../../../../lib/patients/summary";
import { getSummaryLabel } from "../../../../lib/patients/summary";

interface PatientSummaryCardsProps {
  summary: PatientOperationalSummary;
}

export function PatientSummaryCards({ summary }: PatientSummaryCardsProps) {
  return (
    <section style={sectionStyle}>
      <div style={headerRowStyle}>
        <p style={eyebrowStyle}>Resumo operacional</p>
        {summary.noShowAlert && (
          <span
            title="2 faltas consecutivas detectadas"
            style={noShowDotStyle}
          />
        )}
      </div>

      <div style={cardsGridStyle}>
        <SummaryCard
          label="Última sessão"
          value={getSummaryLabel("lastSession", summary.lastSession)}
          isEmpty={summary.lastSession === null}
        />

        <SummaryCard
          label="Próxima sessão"
          value={getSummaryLabel("nextSession", summary.nextSession)}
          isEmpty={summary.nextSession === null}
        />

        <SummaryCard
          label="Itens pendentes"
          value={
            summary.pendingItemsCount === 0
              ? "Nenhum item pendente"
              : `${summary.pendingItemsCount} item${summary.pendingItemsCount > 1 ? "s" : ""} pendente${summary.pendingItemsCount > 1 ? "s" : ""}`
          }
          isEmpty={summary.pendingItemsCount === 0}
        />

        <SummaryCard
          label="Documentos"
          value={
            summary.documentCount === 0
              ? "Nenhum documento"
              : `${summary.documentCount} documento${summary.documentCount > 1 ? "s" : ""}`
          }
          isEmpty={summary.documentCount === 0}
        />

        <SummaryCard
          label="Situação financeira"
          value={getSummaryLabel("financialStatus", summary.financialStatus)}
          isEmpty={summary.financialStatus === "no_data"}
          fullWidth
        />
      </div>
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  isEmpty?: boolean;
  fullWidth?: boolean;
}

function SummaryCard({ label, value, isEmpty = false, fullWidth = false }: SummaryCardProps) {
  return (
    <div style={{ ...cardStyle, ...(fullWidth ? fullWidthCardStyle : {}) }}>
      <span style={cardLabelStyle}>{label}</span>
      <strong style={isEmpty ? emptyValueStyle : cardValueStyle}>{value}</strong>
    </div>
  );
}

const sectionStyle = {
  display: "grid",
  gap: "0.85rem",
} satisfies React.CSSProperties;

const headerRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const noShowDotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "var(--color-red-mid)",
  display: "inline-block",
  flexShrink: 0,
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const cardStyle = {
  padding: "1.1rem 1.2rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  gap: "0.35rem",
} satisfies React.CSSProperties;

const fullWidthCardStyle = {
  gridColumn: "1 / -1",
} satisfies React.CSSProperties;

const cardLabelStyle = {
  fontSize: "0.78rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--color-text-4)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const cardValueStyle = {
  fontSize: "0.97rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const emptyValueStyle = {
  ...cardValueStyle,
  color: "var(--color-text-4)",
  fontWeight: 400,
} satisfies React.CSSProperties;
