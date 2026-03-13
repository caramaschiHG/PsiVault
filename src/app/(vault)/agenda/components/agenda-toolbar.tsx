/**
 * AgendaToolbar — day/week view switcher and date navigation.
 *
 * Stays stateless: all navigation is driven by search params so the
 * professional can bookmark or share a specific day/week view.
 *
 * Receives pre-formatted labels so the toolbar is not responsible for
 * date formatting decisions.
 */

import Link from "next/link";

export type AgendaView = "day" | "week";

interface AgendaToolbarProps {
  /** Current active view. */
  activeView: AgendaView;
  /** Human-readable label for the current period (e.g., "16 de março" or "16–22 de março"). */
  periodLabel: string;
  /** URL for the previous day/week. */
  prevHref: string;
  /** URL for the next day/week. */
  nextHref: string;
  /** URL to switch to the day view (for the current anchor date). */
  dayViewHref: string;
  /** URL to switch to the week view (for the current anchor date). */
  weekViewHref: string;
  /** URL to navigate to today. */
  todayHref: string;
}

export function AgendaToolbar({
  activeView,
  periodLabel,
  prevHref,
  nextHref,
  dayViewHref,
  weekViewHref,
  todayHref,
}: AgendaToolbarProps) {
  return (
    <div style={toolbarStyle}>
      {/* Period navigation */}
      <div style={navGroupStyle}>
        <Link href={prevHref} style={navButtonStyle} aria-label="Período anterior">
          ←
        </Link>

        <span style={periodLabelStyle}>{periodLabel}</span>

        <Link href={nextHref} style={navButtonStyle} aria-label="Próximo período">
          →
        </Link>

        <Link href={todayHref} style={todayButtonStyle}>
          Hoje
        </Link>
      </div>

      {/* View switcher */}
      <div style={viewSwitcherStyle}>
        <Link
          href={dayViewHref}
          style={{
            ...viewTabStyle,
            ...(activeView === "day" ? activeViewTabStyle : {}),
          }}
        >
          Dia
        </Link>
        <Link
          href={weekViewHref}
          style={{
            ...viewTabStyle,
            ...(activeView === "week" ? activeViewTabStyle : {}),
          }}
        >
          Semana
        </Link>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const navGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const navButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "50%",
  background: "rgba(255, 247, 237, 0.8)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
  color: "#78350f",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "1rem",
  lineHeight: 1,
} satisfies React.CSSProperties;

const periodLabelStyle = {
  fontWeight: 700,
  fontSize: "1.05rem",
  color: "#1c1917",
  minWidth: "10rem",
  textAlign: "center" as const,
} satisfies React.CSSProperties;

const todayButtonStyle = {
  padding: "0.38rem 0.9rem",
  borderRadius: "12px",
  background: "transparent",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  color: "#92400e",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
} satisfies React.CSSProperties;

const viewSwitcherStyle = {
  display: "flex",
  borderRadius: "14px",
  background: "rgba(255, 247, 237, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const viewTabStyle = {
  padding: "0.48rem 1.1rem",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.88rem",
  color: "#78716c",
  transition: "background 0.15s, color 0.15s",
} satisfies React.CSSProperties;

const activeViewTabStyle = {
  background: "#9a3412",
  color: "#fff7ed",
} satisfies React.CSSProperties;
