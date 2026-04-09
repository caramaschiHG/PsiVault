import type { CSSProperties } from "react";

// ─── List ─────────────────────────────────────────────────────────────────────

interface ListProps {
  variant?: "bordered" | "separated" | "plain";
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  "aria-label"?: string;
}

const variantStyles = {
  bordered: {
    borderRadius: "var(--radius-lg)",
    background: "var(--surface-base)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-xs)",
    overflow: "hidden",
  },
  separated: {
    display: "grid",
    gap: "var(--space-2)",
  },
  plain: {
    display: "grid",
    gap: "var(--space-1)",
  },
};

export function List({
  variant = "bordered",
  interactive = false,
  className,
  style,
  children,
  "aria-label": ariaLabel,
}: ListProps) {
  return (
    <ul
      className={className}
      style={{
        ...variantStyles[variant],
        ...(interactive ? {} : {}),
        ...style,
      }}
      aria-label={ariaLabel}
    >
      {children}
    </ul>
  );
}

// ─── ListItem ─────────────────────────────────────────────────────────────────

interface ListItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg";
  divider?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

const paddingStyles = {
  sm: { padding: "var(--space-2) var(--space-4)" },
  md: { padding: "var(--space-3) var(--space-6)" },
  lg: { padding: "var(--space-4) var(--space-6)" },
};

const dividerStyle: CSSProperties = {
  borderBottom: "1px solid var(--color-border)",
};

const interactiveStyle: CSSProperties = {
  cursor: "pointer",
  transition: "background-color var(--transition-fast)",
};

export function ListItem({
  children,
  href,
  onClick,
  padding = "md",
  divider = true,
  className,
  style,
  "aria-label": ariaLabel,
}: ListItemProps) {
  const baseItemStyle: CSSProperties = {
    ...paddingStyles[padding],
    ...(divider ? dividerStyle : {}),
    ...(onClick || href ? interactiveStyle : {}),
    ...style,
  };

  const hoverStyle: CSSProperties = {
    ...baseItemStyle,
  };

  if (href) {
    return (
      <li className={className} style={{ listStyle: "none" }}>
        <a
          href={href}
          style={{
            ...hoverStyle,
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {children}
        </a>
      </li>
    );
  }

  if (onClick) {
    return (
      <li
        className={className}
        style={{ listStyle: "none" }}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={ariaLabel}
      >
        <div style={hoverStyle}>{children}</div>
      </li>
    );
  }

  return (
    <li className={className} style={hoverStyle} aria-label={ariaLabel}>
      {children}
    </li>
  );
}

// ─── ListEmpty ────────────────────────────────────────────────────────────────

interface ListEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  style?: CSSProperties;
}

const emptyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  padding: "var(--space-6)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-3)",
  flexWrap: "wrap",
};

const emptyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-body-sm)",
  color: "var(--color-text-3)",
  flex: 1,
};

const emptyActionStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  padding: "var(--space-2) var(--space-3)",
};

export function ListEmpty({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  style,
}: ListEmptyProps) {
  return (
    <div className={className} style={{ ...emptyStyle, ...style }}>
      {icon && <div style={{ color: "var(--color-text-4)", flexShrink: 0 }}>{icon}</div>}
      <div style={{ flex: 1 }}>
        <p style={{ ...emptyTextStyle, fontWeight: 500 }}>{title}</p>
        {description && <p style={{ ...emptyTextStyle, marginTop: "var(--space-1)" }}>{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn-secondary" style={emptyActionStyle}>
          {actionLabel}
        </a>
      )}
    </div>
  );
}
