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
import { getPracticeProfileSnapshot } from "../../../lib/setup/profile";
import { deriveDayAgenda, deriveWeekAgenda } from "../../../lib/appointments/agenda";
import { deriveNextSessionDefaults } from "../../../lib/appointments/defaults";
import { AgendaToolbar } from "./components/agenda-toolbar";
import { AgendaDayView } from "./components/agenda-day-view";
import { AgendaWeekView } from "./components/agenda-week-view";
import { CompletedAppointmentNextSessionAction } from "./components/completed-appointment-next-session-action";

// Stub — real workspace/account resolution comes from session in production
const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";
const TIMEZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

interface AgendaPageProps {
  searchParams: Promise<{ view?: string; date?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
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

  const appointments = appointmentRepo.listByDateRange(WORKSPACE_ID, rangeFrom, rangeTo);

  // Build patient name lookup from the patient repository
  const allPatients = patientRepo.listActive(WORKSPACE_ID);
  const patientNames: Record<string, string> = {};
  for (const p of allPatients) {
    patientNames[p.id] = p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName;
  }

  // Load practice profile for next-session defaults
  const profile = getPracticeProfileSnapshot(ACCOUNT_ID, WORKSPACE_ID);

  // Resolve default care mode from practice profile (HYBRID is not a booking value)
  const profileCareMode =
    profile.serviceModes.includes("online") && !profile.serviceModes.includes("in_person")
      ? ("ONLINE" as const)
      : ("IN_PERSON" as const);

  // Build nextSessionActions map for COMPLETED appointment cards
  const nextSessionActions: Record<string, React.ReactNode> = {};
  for (const appt of appointments) {
    if (appt.status !== "COMPLETED") continue;

    const defaults = deriveNextSessionDefaults({
      patientId: appt.patientId,
      lastAppointment: {
        durationMinutes: appt.durationMinutes,
        careMode: appt.careMode,
        priceInCents: null, // Price domain not yet available in Phase 2
      },
      profileDefaults: {
        defaultDurationMinutes: profile.defaultAppointmentDurationMinutes ?? 50,
        defaultPriceInCents: profile.defaultSessionPriceInCents ?? null,
        defaultCareMode: profileCareMode,
      },
    });

    nextSessionActions[appt.id] = (
      <CompletedAppointmentNextSessionAction
        appointmentId={appt.id}
        defaults={defaults}
      />
    );
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
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
  maxWidth: "1100px",
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

const newApptButtonStyle = {
  padding: "0.75rem 1.4rem",
  borderRadius: "16px",
  background: "#9a3412",
  color: "#fff7ed",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
} satisfies React.CSSProperties;
