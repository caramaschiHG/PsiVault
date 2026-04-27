/**
 * AppointmentCard — reusable appointment block for agenda list view.
 *
 * Layout: left accent strip (status color) + content grid.
 * Primary: patient name. Secondary: time window, chips, actions.
 *
 * Privacy: receives only AgendaCard data — no clinical details, no
 * importantObservations, no notes. Patient name is resolved from patientId
 * by the parent (passed as patientDisplayName).
 */

import type { AgendaCard } from "../../../../lib/appointments/agenda";

/** Solid accent colors for the left status strip. */
const STATUS_ACCENTS: Record<string, string> = {
  SCHEDULED: "#b45309",
  CONFIRMED: "#2d6a4f",
  COMPLETED: "#a8a29e",
  CANCELED:  "#dc2626",
  NO_SHOW:   "#9f1239",
};

/** Chip colors for the status badge. */
const STATUS_CHIPS: Record<string, { background: string; color: string; border: string }> = {
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
  nextSessionAction?: React.ReactNode;
  quickActions?: React.ReactNode;
}

export function AppointmentCard({
  card,
  patientDisplayName,
  nextSessionAction,
  quickActions,
}: AppointmentCardProps) {
  const chipStyle = STATUS_CHIPS[card.status] ?? STATUS_CHIPS.SCHEDULED;
  const accentColor = STATUS_ACCENTS[card.status] ?? STATUS_ACCENTS.SCHEDULED;

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
    <div className="card-hover" style={cardStyle}>
      {/* Status accent strip */}
      <div style={{ ...accentStripStyle, background: accentColor }} />

      {/* Card content */}
      <div style={contentStyle}>
        {/* Patient name — primary info */}
        <p style={patientNameStyle}>
          {patientDisplayName}
          {card.patientNoShowAlert && (
            <span
              title="2 faltas consecutivas detectadas"
              style={noShowDotStyle}
            />
          )}
        </p>

        {/* Time row */}
        <div style={timeRowStyle}>
          <time style={timeStyle}>
            {startTime} – {endTime}
          </time>
          <span style={durationStyle}>{card.durationMinutes} min</span>
        </div>

        {/* Chips: status + care mode */}
        <div style={chipsRowStyle}>
          <span
            style={{
              ...statusChipStyle,
              background: chipStyle.background,
              color: chipStyle.color,
              borderColor: chipStyle.border,
            }}
          >
            {card.statusLabel}
          </span>

          <span style={careModeChipStyle}>
            {card.careMode === "ONLINE" ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={iconStyle}>
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={iconStyle}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            )}
            {card.careModeLabel}
          </span>
        </div>

        {/* Quick action buttons (confirm, complete, no-show, cancel) */}
        {quickActions && <div style={quickActionsRowStyle}>{quickActions}</div>}

        {/* Next-session action (completed rebooking, note entry, communication) */}
        {nextSessionAction && <div style={nextSessionActionStyle}>{nextSessionAction}</div>}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle = {
  display: "flex",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const accentStripStyle = {
  width: "4px",
  flexShrink: 0,
} satisfies React.CSSProperties;

const contentStyle = {
  flex: 1,
  padding: "var(--space-4) var(--space-5)",
  display: "grid",
  gap: "var(--space-2)",
  minWidth: 0,
} satisfies React.CSSProperties;

const patientNameStyle = {
  margin: 0,
  fontWeight: 700,
  fontSize: "1rem",
  color: "var(--color-text-1)",
  lineHeight: 1.3,
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
} satisfies React.CSSProperties;

const noShowDotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "var(--color-red-mid)",
  display: "inline-block",
  flexShrink: 0,
} satisfies React.CSSProperties;

const timeRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
} satisfies React.CSSProperties;

const timeStyle = {
  fontWeight: 500,
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-2)",
  fontVariantNumeric: "tabular-nums",
} satisfies React.CSSProperties;

const durationStyle = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-4)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const chipsRowStyle = {
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const statusChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.18rem 0.6rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid",
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  letterSpacing: "0.02em",
} satisfies React.CSSProperties;

const careModeChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.18rem 0.6rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border-med)",
  fontSize: "var(--font-size-xs)",
  fontWeight: 500,
  color: "var(--color-text-2)",
  background: "var(--color-surface-warm)",
} satisfies React.CSSProperties;

const iconStyle = {
  flexShrink: 0,
} satisfies React.CSSProperties;

const quickActionsRowStyle = {
  paddingTop: "var(--space-2)",
} satisfies React.CSSProperties;

const nextSessionActionStyle = {
  marginTop: "0.125rem",
  paddingTop: "0.75rem",
  borderTop: "1px solid var(--color-border)",
} satisfies React.CSSProperties;
