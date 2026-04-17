"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface MiniCalendarProps {
  currentDate: Date;
  /** Map of date string (YYYY-MM-DD) to appointment count for that day */
  appointmentCounts: Map<string, number>;
  activeView?: "day" | "week" | "month";
}

export function MiniCalendar({ currentDate, appointmentCounts }: MiniCalendarProps) {
  const router = useRouter();

  // Convert the UTC midnight anchor date to a local date with the same year, month, and day.
  // This prevents the DayPicker from shifting the selection backwards by a day in negative timezones (like Brazil).
  const localCurrentDate = useMemo(() => {
    return new Date(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate()
    );
  }, [currentDate]);

  const [displayMonth, setDisplayMonth] = useState(() => {
    return new Date(localCurrentDate.getFullYear(), localCurrentDate.getMonth(), 1);
  });

  useEffect(() => {
    setDisplayMonth((prev) => {
      if (prev.getFullYear() === localCurrentDate.getFullYear() && prev.getMonth() === localCurrentDate.getMonth()) {
        return prev;
      }
      return new Date(localCurrentDate.getFullYear(), localCurrentDate.getMonth(), 1);
    });
  }, [localCurrentDate]);

  const handleDayClick = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    router.push(`/agenda?view=day&date=${year}-${month}-${day}`);
  }, [router]);

  return (
    <div style={containerStyle} className="mini-calendar-wrapper">
      <style dangerouslySetInnerHTML={{ __html: customCss }} />
      <DayPicker
        mode="single"
        locale={ptBR}
        weekStartsOn={1}
        selected={localCurrentDate}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        onSelect={(date) => {
          if (date) handleDayClick(date);
        }}
        showOutsideDays
        components={{
          DayButton: (props) => {
            const { day, modifiers, ...buttonProps } = props;
            const dateStr = day.date.toISOString().slice(0, 10);
            const apptCount = appointmentCounts.get(dateStr) ?? 0;
            const isSelected = modifiers.selected;

            return (
              <button {...buttonProps} type="button" style={dayCellStyle}>
                <span style={dayNumberStyle}>{day.date.getDate()}</span>
                {apptCount > 0 && (
                  <div style={dotsContainerStyle}>
                    {Array.from({ length: Math.min(apptCount, 3) }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          ...dotStyle,
                          backgroundColor: isSelected
                            ? "rgba(255, 247, 237, 0.9)"
                            : "var(--color-brown-mid)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          },
        }}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const customCss = `
  .mini-calendar-wrapper {
    --rdp-day-width: 2rem;
    --rdp-day-height: 2rem;
    --rdp-day_button-width: 2rem;
    --rdp-day_button-height: 2rem;
    --rdp-day_button-border: 0;
    --rdp-day_button-border-radius: 50%;
    --rdp-nav-height: 2rem;
    --rdp-nav_button-width: 1.75rem;
    --rdp-nav_button-height: 1.75rem;
    --rdp-weekday-padding: 0.25rem 0;
    --rdp-accent-color: var(--color-accent);
    --rdp-accent-background-color: var(--color-accent-light);
    --rdp-today-color: var(--color-accent);
    --rdp-selected-border: 0;
    width: 100%;
    overflow: hidden;
  }
  .mini-calendar-wrapper .rdp-root {
    width: 100%;
  }
  .mini-calendar-wrapper .rdp-months {
    max-width: 100%;
    width: 100%;
  }
  .mini-calendar-wrapper .rdp-month {
    width: 100%;
  }
  .mini-calendar-wrapper .rdp-month_grid {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  .mini-calendar-wrapper .rdp-weekdays,
  .mini-calendar-wrapper .rdp-week {
    width: 100%;
  }
  .mini-calendar-wrapper .rdp-day,
  .mini-calendar-wrapper .rdp-weekday {
    width: calc(100% / 7);
    padding: 0;
    text-align: center;
    box-sizing: border-box;
  }
  .mini-calendar-wrapper .rdp-nav {
    color: var(--color-text-3);
  }
  .mini-calendar-wrapper .rdp-chevron {
    width: 1rem;
    height: 1rem;
    fill: currentColor;
  }
  .mini-calendar-wrapper .rdp-month_caption {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-1);
    text-transform: capitalize;
    padding-left: 0.25rem;
  }
  .mini-calendar-wrapper .rdp-weekday {
    font-size: var(--font-size-2xs);
    font-weight: 600;
    color: var(--color-text-3);
    text-transform: uppercase;
  }
  .mini-calendar-wrapper .rdp-day_button {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background-color 0.1s ease;
  }
  .mini-calendar-wrapper .rdp-day_button:hover {
    background-color: var(--color-surface-2);
  }
  .mini-calendar-wrapper .rdp-today .rdp-day_button {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    font-weight: bold;
  }
  .mini-calendar-wrapper .rdp-selected .rdp-day_button {
    background-color: var(--color-accent) !important;
    color: #fff !important;
    font-weight: bold;
  }
  .mini-calendar-wrapper .rdp-outside {
    opacity: 0.35;
  }
`;

const containerStyle = {
  background: "transparent",
  padding: "0",
  display: "flex",
  justifyContent: "center",
  width: "100%",
  boxSizing: "border-box" as const,
} satisfies React.CSSProperties;

const dayCellStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  margin: 0,
  boxSizing: "border-box" as const,
} satisfies React.CSSProperties;

const dayNumberStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 500,
  lineHeight: 1,
} satisfies React.CSSProperties;

const dotsContainerStyle = {
  display: "flex",
  gap: "1px",
  marginTop: "2px",
} satisfies React.CSSProperties;

const dotStyle = {
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  display: "inline-block",
} satisfies React.CSSProperties;
