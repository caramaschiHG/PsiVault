/**
 * Weekly recurrence materialization and edit-scope logic.
 *
 * Design decisions:
 * - Weekly series are materialized into concrete occurrence rows at creation time.
 *   Agenda queries read normal occurrence rows — no rule expansion at render time.
 * - Edit scopes: THIS, THIS_AND_FUTURE, ALL.
 * - Finalized occurrences (COMPLETED, CANCELED, NO_SHOW) are never overwritten
 *   by series edits — they represent historical clinical facts.
 */

import { createAppointment } from "./model";
import type { Appointment, AppointmentCareMode } from "./model";
import type { AppointmentRepository } from "./repository";

/** Statuses that cannot be overwritten by a series edit. */
const FINALIZED_STATUSES = new Set(["COMPLETED", "CANCELED", "NO_SHOW"]);

export type RecurrenceEditScope = "THIS" | "THIS_AND_FUTURE" | "ALL";

export interface WeeklySeriesSeed {
  workspaceId: string;
  patientId: string;
  startsAt: Date;
  durationMinutes: number;
  careMode: AppointmentCareMode;
}

export interface WeeklySeriesOptions {
  /**
   * Number of weekly occurrences to generate, or "OPEN_ENDED" for an
   * indefinite series (materializes 2 years / 104 occurrences).
   */
  count: number | "OPEN_ENDED";
}

interface GenerateWeeklySeriesDeps {
  now: Date;
  createId: () => string;
  createSeriesId: () => string;
}

/**
 * Materializes a weekly series into `count` concrete occurrences.
 * The first occurrence starts at seed.startsAt; each subsequent one is
 * exactly 7 days later.
 */
export function generateWeeklySeries(
  seed: WeeklySeriesSeed,
  options: WeeklySeriesOptions,
  deps: GenerateWeeklySeriesDeps,
): Appointment[] {
  const seriesId = deps.createSeriesId();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const resolvedCount = options.count === "OPEN_ENDED" ? 104 : options.count;

  const occurrences: Appointment[] = [];

  for (let i = 0; i < resolvedCount; i++) {
    const startsAt = new Date(seed.startsAt.getTime() + i * WEEK_MS);

    const occurrence = createAppointment(
      {
        workspaceId: seed.workspaceId,
        patientId: seed.patientId,
        startsAt,
        durationMinutes: seed.durationMinutes,
        careMode: seed.careMode,
        seriesId,
        seriesIndex: i,
        seriesPattern: "WEEKLY",
        seriesDaysOfWeek: [],
      },
      {
        now: deps.now,
        createId: deps.createId,
      },
    );

    occurrences.push(occurrence);
  }

  return occurrences;
}

/**
 * Materializes a biweekly (every 14 days) series into `count` concrete occurrences.
 * The first occurrence starts at seed.startsAt; each subsequent one is exactly 14 days later.
 *
 * ⚠️ DST note: uses pure millisecond arithmetic. Series times may shift by ±1h on
 * daylight saving transitions (same behaviour as generateWeeklySeries). Known debt.
 */
export function generateBiweeklySeries(
  seed: WeeklySeriesSeed,
  options: WeeklySeriesOptions,
  deps: GenerateWeeklySeriesDeps,
): Appointment[] {
  const seriesId = deps.createSeriesId();
  const BIWEEK_MS = 14 * 24 * 60 * 60 * 1000;
  const resolvedCount = options.count === "OPEN_ENDED" ? 52 : options.count; // 52 biweekly = ~1 year

  const occurrences: Appointment[] = [];

  for (let i = 0; i < resolvedCount; i++) {
    const startsAt = new Date(seed.startsAt.getTime() + i * BIWEEK_MS);

    const occurrence = createAppointment(
      {
        workspaceId: seed.workspaceId,
        patientId: seed.patientId,
        startsAt,
        durationMinutes: seed.durationMinutes,
        careMode: seed.careMode,
        seriesId,
        seriesIndex: i,
        seriesPattern: "BIWEEKLY",
        seriesDaysOfWeek: [],
      },
      { now: deps.now, createId: deps.createId },
    );

    occurrences.push(occurrence);
  }

  return occurrences;
}

export interface TwiceWeeklySeriesSeed extends WeeklySeriesSeed {
  /** Exactly two days of the week (0=Sun, 1=Mon, …, 6=Sat). Must have exactly 2 elements. */
  daysOfWeek: [number, number];
}

/**
 * Materializes a twice-weekly series into `count` concrete occurrences.
 *
 * The two days are sorted chronologically within each week. The hour/minute from
 * seed.startsAt is used for every occurrence. seriesIndex increments linearly (0, 1, 2…).
 *
 * OPEN_ENDED → 104 occurrences (52 weeks × 2/week ≈ 1 year).
 *
 * ⚠️ DST note: same as generateWeeklySeries — pure ms arithmetic, known debt.
 */
