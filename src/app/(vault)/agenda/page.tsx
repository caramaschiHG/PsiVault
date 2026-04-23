/**
 * Agenda route — daily-first, weekly view available via toolbar switch.
 *
 * Structure:
 * 1. AgendaToolbar (day/week switch, date navigation, today shortcut)
 * 2. AgendaDayView (primary posture) OR AgendaWeekView (secondary layout)
 *
 * Navigation is search-param driven:
 * - ?view=day&date=2026-03-16  → day view for a specific date
 * - ?view=week&date=2026-03-16 → week view starting from that date's week
 * - Default: day view for today
 *
 * Appointment data is sourced from the appointment repository.
 * Patient names are resolved from the patient repository so appointment
 * cards never handle raw patient records.
 *
 * Design decisions:
 * - Day view is the primary operating posture; week view is still fully usable.
 * - Agenda consumes view-model contracts from src/lib/appointments/agenda.ts
 *   rather than constructing display logic inline.
 * - Date navigation uses UTC midnights as anchors; timezone passed down as
 *   a constant (America/Sao_Paulo) for the initial implementation.
 */

import Link from "next/link";
import { getAppointmentRepository } from "../../../lib/appointments/store";
import { getPatientRepository } from "../../../lib/patients/store";
import { getClinicalNoteRepository } from "../../../lib/clinical/store";
import { getPracticeProfileSnapshot } from "../../../lib/setup/profile";
import { deriveDayAgenda, deriveWeekAgenda } from "../../../lib/appointments/agenda";
import { deriveNextSessionDefaults } from "../../../lib/appointments/defaults";
import {
  buildReminderWhatsAppUrl,
  buildRescheduleWhatsAppUrl,
  buildReminderMailtoUrl,
  buildRescheduleMailtoUrl,
} from "../../../lib/communication/templates";
import { AgendaToolbar } from "./components/agenda-toolbar";
import { TodayWhatsAppPanel } from "./components/today-whatsapp-panel";
import { MeetingLinkForm } from "./components/meeting-link-form";
import { RemoteIssueForm } from "./components/remote-issue-form";
import { AgendaDayView } from "./components/agenda-day-view";
import { AgendaMonthView } from "./components/agenda-month-view";
import { AgendaKeyboard } from "./components/agenda-keyboard-wrapper";
import { useKeyboardShortcuts } from "./components/agenda-keyboard";
import { CompletedAppointmentNextSessionAction } from "./components/completed-appointment-next-session-action";
import { AppointmentQuickActions } from "./components/appointment-quick-actions";
import { toGridBlock } from "../../../lib/appointments/grid-layout";
import { EmptyState } from "../components/empty-state";
import { observeServerStage } from "../../../lib/observability/server-render";
import { resolveSession } from "../../../lib/supabase/session";
import { deriveMonthAgenda } from "../../../lib/appointments/agenda";
import { createAppointmentQuickAction } from "../appointments/actions";
import { QuickCreateWrapper } from "./components/quick-create-wrapper";
import { AgendaErrorBoundary } from "./components/agenda-error-boundary";
import { getFinanceRepository } from "../../../lib/finance/store";
import { autoMarkOverdue } from "../../../lib/finance/model";
import { db } from "../../../lib/db";
import { MiniCalendar, CalendarGrid, WeekCalendarGrid } from "./components/agenda-grids-lazy";

const TIMEZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

