import type { CSSProperties } from "react";

interface HeroCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const cardStyle = {
  padding: "var(--space-hero-padding)",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.5rem",
} satisfies CSSProperties;

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
  fontSize: "var(--font-size-section-title)",
  fontWeight: 600,
  fontFamily: "var(--font-serif)",
} satisfies CSSProperties;

const descriptionStyle = {
  margin: "0.25rem 0 0",
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-2)",
  lineHeight: 1.5,
} satisfies CSSProperties;

export function HeroCard({ eyebrow, title, description, children, className }: HeroCardProps) {
  return (
    <div className={className} style={cardStyle}>
      {eyebrow && <p style={eyebrowStyle}>{eyebrow}</p>}
      <h2 style={titleStyle}>{title}</h2>
      {description && <p style={descriptionStyle}>{description}</p>}
      {children}
    </div>
  );
}
