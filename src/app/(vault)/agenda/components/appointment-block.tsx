"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { PositionedBlock } from "../../../../lib/appointments/grid-layout";

interface AppointmentBlockProps {
  block: PositionedBlock;
  patientName: string;
  onClick: (appointmentId: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  SCHEDULED:  { bg: "var(--appt-scheduled-bg)",  border: "var(--appt-scheduled-border)",  text: "var(--appt-scheduled-text)",  accent: "#b45309" },
  CONFIRMED:  { bg: "var(--appt-confirmed-bg)",  border: "var(--appt-confirmed-border)",  text: "var(--appt-confirmed-text)",  accent: "#2d6a4f" },
  COMPLETED:  { bg: "var(--appt-completed-bg)",  border: "var(--appt-completed-border)",  text: "var(--appt-completed-text)",  accent: "#a8a29e" },
  CANCELED:   { bg: "var(--appt-canceled-bg)",   border: "var(--appt-canceled-border)",   text: "var(--appt-canceled-text)",   accent: "#dc2626" },
  NO_SHOW:    { bg: "var(--appt-noshow-bg)",     border: "var(--appt-noshow-border)",     text: "var(--appt-noshow-text)",     accent: "#9f1239" },
};

export function AppointmentBlock({ block, patientName, onClick }: AppointmentBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.appointmentId,
    data: { block },
  });

  const colors = STATUS_COLORS[block.status] ?? STATUS_COLORS.SCHEDULED;
  const isFinalized = block.status === "COMPLETED" || block.status === "CANCELED" || block.status === "NO_SHOW";

  const style: React.CSSProperties = {
    position: "absolute",
    top: `${block.topPercent}%`,
    height: `${Math.max(block.heightPercent, 2)}%`,
    left: `${(block.columnIndex / block.columnCount) * 100}%`,
    width: `${(1 / block.columnCount) * 100}%`,
    padding: "var(--space-1)",
    boxSizing: "border-box",
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? "var(--z-dropdown)" : "var(--z-base)",
    cursor: isFinalized ? "default" : "grab",
    touchAction: "none",
  };

  const innerStyle: React.CSSProperties = {
    height: "100%",
    borderRadius: "var(--radius-sm)",
    border: `1px solid ${colors.border}`,
    borderLeft: `3px solid ${colors.accent}`,
    background: colors.bg,
    padding: "var(--space-1) var(--space-2)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  };

  const startTime = new Date(block.startsAtIso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      ref={setNodeRef}
      data-appointment-id={block.appointmentId}
      style={style}
      {...(isFinalized ? {} : { ...attributes, ...listeners })}
      onClick={(e) => {
        e.stopPropagation();
        onClick(block.appointmentId);
      }}
    >
      <div style={innerStyle}>
        <span style={{ fontSize: "var(--font-size-xs)", color: colors.text, fontWeight: 600, lineHeight: 1.2 }}>
          {startTime}
        </span>
        <span style={{ fontSize: "var(--font-size-xs)", color: colors.text, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {patientName}
        </span>
        {block.durationMinutes >= 45 && (
          <span style={{ fontSize: "var(--font-size-2xs)", color: colors.text, opacity: 0.7, lineHeight: 1.2, display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}>
            {block.careMode === "ONLINE" ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Online
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Presencial
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
