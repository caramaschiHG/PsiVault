/**
 * /financeiro — Server component. Loads data, computes overdue status, delegates to client.
 */

import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
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

  const [activePatients, archivedPatients, charges] = await Promise.all([
    patientRepo.listActive(workspaceId),
    patientRepo.listArchived(workspaceId),
    financeRepo.listByWorkspaceAndMonth(workspaceId, year, month),
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
  const overdueCount = enrichedCharges.filter((c) => c.status === "atrasado").length;
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

  const trendData: { monthLabel: string; totalReceived: number }[] = [];
  for (const tm of trendMonths) {
    const monthCharges = await financeRepo.listByWorkspaceAndMonth(workspaceId, tm.year, tm.month);
    // Also auto-mark overdue for trend months
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

    const totalReceived = tmEnriched
      .filter((c) => c.status === "pago" && c.amountInCents !== null)
      .reduce((sum, c) => sum + (c.amountInCents ?? 0), 0);
    trendData.push({
      monthLabel: monthAbbr(tm.month),
      totalReceived: totalReceived / 100,
    });
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
    />
  );
}
