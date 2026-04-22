/**
 * /financeiro — Server component. Loads data, computes overdue status, delegates to client.
 */

import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
import { getPracticeProfileSnapshot } from "@/lib/setup/profile";
import { deriveMonthlyFinancialSummary, autoMarkOverdue } from "@/lib/finance/model";
import { resolveSession } from "@/lib/supabase/session";
import FinanceiroPageClient from "./page-client";
import { db } from "@/lib/db";

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

function monthAbbr(month: number): string {
  return MONTH_LABELS[month - 1].slice(0, 3);
}

interface FinanceiroPageProps {
  searchParams: Promise<{ month?: string; year?: string; drawer?: string }>;
}

async function loadMonthBreakdown(
  workspaceId: string,
  year: number,
  month: number,
  now: Date,
) {
  const financeRepo = getFinanceRepository();
  const charges = await financeRepo.listByWorkspaceAndMonth(workspaceId, year, month);
  const apptIds = charges
    .filter((c) => c.appointmentId)
    .map((c) => c.appointmentId as string);
  const appts = apptIds.length
    ? await db.appointment.findMany({
        where: { id: { in: apptIds } },
        select: { id: true, startsAt: true },
      })
    : [];
  const apptMap = new Map(appts.map((a) => [a.id, a.startsAt]));
  const enriched = autoMarkOverdue(charges, apptMap, now);
  return { charges, enriched, summary: deriveMonthlyFinancialSummary(enriched) };
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { workspaceId, accountId } = await resolveSession();
  const params = await searchParams;
  const now = new Date();

  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const patientRepo = getPatientRepository();

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

  // Revenue forecast range — rest of current selected month
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  // Fan out every independent DB call in parallel.
  const [
    activePatients,
    archivedPatients,
    profile,
    current,
    prev,
    trendBreakdowns,
    yearBreakdowns,
    restOfMonth,
  ] = await Promise.all([
    patientRepo.listActive(workspaceId),
    patientRepo.listArchived(workspaceId),
    getPracticeProfileSnapshot(accountId, workspaceId),
    loadMonthBreakdown(workspaceId, year, month, now),
    loadMonthBreakdown(workspaceId, prevYear, prevMonth, now),
    Promise.all(trendMonths.map((tm) => loadMonthBreakdown(workspaceId, tm.year, tm.month, now))),
    Promise.all(yearMonths.map((ym) => loadMonthBreakdown(workspaceId, ym.year, ym.month, now))),
    db.appointment.findMany({
      where: {
        workspaceId,
        startsAt: { gte: now, lte: monthEnd },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      select: { id: true, patientId: true, priceInCents: true },
    }),
  ]);

  const allPatients = [...activePatients, ...archivedPatients];
  const patientIndex = new Map(allPatients.map((p) => [p.id, p]));

  const enrichedCharges = current.enriched;
  const summary = current.summary;
  const overdueCount = enrichedCharges.filter((c: { status: string }) => c.status === "atrasado").length;
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  const trendData = trendMonths.map((tm, i) => ({
    monthLabel: monthAbbr(tm.month),
    totalReceived: trendBreakdowns[i].summary.totalReceivedCents / 100,
    totalPending: trendBreakdowns[i].summary.totalPendingCents / 100,
    totalSessions: trendBreakdowns[i].summary.totalSessions,
  }));

  const prevSummary = prev.summary;

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

  // Top patients by revenue this month
  const patientRevenue = new Map<string, { received: number; sessions: number; name: string }>();
  for (const charge of enrichedCharges) {
    if (!patientRevenue.has(charge.patientId)) {
      const patient = patientIndex.get(charge.patientId);
      patientRevenue.set(charge.patientId, {
        received: 0,
        sessions: 0,
        name: patient?.socialName ?? patient?.fullName ?? charge.patientId,
      });
    }
    const entry = patientRevenue.get(charge.patientId)!;
    entry.sessions++;
    if (charge.status === "pago" && charge.amountInCents) entry.received += charge.amountInCents / 100;
  }
  const topPatients = Array.from(patientRevenue.entries())
    .map(([, data]) => data)
    .sort((a, b) => b.received - a.received)
    .slice(0, 5);

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
      trends={trendData}
      prevMonthReceived={prevSummary.totalReceivedCents / 100}
      yearSummary={yearSummary}
      topPatients={topPatients}
      forecast={forecastCents / 100}
      scheduledCount={restOfMonth.length}
      drawerId={params.drawer || null}
    />
  );
}