interface AgendaPageProps {
  searchParams: Promise<{ view?: string; date?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const route = "vault.agenda";
  const { accountId, workspaceId } = await observeServerStage(route, "resolveSession", () => resolveSession());
  const params = await searchParams;
  const activeView: "day" | "week" | "month" =
    params.view === "week" ? "week" : params.view === "month" ? "month" : "day";

  // Resolve anchor date from search params (UTC midnight) or default to today
  const anchorDate = parseAnchorDate(params.date);

  // Load appointments from repository
  const appointmentRepo = getAppointmentRepository();
  const patientRepo = getPatientRepository();

  // For day view: load appointments for ±1 day around anchor to handle timezone boundary
  // For week view: load for the full week window
  const rangeFrom = activeView === "day"
    ? new Date(anchorDate.getTime() - DAY_MS)
    : new Date(anchorDate.getTime() - DAY_MS);
  const rangeTo = activeView === "day"
    ? new Date(anchorDate.getTime() + 2 * DAY_MS)
    : new Date(anchorDate.getTime() + WEEK_MS + DAY_MS);

  // Parallel load of independent data sources
  const [appointments, allPatients, profile] = await Promise.all([
    observeServerStage(
      route,
      "loadAppointments",
      () => appointmentRepo.listByDateRange(workspaceId, rangeFrom, rangeTo),
      {
        workspaceId,
        activeView,
        rangeFrom: rangeFrom.toISOString(),
        rangeTo: rangeTo.toISOString(),
      },
    ),
    observeServerStage(
      route,
      "loadPatients",
      () => patientRepo.listActive(workspaceId),
      { workspaceId },
    ),
    observeServerStage(
      route,
      "loadPracticeProfile",
      () => getPracticeProfileSnapshot(accountId, workspaceId),
      { accountId, workspaceId },
    ),
  ]);

  // Build patient name lookup from the patient repository
  const patientNames: Record<string, string> = {};
  const patientById: Record<string, typeof allPatients[number]> = {};
  for (const p of allPatients) {
    patientNames[p.id] = p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName;
    patientById[p.id] = p;
  }

  // Build WhatsApp batch entries for today's scheduled/confirmed appointments with phone
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayWhatsAppEntries = activeView === "day"
    ? appointments
        .filter(
          (a) =>
            (a.status === "SCHEDULED" || a.status === "CONFIRMED") &&
            patientById[a.patientId]?.phone,
        )
        .map((a) => {
          const patient = patientById[a.patientId]!;
          const patientName = patient.socialName ?? patient.fullName;
          const patientPhone = patient.phone!;
          const apptDate = new Intl.DateTimeFormat("pt-BR", {
            day: "numeric", month: "long", year: "numeric", timeZone: TIMEZONE,
          }).format(a.startsAt);
          const apptTime = new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit", minute: "2-digit", timeZone: TIMEZONE,
          }).format(a.startsAt);
          return {
            appointmentId: a.id,
            patientName,
            patientPhone,
            appointmentDate: apptDate,
            appointmentTime: apptTime,
            whatsappUrl: buildReminderWhatsAppUrl({ patientName, patientPhone, appointmentDate: apptDate, appointmentTime: apptTime }),
          };
        })
    : [];

  // Patients without phone who have appointments today — shown as warning in panel
  const noPhonePatients = activeView === "day"
    ? appointments
        .filter(
          (a) =>
            (a.status === "SCHEDULED" || a.status === "CONFIRMED") &&
            !patientById[a.patientId]?.phone,
        )
        .map((a) => {
          const p = patientById[a.patientId];
          return p ? (p.socialName ?? p.fullName) : null;
        })
        .filter((name): name is string => name !== null)
    : [];

  // Resolve default care mode from practice profile (HYBRID is not a booking value)
  const profileCareMode =
    profile.serviceModes.includes("online") && !profile.serviceModes.includes("in_person")
      ? ("ONLINE" as const)
      : ("IN_PERSON" as const);

  // Second fan-out: everything that depends on the appointment list runs in
  // parallel. Previously the clinical-note fetch and the overdue-charges chain
  // ran sequentially, introducing an unnecessary round trip.
  const clinicalRepo = getClinicalNoteRepository();
  const financeRepo = getFinanceRepository();
  const completedAppts = appointments.filter((a) => a.status === "COMPLETED");

  const nowDate = new Date();
  const todayStr = nowDate.toISOString().slice(0, 10);
  const todayPatientIds = [...new Set(appointments
    .filter((a) => a.startsAt.toISOString().slice(0, 10) === todayStr)
    .map((a) => a.patientId))];
  const currentMonth = nowDate.getMonth() + 1;
  const currentYear = nowDate.getFullYear();

  const [agendaNoteResults, overdueCharges] = await Promise.all([
    observeServerStage(
      route,
      "loadClinicalNotesForCompletedAppointments",
      () => clinicalRepo.findByAppointmentIds(completedAppts.map((a) => a.id), workspaceId),
      {
        workspaceId,
        completedAppointmentCount: completedAppts.length,
      },
    ),
    todayPatientIds.length > 0
      ? observeServerStage(
          route,
          "loadOverdueChargesForTodayPatients",
          async () => {
            const allCharges = await financeRepo.listByWorkspaceAndMonth(
              workspaceId,
              currentYear,
              currentMonth,
            );
            const apptIds = allCharges
              .filter((c) => c.appointmentId)
              .map((c) => c.appointmentId as string);
            const appts = apptIds.length
              ? await db.appointment.findMany({
                  where: { id: { in: apptIds } },
                  select: { id: true, startsAt: true },
                })
              : [];
            const apptMap = new Map(appts.map((a) => [a.id, a.startsAt]));
            const todayPatientSet = new Set(todayPatientIds);
            return autoMarkOverdue(allCharges, apptMap, nowDate).filter(
              (c) => c.status === "atrasado" && todayPatientSet.has(c.patientId),
            );
          },
          { workspaceId },
        )
      : Promise.resolve([]),
  ]);

  const notedAppointmentIds = agendaNoteResults; // Set<string> from batch query

  const overdueMap = new Map<string, { count: number; totalCents: number }>();
  for (const charge of overdueCharges) {
    const existing = overdueMap.get(charge.patientId) ?? { count: 0, totalCents: 0 };
    existing.count++;
    existing.totalCents += charge.amountInCents ?? 0;
    overdueMap.set(charge.patientId, existing);
  }
  const overduePatientIds = new Set(overdueMap.keys());
  const overdueDetails = Array.from(overdueMap.entries()).map(([patientId, data]) => ({
    patientId,
    ...data,
  }));

  const currencyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  // Build nextSessionActions map for appointment cards.
  // COMPLETED entries include next-session action and clinical note entry point.
  // All entries include ONLINE care fields (if applicable) and Comunicacao group.
  const nextSessionActions: Record<string, React.ReactNode> = {};
  for (const appt of appointments) {
    const patientName = patientNames[appt.patientId] ?? "Paciente";

    const apptDate = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(appt.startsAt);

    const apptTime = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(appt.startsAt);

    const reminderWhatsApp = buildReminderWhatsAppUrl({
      patientName,
      patientPhone: null,
      appointmentDate: apptDate,
      appointmentTime: apptTime,
    });

    const reminderMailto = buildReminderMailtoUrl({
      patientName,
      patientEmail: null,
      appointmentDate: apptDate,
      appointmentTime: apptTime,
    });

    const rescheduleWhatsApp = buildRescheduleWhatsAppUrl({
      patientName,
      patientPhone: null,
      originalDate: apptDate,
      originalTime: apptTime,
    });

    const rescheduleMailto = buildRescheduleMailtoUrl({
      patientName,
      patientEmail: null,
      originalDate: apptDate,
      originalTime: apptTime,
    });

    const comunicacaoSection = (
      <section style={comunicacaoSectionStyle}>
        <p style={comunicacaoLabelStyle}>Comunicação</p>
        <div style={comunicacaoRowStyle}>
          <span style={comunicacaoItemLabelStyle}>Lembrete</span>
          <a href={reminderWhatsApp} target="_blank" rel="noreferrer" style={commLinkStyle} className="external-link">
            WhatsApp
          </a>
          <a href={reminderMailto} target="_blank" rel="noreferrer" style={commLinkStyle} className="external-link">
            Email
          </a>
        </div>
        <div style={comunicacaoRowStyle}>
          <span style={comunicacaoItemLabelStyle}>Reagendamento</span>
          <a href={rescheduleWhatsApp} target="_blank" rel="noreferrer" style={commLinkStyle} className="external-link">
            WhatsApp
          </a>
          <a href={rescheduleMailto} target="_blank" rel="noreferrer" style={commLinkStyle} className="external-link">
            Email
          </a>
        </div>
      </section>
    );

    // ONLINE-only section: meetingLink + remoteIssueNote forms (for all statuses)
    const onlineSection = appt.careMode === "ONLINE" ? (
      <section style={onlineSectionStyle}>
        <p style={onlineSectionLabelStyle}>Link da sessão</p>
        {appt.meetingLink && (
          <a
            href={appt.meetingLink}
            target="_blank"
            rel="noreferrer"
            style={openLinkStyle}
            className="external-link"
          >
            Abrir link
          </a>
        )}
        <MeetingLinkForm
          appointmentId={appt.id}
          meetingLink={appt.meetingLink ?? null}
          urlInputStyle={urlInputStyle}
          inlineFormStyle={inlineFormStyle}
        />
        <details style={detailsStyle}>
          <summary style={detailsSummaryStyle}>Problemas de conexão</summary>
          {appt.remoteIssueNote && (
            <p style={remoteIssueNoteStyle}>{appt.remoteIssueNote}</p>
          )}
          <RemoteIssueForm
            appointmentId={appt.id}
            remoteIssueNote={appt.remoteIssueNote ?? null}
            inlineFormStyle={inlineFormStyle}
            textareaStyle={textareaStyle}
          />
        </details>
      </section>
    ) : null;

    if (appt.status === "COMPLETED") {
      const defaults = deriveNextSessionDefaults({
        patientId: appt.patientId,
        lastAppointment: {
          durationMinutes: appt.durationMinutes,
          careMode: appt.careMode,
          priceInCents: null,
        },
        profileDefaults: {
          defaultDurationMinutes: profile.defaultAppointmentDurationMinutes ?? 50,
          defaultPriceInCents: profile.defaultSessionPriceInCents ?? null,
          defaultCareMode: profileCareMode,
        },
      });

      const hasNote = notedAppointmentIds.has(appt.id);

      nextSessionActions[appt.id] = (
        <>
          <CompletedAppointmentNextSessionAction
            appointmentId={appt.id}
            defaults={defaults}
          />
          {hasNote ? (
            <Link href={`/sessions/${appt.id}/note`} style={viewNoteStyle}>
              Ver prontuário
            </Link>
          ) : (
            <Link href={`/sessions/${appt.id}/note`} style={registerNoteStyle}>
              Registrar prontuário
            </Link>
          )}
          {onlineSection}
          {comunicacaoSection}
        </>
      );
    } else {
      // SCHEDULED, CONFIRMED, CANCELED, NO_SHOW
      nextSessionActions[appt.id] = (
        <>
          {onlineSection}
          {comunicacaoSection}
        </>
      );
    }
  }

  // Build quickActionsMap for active appointment cards
  const quickActionsMap: Record<string, React.ReactNode> = {};
  for (const appt of appointments) {
    if (appt.status === "COMPLETED" || appt.status === "CANCELED" || appt.status === "NO_SHOW") continue;
    quickActionsMap[appt.id] = (
      <AppointmentQuickActions
        appointmentId={appt.id}
        status={appt.status}
        seriesId={appt.seriesId}
      />
    );
  }

  // Build panels: combined quickActions + nextSessionActions per appointment (for side panel)
  const panels: Record<string, React.ReactNode> = {};
  for (const appt of appointments) {
    panels[appt.id] = (
      <div style={{ display: "grid", gap: "1rem" }}>
        {quickActionsMap[appt.id]}
        {nextSessionActions[appt.id]}
      </div>
    );
  }

  // Derive view models
  const dayResult = deriveDayAgenda(appointments, anchorDate, TIMEZONE);
  const weekStart = activeView === "week" ? anchorDate : getWeekStart(anchorDate);
  const weekResult = deriveWeekAgenda(appointments, weekStart, TIMEZONE);
  const monthStart = getMonthStart(anchorDate);
  const monthResult = deriveMonthAgenda(appointments, anchorDate, TIMEZONE);

  // Build toolbar props
  const prevDate =
    activeView === "day"
      ? new Date(anchorDate.getTime() - DAY_MS)
      : activeView === "week"
        ? new Date(anchorDate.getTime() - WEEK_MS)
        : new Date(anchorDate.getTime() - 30 * DAY_MS);
  const nextDate =
    activeView === "day"
      ? new Date(anchorDate.getTime() + DAY_MS)
      : activeView === "week"
        ? new Date(anchorDate.getTime() + WEEK_MS)
        : new Date(anchorDate.getTime() + 30 * DAY_MS);

  const periodLabel =
    activeView === "day"
      ? formatDayLabel(anchorDate)
      : activeView === "week"
        ? formatWeekLabel(weekStart, new Date(weekStart.getTime() + 6 * DAY_MS))
        : formatMonthLabel(monthResult.year, monthResult.month);

  const todayDate = getTodayUTCMidnight();

  await observeServerStage(
    route,
    "renderPreparation",
    async () => undefined,
    {
      workspaceId,
      activeView,
      appointmentCount: appointments.length,
      patientCount: allPatients.length,
      completedAppointmentCount: completedAppts.length,
    },
  );

  // Build appointment counts map for MiniCalendar (date → count)
  const appointmentCounts = new Map<string, number>();
  for (const appt of appointments) {
    const dateStr = appt.startsAt.toISOString().slice(0, 10);
    appointmentCounts.set(dateStr, (appointmentCounts.get(dateStr) ?? 0) + 1);
  }

  // Session count for badge
  const sessionCount = activeView === "day" ? dayResult.cards.length : activeView === "week" ? weekResult.days.reduce((sum, d) => sum + d.cards.length, 0) : 0;

  // Patient list for QuickCreate (normalized type)
  const quickCreatePatients = allPatients.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    socialName: p.socialName ?? undefined,
  }));

  return (
    <div style={pageLayoutStyle}>
      {/* Sidebar — MiniCalendar (desktop only) */}
      <aside style={sidebarStyle}>
        <MiniCalendar
          currentDate={anchorDate}
          appointmentCounts={appointmentCounts}
          activeView={activeView}
        />
      </aside>

      {/* Main content */}
      <main style={shellStyle}>
        {/* Keyboard shortcuts */}
        <AgendaKeyboard
          currentView={activeView}
          currentDate={anchorDate.toISOString()}
          monthStart={monthStart.toISOString()}
        />

        {/* Page heading */}
        <div style={headingRowStyle}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
            <h1 style={titleStyle}>Agenda</h1>
            {sessionCount > 0 && (
              <span style={sessionBadgeStyle}>
                {sessionCount} sess{sessionCount !== 1 ? "ões" : "ão"}
              </span>
            )}
          </div>

          <div style={headingActionsStyle}>
            <Link href="/appointments/new" style={newApptButtonStyle}>
              Nova consulta
            </Link>
          </div>
        </div>

        {/* Overdue patients alert */}
        {overduePatientIds.size > 0 && (
          <div style={overdueAlertStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "0.1rem" }} aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div style={overdueContentStyle}>
              <span style={overdueTextStyle}>
                Pacientes com cobranças atrasadas:
              </span>
              <span style={overdueNamesStyle}>
                {overdueDetails
                  .map((d) => {
                    const name = patientNames[d.patientId] ?? "Paciente";
                    return `${name} (${d.count}x — ${currencyFmt.format(d.totalCents / 100)})`;
                  })
                  .join(" · ")}
              </span>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <AgendaToolbar
        activeView={activeView}
        periodLabel={periodLabel}
        prevHref={`/agenda?view=${activeView}&date=${dateToParam(prevDate)}`}
        nextHref={`/agenda?view=${activeView}&date=${dateToParam(nextDate)}`}
        dayViewHref={`/agenda?view=day&date=${dateToParam(anchorDate)}`}
        weekViewHref={`/agenda?view=week&date=${dateToParam(weekStart)}`}
        monthViewHref={`/agenda?view=month&date=${dateToParam(monthStart)}`}
        todayHref={`/agenda?view=${activeView}&date=${dateToParam(todayDate)}`}
      />

      {/* Agenda content */}
      {activeView === "day" ? (
        <QuickCreateWrapper
          patients={quickCreatePatients}
          defaultDurationMinutes={profile.defaultAppointmentDurationMinutes ?? 50}
          defaultCareMode={profileCareMode}
          onCreate={createAppointmentQuickAction}
          grid={
            dayResult.cards.length > 0 ? (
              <CalendarGrid
                blocks={appointments
                  .filter((a) => dayResult.cards.some((c) => c.appointmentId === a.id))
                  .map(toGridBlock)}
                panels={panels}
                patientNames={patientNames}
                date={dateToParam(anchorDate)}
                options={{ dayStartHour: 7, dayEndHour: 21 }}
              />
            ) : (
              <div style={emptyStateContainerStyle}>
                <EmptyState
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  }
                  title="Sua agenda está livre hoje"
                  description="Nenhuma sessão agendada para este dia."
                  actionLabel="Agendar sessão"
                  actionHref="/appointments/new"
                />
              </div>
            )
          }
        />
      ) : activeView === "week" ? (
        <QuickCreateWrapper
          patients={quickCreatePatients}
          defaultDurationMinutes={profile.defaultAppointmentDurationMinutes ?? 50}
          defaultCareMode={profileCareMode}
          onCreate={createAppointmentQuickAction}
          grid={
            <WeekCalendarGrid
              blocks={appointments.map(toGridBlock)}
              panels={panels}
              patientNames={patientNames}
              weekStart={dateToParam(weekStart)}
              options={{ dayStartHour: 7, dayEndHour: 21 }}
            />
          }
        />
      ) : (
        <AgendaMonthView
          month={monthResult}
          patientNames={patientNames}
          onDayClick={(date) => {
            // Redirect handled by component
          }}
          onAppointmentClick={(appointmentId) => {
            // Panel handled by component
          }}
        />
      )}

      {/* WhatsApp batch panel — day view only */}
      {activeView === "day" && (todayWhatsAppEntries.length > 0 || noPhonePatients.length > 0) && (
        <TodayWhatsAppPanel
          entries={todayWhatsAppEntries}
          noPhonePatients={noPhonePatients}
          todayDateStr={todayDateStr}
        />
      )}

      {/* FAB mobile — visible only on mobile via CSS class */}
      <a
        href="/appointments/new"
        className="fab-mobile"
        style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "1.5rem",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          fontSize: "1.5rem",
          textDecoration: "none",
          zIndex: "var(--z-dropdown)",
        } satisfies React.CSSProperties}
        aria-label="Agendar sessão"
      >
        +
      </a>
      </main>
    </div>
  );
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

