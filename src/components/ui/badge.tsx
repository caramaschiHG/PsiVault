import type { CSSProperties } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  dotColor?: string;
  className?: string;
  style?: CSSProperties;
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default: {
    background: "var(--color-surface-3)",
    color: "var(--color-text-2)",
  },
  accent: {
    background: "var(--color-accent-light)",
    color: "var(--color-accent)",
  },
  success: {
    background: "var(--color-success-bg)",
    color: "var(--color-success-text)",
  },
  warning: {
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
  },
  danger: {
    background: "var(--color-error-bg)",
    color: "var(--color-error-text)",
  },
  neutral: {
    background: "rgba(245, 245, 244, 0.8)",
    color: "var(--color-text-3)",
  },
};

const sizeStyles = {
  sm: {
    fontSize: "var(--font-size-xs)",
    padding: "0.15rem 0.5rem",
  },
  md: {
    fontSize: "var(--font-size-sm)",
    padding: "0.2rem 0.625rem",
  },
};

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  fontWeight: 600,
  borderRadius: "var(--radius-pill)",
  whiteSpace: "nowrap",
  lineHeight: 1.4,
};

const dotStyle: CSSProperties = {
  width: "0.45rem",
  height: "0.45rem",
  borderRadius: "50%",
  flexShrink: 0,
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  dotColor,
  className,
  style,
}: BadgeProps) {
  const computedDotColor = dotColor ?? (
    variant === "success" ? "var(--color-success-text)" :
    variant === "warning" ? "var(--color-warning-text)" :
    variant === "danger" ? "var(--color-error-text)" :
    "var(--color-text-3)"
  );

  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {dot && <span style={{ ...dotStyle, background: computedDotColor }} />}
      {children}
    </span>
  );
}
