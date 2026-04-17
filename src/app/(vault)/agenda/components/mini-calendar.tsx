"use client";

import { useState, useCallback, useEffect } from "react";
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

  const [displayMonth, setDisplayMonth] = useState(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  });

  useEffect(() => {
    setDisplayMonth((prev) => {
      if (prev.getFullYear() === currentDate.getFullYear() && prev.getMonth() === currentDate.getMonth()) {
        return prev;
      }
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    });
  }, [currentDate]);

  const handleDayClick = useCallback((date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    router.push(`/agenda?view=day&date=${dateStr}`);
  }, [router]);

  return (
    <div style={containerStyle} className="mini-calendar-wrapper">
      <style dangerouslySetInnerHTML={{ __html: customCss }} />
      <DayPicker
        mode="single"
        locale={ptBR}
        selected={currentDate}
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
    --rdp-cell-size: 2.25rem;
    --rdp-accent-color: var(--color-accent);
    --rdp-background-color: transparent;
    --rdp-accent-color-dark: var(--color-accent-dark);
    --rdp-outline: 2px solid var(--color-accent);
    --rdp-outline-selected: 2px solid var(--color-accent);
  }
  .mini-calendar-wrapper .rdp-root {
    --rdp-margin: 0;
  }
  .mini-calendar-wrapper .rdp-nav {
    color: var(--color-text-3);
  }
  .mini-calendar-wrapper .rdp-nav svg {
    stroke-width: 2.5;
  }
  .mini-calendar-wrapper .rdp-month_caption {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-1);
    text-transform: capitalize;
  }
  .mini-calendar-wrapper .rdp-weekday {
    font-size: var(--font-size-2xs);
    font-weight: 600;
    color: var(--color-text-3);
    text-transform: uppercase;
  }
  .mini-calendar-wrapper .rdp-day_button {
    border-radius: var(--radius-xs);
    width: 100%;
    height: 100%;
  }
  .mini-calendar-wrapper .rdp-today {
    color: var(--color-accent);
    font-weight: bold;
    background-color: rgba(154, 52, 18, 0.08);
  }
  .mini-calendar-wrapper .rdp-selected {
    background-color: var(--color-accent);
    color: #fff;
  }
  .mini-calendar-wrapper .rdp-selected .rdp-day_button {
    background-color: var(--color-accent);
    color: #fff;
  }
  .mini-calendar-wrapper .rdp-outside {
    opacity: 0.35;
  }
`;

const containerStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-3)",
  display: "flex",
  justifyContent: "center",
  width: "100%",
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
