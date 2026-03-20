"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { PositionedBlock } from "../../../../lib/appointments/grid-layout";

interface AppointmentBlockProps {
  block: PositionedBlock;
  patientName: string;
  onClick: (appointmentId: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  SCHEDULED:  { bg: "rgba(246, 246, 244, 0.96)", border: "rgba(120, 53, 15, 0.22)", text: "#44403c" },
  CONFIRMED:  { bg: "rgba(236, 253, 245, 0.96)", border: "rgba(16, 185, 129, 0.3)",  text: "#065f46" },
  COMPLETED:  { bg: "rgba(241, 245, 249, 0.96)", border: "rgba(100, 116, 139, 0.3)", text: "#475569" },
  CANCELED:   { bg: "rgba(254, 242, 242, 0.96)", border: "rgba(220, 38, 38, 0.2)",   text: "#991b1b" },
  NO_SHOW:    { bg: "rgba(255, 247, 237, 0.96)", border: "rgba(234, 88, 12, 0.3)",   text: "#9a3412" },
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
    padding: "2px",
    boxSizing: "border-box",
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
    cursor: isFinalized ? "default" : "grab",
    touchAction: "none",
  };

  const innerStyle: React.CSSProperties = {
    height: "100%",
    borderRadius: "8px",
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    padding: "3px 6px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  };

  const startTime = new Date(block.startsAtIso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isFinalized ? {} : { ...attributes, ...listeners })}
      onClick={(e) => {
        e.stopPropagation();
        onClick(block.appointmentId);
      }}
    >
      <div style={innerStyle}>
        <span style={{ fontSize: "0.7rem", color: colors.text, fontWeight: 600, lineHeight: 1.2 }}>
          {startTime}
        </span>
        <span style={{ fontSize: "0.75rem", color: colors.text, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {patientName}
        </span>
        {block.durationMinutes >= 45 && (
          <span style={{ fontSize: "0.68rem", color: colors.text, opacity: 0.7, lineHeight: 1.2 }}>
            {block.careMode === "ONLINE" ? "🌐 Online" : "🏥 Presencial"}
          </span>
        )}
      </div>
    </div>
  );
}
