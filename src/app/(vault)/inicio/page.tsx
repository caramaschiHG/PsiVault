/**
 * /inicio — the professional's morning orientation screen.
 *
 * Aggregates 4 domains at page load:
 * 1. Appointments — today's sessions via UTC day boundary filter
 * 2. Reminders    — all active workspace reminders
 * 3. Finance      — this month's charges (pending count badge only — SECU-05)
 * 4. Patients     — active + archived for monthly snapshot
 *
 * Security policy (SECU-05):
 * - NO payment amounts displayed on this surface.
 * - Finance section shows only a pending count badge linking to /financeiro.
 *
 * Layout:
 * - Section 1: "Hoje" — today's sessions with time, patient name, care mode
 * - Section 2: "Lembretes ativos" — active reminders + inline creation form
 * - Section 3: "Resumo do mês" — monthly snapshot numbers (count-only for finance)
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
import { RemindersSection } from "./components/reminders-section";
import { QuickActionFab } from "./components/quick-action-fab";
import { observeServerStage } from "../../../lib/observability/server-render";
import { resolveSession } from "../../../lib/supabase/session";

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

  // Today's appointments (load a window and filter)
  const rawAppointments = await observeServerStage(
    route,
    "loadTodayAppointments",
    () => appointmentRepo.listByDateRange(workspaceId, from, to),
    {
      workspaceId,
      from: from.toISOString(),
      to: to.toISOString(),
    },
  );
  const todayAppointments = filterTodayAppointments(rawAppointments, from);

  // All patients for snapshot and name resolution
  const [activePatients, archivedPatients] = await observeServerStage(
    route,
    "loadPatients",
    () =>
      Promise.all([
        patientRepo.listActive(workspaceId),
        patientRepo.listArchived(workspaceId),
      ]),
    { workspaceId },
  );
  const allPatients = [...activePatients, ...archivedPatients];

  // Build patient name map for session cards
  const patientMap = new Map<string, string>();
  for (const p of allPatients) {
    patientMap.set(p.id, p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName);
  }

  // Monthly charge aggregation (SECU-05: count only, never display amounts)
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  // Active reminders and monthly charges loaded concurrently
  const [activeReminders, monthlyCharges] = await observeServerStage(
    route,
    "loadRemindersAndCharges",
    () =>
      Promise.all([
        reminderRepo.listActive(workspaceId),
        financeRepo.listByWorkspaceAndMonth(workspaceId, year, month),
      ]),
    { workspaceId, year, month },
  );
  const pendingChargeCount = countPendingCharges(monthlyCharges);

  // Monthly snapshot for summary section
  const monthFrom = new Date(Date.UTC(year, month - 1, 1));
  const monthTo = new Date(Date.UTC(year, month, 1));
  const monthlyAppointments = await observeServerStage(
    route,
    "loadMonthlyAppointments",
    () => appointmentRepo.listByDateRange(workspaceId, monthFrom, monthTo),
    {
      workspaceId,
      monthFrom: monthFrom.toISOString(),
      monthTo: monthTo.toISOString(),
    },
  );
  const snapshot = deriveMonthlySnapshot({
    activePatients,
    monthlyCharges,
    monthlyAppointments,
  });

  // Contextual header message based on next upcoming appointment today
  const nextAppt = todayAppointments
    .filter((a) => ["SCHEDULED", "CONFIRMED"].includes(a.status))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const minutesUntilNext = nextAppt
    ? Math.floor((new Date(nextAppt.startsAt).getTime() - now.getTime()) / 60000)
    : null;

  const contextualMessage =
    minutesUntilNext !== null && minutesUntilNext > 0 && minutesUntilNext <= 60
      ? `Sua próxima sessão começa em ${minutesUntilNext} min`
      : "Sua rotina clínica está organizada";

  await observeServerStage(
    route,
    "renderPreparation",
    async () => undefined,
    {
      workspaceId,
      todayAppointmentCount: todayAppointments.length,
      activePatientCount: activePatients.length,
      archivedPatientCount: archivedPatients.length,
      reminderCount: activeReminders.length,
      monthlyChargeCount: monthlyCharges.length,
    },
  );

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
      <div style={headingRowStyle}>
        <div style={headingTextStyle}>
          <p style={eyebrowStyle}>Consultório</p>
          <h1 style={titleStyle}>Início</h1>
          <p style={contextualMessageStyle}>{contextualMessage}</p>
        </div>
      </div>

      {/* ─── Section 1: Hoje ─────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={sectionHeadingRowStyle}>
          <h2 style={sectionTitleStyle}>Hoje</h2>
          <a href="/agenda" className="link-subtle" style={sectionActionLinkStyle}>
            Ver agenda completa
          </a>
        </div>

        {todayAppointments.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyStateTextStyle}>Nenhuma sessão agendada para hoje.</p>
            <a href="/appointments/new" className="btn-secondary" style={emptyStateActionStyle}>
              Agendar consulta
            </a>
          </div>
        ) : (
          <ul style={cardListStyle}>
            {todayAppointments.map((appt) => (
              <li key={appt.id} className="card-hover" style={sessionCardStyle}>
                <span style={sessionTimeStyle}>
                  {timeFormatter.format(appt.startsAt)}
                </span>
                <span style={sessionPatientStyle}>
                  {patientMap.get(appt.patientId) ?? "Paciente"}
                </span>
                <span style={sessionCareModeStyle}>
                  {careModeLabel(appt.careMode)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ─── Section 2: Lembretes ativos ─────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={sectionHeadingRowStyle}>
          <h2 style={sectionTitleStyle}>Lembretes ativos</h2>
        </div>

        <RemindersSection
          reminders={activeReminders.map((r) => ({
            id: r.id,
            title: r.title,
            dueAt: r.dueAt ? r.dueAt.toISOString() : null,
          }))}
          workspaceId={workspaceId}
        />
      </section>

      {/* ─── Section 3: Resumo do mês ─────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={sectionHeadingRowStyle}>
          <h2 style={sectionTitleStyle}>Resumo do mês</h2>
        </div>

        <div style={snapshotGridStyle}>
          {/* Active patients */}
          <div style={snapshotCardStyle}>
            <span style={snapshotNumberStyle}>{snapshot.activePatientCount}</span>
            <span style={snapshotLabelStyle}>Pacientes ativos</span>
          </div>

          {/* Completed sessions this month */}
          <div style={snapshotCardStyle}>
            <span style={snapshotNumberStyle}>{snapshot.completedSessionCount}</span>
            <span style={snapshotLabelStyle}>Sessões realizadas</span>
          </div>

          {/* Pending charges — count badge only (SECU-05) */}
          <div style={snapshotCardStyle}>
            <a href="/financeiro" style={pendingBadgeLinkStyle}>
              <span style={pendingBadgeNumberStyle}>{pendingChargeCount}</span>
              <span style={pendingBadgeLabelStyle}>
                {pendingChargeCount === 1 ? "cobrança em aberto" : "cobranças em aberto"}
              </span>
            </a>
          </div>
        </div>
      </section>

      <QuickActionFab />
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const headingRowStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1rem",
} satisfies React.CSSProperties;

const headingTextStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const contextualMessageStyle = {
  margin: 0,
  fontSize: "0.875rem",
  color: "var(--color-text-3)",
  fontWeight: 400,
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
  fontSize: "var(--font-size-page-title)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const sectionStyle = {
  padding: "1.5rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const sectionHeadingRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "var(--font-size-label)",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const sectionActionLinkStyle = {
  fontSize: "0.82rem",
} satisfies React.CSSProperties;

const emptyStateStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(245, 245, 244, 0.5)",
} satisfies React.CSSProperties;

const emptyStateTextStyle = {
  margin: 0,
  fontSize: "0.88rem",
  color: "var(--color-text-3)",
  flex: 1,
} satisfies React.CSSProperties;

const emptyStateActionStyle = {
  fontSize: "0.85rem",
  padding: "0.35rem 0.875rem",
} satisfies React.CSSProperties;

const cardListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const sessionCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(255, 247, 237, 0.6)",
  border: "1px solid var(--color-border)",
  cursor: "default",
} satisfies React.CSSProperties;

const sessionTimeStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--color-accent)",
  minWidth: "3.5rem",
  fontVariantNumeric: "tabular-nums",
} satisfies React.CSSProperties;

const sessionPatientStyle = {
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "var(--color-text-1)",
  flex: 1,
} satisfies React.CSSProperties;

const sessionCareModeStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
  padding: "0.2rem 0.55rem",
  borderRadius: "var(--radius-sm)",
  background: "rgba(245, 245, 244, 0.8)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const snapshotGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const snapshotCardStyle = {
  padding: "1.1rem 1.2rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const snapshotNumberStyle = {
  fontSize: "1.875rem",
  fontWeight: 700,
  color: "var(--color-text-1)",
  fontFamily: "'IBM Plex Serif', serif",
  lineHeight: 1,
} satisfies React.CSSProperties;

const snapshotLabelStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const pendingBadgeLinkStyle = {
  textDecoration: "none",
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const pendingBadgeNumberStyle = {
  fontSize: "1.875rem",
  fontWeight: 700,
  color: "var(--color-accent)",
  fontFamily: "'IBM Plex Serif', serif",
  lineHeight: 1,
} satisfies React.CSSProperties;

const pendingBadgeLabelStyle = {
  fontSize: "0.8rem",
  color: "var(--color-accent)",
  textDecoration: "underline",
  textDecorationColor: "rgba(154, 52, 18, 0.3)",
} satisfies React.CSSProperties;
