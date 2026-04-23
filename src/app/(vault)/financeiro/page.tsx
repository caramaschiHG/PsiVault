/**
 * /financeiro — Server component. Loads data, computes overdue status, renders shell + async sections.
 */

import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
import { getPracticeProfileSnapshot } from "@/lib/setup/profile";
import { deriveMonthlyFinancialSummary, autoMarkOverdue } from "@/lib/finance/model";
import type { SessionCharge } from "@/lib/finance/model";
import { resolveSession } from "@/lib/supabase/session";
import FinanceiroPageClient from "./page-client";
import { db } from "@/lib/db";
import { AsyncBoundary } from "@/components/streaming/async-boundary";
import { ExpensesAsyncSection } from "./components/expenses-async-section";
import { ChartSkeleton } from "@/components/streaming/chart-skeleton";
import { SectionSkeleton } from "@/components/streaming/section-skeleton";
import TrendSection from "./sections/trend-section";
import TopPatientsSection from "./sections/top-patients-section";
import YearSummarySection from "./sections/year-summary-section";

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function prevMonthHref(year: number, month: number): string {
  let y = year;
  let m = month - 1;
  if (m < 1) { m = 12; y -= 1; }
  return `/financeiro?month=${m}&year=${y}`;
}

function nextMonthHref(year: number, month: number): string {
  let y = year;
  let m = month + 1;
  if (m > 12) { m = 1; y += 1; }
  return `/financeiro?month=${m}&year=${y}`;
}

