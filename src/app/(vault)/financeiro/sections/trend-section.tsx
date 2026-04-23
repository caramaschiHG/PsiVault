import type { SessionCharge } from "@/lib/finance/model";
import { autoMarkOverdue, deriveMonthlyFinancialSummary } from "@/lib/finance/model";
import type { Patient } from "../domain-types";

interface TrendSectionProps {
  chargesByMonth: Map<string, SessionCharge[]>;
  trendMonths: { year: number; month: number }[];
  apptMap: Map<string, Date>;
  now: Date;
}

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function monthAbbr(month: number): string {
  return MONTH_LABELS[month - 1].slice(0, 3);
}

function computeBreakdown(
  year: number,
  month: number,
  chargesByMonth: Map<string, SessionCharge[]>,
  apptMap: Map<string, Date>,
  now: Date,
) {
  const charges = chargesByMonth.get(`${year}-${month}`) ?? [];
  const enriched = autoMarkOverdue(charges, apptMap, now);
  return { enriched, summary: deriveMonthlyFinancialSummary(enriched) };
}

const trendCardStyle: React.CSSProperties = {
  padding: "1.25rem 1.5rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "1rem",
};

const trendHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const trendLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#888",
  fontWeight: 600,
};

const trendTotalStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "#222",
  lineHeight: 1,
};

const chartContainerStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  gap: "0.75rem",
  height: "120px",
};

const barWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.375rem",
  height: "100%",
  justifyContent: "flex-end",
};

const barStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "60px",
  background: "var(--color-accent)",
  borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
  minHeight: "4px",
};

const barLabelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#888",
  fontWeight: 500,
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function TrendSection({ chargesByMonth, trendMonths, apptMap, now }: TrendSectionProps) {
  const trendBreakdowns = trendMonths.map((tm) => computeBreakdown(tm.year, tm.month, chargesByMonth, apptMap, now));
  const trendData = trendMonths.map((tm, i) => ({
    monthLabel: monthAbbr(tm.month),
    totalReceived: trendBreakdowns[i].summary.totalReceivedCents / 100,
    totalPending: trendBreakdowns[i].summary.totalPendingCents / 100,
    totalSessions: trendBreakdowns[i].summary.totalSessions,
  }));

  const maxTrend = Math.max(...trendData.map((t) => t.totalReceived), 1);
  const trendTotal = trendData.reduce((s, t) => s + t.totalReceived, 0);

  return (
    <div className="vault-page-transition" style={trendCardStyle}>
      <div style={trendHeaderStyle}>
        <p style={trendLabelStyle}>Receita mensal</p>
        <span style={trendTotalStyle}>{currency.format(trendTotal)}</span>
      </div>
      <div style={chartContainerStyle}>
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            style={{ position: "absolute", left: 0, right: 0, bottom: `${pct}%`, borderTop: "1px solid var(--color-border, #e5e5e5)", opacity: 0.4 }}
          />
        ))}
        {trendData.map((t) => (
          <div key={t.monthLabel} style={barWrapperStyle}>
            <div
              style={{
                ...barStyle,
                height: `${(t.totalReceived / maxTrend) * 100}%`,
              }}
              title={`${t.monthLabel}: ${currency.format(t.totalReceived)}`}
            />
            <span style={barLabelStyle}>{t.monthLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
