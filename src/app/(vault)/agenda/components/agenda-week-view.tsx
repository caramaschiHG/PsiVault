/**
 * AgendaWeekView — secondary layout showing all 7 days side by side.
 *
 * Legible and not cramped: each day column shows its date heading and
 * appointment cards. Empty days show a minimal placeholder.
 *
 * Design decisions:
 * - Week view is a consumer of the same WeekAgendaResult contract as the day
 *   view — no scheduling logic lives here.
 * - Columns scroll horizontally on small screens rather than collapsing the
 *   layout to maintain visual day-to-day comparison.
 */

import type { WeekAgendaResult } from "../../../../lib/appointments/agenda";
import { AppointmentCard } from "./appointment-card";

const WEEKDAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface AgendaWeekViewProps {
  week: WeekAgendaResult;
  /** Resolves patientId to a display name. */
  patientNames: Record<string, string>;
  /** Optional: slot for completed-appointment next-session actions (keyed by appointmentId). */
  nextSessionActions?: Record<string, React.ReactNode>;
  /** Optional: slot for inline quick action buttons (confirm, complete, cancel, no-show). */
  quickActions?: Record<string, React.ReactNode>;
}

export function AgendaWeekView({
  week,
  patientNames,
  nextSessionActions = {},
  quickActions = {},
}: AgendaWeekViewProps) {
  return (
    <div style={weekGridStyle}>
      {week.days.map((day, index) => {
        const dayNumber = day.date.getUTCDate();
        const dayName = WEEKDAY_NAMES[index] ?? String(index);
        const isToday = isTodayUTC(day.date);

        return (
          <div key={day.date.toISOString()} style={dayColumnStyle}>
            {/* Day heading */}
            <div style={{ ...dayHeadingStyle, ...(isToday ? todayHeadingStyle : {}) }}>
              <span style={dayNameStyle}>{dayName}</span>
              <span style={{ ...dayNumberStyle, ...(isToday ? todayDayNumberStyle : {}) }}>
                {dayNumber}
              </span>
            </div>

            {/* Appointment cards */}
            <div style={dayCardsStyle}>
              {day.cards.length === 0 ? (
                <div style={emptyDayStyle} />
              ) : (
                day.cards.map((card) => (
                  <AppointmentCard
                    key={card.appointmentId}
                    card={card}
                    patientDisplayName={patientNames[card.patientId] ?? "Paciente"}
                    nextSessionAction={nextSessionActions[card.appointmentId]}
                    quickActions={quickActions[card.appointmentId]}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function isTodayUTC(date: Date): boolean {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const weekGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(130px, 1fr))",
  gap: "0.5rem",
  overflowX: "auto" as const,
} satisfies React.CSSProperties;

const dayColumnStyle = {
  display: "grid",
  gap: "0.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const dayHeadingStyle = {
  display: "grid",
  placeItems: "center",
  padding: "0.6rem 0.5rem",
  borderRadius: "var(--radius-md)",
  background: "transparent",
} satisfies React.CSSProperties;

const todayHeadingStyle = {
  background: "var(--color-accent-light)",
  border: "1px solid var(--color-border-med)",
} satisfies React.CSSProperties;

const dayNameStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-4)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
} satisfies React.CSSProperties;

const dayNumberStyle = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "var(--color-warm-brown)",
  lineHeight: 1.2,
} satisfies React.CSSProperties;

const todayDayNumberStyle = {
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const dayCardsStyle = {
  display: "grid",
  gap: "0.4rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const emptyDayStyle = {
  height: "3rem",
  borderRadius: "var(--radius-md)",
  border: "1px dashed rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;