function groupChargesByMonth(charges: SessionCharge[]): Map<string, SessionCharge[]> {
  const map = new Map<string, SessionCharge[]>();
  for (const c of charges) {
    const key = `${c.createdAt.getUTCFullYear()}-${c.createdAt.getUTCMonth() + 1}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return map;
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

interface FinanceiroPageProps {
  searchParams: Promise<{ month?: string; year?: string; drawer?: string }>;
}

const shellStyle: React.CSSProperties = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
};

const headingBlockStyle: React.CSSProperties = { display: "grid", gap: "0.25rem" };

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
};

const monthNavStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
};

const navArrowStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  padding: "0.375rem 0.75rem",
  color: "var(--color-text-2)",
  textDecoration: "none",
};

const monthLabelStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "center",
  fontWeight: 600,
  fontSize: "1rem",
};

const summaryCardsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "0.75rem",
};

const miniCardStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
};

const miniCardLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#666",
  fontWeight: 600,
};

const miniCardValueStyle: React.CSSProperties = {
  margin: "0.25rem 0 0",
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "var(--color-text-1)",
};

const variationStyle: React.CSSProperties = {
  margin: "0.375rem 0 0",
  fontSize: "0.75rem",
  fontWeight: 500,
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { workspaceId, accountId } = await resolveSession();
  const params = await searchParams;
  const now = new Date();

  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const patientRepo = getPatientRepository();
  const financeRepo = getFinanceRepository();

  // Trend data (last 6 months, oldest → newest)
  const trendMonths: { year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let y = year;
    let m = month - i;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    trendMonths.push({ year: y, month: m });
  }

  // Annual data (12 months for year summary)
  const yearMonths: { year: number; month: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    yearMonths.push({ year, month: m });
  }

  // Previous month for comparison
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }

  // Compute date range covering all months needed
  const allMonthsList = [...trendMonths, ...yearMonths, { year: prevYear, month: prevMonth }];
  let minYear = allMonthsList[0].year, minMonth = allMonthsList[0].month;
  let maxYear = allMonthsList[0].year, maxMonth = allMonthsList[0].month;
  for (const m of allMonthsList) {
    if (m.year < minYear || (m.year === minYear && m.month < minMonth)) {
      minYear = m.year; minMonth = m.month;
    }
    if (m.year > maxYear || (m.year === maxYear && m.month > maxMonth)) {
      maxYear = m.year; maxMonth = m.month;
    }
  }
  const rangeStart = new Date(Date.UTC(minYear, minMonth - 1, 1));
  const rangeEnd = new Date(Date.UTC(maxYear, maxMonth, 1));

  // Revenue forecast range
  const monthEnd = new Date(Date.UTC(year, month, 1));

  const [
    activePatients,
    archivedPatients,
    profile,
    allChargesInRange,
    restOfMonth,
  ] = await Promise.all([
    patientRepo.listActive(workspaceId),
    patientRepo.listArchived(workspaceId),
    getPracticeProfileSnapshot(accountId, workspaceId),
    financeRepo.listByWorkspaceAndDateRange(workspaceId, rangeStart, rangeEnd),
    db.appointment.findMany({
      where: {
        workspaceId,
        startsAt: { gte: now, lt: monthEnd },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      select: { id: true, patientId: true, priceInCents: true },
    }),
  ]);

  // One appointment query for all apptIds across the full range
  const apptIds = [...new Set(
    allChargesInRange
      .filter((c) => c.appointmentId)
      .map((c) => c.appointmentId as string)
  )];
  const appts = apptIds.length
    ? await db.appointment.findMany({
        where: { id: { in: apptIds } },
        select: { id: true, startsAt: true },
      })
    : [];
  const apptMap = new Map(appts.map((a) => [a.id, a.startsAt]));

  // Compute all breakdowns in memory
  const chargesByMonth = groupChargesByMonth(allChargesInRange);
  const current = computeBreakdown(year, month, chargesByMonth, apptMap, now);
  const prev = computeBreakdown(prevYear, prevMonth, chargesByMonth, apptMap, now);

  const allPatients = [...activePatients, ...archivedPatients];
  const patientIndex = new Map(allPatients.map((p) => [p.id, p]));

  const enrichedCharges = current.enriched;
  const summary = current.summary;
  const overdueCount = enrichedCharges.filter((c) => c.status === "atrasado").length;
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  const prevMonthReceived = prev.summary.totalReceivedCents / 100;

  let forecastCents = 0;
  for (const appt of restOfMonth) {
    if (appt.priceInCents) {
      forecastCents += appt.priceInCents;
    } else {
      const patient = patientIndex.get(appt.patientId);
      const price = patient?.sessionPriceInCents ?? profile?.defaultSessionPriceInCents;
      if (price) forecastCents += price;
    }
  }

  return (
    <main style={shellStyle}>
      {/* Page heading */}
      <div style={headingBlockStyle}>
        <p style={eyebrowStyle}>Resumo financeiro</p>
        <h1 style={titleStyle}>Financeiro</h1>
      </div>

      {/* Month navigation */}
      <div style={monthNavStyle}>
        <a href={prevMonthHref(year, month)} style={navArrowStyle}>← Anterior</a>
        <span style={monthLabelStyle}>{monthLabel}</span>
        <a href={nextMonthHref(year, month)} style={navArrowStyle}>Próximo →</a>
      </div>

      {/* Summary cards */}
      <div style={summaryCardsStyle}>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid var(--color-success-text)" }}>
          <p style={miniCardLabelStyle}>Recebido</p>
          <p style={miniCardValueStyle}>{currency.format(summary.totalReceivedCents / 100)}</p>
          {prevMonthReceived > 0 && (
            <p style={variationStyle}>
              {summary.totalReceivedCents / 100 >= prevMonthReceived ? (
                <span style={{ color: "var(--color-success-text)" }}>↑ +{Math.round(((summary.totalReceivedCents / 100 - prevMonthReceived) / prevMonthReceived) * 100)}%</span>
              ) : (
                <span style={{ color: "var(--color-error-text)" }}>↓ -{Math.round(((prevMonthReceived - summary.totalReceivedCents / 100) / prevMonthReceived) * 100)}%</span>
              )}
              <span style={{ color: "#999", marginLeft: "0.25rem" }}>vs {MONTH_LABELS[month === 1 ? 11 : month - 2]}</span>
            </p>
          )}
        </div>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid var(--color-warning-text)" }}>
          <p style={miniCardLabelStyle}>Pendente</p>
          <p style={miniCardValueStyle}>{currency.format(summary.totalPendingCents / 100)}</p>
        </div>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid var(--color-error-text)" }}>
          <p style={miniCardLabelStyle}>Atrasado</p>
          <p style={{ ...miniCardValueStyle, color: "var(--color-error-text)" }}>
            {overdueCount} {overdueCount === 1 ? "cobrança" : "cobranças"}
          </p>
        </div>
        {forecastCents > 0 && (
          <div style={{ ...miniCardStyle, borderLeft: "3px solid #2563eb" }}>
            <p style={miniCardLabelStyle}>Previsão</p>
            <p style={miniCardValueStyle}>{currency.format(forecastCents / 100)}</p>
            <p style={{ ...variationStyle, color: "#999" }}>
              {restOfMonth.length} sess{restOfMonth.length === 1 ? "ão" : "ões"}
            </p>
          </div>
        )}
      </div>

      {/* Trend chart — streams in */}
      <AsyncBoundary fallback={<ChartSkeleton height={120} barCount={6} />}>
        <TrendSection
          chargesByMonth={chargesByMonth}
          trendMonths={trendMonths}
          apptMap={apptMap}
          now={now}
        />
      </AsyncBoundary>

      {/* Interactive charge list */}
      <FinanceiroPageClient
        initialCharges={enrichedCharges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
        patients={allPatients}
        summary={summary}
        overdueCount={overdueCount}
        year={year}
        month={month}
        monthLabel={monthLabel}
        prevHref={prevMonthHref(year, month)}
        nextHref={nextMonthHref(year, month)}
        drawerId={params.drawer || null}
        workspaceId={workspaceId}
        expensesPanel={<ExpensesAsyncSection workspaceId={workspaceId} />}
      />

      {/* Top patients — streams in */}
      <AsyncBoundary fallback={<SectionSkeleton />}>
        <TopPatientsSection enrichedCharges={enrichedCharges} patientIndex={patientIndex} />
      </AsyncBoundary>

      {/* Year summary — streams in */}
      <AsyncBoundary fallback={<SectionSkeleton />}>
        <YearSummarySection
          chargesByMonth={chargesByMonth}
          yearMonths={yearMonths}
          apptMap={apptMap}
          year={year}
          month={month}
          now={now}
        />
      </AsyncBoundary>
    </main>
  );
}
