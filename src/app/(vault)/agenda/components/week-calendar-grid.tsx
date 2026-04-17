"use client";

import { useState, useTransition, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { layoutGridBlocks } from "../../../../lib/appointments/grid-layout";
import type { GridBlock, GridLayoutOptions, PositionedBlock } from "../../../../lib/appointments/grid-layout";
import { AppointmentBlock } from "./appointment-block";
import { AppointmentSidePanel } from "./appointment-side-panel";
import { rescheduleAppointmentAction } from "../../appointments/actions";
import type { SlotClickHandler } from "./calendar-grid";

const SLOT_MINUTES = 15;
const WEEKDAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAY_MS = 24 * 60 * 60 * 1000;

interface WeekDay {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

interface WeekCalendarGridProps {
  blocks: GridBlock[];
  panels: Record<string, React.ReactNode>;
  patientNames: Record<string, string>;
  /** ISO date string for the week start (Monday), e.g. "2026-03-16" */
  weekStart: string;
  options: GridLayoutOptions;
  /** Called when an empty slot is clicked. Opens quick create popover. */
  onSlotClick?: SlotClickHandler;
}

export function WeekCalendarGrid({
  blocks,
  panels,
  patientNames,
  weekStart,
  options,
  onSlotClick,
}: WeekCalendarGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const { dayStartHour, dayEndHour } = options;
  const totalMinutes = (dayEndHour - dayStartHour) * 60;
  const pixelsPerMinute = 2;
  const containerHeight = totalMinutes * pixelsPerMinute;

  const hours: number[] = [];
  for (let h = dayStartHour; h < dayEndHour; h++) hours.push(h);

  // Build 7-day descriptors from weekStart
  const todayStr = new Date().toISOString().slice(0, 10);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const ts = Date.parse(weekStart + "T00:00:00.000Z") + i * DAY_MS;
    const d = new Date(ts);
    const dateStr = d.toISOString().slice(0, 10);
    return {
      dateStr,
      dayName: WEEKDAY_NAMES[i] ?? String(i),
      dayNumber: d.getUTCDate(),
      isToday: dateStr === todayStr,
    };
  });

  // Position blocks per day (independent conflict groups)
  const positionedByDay: Record<string, PositionedBlock[]> = {};
  for (const day of days) {
    const dayBlocks = blocks.filter((b) => b.startsAtIso.startsWith(day.dateStr));
    positionedByDay[day.dateStr] = layoutGridBlocks(dayBlocks, options);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    if (!overId.startsWith("column-")) return;

    // Extract date from column id: "column-2026-03-20"
    const dateStr = overId.replace("column-", "");

    // Find the dragged block across all day columns
    let dragged: PositionedBlock | undefined;
    for (const day of days) {
      dragged = positionedByDay[day.dateStr]?.find((b) => b.appointmentId === active.id);
      if (dragged) break;
    }
    if (!dragged) return;

    // Parse the original time and create new datetime with dropped date
    const originalTime = new Date(dragged.startsAtIso);
    const newStartsAt = new Date(`${dateStr}T${String(originalTime.getUTCHours()).padStart(2, "0")}:${String(originalTime.getUTCMinutes()).padStart(2, "0")}:00.000Z`);
    if (isNaN(newStartsAt.getTime())) return;

    const formData = new FormData();
    formData.set("appointmentId", dragged.appointmentId);
    formData.set("startsAt", newStartsAt.toISOString());
    formData.set("durationMinutes", String(dragged.durationMinutes));
    formData.set("careMode", dragged.careMode);
    formData.set("rescheduledFromId", dragged.appointmentId);

    startTransition(() => {
      rescheduleAppointmentAction(formData).catch(console.error);
    });
  }

  const handleClose = useCallback(() => setSelectedId(null), []);

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={outerWrapStyle}>
          {/* Sticky header row: axis spacer + 7 day labels */}
          <div style={headerRowStyle}>
            <div /> {/* axis spacer */}
            {days.map((day) => (
              <div
                key={day.dateStr}
                style={{
                  ...dayHeaderStyle,
                  ...(day.isToday ? todayHeaderStyle : {}),
                }}
              >
                <span style={dayNameStyle}>{day.dayName}</span>
                <span
                  style={{
                    ...dayNumberStyle,
                    ...(day.isToday ? todayDayNumberStyle : {}),
                  }}
                >
                  {day.dayNumber}
                </span>
              </div>
            ))}
          </div>

          {/* Scrollable body: axis + 7 day columns */}
          <div style={bodyStyle}>
            {/* Hour axis */}
            <div style={{ ...axisStyle, height: containerHeight }}>
              {hours.map((h) => {
                const topPx = (h - dayStartHour) * 60 * pixelsPerMinute;
                return (
                  <div key={h} style={{ ...hourLabelStyle, top: topPx }}>
                    {String(h).padStart(2, "0")}:00
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const positioned = positionedByDay[day.dateStr] ?? [];

              return (
                <DroppableColumn
                  key={day.dateStr}
                  dateStr={day.dateStr}
                  dayIndex={dayIndex}
                  dayStartHour={dayStartHour}
                  pixelsPerMinute={pixelsPerMinute}
                  containerHeight={containerHeight}
                  positioned={positioned}
                  patientNames={patientNames}
                  onSelectAppointment={setSelectedId}
                  onSlotClick={onSlotClick}
                />
              );
            })}
          </div>
        </div>
      </DndContext>

      <AppointmentSidePanel
        appointmentId={selectedId}
        panels={panels}
        onClose={handleClose}
      />
    </>
  );
}

