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
  /** Number of weekly occurrences to generate. */
  count: number;
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

  const occurrences: Appointment[] = [];

  for (let i = 0; i < options.count; i++) {
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
