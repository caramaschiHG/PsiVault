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
    background: "var(--status-scheduled-bg)",
    color: "#92400e",
    border: "var(--status-scheduled-border)",
  },
  CONFIRMED: {
    background: "var(--status-confirmed-bg)",
    color: "#2d6a4f",
    border: "var(--status-confirmed-border)",
  },
  COMPLETED: {
    background: "var(--status-completed-bg)",
    color: "#92400e",
    border: "var(--status-completed-border)",
  },
  CANCELED: {
    background: "var(--status-canceled-bg)",
    color: "#64748b",
    border: "var(--status-canceled-border)",
  },
  NO_SHOW: {
    background: "var(--status-no-show-bg)",
    color: "#9f1239",
    border: "var(--status-no-show-border)",
  },
};

const CARE_MODE_ICONS: Record<string, string> = {
  IN_PERSON: "○",
  ONLINE: "◎",
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
      className="card-hover"
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
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid",
  display: "grid",
  gap: "0.55rem",
  boxShadow: "var(--shadow-sm)",
  transition: "box-shadow 0.15s",
} satisfies React.CSSProperties;

const timeRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} satisfies React.CSSProperties;

const timeStyle = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "var(--color-text-1)",
  fontVariantNumeric: "tabular-nums",
} satisfies React.CSSProperties;

const durationStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-4)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const patientNameStyle = {
  margin: 0,
  fontWeight: 600,
  fontSize: "0.97rem",
  color: "var(--color-text-1)",
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
  background: "rgba(245, 241, 235, 0.9)",
  color: "var(--color-text-2)",
  borderColor: "var(--color-border-med)",
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
