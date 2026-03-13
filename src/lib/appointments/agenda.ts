/**
 * Agenda view-model derivation — server-side, no I/O.
 *
 * Converts raw appointment occurrences into structured, privacy-safe view
 * models consumed by both day and week agenda surfaces.
 *
 * Privacy contract:
 * - AgendaCard exposes only scheduling-operational fields: time window, status,
 *   care mode, and patient id.
 * - Patient name, important observations, and note content are intentionally
 *   excluded; the UI layer resolves display names from patientId when needed.
 *
 * Design decisions:
 * - deriveDayAgenda and deriveWeekAgenda accept a timezone string so local
 *   date boundaries are evaluated correctly without relying on the server TZ.
 * - Weekly grouping materializes 7 day slots in order so the UI only needs
 *   to iterate days — no extra sorting or index arithmetic needed.
 */

import type { Appointment, AppointmentCareMode, AppointmentStatus } from "./model";

// ---------------------------------------------------------------------------
// Card types
// ---------------------------------------------------------------------------

export interface AgendaCard {
  appointmentId: string;
  patientId: string;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  statusLabel: string;
  careMode: AppointmentCareMode;
  careModeLabel: string;
}

// ---------------------------------------------------------------------------
// Status and care-mode labels (pt-BR)
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
  NO_SHOW: "Não compareceu",
};

const CARE_MODE_LABELS: Record<AppointmentCareMode, string> = {
  IN_PERSON: "Presencial",
  ONLINE: "Online",
};

// ---------------------------------------------------------------------------
// Card derivation
// ---------------------------------------------------------------------------

/**
 * Convert a single appointment occurrence into a privacy-safe agenda card.
 * Only scheduling-operational data is exposed — no clinical or sensitive fields.
 */
export function deriveAgendaCard(appointment: Appointment): AgendaCard {
  return {
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
    statusLabel: STATUS_LABELS[appointment.status],
    careMode: appointment.careMode,
    careModeLabel: CARE_MODE_LABELS[appointment.careMode],
  };
}

// ---------------------------------------------------------------------------
// Date helpers (timezone-aware)
// ---------------------------------------------------------------------------

/**
 * Return the calendar date parts (year, month, day) for a timestamp
 * interpreted in the given IANA timezone.
 */
function getLocalDateParts(date: Date, timezone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const day = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  return { year, month, day };
}

/**
 * Return true when appointment.startsAt falls on the same calendar date as
 * `targetDate`.
 *
 * The `targetDate` is treated as a UTC-based day anchor: its UTC year/month/day
 * define the target calendar date. The appointment's local date is evaluated in
 * the given timezone to handle cases where the UTC midnight boundary shifts the
 * local calendar day (e.g., a UTC midnight in one timezone is still the previous
 * day in another). This allows the day anchor to be passed as a UTC midnight
 * timestamp while appointment times are correctly bucketed into their local day.
 */
function isSameLocalDate(appointmentStart: Date, targetDate: Date, timezone: string): boolean {
  const appt = getLocalDateParts(appointmentStart, timezone);
  // targetDate is always a UTC midnight anchor — use UTC parts for target
  const target = {
    year: targetDate.getUTCFullYear(),
    month: targetDate.getUTCMonth() + 1,
    day: targetDate.getUTCDate(),
  };

  // Check if the appointment's local date in the timezone matches the UTC anchor date
  // This handles cases like: UTC midnight anchor for Mar 16 should catch appointments
  // that are on Mar 16 in the given timezone
  return appt.year === target.year && appt.month === target.month && appt.day === target.day;
}

// ---------------------------------------------------------------------------
// Day agenda
// ---------------------------------------------------------------------------

export interface DayAgendaResult {
  date: Date;
  cards: AgendaCard[];
}

/**
 * Derive the ordered list of appointment cards for a single calendar day.
 *
 * @param appointments  All appointments to filter (no pre-filtering required).
 * @param date          The calendar day to show (time component ignored).
 * @param timezone      IANA timezone string (e.g. "America/Sao_Paulo").
 */
export function deriveDayAgenda(
  appointments: Appointment[],
  date: Date,
  timezone: string,
): DayAgendaResult {
  const dayAppointments = appointments
    .filter((a) => isSameLocalDate(a.startsAt, date, timezone))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return {
    date,
    cards: dayAppointments.map(deriveAgendaCard),
  };
}

// ---------------------------------------------------------------------------
// Week agenda
// ---------------------------------------------------------------------------

export interface WeekDaySlot {
  date: Date;
  cards: AgendaCard[];
}

export interface WeekAgendaResult {
  weekStart: Date;
  days: WeekDaySlot[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Derive the 7-day agenda starting from weekStart.
 *
 * Each day slot contains the ordered list of agenda cards for that calendar day.
 * Days are returned in ascending order (weekStart, weekStart+1, ..., weekStart+6).
 *
 * @param appointments  All appointments to distribute across the week.
 * @param weekStart     UTC midnight of the first day of the week.
 * @param timezone      IANA timezone string used for local date boundary checks.
 */
export function deriveWeekAgenda(
  appointments: Appointment[],
  weekStart: Date,
  timezone: string,
): WeekAgendaResult {
  const days: WeekDaySlot[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart.getTime() + i * DAY_MS);
    const dayResult = deriveDayAgenda(appointments, dayDate, timezone);
    days.push({ date: dayDate, cards: dayResult.cards });
  }

  return {
    weekStart,
    days,
  };
}