// ─── DroppableColumn (replaces 96 DroppableSlots per day) ─────────────────────

interface DroppableColumnProps {
  dateStr: string;
  dayIndex: number;
  dayStartHour: number;
  pixelsPerMinute: number;
  containerHeight: number;
  positioned: PositionedBlock[];
  patientNames: Record<string, string>;
  onSelectAppointment: (id: string) => void;
  onSlotClick?: SlotClickHandler;
}

function DroppableColumn({
  dateStr,
  dayIndex,
  dayStartHour,
  pixelsPerMinute,
  containerHeight,
  positioned,
  patientNames,
  onSelectAppointment,
  onSlotClick,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${dateStr}` });

  const handleClick = (e: React.MouseEvent) => {
    if (!onSlotClick) return;
    // Only open popover if clicking on empty space (not on appointment blocks)
    if ((e.target as HTMLElement).closest('[data-appointment-id]')) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const scrollTop = (e.currentTarget.closest('[style*="overflow"]') as HTMLElement)?.scrollTop ?? 0;
    const slotMinutes = Math.floor((y + scrollTop) / pixelsPerMinute);
    const totalMinutesFromMidnight = slotMinutes * SLOT_MINUTES + dayStartHour * 60;
    const hh = String(Math.floor(totalMinutesFromMidnight / 60)).padStart(2, "0");
    const mm = String(totalMinutesFromMidnight % 60).padStart(2, "0");
    const isoStartsAt = `${dateStr}T${hh}:${mm}:00.000Z`;
    onSlotClick(isoStartsAt, { top: e.clientY, left: e.clientX });
  };

  return (
    <div
      ref={setNodeRef}
      onClick={onSlotClick ? handleClick : undefined}
      style={{
        position: "relative",
        height: containerHeight,
        borderLeft: "1px solid var(--color-border)",
        background: isOver ? "rgba(154, 52, 18, 0.04)" : "transparent",
        transition: "background 80ms",
        cursor: onSlotClick ? "pointer" : "default",
      }}
    >
      {/* Hour dividers */}
      {Array.from({ length: Math.round(containerHeight / (60 * pixelsPerMinute)) }, (_, i) => {
        const topPx = i * 60 * pixelsPerMinute;
        return <div key={i} style={{ ...hourLineStyle, top: topPx }} />;
      })}

      {/* Positioned appointment blocks */}
      {positioned.map((b) => (
        <AppointmentBlock
          key={b.appointmentId}
          block={b}
          patientName={patientNames[b.patientId] ?? "—"}
          onClick={onSelectAppointment}
        />
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const COLUMNS = "3.5rem repeat(7, minmax(110px, 1fr))";

const outerWrapStyle = {
  overflowX: "auto" as const,
  overflowY: "auto" as const,
  maxHeight: "calc(100vh - 160px)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  width: "100%",
  position: "relative" as const,
} satisfies React.CSSProperties;

const headerRowStyle = {
  display: "grid",
  gridTemplateColumns: COLUMNS,
  borderBottom: "1px solid var(--color-border)",
  position: "sticky" as const,
  top: 0,
  zIndex: "var(--z-dropdown)",
  background: "var(--color-surface-1)",
  minWidth: "min-content",
} satisfies React.CSSProperties;

const bodyStyle = {
  display: "grid",
  gridTemplateColumns: COLUMNS,
  minWidth: "min-content",
} satisfies React.CSSProperties;

const dayHeaderStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem 0",
  gap: "0.1rem",
} satisfies React.CSSProperties;

const todayHeaderStyle = {
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const dayNameStyle = {
  fontSize: "0.7rem",
  fontWeight: 500,
  color: "var(--color-text-3)",
  textTransform: "uppercase" as const,
} satisfies React.CSSProperties;

const dayNumberStyle = {
  fontSize: "1.5rem",
  fontWeight: 400,
  color: "var(--color-text-1)",
  lineHeight: 1,
  width: "2.5rem",
  height: "2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
} satisfies React.CSSProperties;

const todayDayNumberStyle = {
  background: "var(--color-accent)",
  color: "#fff",
  fontWeight: 600,
} satisfies React.CSSProperties;

const axisStyle = {
  position: "sticky" as const,
  left: 0,
  flexShrink: 0,
  borderRight: "1px solid var(--color-border)",
  background: "var(--color-surface-1)",
  zIndex: "var(--z-base)",
} satisfies React.CSSProperties;

const hourLabelStyle = {
  position: "absolute" as const,
  right: "0.4rem",
  fontSize: "0.7rem",
  color: "var(--color-text-3)",
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1,
  transform: "translateY(-50%)",
} satisfies React.CSSProperties;

const hourLineStyle = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  borderTop: "1px solid var(--color-border)",
} satisfies React.CSSProperties;
