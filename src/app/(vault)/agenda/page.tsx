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
import { editMeetingLinkAction, addRemoteIssueNoteAction } from "../appointments/actions";
import { AgendaToolbar } from "./components/agenda-toolbar";
import { AgendaDayView } from "./components/agenda-day-view";
import { AgendaWeekView } from "./components/agenda-week-view";
import { CompletedAppointmentNextSessionAction } from "./components/completed-appointment-next-session-action";
import { resolveSession } from "../../../lib/supabase/session";

const TIMEZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

interface AgendaPageProps {
  searchParams: Promise<{ view?: string; date?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { accountId, workspaceId } = await resolveSession();
  const params = await searchParams;
  const activeView = params.view === "week" ? "week" : "day";

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

  const appointments = await appointmentRepo.listByDateRange(workspaceId, rangeFrom, rangeTo);

  // Build patient name lookup from the patient repository
  const allPatients = await patientRepo.listActive(workspaceId);
  const patientNames: Record<string, string> = {};
  for (const p of allPatients) {
    patientNames[p.id] = p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName;
  }

  // Load practice profile for next-session defaults
  const profile = await getPracticeProfileSnapshot(accountId, workspaceId);

  // Resolve default care mode from practice profile (HYBRID is not a booking value)
  const profileCareMode =
    profile.serviceModes.includes("online") && !profile.serviceModes.includes("in_person")
      ? ("ONLINE" as const)
      : ("IN_PERSON" as const);

  // Load clinical repository to check note existence for completed appointments
  const clinicalRepo = getClinicalNoteRepository();

  // Build set of appointment IDs that already have a note
  const notedAppointmentIds = new Set<string>();
  const completedAppts = appointments.filter((a) => a.status === "COMPLETED");
  const agendaNoteResults = await Promise.all(
    completedAppts.map((a) => clinicalRepo.findByAppointmentId(a.id, workspaceId)),
  );
  completedAppts.forEach((a, i) => {
    if (agendaNoteResults[i]) notedAppointmentIds.add(a.id);
  });

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
          <a href={reminderWhatsApp} target="_blank" rel="noreferrer" style={commLinkStyle}>
            WhatsApp
          </a>
          <a href={reminderMailto} target="_blank" rel="noreferrer" style={commLinkStyle}>
            Email
          </a>
        </div>
        <div style={comunicacaoRowStyle}>
          <span style={comunicacaoItemLabelStyle}>Reagendamento</span>
          <a href={rescheduleWhatsApp} target="_blank" rel="noreferrer" style={commLinkStyle}>
            WhatsApp
          </a>
          <a href={rescheduleMailto} target="_blank" rel="noreferrer" style={commLinkStyle}>
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
          >
            Abrir link
          </a>
        )}
        <form action={editMeetingLinkAction} style={inlineFormStyle}>
          <input type="hidden" name="appointmentId" value={appt.id} />
          <input
            type="url"
            name="meetingLink"
            defaultValue={appt.meetingLink ?? ""}
            placeholder="https://meet.google.com/..."
            style={urlInputStyle}
          />
          <button type="submit" style={submitButtonStyle}>
            Salvar link
          </button>
        </form>
        <details style={detailsStyle}>
          <summary style={detailsSummaryStyle}>Problemas de conexão</summary>
          {appt.remoteIssueNote && (
            <p style={remoteIssueNoteStyle}>{appt.remoteIssueNote}</p>
          )}
          <form action={addRemoteIssueNoteAction} style={inlineFormStyle}>
            <input type="hidden" name="appointmentId" value={appt.id} />
            <textarea
              name="remoteIssueNote"
              defaultValue={appt.remoteIssueNote ?? ""}
              placeholder="Descreva o problema..."
              style={textareaStyle}
            />
            <button type="submit" style={submitButtonStyle}>
              Registrar
            </button>
          </form>
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
              Ver evolução
            </Link>
          ) : (
            <Link href={`/sessions/${appt.id}/note`} style={registerNoteStyle}>
              Registrar evolução
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

  // Derive view models
  const dayResult = deriveDayAgenda(appointments, anchorDate, TIMEZONE);
  const weekStart = activeView === "week" ? anchorDate : getWeekStart(anchorDate);
  const weekResult = deriveWeekAgenda(appointments, weekStart, TIMEZONE);

  // Build toolbar props
  const prevDate =
    activeView === "day"
      ? new Date(anchorDate.getTime() - DAY_MS)
      : new Date(anchorDate.getTime() - WEEK_MS);
  const nextDate =
    activeView === "day"
      ? new Date(anchorDate.getTime() + DAY_MS)
      : new Date(anchorDate.getTime() + WEEK_MS);

  const periodLabel =
    activeView === "day"
      ? formatDayLabel(anchorDate)
      : formatWeekLabel(weekStart, new Date(weekStart.getTime() + 6 * DAY_MS));

  const todayDate = getTodayUTCMidnight();

  return (
    <main style={shellStyle}>
      {/* Page heading */}
      <div style={headingRowStyle}>
        <div style={headingTextStyle}>
          <p style={eyebrowStyle}>Consultório</p>
          <h1 style={titleStyle}>Agenda</h1>
        </div>

        <Link href="/appointments/new" style={newApptButtonStyle}>
          Nova consulta
        </Link>
      </div>

      {/* Toolbar */}
      <AgendaToolbar
        activeView={activeView}
        periodLabel={periodLabel}
        prevHref={`/agenda?view=${activeView}&date=${dateToParam(prevDate)}`}
        nextHref={`/agenda?view=${activeView}&date=${dateToParam(nextDate)}`}
        dayViewHref={`/agenda?view=day&date=${dateToParam(anchorDate)}`}
        weekViewHref={`/agenda?view=week&date=${dateToParam(weekStart)}`}
        todayHref={`/agenda?view=${activeView}&date=${dateToParam(todayDate)}`}
      />

      {/* Agenda content */}
      {activeView === "day" ? (
        <AgendaDayView day={dayResult} patientNames={patientNames} nextSessionActions={nextSessionActions} />
      ) : (
        <AgendaWeekView week={weekResult} patientNames={patientNames} nextSessionActions={nextSessionActions} />
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
          zIndex: 90,
        } satisfies React.CSSProperties}
        aria-label="Agendar sessão"
      >
        +
      </a>
    </main>
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
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const headingTextStyle = {
  display: "grid",
  gap: "0.2rem",
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

const newApptButtonStyle = {
  padding: "0.625rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent)",
  color: "#fff7ed",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.9rem",
} satisfies React.CSSProperties;

const registerNoteStyle = {
  display: "inline-flex",
  alignItems: "center",
  marginTop: "0.5rem",
  padding: "0.38rem 0.875rem",
  borderRadius: "10px",
  background: "var(--color-accent-light)",
  border: "1px solid var(--color-border-med)",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.82rem",
} satisfies React.CSSProperties;

const viewNoteStyle = {
  display: "inline-flex",
  alignItems: "center",
  marginTop: "0.5rem",
  padding: "0.38rem 0.875rem",
  borderRadius: "10px",
  background: "rgba(245, 235, 220, 0.6)",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  color: "var(--color-brown-mid)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.82rem",
} satisfies React.CSSProperties;

// ─── Online care & communication styles ───────────────────────────────────────

const comunicacaoSectionStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  borderRadius: "12px",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.375rem",
} satisfies React.CSSProperties;

const comunicacaoLabelStyle = {
  margin: 0,
  fontSize: "0.72rem",
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
  fontSize: "0.8rem",
  color: "var(--color-text-2)",
  minWidth: "7rem",
} satisfies React.CSSProperties;

const commLinkStyle = {
  fontSize: "0.8rem",
  color: "#9a3412",
  textDecoration: "none",
  fontWeight: 500,
  padding: "0.15rem 0.55rem",
  borderRadius: "6px",
  background: "rgba(255, 247, 237, 0.8)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
} satisfies React.CSSProperties;

const onlineSectionStyle = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  borderRadius: "12px",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const onlineSectionLabelStyle = {
  margin: 0,
  fontSize: "0.72rem",
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
  fontSize: "0.82rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const textareaStyle = {
  flex: 1,
  minWidth: "12rem",
  padding: "0.3rem 0.5rem",
  fontSize: "0.82rem",
  borderRadius: "6px",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
  fontFamily: "inherit",
  color: "var(--color-text-1)",
  resize: "vertical" as const,
  minHeight: "4rem",
} satisfies React.CSSProperties;

const submitButtonStyle = {
  padding: "0.3rem 0.75rem",
  borderRadius: "6px",
  border: "none",
  background: "var(--color-accent)",
  color: "#fff7ed",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const detailsStyle = {
  fontSize: "0.85rem",
} satisfies React.CSSProperties;

const detailsSummaryStyle = {
  cursor: "pointer",
  fontSize: "0.82rem",
  color: "var(--color-text-2)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const remoteIssueNoteStyle = {
  margin: "0.5rem 0",
  fontSize: "0.82rem",
  color: "var(--color-text-2)",
  background: "var(--color-accent-light)",
  padding: "0.4rem 0.6rem",
  borderRadius: "6px",
  whiteSpace: "pre-wrap" as const,
} satisfies React.CSSProperties;
