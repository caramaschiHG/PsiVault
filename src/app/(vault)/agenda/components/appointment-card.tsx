/**
 * AppointmentCard — reusable appointment block for both agenda layouts.
 *
 * Displays the essentials at a glance:
 * - Time window (start and end)
 * - Status chip (color-coded, clear copy)
 * - Care mode chip (SVG icon + label so Presencial vs Online is fast to parse)
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
    color: "var(--color-warning-text)",
    border: "var(--status-scheduled-border)",
  },
  CONFIRMED: {
    background: "var(--status-confirmed-bg)",
    color: "var(--color-forest)",
    border: "var(--status-confirmed-border)",
  },
  COMPLETED: {
    background: "var(--status-completed-bg)",
    color: "var(--color-text-3)",
    border: "var(--status-completed-border)",
  },
  CANCELED: {
    background: "var(--status-canceled-bg)",
    color: "var(--color-error-text)",
    border: "var(--status-canceled-border)",
  },
  NO_SHOW: {
    background: "var(--status-no-show-bg)",
    color: "var(--color-rose)",
    border: "var(--status-no-show-border)",
  },
};

interface AppointmentCardProps {
  card: AgendaCard;
  patientDisplayName: string;
  /** When provided, renders the quick next-session action below the card. */
  nextSessionAction?: React.ReactNode;
  /** When provided, renders inline action buttons (confirm, complete, cancel, no-show). */
  quickActions?: React.ReactNode;
}

export function AppointmentCard({
  card,
  patientDisplayName,
  nextSessionAction,
  quickActions,
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
          {card.careMode === "ONLINE" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={careModeIconStyle}>
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={careModeIconStyle}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          )}
          {card.careModeLabel}
        </span>
      </div>

      {/* Quick action buttons (confirm, complete, no-show, cancel) */}
      {quickActions && <div style={quickActionsRowStyle}>{quickActions}</div>}

      {/* Quick next-session action (e.g., completed-appointment rebooking) */}
      {nextSessionAction && <div style={nextSessionActionStyle}>{nextSessionAction}</div>}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle = {
  padding: "var(--space-4) var(--space-5)",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid",
  display: "grid",
  gap: "var(--space-2)",
  boxShadow: "var(--shadow-sm)",
  transition: "box-shadow 150ms ease, transform 150ms ease",
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
  fontSize: "var(--font-size-body-sm)",
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
  borderRadius: "var(--radius-pill)",
  border: "1px solid",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.02em",
} satisfies React.CSSProperties;

const careModeChipStyle = {
  ...chipStyle,
  background: "var(--color-surface-warm)",
  color: "var(--color-text-2)",
  borderColor: "var(--color-border-med)",
} satisfies React.CSSProperties;

const careModeIconStyle = {
  marginRight: "var(--space-1.5)",
  flexShrink: 0,
} satisfies React.CSSProperties;

const quickActionsRowStyle = {
  paddingTop: "0.5rem",
} satisfies React.CSSProperties;

const nextSessionActionStyle = {
  marginTop: "0.25rem",
  paddingTop: "0.75rem",
  borderTop: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;
