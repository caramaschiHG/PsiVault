"use client";

import { useState, useTransition, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { layoutGridBlocks } from "../../../../lib/appointments/grid-layout";
import type { GridBlock, GridLayoutOptions, PositionedBlock } from "../../../../lib/appointments/grid-layout";
import { AppointmentBlock } from "./appointment-block";
import { AppointmentSidePanel } from "./appointment-side-panel";
import { rescheduleAppointmentAction } from "../../appointments/actions";

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
}

export function WeekCalendarGrid({
  blocks,
  panels,
  patientNames,
  weekStart,
  options,
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
    if (!overId.startsWith("slot-")) return;

    // "slot-2026-03-20T14:00" → "2026-03-20T14:00:00.000Z"
    const isoDatetime = overId.replace("slot-", "") + ":00.000Z";
    const newStartsAt = new Date(isoDatetime);
    if (isNaN(newStartsAt.getTime())) return;

    // Find the dragged block across all day columns
    let dragged: PositionedBlock | undefined;
    for (const day of days) {
      dragged = positionedByDay[day.dateStr]?.find((b) => b.appointmentId === active.id);
      if (dragged) break;
    }
    if (!dragged) return;

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

              const slots: string[] = [];
              for (let h = dayStartHour; h < dayEndHour; h++) {
                for (let m = 0; m < 60; m += SLOT_MINUTES) {
                  const hh = String(h).padStart(2, "0");
                  const mm = String(m).padStart(2, "0");
                  slots.push(`slot-${day.dateStr}T${hh}:${mm}`);
                }
              }

              return (
                <div
                  key={day.dateStr}
                  style={{
                    position: "relative",
                    height: containerHeight,
                    borderLeft:
                      dayIndex === 0
                        ? "1px solid var(--color-border)"
                        : "1px solid var(--color-border)",
                  }}
                >
                  {/* Hour dividers */}
                  {hours.map((h) => {
                    const topPx = (h - dayStartHour) * 60 * pixelsPerMinute;
                    return <div key={h} style={{ ...hourLineStyle, top: topPx }} />;
                  })}

                  {/* Droppable 15-min slots */}
                  {slots.map((slotId) => (
                    <DroppableSlot
                      key={slotId}
                      id={slotId}
                      dayStartHour={dayStartHour}
                      pixelsPerMinute={pixelsPerMinute}
                    />
                  ))}

                  {/* Positioned appointment blocks */}
                  {positioned.map((b) => (
                    <AppointmentBlock
                      key={b.appointmentId}
                      block={b}
                      patientName={patientNames[b.patientId] ?? "—"}
                      onClick={setSelectedId}
                    />
                  ))}
                </div>
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

// ─── DroppableSlot ────────────────────────────────────────────────────────────

interface DroppableSlotProps {
  id: string;
  dayStartHour: number;
  pixelsPerMinute: number;
}

function DroppableSlot({ id, dayStartHour, pixelsPerMinute }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // "slot-2026-03-16T09:15" → time part "09:15"
  const timePart = id.replace(/^slot-[^T]+T/, "");
  const [hStr, mStr] = timePart.split(":");
  const slotMinutes = (Number(hStr) - dayStartHour) * 60 + Number(mStr);
  const topPx = slotMinutes * pixelsPerMinute;
  const slotHeightPx = SLOT_MINUTES * pixelsPerMinute;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        height: slotHeightPx,
        background: isOver ? "rgba(154, 52, 18, 0.06)" : "transparent",
        transition: "background 80ms",
      }}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const COLUMNS = "3.5rem repeat(7, minmax(130px, 1fr))";

const outerWrapStyle = {
  overflowX: "auto" as const,
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

const headerRowStyle = {
  display: "grid",
  gridTemplateColumns: COLUMNS,
  borderBottom: "1px solid var(--color-border)",
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

const bodyStyle = {
  display: "grid",
  gridTemplateColumns: COLUMNS,
  overflowY: "auto" as const,
  maxHeight: "65vh",
} satisfies React.CSSProperties;

const dayHeaderStyle = {
  display: "grid",
  placeItems: "center",
  padding: "0.5rem 0.25rem",
  gap: "0.1rem",
} satisfies React.CSSProperties;

const todayHeaderStyle = {
  background: "rgba(255, 247, 237, 0.8)",
} satisfies React.CSSProperties;

const dayNameStyle = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "var(--color-text-3)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
} satisfies React.CSSProperties;

const dayNumberStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--color-text-1)",
  lineHeight: 1.2,
} satisfies React.CSSProperties;

const todayDayNumberStyle = {
  color: "#9a3412",
} satisfies React.CSSProperties;

const axisStyle = {
  position: "relative" as const,
  flexShrink: 0,
  borderRight: "1px solid var(--color-border)",
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