function parseAnchorDate(dateParam: string | undefined): Date {
  if (!dateParam) return getTodayUTCMidnight();

  // Expect format YYYY-MM-DD
  const parsed = Date.parse(dateParam + "T00:00:00.000Z");
  if (isNaN(parsed)) return getTodayUTCMidnight();
  return new Date(parsed);
}

function getTodayUTCMidnight(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** Returns the Monday of the week containing the given date (UTC). */
function getWeekStart(date: Date): Date {
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  // Adjust so Monday = 0
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(date.getTime() - daysFromMonday * DAY_MS);
}

function dateToParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function formatWeekLabel(start: Date, end: Date): string {
  const startDay = start.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const endDay = end.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `${startDay} – ${endDay}`;
}

/** Returns the first day of the month containing the given date (UTC). */
function getMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function formatMonthLabel(year: number, month: number): string {
  // month is 1-based; create a UTC date for formatting
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const emptyStateContainerStyle = {
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const shellStyle = {
  padding: 0,
  maxWidth: "none",
  width: "100%",
  display: "grid",
  gap: "0.75rem",
  alignContent: "start",
  minWidth: 0,
} satisfies React.CSSProperties;

const headingRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  flexWrap: "nowrap" as const,
} satisfies React.CSSProperties;

const headingActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const sessionBadgeStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-2)",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "0.2rem 0.6rem",
} satisfies React.CSSProperties;

const headingTextStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "var(--font-size-2xs)",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
  letterSpacing: "-0.01em",
} satisfies React.CSSProperties;

const newApptButtonStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent)",
  color: "var(--color-surface-0)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const registerNoteStyle = {
  display: "inline-flex",
  alignItems: "center",
  marginTop: "0.5rem",
  padding: "0.38rem 0.875rem",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-accent-light)",
  border: "1px solid var(--color-border-med)",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
} satisfies React.CSSProperties;

const viewNoteStyle = {
  display: "inline-flex",
  alignItems: "center",
  marginTop: "0.5rem",
  padding: "0.38rem 0.875rem",
  borderRadius: "var(--radius-sm)",
  background: "rgba(245, 235, 220, 0.6)",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  color: "var(--color-brown-mid)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
} satisfies React.CSSProperties;

// ─── Online care & communication styles ───────────────────────────────────────

const comunicacaoSectionStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.375rem",
} satisfies React.CSSProperties;

const comunicacaoLabelStyle = {
  margin: 0,
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const comunicacaoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const comunicacaoItemLabelStyle = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-2)",
  minWidth: "7rem",
} satisfies React.CSSProperties;

const commLinkStyle = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 500,
  padding: "0.15rem 0.55rem",
  borderRadius: "var(--radius-xs)",
  background: "rgba(255, 247, 237, 0.8)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
} satisfies React.CSSProperties;

const onlineSectionStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const onlineSectionLabelStyle = {
  margin: 0,
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const openLinkStyle = {
  fontSize: "0.85rem",
  color: "var(--color-accent)",
  fontWeight: 500,
  textDecoration: "none",
} satisfies React.CSSProperties;

const inlineFormStyle = {
  display: "flex",
  gap: "0.4rem",
  alignItems: "center",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const urlInputStyle = {
  flex: 1,
  minWidth: "12rem",
  padding: "0.3rem 0.5rem",
  fontSize: "var(--font-size-sm)",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const textareaStyle = {
  flex: 1,
  minWidth: "12rem",
  padding: "0.3rem 0.5rem",
  fontSize: "var(--font-size-sm)",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
  resize: "vertical" as const,
  minHeight: "4rem",
} satisfies React.CSSProperties;

const detailsStyle = {
  fontSize: "0.85rem",
} satisfies React.CSSProperties;

const detailsSummaryStyle = {
  cursor: "pointer",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-2)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const remoteIssueNoteStyle = {
  margin: "0.5rem 0",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-2)",
  background: "var(--color-accent-light)",
  padding: "0.4rem 0.6rem",
  borderRadius: "var(--radius-xs)",
  whiteSpace: "pre-wrap" as const,
} satisfies React.CSSProperties;

// ─── Page layout (sidebar + main) ─────────────────────────────────────────────

const pageLayoutStyle = {
  display: "grid",
  gridTemplateColumns: "256px minmax(0, 1fr)",
  gap: "1.5rem",
  padding: "1.5rem 2rem",
  maxWidth: "100%",
  width: "100%",
  minHeight: "100vh",
} satisfies React.CSSProperties;

const sidebarStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "1rem",
  paddingTop: "0.5rem",
  minWidth: 0,
} satisfies React.CSSProperties;

// Overdue alert
const overdueAlertStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-error-bg)",
  border: "1px solid var(--color-error-border)",
  marginBottom: "0.5rem",
} satisfies React.CSSProperties;

const overdueIconStyle = {
  fontSize: "1.1rem",
  flexShrink: 0,
  marginTop: "0.1rem",
} satisfies React.CSSProperties;

const overdueContentStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.2rem",
  flex: 1,
} satisfies React.CSSProperties;

const overdueTextStyle = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 600,
  color: "var(--color-error-text)",
} satisfies React.CSSProperties;

const overdueNamesStyle = {
  fontSize: "0.78rem",
  color: "var(--color-error-text)",
} satisfies React.CSSProperties;
