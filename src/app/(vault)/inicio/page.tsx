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
import { createReminderAction, completeReminderAction } from "../actions/reminders";

// Stub — replace with real session resolution in production
const WORKSPACE_ID = "ws_1";

export default async function InicioPage() {
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
  const rawAppointments = appointmentRepo.listByDateRange(WORKSPACE_ID, from, to);
  const todayAppointments = filterTodayAppointments(rawAppointments, from);

  // All patients for snapshot and name resolution
  const activePatients = patientRepo.listActive(WORKSPACE_ID);
  const archivedPatients = patientRepo.listArchived(WORKSPACE_ID);
  const allPatients = [...activePatients, ...archivedPatients];

  // Build patient name map for session cards
  const patientMap = new Map<string, string>();
  for (const p of allPatients) {
    patientMap.set(p.id, p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName);
  }

  // Active reminders
  const activeReminders = reminderRepo.listActive(WORKSPACE_ID);

  // Monthly charge aggregation (SECU-05: count only, never display amounts)
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const monthlyCharges = financeRepo.listByWorkspaceAndMonth(WORKSPACE_ID, year, month);
  const pendingChargeCount = countPendingCharges(monthlyCharges);

  // Monthly snapshot for summary section
  // Load all appointments this month for session count
  const monthFrom = new Date(Date.UTC(year, month - 1, 1));
  const monthTo = new Date(Date.UTC(year, month, 1));
  const monthlyAppointments = appointmentRepo.listByDateRange(WORKSPACE_ID, monthFrom, monthTo);
  const snapshot = deriveMonthlySnapshot({
    activePatients,
    monthlyCharges,
    monthlyAppointments,
  });

  // Format helpers
  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
        </div>
      </div>

      {/* ─── Section 1: Hoje ─────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={sectionHeadingRowStyle}>
          <h2 style={sectionTitleStyle}>Hoje</h2>
          <a href="/agenda" style={sectionActionLinkStyle}>
            Ver agenda completa
          </a>
        </div>

        {todayAppointments.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyStateTextStyle}>Nenhuma sessão hoje</p>
            <a href="/appointments/new" style={emptyStateActionStyle}>
              Agendar consulta
            </a>
          </div>
        ) : (
          <ul style={cardListStyle}>
            {todayAppointments.map((appt) => (
              <li key={appt.id} style={sessionCardStyle}>
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

        {activeReminders.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyStateTextStyle}>Nenhum lembrete ativo</p>
          </div>
        ) : (
          <ul style={cardListStyle}>
            {activeReminders.map((reminder) => (
              <li key={reminder.id} style={reminderCardStyle}>
                <div style={reminderInfoStyle}>
                  <span style={reminderTitleStyle}>{reminder.title}</span>
                  {reminder.dueAt && (
                    <span style={reminderDueDateStyle}>
                      Prazo: {dateFormatter.format(reminder.dueAt)}
                    </span>
                  )}
                </div>
                {/* Completion form — uses server action */}
                <form action={completeReminderAction.bind(null, reminder.id)}>
                  <button type="submit" style={completeButtonStyle}>
                    Concluir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {/* Novo lembrete inline form */}
        <div style={newReminderFormContainerStyle}>
          <p style={newReminderFormLabelStyle}>Novo lembrete</p>
          <form action={createReminderAction} style={newReminderFormStyle}>
            <input type="hidden" name="workspaceId" value={WORKSPACE_ID} />
            <input
              type="text"
              name="title"
              placeholder="Título do lembrete"
              required
              style={reminderTitleInputStyle}
            />
            <input
              type="date"
              name="dueAt"
              style={reminderDateInputStyle}
            />
            <button type="submit" style={submitButtonStyle}>
              Adicionar
            </button>
          </form>
        </div>
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
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
  maxWidth: "900px",
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

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 700,
  color: "#1c1917",
} satisfies React.CSSProperties;

const sectionStyle = {
  padding: "1.5rem",
  borderRadius: "20px",
  background: "rgba(255, 252, 247, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
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
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "#1c1917",
} satisfies React.CSSProperties;

const sectionActionLinkStyle = {
  fontSize: "0.82rem",
  color: "#9a3412",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const emptyStateStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  borderRadius: "12px",
  background: "rgba(245, 245, 244, 0.6)",
} satisfies React.CSSProperties;

const emptyStateTextStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const emptyStateActionStyle = {
  fontSize: "0.85rem",
  color: "#9a3412",
  textDecoration: "none",
  fontWeight: 500,
  padding: "0.3rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(254, 243, 199, 0.5)",
  border: "1px solid rgba(146, 64, 14, 0.15)",
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
  borderRadius: "12px",
  background: "rgba(255, 247, 237, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const sessionTimeStyle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#9a3412",
  minWidth: "3.5rem",
} satisfies React.CSSProperties;

const sessionPatientStyle = {
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#1c1917",
  flex: 1,
} satisfies React.CSSProperties;

const sessionCareModeStyle = {
  fontSize: "0.78rem",
  color: "#78716c",
  padding: "0.15rem 0.5rem",
  borderRadius: "6px",
  background: "rgba(245, 245, 244, 0.8)",
} satisfies React.CSSProperties;

const reminderCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  background: "rgba(255, 247, 237, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const reminderInfoStyle = {
  display: "grid",
  gap: "0.15rem",
  flex: 1,
} satisfies React.CSSProperties;

const reminderTitleStyle = {
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#1c1917",
} satisfies React.CSSProperties;

const reminderDueDateStyle = {
  fontSize: "0.78rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const completeButtonStyle = {
  padding: "0.3rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  background: "rgba(236, 253, 245, 0.8)",
  color: "#065f46",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const newReminderFormContainerStyle = {
  paddingTop: "0.75rem",
  borderTop: "1px solid rgba(146, 64, 14, 0.08)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const newReminderFormLabelStyle = {
  margin: 0,
  fontSize: "0.78rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#b45309",
} satisfies React.CSSProperties;

const newReminderFormStyle = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const reminderTitleInputStyle = {
  flex: 1,
  minWidth: "12rem",
  padding: "0.4rem 0.6rem",
  fontSize: "0.88rem",
  borderRadius: "8px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "#fff",
} satisfies React.CSSProperties;

const reminderDateInputStyle = {
  padding: "0.4rem 0.6rem",
  fontSize: "0.88rem",
  borderRadius: "8px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "#fff",
} satisfies React.CSSProperties;

const submitButtonStyle = {
  padding: "0.4rem 0.9rem",
  borderRadius: "8px",
  border: "none",
  background: "#9a3412",
  color: "#fff7ed",
  fontSize: "0.88rem",
  fontWeight: 600,
  cursor: "pointer",
} satisfies React.CSSProperties;

const snapshotGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const snapshotCardStyle = {
  padding: "1rem",
  borderRadius: "14px",
  background: "rgba(245, 245, 244, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.08)",
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const snapshotNumberStyle = {
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#1c1917",
} satisfies React.CSSProperties;

const snapshotLabelStyle = {
  fontSize: "0.82rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const pendingBadgeLinkStyle = {
  textDecoration: "none",
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const pendingBadgeNumberStyle = {
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#9a3412",
} satisfies React.CSSProperties;

const pendingBadgeLabelStyle = {
  fontSize: "0.82rem",
  color: "#9a3412",
  textDecoration: "underline",
  textDecorationColor: "rgba(154, 52, 18, 0.3)",
} satisfies React.CSSProperties;
