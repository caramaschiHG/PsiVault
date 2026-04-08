/**
 * /financeiro — Server component. Loads data and delegates to FinanceiroPageClient.
 */

import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
import { deriveMonthlyFinancialSummary } from "@/lib/finance/model";
import { resolveSession } from "@/lib/supabase/session";
import FinanceiroPageClient from "./page-client";
import { EmptyState } from "../components/empty-state";

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

  const summary = deriveMonthlyFinancialSummary(charges);
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  // Load trend data (last 6 months)
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
    const totalReceived = monthCharges
      .filter((c) => c.status === "pago" && c.amountInCents !== null)
      .reduce((sum, c) => sum + (c.amountInCents ?? 0), 0);
    trendData.push({
      monthLabel: monthAbbr(tm.month),
      totalReceived: totalReceived / 100, // convert to BRL for display
    });
  }

  return (
    <FinanceiroPageClient
      initialCharges={charges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
      patients={allPatients}
      summary={summary}
      year={year}
      month={month}
      monthLabel={monthLabel}
      prevHref={prevMonthHref(year, month)}
      nextHref={nextMonthHref(year, month)}
      trends={trendData}
    />
  );
}
