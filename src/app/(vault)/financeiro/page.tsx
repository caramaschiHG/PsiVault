/**
 * /financeiro — Monthly financial summary for all patients.
 *
 * Server component page. Reads month/year from searchParams, defaults to
 * current month. Loads charges from the finance repository (aggregated across
 * all patients via patient list), computes monthly totals, and renders the
 * charge list with patient name resolution.
 *
 * Month navigation uses plain <a href> links — no client component needed.
 */

import { getFinanceRepository } from "../../../lib/finance/store";
import { getPatientRepository } from "../../../lib/patients/store";
import { deriveMonthlyFinancialSummary } from "../../../lib/finance/model";
import type { SessionCharge } from "../../../lib/finance/model";

const DEFAULT_WORKSPACE_ID = "ws_1";

const ptBRDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const CHARGE_STATUS_LABELS: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

const CHARGE_STATUS_COLORS: Record<string, { background: string; color: string }> = {
  pago: { background: "rgba(34, 197, 94, 0.1)", color: "#166534" },
  pendente: { background: "rgba(245, 158, 11, 0.1)", color: "#92400e" },
  atrasado: { background: "rgba(239, 68, 68, 0.1)", color: "#991b1b" },
};

function prevMonthHref(year: number, month: number): string {
  let y = year;
  let m = month - 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return `/financeiro?month=${m}&year=${y}`;
}

function nextMonthHref(year: number, month: number): string {
  let y = year;
  let m = month + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `/financeiro?month=${m}&year=${y}`;
}

interface FinanceiroPageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const params = await searchParams;
  const now = new Date();

  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const financeRepo = getFinanceRepository();
  const patientRepo = getPatientRepository();

  const [activePatients, archivedPatients] = await Promise.all([
    patientRepo.listActive(DEFAULT_WORKSPACE_ID),
    patientRepo.listArchived(DEFAULT_WORKSPACE_ID),
  ]);
  const allPatients = [...activePatients, ...archivedPatients];

  const patientNameMap = new Map<string, string>(
    allPatients.map((p) => [p.id, p.socialName ?? p.fullName]),
  );

  const chargesResults = await Promise.all(
    allPatients.map((p) => financeRepo.listByMonth(DEFAULT_WORKSPACE_ID, p.id, year, month)),
  );
  const allCharges: SessionCharge[] = chargesResults.flat();

  allCharges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const summary = deriveMonthlyFinancialSummary(allCharges);
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  return (
    <main style={shellStyle}>
      {/* Page heading */}
      <div style={headingBlockStyle}>
        <p style={eyebrowStyle}>Resumo financeiro</p>
        <h1 style={titleStyle}>Financeiro</h1>
      </div>

      {/* Month navigation bar */}
      <div style={monthNavStyle}>
        <a href={prevMonthHref(year, month)} className="btn-ghost" style={navArrowStyle}>
          ← Anterior
        </a>
        <span style={monthLabelStyle}>{monthLabel}</span>
        <a href={nextMonthHref(year, month)} className="btn-ghost" style={navArrowStyle}>
          Próximo →
        </a>
      </div>

      {/* Summary cards */}
      <div style={summaryCardsStyle}>
        <div style={summaryCardStyle}>
          <p style={cardLabelStyle}>Sessões</p>
          <p style={cardValueStyle}>{summary.totalSessions}</p>
        </div>
        <div style={summaryCardStyle}>
          <p style={cardLabelStyle}>Recebido</p>
          <p style={{ ...cardValueStyle, color: "#166534" }}>
            {currency.format(summary.totalReceivedCents / 100)}
          </p>
        </div>
        <div style={summaryCardStyle}>
          <p style={cardLabelStyle}>Pendente / Atrasado</p>
          <p style={{ ...cardValueStyle, color: "#92400e" }}>
            {currency.format(summary.totalPendingCents / 100)}
          </p>
        </div>
      </div>

      {/* Charge list */}
      {allCharges.length === 0 ? (
        <p style={emptyStateStyle}>Nenhuma sessão concluída neste mês.</p>
      ) : (
        <div style={listStyle}>
          {allCharges.map((charge) => {
            const patientName = patientNameMap.get(charge.patientId) ?? charge.patientId;
            const statusColors =
              CHARGE_STATUS_COLORS[charge.status] ?? CHARGE_STATUS_COLORS.pendente;
            const amountLabel =
              charge.amountInCents !== null
                ? currency.format(charge.amountInCents / 100)
                : "Sem valor definido";

            return (
              <div key={charge.id} style={rowStyle}>
                <div style={rowInfoStyle}>
                  <span style={patientNameStyle}>{patientName}</span>
                  <span style={dateLabelStyle}>{ptBRDate.format(charge.createdAt)}</span>
                </div>
                <div style={rowRightStyle}>
                  <span
                    style={{
                      ...statusBadgeStyle,
                      background: statusColors.background,
                      color: statusColors.color,
                    }}
                  >
                    {CHARGE_STATUS_LABELS[charge.status] ?? charge.status}
                  </span>
                  <span style={amountLabelStyle}>{amountLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// --- Style objects ---

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const headingBlockStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 700,
  fontFamily: "'IBM Plex Serif', serif",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const monthNavStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const navArrowStyle = {
  fontSize: "0.875rem",
  padding: "0.375rem 0.75rem",
} satisfies React.CSSProperties;

const monthLabelStyle = {
  flex: 1,
  textAlign: "center" as const,
  fontWeight: 600,
  fontSize: "1rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const summaryCardsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const summaryCardStyle = {
  padding: "1.25rem 1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const cardLabelStyle = {
  margin: 0,
  fontSize: "0.72rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-text-4)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const cardValueStyle = {
  margin: 0,
  fontSize: "1.625rem",
  fontWeight: 700,
  color: "var(--color-text-1)",
  fontFamily: "'IBM Plex Serif', serif",
  lineHeight: 1,
} satisfies React.CSSProperties;

const emptyStateStyle = {
  margin: 0,
  color: "var(--color-text-3)",
  fontSize: "0.9rem",
  padding: "0.5rem 0",
} satisfies React.CSSProperties;

const listStyle = {
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.875rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const rowInfoStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.2rem",
} satisfies React.CSSProperties;

const patientNameStyle = {
  fontWeight: 500,
  fontSize: "0.9rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const dateLabelStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const rowRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const statusBadgeStyle = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: 600,
  padding: "0.2rem 0.625rem",
  borderRadius: "var(--radius-pill)",
} satisfies React.CSSProperties;

const amountLabelStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-2)",
  fontWeight: 600,
} satisfies React.CSSProperties;
