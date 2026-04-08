import type { CSSProperties } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

const blockStyle = { display: "grid", gap: "0.25rem" } satisfies CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "var(--font-size-page-title)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
} satisfies CSSProperties;

const descriptionStyle = {
  margin: "0.25rem 0 0",
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-2)",
  lineHeight: 1.5,
} satisfies CSSProperties;

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={className} style={blockStyle}>
      {eyebrow && <p style={eyebrowStyle}>{eyebrow}</p>}
      <h1 style={titleStyle}>{title}</h1>
      {description && <p style={descriptionStyle}>{description}</p>}
      {actions && <div style={{ marginTop: "0.5rem" }}>{actions}</div>}
    </div>
  );
}
