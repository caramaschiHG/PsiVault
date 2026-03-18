import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    padding: "3rem 1.5rem",
    textAlign: "center" as const,
    color: "var(--color-text-2)",
  } satisfies React.CSSProperties;

  const iconStyle = {
    width: "3rem",
    height: "3rem",
    opacity: 0.4,
    marginBottom: "0.25rem",
  } satisfies React.CSSProperties;

  const titleStyle = {
    fontSize: "var(--font-size-body)",
    fontWeight: 600,
    color: "var(--color-text-1)",
    margin: 0,
  } satisfies React.CSSProperties;

  const descStyle = {
    fontSize: "var(--font-size-meta)",
    color: "var(--color-text-2)",
    margin: 0,
    maxWidth: "280px",
  } satisfies React.CSSProperties;

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{icon}</div>
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
