"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MiniCalendarProps {
  currentDate: Date;
  /** Map of date string (YYYY-MM-DD) to appointment count for that day */
  appointmentCounts: Map<string, number>;
  activeView?: "day" | "week" | "month";
}

const WEEKDAY_INITIALS = ["S", "T", "Q", "Q", "S", "S", "D"];
const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function MiniCalendar({ currentDate, appointmentCounts, activeView = "day" }: MiniCalendarProps) {
  const router = useRouter();
  const todayStr = getTodayLocal().toISOString().slice(0, 10);
  const selectedStr = currentDate.toISOString().slice(0, 10);

  const [displayMonth, setDisplayMonth] = useState(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  });

  // Sync displayMonth when currentDate changes externally
  useEffect(() => {
    setDisplayMonth((prev) => {
      if (prev.getFullYear() === currentDate.getFullYear() && prev.getMonth() === currentDate.getMonth()) {
        return prev;
      }
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    });
  }, [currentDate]);

  const prevMonth = useCallback(() => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    router.push(`/agenda?view=day&date=${dateStr}`);
  }, [router]);

  // Build 42-day grid using local dates
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstOfMonth.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const gridStart = new Date(firstOfMonth.getTime() - daysFromMonday * DAY_MS);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const dayDate = new Date(gridStart.getTime() + i * DAY_MS);
    const dateStr = dayDate.toISOString().slice(0, 10);
    const isCurrentMonth = dayDate.getMonth() === month;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;
    const apptCount = appointmentCounts.get(dateStr) ?? 0;

    days.push({ dayDate, dateStr, isCurrentMonth, isToday, isSelected, apptCount });
  }

  const headerLabel = `${MONTH_NAMES[month]} ${year}`;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button type="button" onClick={prevMonth} style={arrowButtonStyle} aria-label="Mês anterior" className="mini-cal-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={headerLabelStyle}>{headerLabel}</span>
        <button type="button" onClick={nextMonth} style={arrowButtonStyle} aria-label="Próximo mês" className="mini-cal-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div style={weekdayRowStyle}>
        {WEEKDAY_INITIALS.map((d) => (
          <div key={d} style={weekdayCellStyle}>{d}</div>
        ))}
      </div>

      <div style={daysGridStyle}>
        {days.map(({ dayDate, dateStr, isCurrentMonth, isToday, isSelected, apptCount }) => (
          <button
            key={dateStr}
            type="button"
            className={`mini-cal-day${isSelected ? " selected" : ""}${isToday ? " today" : ""}`}
            style={{
              ...dayCellStyle,
              opacity: isCurrentMonth ? 1 : 0.35,
              color: isToday
                ? "var(--color-accent)"
                : isSelected
                  ? "#fff"
                  : isCurrentMonth
                    ? "var(--color-text-1)"
                    : "var(--color-text-3)",
              backgroundColor: isSelected
                ? "var(--color-accent)"
                : isToday
                  ? "rgba(154, 52, 18, 0.08)"
                  : "transparent",
            }}
            onClick={() => handleDayClick(dayDate)}
            aria-label={`${dayDate.getDate()} de ${MONTH_NAMES[dayDate.getMonth()]}`}
            aria-pressed={isSelected}
          >
            <span style={dayNumberStyle}>{dayDate.getDate()}</span>
            {apptCount > 0 && (
              <div style={dotsContainerStyle}>
                {Array.from({ length: Math.min(apptCount, 3) }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      ...dotStyle,
                      backgroundColor: isSelected
                        ? "rgba(255, 247, 237, 0.7)"
                        : "var(--color-brown-mid)",
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "0.5rem",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.25rem 0",
  marginBottom: "0.25rem",
} satisfies React.CSSProperties;

const arrowButtonStyle = {
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
  fontSize: "0.85rem",
  color: "var(--color-text-2)",
  borderRadius: "var(--radius-xs)",
  transition: "background 100ms ease, color 100ms ease",
} satisfies React.CSSProperties;

const headerLabelStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const weekdayRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "1px",
  marginBottom: "2px",
} satisfies React.CSSProperties;

const weekdayCellStyle = {
  textAlign: "center" as const,
  fontSize: "0.55rem",
  fontWeight: 600,
  color: "var(--color-text-3)",
  textTransform: "uppercase" as const,
  padding: "2px 0",
} satisfies React.CSSProperties;

const daysGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "1px",
} satisfies React.CSSProperties;

const dayCellStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  minHeight: "1.75rem",
  padding: "1px",
  border: "none",
  cursor: "pointer",
  borderRadius: "var(--radius-xs)",
  lineHeight: 1,
  transition: "background 80ms ease",
} satisfies React.CSSProperties;

const dayNumberStyle = {
  fontSize: "0.7rem",
  fontWeight: 500,
  lineHeight: 1,
} satisfies React.CSSProperties;

const dotsContainerStyle = {
  display: "flex",
  gap: "1px",
  marginTop: "1px",
} satisfies React.CSSProperties;

const dotStyle = {
  width: "3px",
  height: "3px",
  borderRadius: "50%",
  display: "inline-block",
} satisfies React.CSSProperties;
