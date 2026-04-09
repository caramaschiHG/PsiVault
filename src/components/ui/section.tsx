import type { CSSProperties } from "react";

interface SectionProps {
  title: string;
  action?: React.ReactNode;
  description?: string;
  variant?: "card" | "plain";
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}

const sectionCardStyle: CSSProperties = {
  padding: "var(--space-6)",
  borderRadius: "var(--radius-xl)",
  background: "var(--surface-base)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  display: "grid",
  gap: "var(--space-4)",
  alignContent: "start",
};

const sectionPlainStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-4)",
  alignContent: "start",
};

const sectionHeadingStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-h2)",
  fontWeight: 600,
  color: "var(--color-text-2)",
  textTransform: "uppercase",
  letterSpacing: "var(--letter-spacing-wide)",
};

const sectionDescriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-body-sm)",
  color: "var(--color-text-3)",
  lineHeight: "var(--line-height-base)",
};

export function Section({
  title,
  action,
  description,
  variant = "card",
  className,
  style,
  children,
}: SectionProps) {
  const baseStyle = variant === "card" ? sectionCardStyle : sectionPlainStyle;

  return (
    <section className={className} style={{ ...baseStyle, ...style }}>
      {/* Heading row */}
      <div style={sectionHeadingStyle}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        {action && <div>{action}</div>}
      </div>

      {/* Optional description */}
      {description && <p style={sectionDescriptionStyle}>{description}</p>}

      {/* Content */}
      {children}
    </section>
  );
}