export function generateTwiceWeeklySeries(
  seed: TwiceWeeklySeriesSeed,
  options: WeeklySeriesOptions,
  deps: GenerateWeeklySeriesDeps,
): Appointment[] {
  const seriesId = deps.createSeriesId();
  const resolvedCount = options.count === "OPEN_ENDED" ? 104 : options.count;

  // Sort days ascending so we always process the earlier day first
  const [dayA, dayB] = [...seed.daysOfWeek].sort((a, b) => a - b) as [number, number];

  // Determine the starting week's Monday (UTC, day 1)
  const seedDay = seed.startsAt.getUTCDay(); // 0=Sun
  const daysFromSunday = seedDay;
  const weekSundayMs = seed.startsAt.getTime() - daysFromSunday * 24 * 60 * 60 * 1000;
  // Strip hours from weekSunday to midnight UTC
  const weekSundayMidnight = new Date(weekSundayMs);
  weekSundayMidnight.setUTCHours(0, 0, 0, 0);

  // Get hours/minutes from seed
  const seedHour = seed.startsAt.getUTCHours();
  const seedMinute = seed.startsAt.getUTCMinutes();

  const DAY_MS = 24 * 60 * 60 * 1000;
  const WEEK_MS = 7 * DAY_MS;

  const occurrences: Appointment[] = [];
  let seriesIndex = 0;
  let week = 0;

  while (occurrences.length < resolvedCount) {
    const weekStart = weekSundayMidnight.getTime() + week * WEEK_MS;

    for (const dayOfWeek of [dayA, dayB]) {
      if (occurrences.length >= resolvedCount) break;

      const dayMs = weekStart + dayOfWeek * DAY_MS;
      const startsAt = new Date(dayMs);
      startsAt.setUTCHours(seedHour, seedMinute, 0, 0);

      // Skip occurrences before seed.startsAt (first partial week)
      if (startsAt < seed.startsAt) continue;

      const occurrence = createAppointment(
        {
          workspaceId: seed.workspaceId,
          patientId: seed.patientId,
          startsAt,
          durationMinutes: seed.durationMinutes,
          careMode: seed.careMode,
          seriesId,
          seriesIndex,
          seriesPattern: "TWICE_WEEKLY",
          seriesDaysOfWeek: [dayA, dayB],
        },
        { now: deps.now, createId: deps.createId },
      );

      occurrences.push(occurrence);
      seriesIndex++;
    }

    week++;
  }

  return occurrences;
}

export interface SeriesEditInput {
  scope: RecurrenceEditScope;
  /** Id of the occurrence the professional targeted. */
  targetId: string;
  /** Fields to apply to in-scope occurrences. */
  changes: Partial<Pick<Appointment, "durationMinutes" | "careMode">>;
}

interface ApplySeriesEditDeps {
  workspaceId: string;
  now: Date;
  createId: () => string;
}

/**
 * Apply a series edit to the appropriate set of occurrences.
 *
 * - THIS: updates only the targeted occurrence.
 * - THIS_AND_FUTURE: updates the target and all series occurrences with a
 *   higher seriesIndex (or later startsAt when index is absent).
 * - ALL: updates every occurrence in the series.
 *
 * In all cases, finalized occurrences (COMPLETED, CANCELED, NO_SHOW) are
 * skipped — their historical state must not be mutated.
 *
 * Returns the list of occurrences that were actually mutated and persisted.
 */
export async function applySeriesEdit(
  input: SeriesEditInput,
  repository: AppointmentRepository,
  deps: ApplySeriesEditDeps,
): Promise<Appointment[]> {
  const target = await repository.findById(input.targetId, deps.workspaceId);
  if (!target) {
    throw new Error(`Appointment "${input.targetId}" not found in workspace "${deps.workspaceId}".`);
  }
  if (!target.seriesId) {
    throw new Error(`Appointment "${input.targetId}" does not belong to a series.`);
  }

  const allInSeries = await repository.listBySeries(target.seriesId, deps.workspaceId);

  // Determine which occurrences are in scope
  let inScope: Appointment[];

  if (input.scope === "THIS") {
    inScope = allInSeries.filter((o) => o.id === input.targetId);
  } else if (input.scope === "THIS_AND_FUTURE") {
    const targetIndex = target.seriesIndex ?? target.startsAt.getTime();
    inScope = allInSeries.filter((o) => {
      const oIndex = o.seriesIndex ?? o.startsAt.getTime();
      return oIndex >= (target.seriesIndex !== null ? targetIndex : oIndex) &&
        (target.seriesIndex !== null
          ? (o.seriesIndex ?? Infinity) >= (target.seriesIndex as number)
          : o.startsAt.getTime() >= target.startsAt.getTime());
    });
  } else {
    // ALL
    inScope = allInSeries;
  }

  // Apply changes, skipping finalized occurrences
  const mutated: Appointment[] = [];

  for (const occurrence of inScope) {
    if (FINALIZED_STATUSES.has(occurrence.status)) continue;

    const updated: Appointment = {
      ...occurrence,
      ...(input.changes.durationMinutes !== undefined
        ? {
            durationMinutes: input.changes.durationMinutes,
            endsAt: new Date(
              occurrence.startsAt.getTime() + input.changes.durationMinutes * 60_000,
            ),
          }
        : {}),
      ...(input.changes.careMode !== undefined
        ? { careMode: input.changes.careMode }
        : {}),
      updatedAt: deps.now,
    };

    await repository.save(updated);
    mutated.push(updated);
  }

  return mutated;
}
