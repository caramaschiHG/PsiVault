import React from "react";
import { T } from "../tokens";

export type BadgeVariant = "confirmed" | "scheduled" | "paid" | "pending" | "confidential";

const STYLES: Record<BadgeVariant, React.CSSProperties> = {
  confirmed:    { background: "rgba(245, 250, 246, 0.9)", color: "#166534", border: "1px solid rgba(34,197,94,0.25)" },
  scheduled:    { background: "rgba(255, 247, 237, 0.9)", color: T.accent, border: `1px solid rgba(154,52,18,0.2)` },
  paid:         { background: T.paidBg, color: T.paidText, border: "1px solid rgba(34,197,94,0.25)" },
  pending:      { background: T.pendingBg, color: T.pendingText, border: "1px solid rgba(245,158,11,0.25)" },
  confidential: { background: T.accentLight, color: T.accent, border: `1px solid ${T.borderMed}` },
};

type BadgeProps = { variant: BadgeVariant; children: React.ReactNode };

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 14px",
      borderRadius: T.rPill,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: T.fontSans,
      lineHeight: 1.4,
      ...STYLES[variant],
    }}
  >
    {children}
  </span>
);
