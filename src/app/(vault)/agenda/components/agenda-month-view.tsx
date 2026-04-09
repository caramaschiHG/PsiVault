"use client";

import type { MonthAgendaResult } from "../../../../lib/appointments/agenda";

interface AgendaMonthViewProps {
  month: MonthAgendaResult;
  patientNames: Record<string, string>;
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointmentId: string) => void;
}

const WEEKDAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const STATUS_BAR_COLORS: Record<string, string> = {
  SCHEDULED: "var(--color-brown-mid)",
  CONFIRMED: "var(--color-sage)",
  COMPLETED: "var(--color-text-2)",
  CANCELED: "var(--color-error-text)",
  NO_SHOW: "var(--color-text-3)",
};

export function AgendaMonthView({
  month,
  patientNames,
  onDayClick,
  onAppointmentClick,
}: AgendaMonthViewProps) {
  const { days } = month;

  return (
    <div style={containerStyle}>
      {/* Weekday headers */}
      <div style={headerRowStyle}>
        {WEEKDAY_NAMES.map((day) => (
          <div key={day} style={headerCellStyle}>
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={gridStyle}>
        {days.map((day, idx) => {
          const dateStr = day.date.toISOString().slice(0, 10);
          const displayCards = day.cards.slice(0, 3);
          const remaining = day.cards.length - 3;

          return (
            <div
              key={dateStr}
              style={{
                ...cellStyle,
                opacity: day.isCurrentMonth ? 1 : 0.35,
                minHeight: idx % 7 === 0 ? "90px" : "80px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-0)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {/* Day number */}
              <button
                type="button"
                style={dayNumberStyle}
                onClick={() => onDayClick(day.date)}
                aria-label={dateStr}
              >
                {day.date.getUTCDate()}
              </button>

              {/* Appointment bars */}
              <div style={barsContainerStyle}>
                {displayCards.map((card) => (
                  <div
                    key={card.appointmentId}
                    style={{
                      ...barStyle,
                      backgroundColor: STATUS_BAR_COLORS[card.status] ?? "var(--color-text-3)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(card.appointmentId);
                    }}
                    title={`${patientNames[card.patientId] ?? "Paciente"} — ${card.statusLabel}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${patientNames[card.patientId] ?? "Paciente"} — ${card.careModeLabel}`}
                  />
                ))}
                {remaining > 0 && (
                  <span style={moreStyle}>+{remaining} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xl)",
  overflow: "hidden",
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

const headerRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const headerCellStyle = {
  padding: "0.375rem 0.25rem",
  fontSize: "0.65rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--color-text-3)",
  textAlign: "center" as const,
} satisfies React.CSSProperties;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
} satisfies React.CSSProperties;

const cellStyle = {
  position: "relative" as const,
  padding: "4px",
  borderTop: "1px solid var(--color-border)",
  borderLeft: "1px solid var(--color-border)",
  transition: "background 80ms",
  cursor: "default",
} satisfies React.CSSProperties;

const dayNumberStyle = {
  display: "block",
  width: "100%",
  textAlign: "right" as const,
  padding: "0 2px 2px 0",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--color-text-1)",
  background: "none",
  border: "none",
  cursor: "pointer",
  lineHeight: 1,
} satisfies React.CSSProperties;

const barsContainerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "2px",
  marginTop: "2px",
} satisfies React.CSSProperties;

const barStyle = {
  height: "4px",
  borderRadius: "2px",
  cursor: "pointer",
  transition: "opacity 80ms",
} satisfies React.CSSProperties;

const moreStyle = {
  fontSize: "0.6rem",
  color: "var(--color-text-3)",
  lineHeight: 1,
  marginTop: "1px",
} satisfies React.CSSProperties;
