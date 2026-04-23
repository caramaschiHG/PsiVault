import type { CSSProperties } from "react";

type CardVariant = "default" | "raised" | "outlined" | "interactive" | "subtle";

interface CardProps {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
  asLink?: boolean;
}

const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    background: "var(--surface-base)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-xs)",
  },
  raised: {
    background: "var(--surface-raised)",
    border: "none",
    boxShadow: "var(--shadow-md)",
  },
  outlined: {
    background: "transparent",
    border: "1px solid var(--color-border)",
    boxShadow: "none",
  },
  interactive: {
    background: "var(--surface-base)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-xs)",
  },
  subtle: {
    background: "transparent",
    border: "none",
    boxShadow: "none",
  },
};

const paddingStyles = {
  sm: { padding: "var(--space-3)" },
  md: { padding: "var(--space-4)" },
  lg: { padding: "var(--space-6)" },
};

const baseStyle: CSSProperties = {
  borderRadius: "var(--radius-lg)",
  display: "grid",
  gap: "var(--space-4)",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  style,
  children,
  onClick,
  asLink,
}: CardProps) {
  const isInteractive = !!onClick || !!asLink;
  const combinedClassName = [
    className,
    isInteractive ? "card-hover" : "",
  ].filter(Boolean).join(" ");

  const combinedStyle: CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...(isInteractive ? { cursor: "pointer" } : {}),
    ...style,
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={combinedClassName}
      style={combinedStyle}
      onClick={onClick}
      {...(onClick ? { type: "button" as const } : {})}
    >
      {children}
    </Component>
  );
}

// ─── Card Sub-components ─────────────────────────────────────────────────────

interface CardHeaderProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

const cardHeaderStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-1)",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "var(--letter-spacing-wider)",
  fontSize: "var(--font-size-label)",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-h2)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
  lineHeight: "var(--line-height-tight)",
};

const descriptionStyle: CSSProperties = {
  margin: "var(--space-1) 0 0",
  fontSize: "var(--font-size-body-sm)",
  color: "var(--color-text-2)",
  lineHeight: "var(--line-height-base)",
};

export function CardHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  style,
  children,
}: CardHeaderProps) {
  if (children) {
    return (
      <div className={className} style={{ ...cardHeaderStyle, ...style }}>
        {children}
      </div>
    );
  }

  return (
    <div className={className} style={{ ...cardHeaderStyle, ...style }}>
      {eyebrow && <p style={eyebrowStyle}>{eyebrow}</p>}
      {title && <h3 style={titleStyle}>{title}</h3>}
      {description && <p style={descriptionStyle}>{description}</p>}
      {actions && <div style={{ marginTop: "var(--space-2)" }}>{actions}</div>}
    </div>
  );
}

interface CardContentProps {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}

export function CardContent({ className, style, children }: CardContentProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  bordered?: boolean;
}

const cardFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
  paddingTop: "var(--space-3)",
};

const cardFooterBorderedStyle: CSSProperties = {
  ...cardFooterStyle,
  borderTop: "1px solid var(--color-border)",
};

export function CardFooter({
  className,
  style,
  children,
  bordered = false,
}: CardFooterProps) {
  return (
    <div
      className={className}
      style={{ ...(bordered ? cardFooterBorderedStyle : cardFooterStyle), ...style }}
    >
      {children}
    </div>
  );
}
