import type { CSSProperties } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
  href?: string;
  className?: string;
  style?: CSSProperties;
}

const cardStyle: CSSProperties = {
  padding: "var(--space-4) var(--space-6)",
  borderRadius: "var(--radius-lg)",
  background: "var(--surface-raised)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  display: "grid",
  gap: "var(--space-1)",
  textDecoration: "none",
};

const labelStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-sm)",
  textTransform: "uppercase",
  letterSpacing: "var(--letter-spacing-wide)",
  color: "var(--color-text-4)",
  fontWeight: 600,
};

const valueStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-display)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
  lineHeight: 1,
};

const valueAccentStyle: CSSProperties = {
  ...valueStyle,
  color: "var(--color-accent)",
};

const accentLabelStyle: CSSProperties = {
  ...labelStyle,
  color: "var(--color-accent)",
  textDecoration: "underline",
  textDecorationColor: "rgba(154, 52, 18, 0.3)",
};

export function StatCard({ label, value, accent = false, href, className, style }: StatCardProps) {
  const content = (
    <>
      <p style={accent ? accentLabelStyle : labelStyle}>{label}</p>
      <p style={accent ? valueAccentStyle : valueStyle}>{value}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={{ ...cardStyle, ...style }}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={className} style={{ ...cardStyle, ...style }}>
      {content}
    </div>
  );
}
