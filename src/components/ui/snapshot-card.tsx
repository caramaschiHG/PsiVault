import type { CSSProperties } from "react";

interface SnapshotCardProps {
  label: string;
  value: string | number;
  accentColor?: string;
  className?: string;
}

const cardStyle = {
  padding: "var(--space-card-padding)",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  gap: "0.4rem",
} satisfies CSSProperties;

const labelStyle = {
  margin: 0,
  fontSize: "0.72rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-text-4)",
  fontWeight: 600,
} satisfies CSSProperties;

const valueStyle = {
  margin: 0,
  fontSize: "var(--font-size-display)",
  fontWeight: 700,
  fontFamily: "'IBM Plex Serif', serif",
  lineHeight: 1,
} satisfies CSSProperties;

export function SnapshotCard({ label, value, accentColor, className }: SnapshotCardProps) {
  return (
    <div className={className} style={cardStyle}>
      <p style={labelStyle}>{label}</p>
      <p style={{ ...valueStyle, ...(accentColor ? { color: accentColor } : {}) }}>
        {value}
      </p>
    </div>
  );
}
