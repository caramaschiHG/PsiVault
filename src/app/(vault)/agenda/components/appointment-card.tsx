/**
 * AppointmentCard — reusable appointment block for both agenda layouts.
 *
 * Displays the essentials at a glance:
 * - Time window (start and end)
 * - Status chip (color-coded, clear copy)
 * - Care mode chip (icon + label so Presencial vs Online is fast to parse)
 *
 * Privacy: receives only AgendaCard data — no clinical details, no
 * importantObservations, no notes. Patient name is resolved from patientId
 * by the parent (passed as patientDisplayName) so this card never handles
 * raw patient records.
 */

import type { AgendaCard } from "../../../../lib/appointments/agenda";

const STATUS_COLORS: Record<string, { background: string; color: string; border: string }> = {
  SCHEDULED: {
    background: "rgba(255, 247, 237, 0.9)",
    color: "#92400e",
    border: "rgba(146, 64, 14, 0.22)",
  },
  CONFIRMED: {
    background: "rgba(236, 253, 245, 0.9)",
    color: "#065f46",
    border: "rgba(16, 185, 129, 0.22)",
  },
  COMPLETED: {
    background: "rgba(239, 246, 255, 0.9)",
    color: "#1e3a8a",
    border: "rgba(59, 130, 246, 0.22)",
  },
  CANCELED: {
    background: "rgba(248, 250, 252, 0.9)",
    color: "#64748b",
    border: "rgba(100, 116, 139, 0.2)",
  },
  NO_SHOW: {
    background: "rgba(255, 241, 242, 0.9)",
    color: "#9f1239",
    border: "rgba(159, 18, 57, 0.2)",
  },
};

const CARE_MODE_ICONS: Record<string, string> = {
  IN_PERSON: "🏠",
  ONLINE: "💻",
};

interface AppointmentCardProps {
  card: AgendaCard;
  patientDisplayName: string;
  /** When provided, renders the quick next-session action below the card. */
  nextSessionAction?: React.ReactNode;
}

export function AppointmentCard({
  card,
  patientDisplayName,
  nextSessionAction,
}: AppointmentCardProps) {
  const statusStyle = STATUS_COLORS[card.status] ?? STATUS_COLORS.SCHEDULED;

  const startTime = card.startsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const endTime = card.endsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      style={{
        ...cardStyle,
        borderColor: statusStyle.border,
      }}
    >
      {/* Time row */}
      <div style={timeRowStyle}>
        <time style={timeStyle}>
          {startTime} – {endTime}
        </time>
        <span style={durationStyle}>{card.durationMinutes} min</span>
      </div>

      {/* Patient name */}
      <p style={patientNameStyle}>{patientDisplayName}</p>

      {/* Chips row: status + care mode */}
      <div style={chipsRowStyle}>
        <span
          style={{
            ...chipStyle,
            background: statusStyle.background,
            color: statusStyle.color,
            borderColor: statusStyle.border,
          }}
        >
          {card.statusLabel}
        </span>

        <span style={careModeChipStyle}>
          <span style={careModeIconStyle}>{CARE_MODE_ICONS[card.careMode]}</span>
          {card.careModeLabel}
        </span>
      </div>

      {/* Quick next-session action (e.g., completed-appointment rebooking) */}
      {nextSessionAction && <div style={nextSessionActionStyle}>{nextSessionAction}</div>}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle = {
  padding: "1.1rem 1.25rem",
  borderRadius: "20px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid",
  display: "grid",
  gap: "0.55rem",
  boxShadow: "0 4px 16px rgba(120, 53, 15, 0.05)",
} satisfies React.CSSProperties;

const timeRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} satisfies React.CSSProperties;

const timeStyle = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#1c1917",
  fontVariantNumeric: "tabular-nums",
} satisfies React.CSSProperties;

const durationStyle = {
  fontSize: "0.8rem",
  color: "#a8a29e",
  fontWeight: 500,
} satisfies React.CSSProperties;

const patientNameStyle = {
  margin: 0,
  fontWeight: 600,
  fontSize: "0.97rem",
  color: "#1c1917",
} satisfies React.CSSProperties;

const chipsRowStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.22rem 0.75rem",
  borderRadius: "100px",
  border: "1px solid",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.02em",
} satisfies React.CSSProperties;

const careModeChipStyle = {
  ...chipStyle,
  background: "rgba(241, 245, 249, 0.9)",
  color: "#475569",
  borderColor: "rgba(71, 85, 105, 0.18)",
} satisfies React.CSSProperties;

const careModeIconStyle = {
  marginRight: "0.35rem",
  fontSize: "0.85rem",
} satisfies React.CSSProperties;

const nextSessionActionStyle = {
  marginTop: "0.25rem",
  paddingTop: "0.75rem",
  borderTop: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;
