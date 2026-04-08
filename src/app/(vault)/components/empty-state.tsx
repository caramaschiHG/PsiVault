import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  compact = false,
}: EmptyStateProps) {
  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    padding: compact ? "1.5rem 1rem" : "3rem 1.5rem",
    textAlign: "center" as const,
    color: "var(--color-text-2)",
  } satisfies React.CSSProperties;

  const iconWrapStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: compact ? "2.5rem" : "3.5rem",
    height: compact ? "2.5rem" : "3.5rem",
    borderRadius: "var(--radius-pill)",
    background: "var(--color-accent-light)",
    flexShrink: 0,
  } satisfies React.CSSProperties;

  const titleStyle = {
    fontSize: compact ? "var(--font-size-body)" : "var(--font-size-body)",
    fontWeight: 600,
    color: "var(--color-text-1)",
    margin: 0,
    letterSpacing: "0.01em",
  } satisfies React.CSSProperties;

  const descStyle = {
    fontSize: "var(--font-size-meta)",
    color: "var(--color-text-2)",
    margin: 0,
    maxWidth: "280px",
  } satisfies React.CSSProperties;

  return (
    <div role="status" aria-live="polite" style={containerStyle}>
      <div style={iconWrapStyle}>{icon}</div>
      <p style={titleStyle}>{title}</p>
      {description && <p style={descStyle}>{description}</p>}
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn-primary" style={{ marginTop: "0.5rem" }}>
          {actionLabel}
        </a>
      )}
    </div>
  );
}
