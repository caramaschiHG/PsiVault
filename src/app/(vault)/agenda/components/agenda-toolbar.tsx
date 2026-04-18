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

export type AgendaView = "day" | "week" | "month";

interface AgendaToolbarProps {
  /** Current active view. */
  activeView: AgendaView;
  /** Human-readable label for the current period (e.g., "16 de março" or "16–22 de março"). */
  periodLabel: string;
  /** URL for the previous day/week/month. */
  prevHref: string;
  /** URL for the next day/week/month. */
  nextHref: string;
  /** URL to switch to the day view (for the current anchor date). */
  dayViewHref: string;
  /** URL to switch to the week view (for the current anchor date). */
  weekViewHref: string;
  /** URL to switch to the month view (for the current anchor date). */
  monthViewHref: string;
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
  monthViewHref,
  todayHref,
}: AgendaToolbarProps) {
  return (
    <div style={toolbarStyle}>
      {/* Period navigation */}
      <div style={navGroupStyle}>
        <Link prefetch={false} href={prevHref} style={navButtonStyle} className="agenda-nav-btn" aria-label="Período anterior">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>

        <span style={periodLabelStyle}>{periodLabel}</span>

        <Link prefetch={false} href={nextHref} style={navButtonStyle} className="agenda-nav-btn" aria-label="Próximo período">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        <Link prefetch={false} href={todayHref} style={todayButtonStyle} className="agenda-today-btn">
          Hoje
        </Link>
      </div>

      {/* View switcher */}
      <div style={viewSwitcherStyle}>
        <Link
          prefetch={false}
          href={dayViewHref}
          className="agenda-view-tab"
          style={{
            ...viewTabStyle,
            ...(activeView === "day" ? activeViewTabStyle : {}),
          }}
        >
          Dia
        </Link>
        <Link
          prefetch={false}
          href={weekViewHref}
          className="agenda-view-tab"
          style={{
            ...viewTabStyle,
            ...(activeView === "week" ? activeViewTabStyle : {}),
          }}
        >
          Semana
        </Link>
        <Link
          prefetch={false}
          href={monthViewHref}
          className="agenda-view-tab"
          style={{
            ...viewTabStyle,
            ...(activeView === "month" ? activeViewTabStyle : {}),
          }}
        >
          Mês
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
  gap: "0.75rem",
  flexWrap: "wrap" as const,
  paddingTop: "0.25rem",
} satisfies React.CSSProperties;

const navGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const navButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  minWidth: "44px",
  minHeight: "44px",
  borderRadius: "50%",
  background: "none",
  border: "1px solid transparent",
  color: "var(--color-text-2)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "1rem",
  lineHeight: 1,
  transition: "background 100ms ease, border-color 100ms ease",
} satisfies React.CSSProperties;

const periodLabelStyle = {
  fontWeight: 600,
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-1)",
  minWidth: "9rem",
  textAlign: "center" as const,
} satisfies React.CSSProperties;

const todayButtonStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "var(--radius-md)",
  background: "transparent",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-2)",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "var(--font-size-sm)",
} satisfies React.CSSProperties;

const viewSwitcherStyle = {
  display: "flex",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const viewTabStyle = {
  padding: "0.4rem 0.9rem",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-3)",
  transition: "background 100ms, color 100ms",
} satisfies React.CSSProperties;

const activeViewTabStyle = {
  background: "var(--color-accent)",
  color: "var(--color-surface-0)",
} satisfies React.CSSProperties;
