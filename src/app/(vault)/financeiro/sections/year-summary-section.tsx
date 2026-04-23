import type { SessionCharge } from "@/lib/finance/model";
import { autoMarkOverdue, deriveMonthlyFinancialSummary } from "@/lib/finance/model";
import { ExportIrButton } from "./export-ir-button";

interface YearSummarySectionProps {
  chargesByMonth: Map<string, SessionCharge[]>;
  yearMonths: { year: number; month: number }[];
  apptMap: Map<string, Date>;
  year: number;
  month: number;
  now: Date;
}

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const insightSectionStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.75rem",
};

const insightContentStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const yearTableStyle: React.CSSProperties = {
  display: "grid",
  gap: 0,
};

const yearTableHeaderStyle: React.CSSProperties = {
  display: "flex",
  padding: "0.5rem 0.75rem",
  borderBottom: "2px solid var(--color-border)",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
};

const yearTableColStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "right",
  fontSize: "0.82rem",
  fontVariantNumeric: "tabular-nums",
};

const yearTableRowStyle: React.CSSProperties = {
  display: "flex",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
  alignItems: "center",
};

const yearTableCurrentMonthStyle: React.CSSProperties = {
  background: "rgba(45, 125, 111, 0.05)",
  borderRadius: "var(--radius-sm)",
};

const yearTableTotalStyle: React.CSSProperties = {
  display: "flex",
  padding: "0.75rem",
  borderTop: "2px solid var(--color-border)",
  marginTop: "0.25rem",
  alignItems: "center",
};

export default async function YearSummarySection({ chargesByMonth, yearMonths, apptMap, year, month, now }: YearSummarySectionProps) {
  const yearBreakdowns = yearMonths.map((ym) => computeBreakdown(ym.year, ym.month, chargesByMonth, apptMap, now));
  const yearSummary = yearMonths.map((ym, i) => {
    const { enriched, summary: ymSummary } = yearBreakdowns[i];
    const ymOverdue = enriched
      .filter((c) => c.status === "atrasado")
      .reduce((s, c) => s + (c.amountInCents ?? 0), 0);
    return {
      month: ym.month,
      monthLabel: MONTH_LABELS[ym.month - 1],
      received: ymSummary.totalReceivedCents / 100,
      pending: ymSummary.totalPendingCents / 100,
      overdue: ymOverdue / 100,
      sessions: ymSummary.totalSessions,
    };
  });

  return (
    <div className="vault-page-transition" style={insightSectionStyle}>
      <div style={insightContentStyle}>
        <div style={yearTableStyle}>
          <div style={yearTableHeaderStyle}>
            <span style={{ flex: 2 }}>Mês</span>
            <span style={yearTableColStyle}>Recebido</span>
            <span style={yearTableColStyle}>Pendente</span>
            <span style={yearTableColStyle}>Atrasado</span>
            <span style={yearTableColStyle}>Sessões</span>
          </div>
          {yearSummary.map((m) => (
            <div
              key={m.month}
              style={{
                ...yearTableRowStyle,
                ...(m.month === month ? yearTableCurrentMonthStyle : {}),
              }}
            >
              <span style={{ flex: 2, fontWeight: m.month === month ? 700 : 400 }}>
                {m.monthLabel}
              </span>
              <span style={{ ...yearTableColStyle, color: "var(--color-success-text)" }}>
                {m.received > 0 ? currency.format(m.received) : "—"}
              </span>
              <span style={{ ...yearTableColStyle, color: "var(--color-warning-text)" }}>
                {m.pending > 0 ? currency.format(m.pending) : "—"}
              </span>
              <span style={{ ...yearTableColStyle, color: "var(--color-error-text)" }}>
                {m.overdue > 0 ? currency.format(m.overdue) : "—"}
              </span>
              <span style={yearTableColStyle}>{m.sessions || "—"}</span>
            </div>
          ))}
          <div style={yearTableTotalStyle}>
            <span style={{ flex: 2, fontWeight: 700 }}>Total</span>
            <span style={{ ...yearTableColStyle, fontWeight: 700, color: "var(--color-success-text)" }}>
              {currency.format(yearSummary.reduce((s, m) => s + m.received, 0))}
            </span>
            <span style={{ ...yearTableColStyle, fontWeight: 700, color: "var(--color-warning-text)" }}>
              {currency.format(yearSummary.reduce((s, m) => s + m.pending, 0))}
            </span>
            <span style={{ ...yearTableColStyle, fontWeight: 700, color: "var(--color-error-text)" }}>
              {currency.format(yearSummary.reduce((s, m) => s + m.overdue, 0))}
            </span>
            <span style={{ ...yearTableColStyle, fontWeight: 700 }}>
              {yearSummary.reduce((s, m) => s + (m.sessions || 0), 0)}
            </span>
          </div>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <ExportIrButton yearSummary={yearSummary} year={year} />
        </div>
      </div>
    </div>
  );
}
