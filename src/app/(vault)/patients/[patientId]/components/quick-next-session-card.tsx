/**
 * QuickNextSessionCard — patient-context entry point for rapid next-session creation.
 *
 * Uses the shared NextSessionDefaults contract to prefill patient, duration,
 * care mode, and price when navigating to the appointment booking form.
 *
 * Date and time are intentionally NOT prefilled — the professional chooses
 * the new slot explicitly to avoid silent scheduling assumptions.
 *
 * This component is wired to the appointment booking form via query params
 * and does not bypass the conflict or archive rules defined in 02-02.
 */

import Link from "next/link";
import type { NextSessionDefaults } from "../../../../../lib/appointments/defaults";

interface QuickNextSessionCardProps {
  defaults: NextSessionDefaults;
  patientDisplayName: string;
}

export function QuickNextSessionCard({
  defaults,
  patientDisplayName,
}: QuickNextSessionCardProps) {
  // Build prefill query params — date/time excluded intentionally
  const params = new URLSearchParams();
  params.set("patientId", defaults.patientId);
  params.set("durationMinutes", String(defaults.durationMinutes));
  params.set("careMode", defaults.careMode);
  if (defaults.priceInCents !== null) {
    params.set("priceInCents", String(defaults.priceInCents));
  }

  const href = `/appointments/new?${params.toString()}`;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <p style={eyebrowStyle}>Ação rápida</p>
        <h3 style={cardTitleStyle}>Próxima sessão</h3>
      </div>

      <p style={cardCopyStyle}>
        Agende a próxima consulta para{" "}
        <strong style={patientNameStyle}>{patientDisplayName}</strong> com os
        dados da sessão anterior já preenchidos.
      </p>

      <div style={defaultsPreviewStyle}>
        <DefaultPreviewItem
          label="Duração"
          value={`${defaults.durationMinutes} min`}
        />
        <DefaultPreviewItem
          label="Modalidade"
          value={defaults.careMode === "IN_PERSON" ? "Presencial" : "Online"}
        />
        {defaults.priceInCents !== null && (
          <DefaultPreviewItem
            label="Valor"
            value={new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(defaults.priceInCents / 100)}
          />
        )}
      </div>

      <p style={noDateNoteStyle}>
        Data e hora em branco — você escolhe o novo horário.
      </p>

      <Link href={href} style={ctaButtonStyle}>
        Agendar próxima sessão
      </Link>
    </div>
  );
}

function DefaultPreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={previewItemStyle}>
      <span style={previewLabelStyle}>{label}</span>
      <span style={previewValueStyle}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle = {
  padding: "1.35rem 1.5rem",
  borderRadius: "22px",
  background: "rgba(255, 247, 237, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.18)",
  display: "grid",
  gap: "0.85rem",
} satisfies React.CSSProperties;

const cardHeaderStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const cardTitleStyle = {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#1c1917",
} satisfies React.CSSProperties;

const cardCopyStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "#57534e",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const patientNameStyle = {
  color: "#1c1917",
} satisfies React.CSSProperties;

const defaultsPreviewStyle = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const previewItemStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const previewLabelStyle = {
  fontSize: "0.72rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#a8a29e",
  fontWeight: 500,
} satisfies React.CSSProperties;

const previewValueStyle = {
  fontSize: "0.93rem",
  fontWeight: 700,
  color: "#78350f",
} satisfies React.CSSProperties;

const noDateNoteStyle = {
  margin: 0,
  fontSize: "0.8rem",
  color: "#a8a29e",
  fontStyle: "italic" as const,
} satisfies React.CSSProperties;

const ctaButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.85rem 1.4rem",
  borderRadius: "16px",
  background: "#9a3412",
  color: "#fff7ed",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.93rem",
  justifySelf: "start" as const,
} satisfies React.CSSProperties;
