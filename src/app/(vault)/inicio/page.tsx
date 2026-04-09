/**
 * /inicio — the professional's morning orientation screen.
 *
 * Refatorado com componentes UI unificados (Phase 3 — UI/UX Polish).
 * Usa: PageHeader, Section, Card, StatCard, List, ListItem, Badge, Separator.
 */

import { getAppointmentRepository } from "../../../lib/appointments/store";
import { getPatientRepository } from "../../../lib/patients/store";
import { getReminderRepository } from "../../../lib/reminders/store";
import { getFinanceRepository } from "../../../lib/finance/store";
import {
  filterTodayAppointments,
  countPendingCharges,
  deriveMonthlySnapshot,
} from "../../../lib/dashboard/aggregation";
import { autoMarkOverdue } from "../../../lib/finance/model";
import { RemindersSection } from "./components/reminders-section";
import { QuickActionFab } from "./components/quick-action-fab";
import { observeServerStage } from "../../../lib/observability/server-render";
import { resolveSession } from "../../../lib/supabase/session";
import { UpdateNotification } from "../../components/update-notification";
import { db } from "../../../lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { List, ListItem, ListEmpty } from "@/components/ui/list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function InicioPage() {
  const route = "vault.inicio";
  const { workspaceId } = await observeServerStage(route, "resolveSession", () => resolveSession());
  const now = new Date();

  // UTC today boundaries
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

  // ─── Load from repositories ─────────────────────────────────────────────────
  const appointmentRepo = getAppointmentRepository();
  const patientRepo = getPatientRepository();
  const reminderRepo = getReminderRepository();
  const financeRepo = getFinanceRepository();

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const monthFrom = new Date(Date.UTC(year, month - 1, 1));
  const monthTo = new Date(Date.UTC(year, month, 1));

  const [
    rawAppointments,
    [activePatients, archivedPatients],
    [activeReminders, monthlyCharges],
    monthlyAppointments,
  ] = await observeServerStage(
    route,
    "loadAll",
    () =>
      Promise.all([
        appointmentRepo.listByDateRange(workspaceId, from, to),
        Promise.all([
          patientRepo.listActive(workspaceId),
          patientRepo.listArchived(workspaceId),
        ]),
        Promise.all([
          reminderRepo.listActive(workspaceId),
          financeRepo.listByWorkspaceAndMonth(workspaceId, year, month),
        ]),
        appointmentRepo.listByDateRange(workspaceId, monthFrom, monthTo),
      ]),
    { workspaceId, year, month },
  );

  const todayAppointments = filterTodayAppointments(rawAppointments, from);
  const allPatients = [...activePatients, ...archivedPatients];

  // Build patient name map
  const patientMap = new Map<string, string>();
  for (const p of allPatients) {
    patientMap.set(p.id, p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName);
  }

  const pendingChargeCount = countPendingCharges(monthlyCharges);
  const snapshot = deriveMonthlySnapshot({
    activePatients,
    monthlyCharges,
    monthlyAppointments,
  });

  // Recent pending/overdue charges
  const pendingOverdueCharges = monthlyCharges.filter(
    (c) => c.status === "pendente" || c.status === "atrasado",
  );

  const pendingApptIds = pendingOverdueCharges
    .filter((c) => c.appointmentId)
    .map((c) => c.appointmentId as string);
  let pendingApptMap = new Map<string, Date>();
  if (pendingApptIds.length > 0) {
    const appts = await db.appointment.findMany({
      where: { id: { in: pendingApptIds } },
      select: { id: true, startsAt: true },
    });
    pendingApptMap = new Map(appts.map((a) => [a.id, a.startsAt]));
  }
  const enrichedPendingOverdue = autoMarkOverdue(pendingOverdueCharges, pendingApptMap, now)
    .filter((c) => c.status === "pendente" || c.status === "atrasado")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const patientNameMap = new Map<string, string>(
    allPatients.map((p) => [p.id, p.socialName ?? p.fullName]),
  );

  const currencyFmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const statusLabel = (s: string) => (s === "atrasado" ? "Atrasado" : "Pendente");

  // Contextual header message
  const nextAppt = todayAppointments
    .filter((a) => ["SCHEDULED", "CONFIRMED"].includes(a.status))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const minutesUntilNext = nextAppt
    ? Math.floor((new Date(nextAppt.startsAt).getTime() - now.getTime()) / 60000)
    : null;

  const contextualMessage =
    minutesUntilNext !== null && minutesUntilNext > 0 && minutesUntilNext <= 60
      ? `Seu próximo atendimento começa em ${minutesUntilNext} min`
      : `${todayAppointments.length > 0 ? `${todayAppointments.length} atendimentos` : "Nenhum atendimento"} agendados para hoje`;

  // Format helpers
  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const careModeLabel = (mode: string) =>
    mode === "ONLINE" ? "Online" : "Presencial";

  return (
    <main style={shellStyle}>
      {/* Page heading */}
      <PageHeader
        title="Início"
        description={contextualMessage}
      />

      {/* ─── Section 1: Hoje ─────────────────────────────────────────────── */}
      <Section
        title="Hoje"
        action={
          <a href="/agenda" className="link-subtle" style={{ fontSize: "var(--font-size-sm)" }}>
            Ver agenda completa →
          </a>
        }
      >
        {todayAppointments.length === 0 ? (
          <ListEmpty
            title="Sem atendimentos hoje."
            actionLabel="Agendar consulta"
            actionHref="/appointments/new"
          />
        ) : (
          <List variant="separated">
            {todayAppointments.map((appt) => (
              <ListItem key={appt.id} divider={false}>
                <Card variant="interactive" padding="sm" style={sessionCardInnerStyle}>
                  <span style={sessionTimeStyle}>
                    {timeFormatter.format(appt.startsAt)}
                  </span>
                  <span style={sessionPatientStyle}>
                    {patientMap.get(appt.patientId) ?? "Paciente"}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {careModeLabel(appt.careMode)}
                  </Badge>
                </Card>
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* ─── Section 2: Lembretes ativos ─────────────────────────────────── */}
      <Section title="Lembretes ativos">
        <RemindersSection
          reminders={activeReminders.map((r) => ({
            id: r.id,
            title: r.title,
            dueAt: r.dueAt ? r.dueAt.toISOString() : null,
          }))}
          workspaceId={workspaceId}
        />
      </Section>

      {/* ─── Section 3: Resumo do mês ─────────────────────────────────────── */}
      <Section title="Resumo do mês">
        <div style={snapshotGridStyle}>
          <StatCard
            label="Pacientes ativos"
            value={snapshot.activePatientCount}
          />
          <StatCard
            label="Atendimentos realizados"
            value={snapshot.completedSessionCount}
          />
          <StatCard
            label="A receber"
            value={pendingChargeCount}
            accent
            href="/financeiro"
          />
        </div>
      </Section>

      {/* ─── Section 4: Cobranças pendentes ─────────────────────────────── */}
      {enrichedPendingOverdue.length > 0 && (
        <Section
          title="A receber"
          action={
            <a href="/financeiro" className="link-subtle" style={{ fontSize: "var(--font-size-sm)" }}>
              Ver financeiro →
            </a>
          }
        >
          <List variant="separated">
            {enrichedPendingOverdue.map((charge, idx) => (
              <ListItem key={charge.id} divider={idx < enrichedPendingOverdue.length - 1}>
                <div style={chargeItemStyle}>
                  <Badge
                    variant={charge.status === "atrasado" ? "danger" : "warning"}
                    size="sm"
                    dot
                  >
                    {statusLabel(charge.status)}
                  </Badge>
                  <span style={chargePatientStyle}>
                    {patientNameMap.get(charge.patientId) ?? "Paciente"}
                  </span>
                  <span style={chargeAmountStyle}>
                    {charge.amountInCents !== null
                      ? currencyFmt.format(charge.amountInCents / 100)
                      : "—"}
                  </span>
                </div>
              </ListItem>
            ))}
          </List>
        </Section>
      )}

      <QuickActionFab />
      <UpdateNotification />
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  padding: "var(--space-page-padding-y) var(--space-page-padding-x)",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "var(--space-6)",
  alignContent: "start",
};

const sessionCardInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  gridTemplateColumns: "unset",
};

const sessionTimeStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body)",
  fontWeight: 700,
  color: "var(--color-accent)",
  minWidth: "3.5rem",
  fontVariantNumeric: "tabular-nums",
};

const sessionPatientStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 500,
  color: "var(--color-text-1)",
  flex: 1,
};

const snapshotGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "var(--space-3)",
};

// Pending charges
const chargeItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  flexWrap: "wrap",
};

const chargePatientStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 500,
  color: "var(--color-text-1)",
  flex: 1,
};

const chargeAmountStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 600,
  color: "var(--color-text-2)",
  fontVariantNumeric: "tabular-nums",
};
