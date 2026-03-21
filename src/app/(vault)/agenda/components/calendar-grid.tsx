"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { layoutGridBlocks } from "../../../../lib/appointments/grid-layout";
import type { GridBlock, GridLayoutOptions } from "../../../../lib/appointments/grid-layout";
import { AppointmentBlock } from "./appointment-block";
import { AppointmentSidePanel } from "./appointment-side-panel";
import { rescheduleAppointmentAction } from "../../appointments/actions";
import { useToast } from "../../../../components/ui/toast-provider";

interface CalendarGridProps {
  blocks: GridBlock[];
  panels: Record<string, React.ReactNode>;
  patientNames: Record<string, string>;
  /** ISO date string for the day being rendered, e.g. "2026-03-20" */
  date: string;
  options: GridLayoutOptions;
}

const SLOT_MINUTES = 15;

export function CalendarGrid({ blocks, panels, patientNames, date, options }: CalendarGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const positioned = layoutGridBlocks(blocks, options);

  const { dayStartHour, dayEndHour } = options;
  const totalMinutes = (dayEndHour - dayStartHour) * 60;
  const pixelsPerMinute = 2; // 120px per hour
  const containerHeight = totalMinutes * pixelsPerMinute;

  // Build hour labels
  const hours: number[] = [];
  for (let h = dayStartHour; h < dayEndHour; h++) hours.push(h);

  // Build 15-min droppable slots
  const slots: string[] = [];
  for (let h = dayStartHour; h < dayEndHour; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`slot-${date}T${hh}:${mm}`);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    if (!overId.startsWith("slot-")) return;

    // Parse slot ISO datetime from id: "slot-2026-03-20T14:00"
    const isoDatetime = overId.replace("slot-", "") + ":00.000Z";
    const newStartsAt = new Date(isoDatetime);
    if (isNaN(newStartsAt.getTime())) return;

    const dragged = positioned.find((b) => b.appointmentId === active.id);
    if (!dragged) return;

    const formData = new FormData();
    formData.set("appointmentId", dragged.appointmentId);
    formData.set("startsAt", newStartsAt.toISOString());
    formData.set("durationMinutes", String(dragged.durationMinutes));
    formData.set("careMode", dragged.careMode);
    formData.set("rescheduledFromId", dragged.appointmentId);

    startTransition(async () => {
      const result = await rescheduleAppointmentAction(formData);
      if (result.success) {
        toast("Consulta reagendada");
        router.refresh();
      } else {
        toast(result.error ?? "Erro ao reagendar consulta", "error");
      }
    });
  }

  const handleClose = useCallback(() => setSelectedId(null), []);

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={outerStyle}>
          {/* Hour axis */}
          <div style={{ ...axisStyle, height: containerHeight }}>
            {hours.map((h) => {
              const topPx = ((h - dayStartHour) * 60) * pixelsPerMinute;
              return (
                <div key={h} style={{ ...hourLabelStyle, top: topPx }}>
                  {String(h).padStart(2, "0")}:00
                </div>
              );
            })}
          </div>

          {/* Grid column */}
          <div style={{ position: "relative", flex: 1, height: containerHeight }}>
            {/* Hour dividers */}
            {hours.map((h) => {
              const topPx = ((h - dayStartHour) * 60) * pixelsPerMinute;
              return (
                <div key={h} style={{ ...hourLineStyle, top: topPx }} />
              );
            })}

            {/* Droppable slots */}
            {slots.map((slotId) => (
              <DroppableSlot
                key={slotId}
                id={slotId}
                dayStartHour={dayStartHour}
                totalMinutes={totalMinutes}
                pixelsPerMinute={pixelsPerMinute}
                containerHeight={containerHeight}
              />
            ))}

            {/* Appointment blocks */}
            {positioned.map((b) => (
              <AppointmentBlock
                key={b.appointmentId}
                block={b}
                patientName={patientNames[b.patientId] ?? "—"}
                onClick={setSelectedId}
              />
            ))}
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

// ─── Droppable slot ────────────────────────────────────────────────────────────

interface DroppableSlotProps {
  id: string;
  dayStartHour: number;
  totalMinutes: number;
  pixelsPerMinute: number;
  containerHeight: number;
}

function DroppableSlot({ id, dayStartHour, totalMinutes, pixelsPerMinute }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Parse hour and minute from slot id: "slot-2026-03-20T14:00"
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

const outerStyle = {
  display: "flex",
  gap: 0,
  overflowY: "auto" as const,
  maxHeight: "70vh",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

const axisStyle = {
  position: "relative" as const,
  width: "3.5rem",
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
