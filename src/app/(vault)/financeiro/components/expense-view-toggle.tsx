"use client";

interface ExpenseViewToggleProps {
  view: "flat" | "grouped";
  onViewChange: (v: "flat" | "grouped") => void;
}

export function ExpenseViewToggle({ view, onViewChange }: ExpenseViewToggleProps) {
  return (
    <div style={containerStyle}>
      <button
        type="button"
        onClick={() => onViewChange("flat")}
        style={view === "flat" ? activePillStyle : inactivePillStyle}
        aria-pressed={view === "flat"}
      >
        Cronológico
      </button>
      <button
        type="button"
        onClick={() => onViewChange("grouped")}
        style={view === "grouped" ? activePillStyle : inactivePillStyle}
        aria-pressed={view === "grouped"}
      >
        Por categoria
      </button>
    </div>
  );
}

const containerStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  display: "inline-flex",
  padding: "2px",
} satisfies React.CSSProperties;

const basePillStyle = {
  height: "36px",
  padding: "6px 14px",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  border: "none",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
  transition: "background 120ms, box-shadow 120ms",
  background: "transparent",
} satisfies React.CSSProperties;

const activePillStyle = {
  ...basePillStyle,
  background: "var(--color-surface-0)",
  boxShadow: "var(--shadow-xs)",
  color: "var(--color-text-1)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const inactivePillStyle = {
  ...basePillStyle,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;
