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
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const { workspaceId } = await resolveSession();
  const params = await searchParams;
  const now = new Date();

  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const financeRepo = getFinanceRepository();
  const patientRepo = getPatientRepository();

  const { accountId } = await resolveSession();
  const [activePatients, archivedPatients, charges, profile] = await Promise.all([
    patientRepo.listActive(workspaceId),
    patientRepo.listArchived(workspaceId),
    financeRepo.listByWorkspaceAndMonth(workspaceId, year, month),
    getPracticeProfileSnapshot(accountId, workspaceId),
  ]);

  const allPatients = [...activePatients, ...archivedPatients];

  // Build appointment date map for overdue detection
  const appointmentIds = charges
    .filter((c) => c.appointmentId)
    .map((c) => c.appointmentId as string);

  let appointmentDateMap = new Map<string, Date>();
  if (appointmentIds.length > 0) {
    const appointments = await db.appointment.findMany({
      where: { id: { in: appointmentIds } },
      select: { id: true, startsAt: true },
    });
    appointmentDateMap = new Map(appointments.map((a) => [a.id, a.startsAt]));
  }

  // Auto-mark overdue based on appointment dates
  const enrichedCharges = autoMarkOverdue(charges, appointmentDateMap, now);

  const summary = deriveMonthlyFinancialSummary(enrichedCharges);
  const overdueCount = enrichedCharges.filter((c: { status: string }) => c.status === "atrasado").length;
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  // Trend data (last 6 months)
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

  const trendData: { monthLabel: string; totalReceived: number; totalPending: number; totalSessions: number }[] = [];
  for (const tm of trendMonths) {
    const monthCharges = await financeRepo.listByWorkspaceAndMonth(workspaceId, tm.year, tm.month);
    const tmAppointmentIds = monthCharges
      .filter((c) => c.appointmentId)
      .map((c) => c.appointmentId as string);
    let tmApptMap = new Map<string, Date>();
    if (tmAppointmentIds.length > 0) {
      const tmAppts = await db.appointment.findMany({
        where: { id: { in: tmAppointmentIds } },
        select: { id: true, startsAt: true },
      });
      tmApptMap = new Map(tmAppts.map((a) => [a.id, a.startsAt]));
    }
    const tmEnriched = autoMarkOverdue(monthCharges, tmApptMap, now);
    const tmSummary = deriveMonthlyFinancialSummary(tmEnriched);

    trendData.push({
      monthLabel: monthAbbr(tm.month),
      totalReceived: tmSummary.totalReceivedCents / 100,
      totalPending: tmSummary.totalPendingCents / 100,
      totalSessions: tmSummary.totalSessions,
    });
  }

  // Previous month data for comparison
  const prevCharges = await financeRepo.listByWorkspaceAndMonth(workspaceId, prevYear, prevMonth);
  const prevApptIds = prevCharges.filter((c) => c.appointmentId).map((c) => c.appointmentId as string);
  let prevApptMap = new Map<string, Date>();
  if (prevApptIds.length > 0) {
    const prevAppts = await db.appointment.findMany({
      where: { id: { in: prevApptIds } },
      select: { id: true, startsAt: true },
    });
    prevApptMap = new Map(prevAppts.map((a) => [a.id, a.startsAt]));
  }
  const prevEnriched = autoMarkOverdue(prevCharges, prevApptMap, now);
  const prevSummary = deriveMonthlyFinancialSummary(prevEnriched);

  // Year summary
  const yearSummary: { month: number; monthLabel: string; received: number; pending: number; overdue: number; sessions: number }[] = [];
  for (const ym of yearMonths) {
    const ymCharges = await financeRepo.listByWorkspaceAndMonth(workspaceId, ym.year, ym.month);
    const ymApptIds = ymCharges.filter((c) => c.appointmentId).map((c) => c.appointmentId as string);
    let ymApptMap = new Map<string, Date>();
    if (ymApptIds.length > 0) {
      const ymAppts = await db.appointment.findMany({
        where: { id: { in: ymApptIds } },
        select: { id: true, startsAt: true },
      });
      ymApptMap = new Map(ymAppts.map((a) => [a.id, a.startsAt]));
    }
    const ymEnriched = autoMarkOverdue(ymCharges, ymApptMap, now);
    const ymSummary = deriveMonthlyFinancialSummary(ymEnriched);
    const ymOverdue = ymEnriched.filter((c) => c.status === "atrasado").reduce((s, c) => s + (c.amountInCents ?? 0), 0);

    yearSummary.push({
      month: ym.month,
      monthLabel: MONTH_LABELS[ym.month - 1],
      received: ymSummary.totalReceivedCents / 100,
      pending: ymSummary.totalPendingCents / 100,
      overdue: ymOverdue / 100,
      sessions: ymSummary.totalSessions,
    });
  }

  // Top patients by revenue this month
  const patientRevenue = new Map<string, { received: number; sessions: number; name: string }>();
  for (const charge of enrichedCharges) {
    if (!patientRevenue.has(charge.patientId)) {
      const patient = allPatients.find((p) => p.id === charge.patientId);
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

  // Revenue forecast: scheduled appointments for rest of month
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const restOfMonth = await db.appointment.findMany({
    where: {
      workspaceId,
      startsAt: { gte: now, lte: monthEnd },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
    },
    select: { id: true, patientId: true, priceInCents: true },
  });

  let forecastCents = 0;
  for (const appt of restOfMonth) {
    if (appt.priceInCents) {
      forecastCents += appt.priceInCents;
    } else {
      const patient = allPatients.find((p) => p.id === appt.patientId);
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
    />
  );
}
