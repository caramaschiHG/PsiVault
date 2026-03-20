/**
 * Calendar grid layout — pure, I/O-free.
 *
 * Converts appointment data into positioned blocks for a time-grid view.
 * Conflict columns are resolved with an interval graph coloring sweep.
 *
 * Dates cross the Server→Client boundary as ISO strings; no Date objects here.
 */

import type { Appointment, AppointmentCareMode, AppointmentStatus, SeriesPattern } from "./model";

export interface GridBlock {
  appointmentId: string;
  patientId: string;
  status: AppointmentStatus;
  careMode: AppointmentCareMode;
  startsAtIso: string;
  endsAtIso: string;
  durationMinutes: number;
  seriesId: string | null;
  seriesPattern: SeriesPattern | null;
}

export interface PositionedBlock extends GridBlock {
  /** % distance from top of the grid container */
  topPercent: number;
  /** % of the grid container height */
  heightPercent: number;
  /** 0-based column index within a conflict group */
  columnIndex: number;
  /** total columns in the conflict group */
  columnCount: number;
}

export interface GridLayoutOptions {
  /** First visible hour (inclusive). Default 7. */
  dayStartHour: number;
  /** Last visible hour (exclusive). Default 21. */
  dayEndHour: number;
}

const DEFAULT_OPTIONS: GridLayoutOptions = { dayStartHour: 7, dayEndHour: 21 };

export function toGridBlock(appointment: Appointment): GridBlock {
  return {
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    status: appointment.status,
    careMode: appointment.careMode,
    startsAtIso: appointment.startsAt.toISOString(),
    endsAtIso: appointment.endsAt.toISOString(),
    durationMinutes: appointment.durationMinutes,
    seriesId: appointment.seriesId,
    seriesPattern: appointment.seriesPattern,
  };
}

/**
 * Positions blocks within a day grid.
 *
 * Algorithm:
 * 1. Convert ISO strings → minutes-since-midnight.
 * 2. Compute topPercent / heightPercent relative to [dayStartHour, dayEndHour].
 * 3. Sweep line to assign columnIndex / columnCount.
 *    - Active set = blocks whose endsAt > current block's startsAt.
 *    - columnIndex = smallest non-negative integer not used by any active block.
 *    - After all blocks are placed, back-fill columnCount = max(columnIndex)+1
 *      within each connected conflict group.
 */
export function layoutGridBlocks(
  blocks: GridBlock[],
  options: GridLayoutOptions = DEFAULT_OPTIONS,
): PositionedBlock[] {
  const { dayStartHour, dayEndHour } = options;
  const dayStartMin = dayStartHour * 60;
  const dayTotalMin = (dayEndHour - dayStartHour) * 60;

  // Parse ISO → minutes since midnight (UTC)
  type RichBlock = GridBlock & { startMin: number; endMin: number };

  const rich: RichBlock[] = blocks.map((b) => {
    const start = new Date(b.startsAtIso);
    const end = new Date(b.endsAtIso);
    return {
      ...b,
      startMin: start.getUTCHours() * 60 + start.getUTCMinutes(),
      endMin: end.getUTCHours() * 60 + end.getUTCMinutes(),
    };
  });

  // Sort by start time for sweep
  rich.sort((a, b) => a.startMin - b.startMin);

  // Sweep line: assign columnIndex
  const colIndex = new Array<number>(rich.length).fill(0);
  // active = indices of blocks that overlap with the current block
  const active: Array<{ idx: number; endMin: number; col: number }> = [];

  for (let i = 0; i < rich.length; i++) {
    const cur = rich[i];

    // Remove expired blocks from active
    const stillActive = active.filter((a) => a.endMin > cur.startMin);
    active.length = 0;
    active.push(...stillActive);

    // Find smallest available column
    const usedCols = new Set(active.map((a) => a.col));
    let col = 0;
    while (usedCols.has(col)) col++;

    colIndex[i] = col;
    active.push({ idx: i, endMin: cur.endMin, col });
  }

  // Build connected conflict groups to compute columnCount.
  // Two blocks are in the same group if they overlap (startA < endB && startB < endA).
  const groupId = new Array<number>(rich.length).fill(-1);
  let nextGroupId = 0;

  for (let i = 0; i < rich.length; i++) {
    for (let j = i + 1; j < rich.length; j++) {
      if (rich[i].startMin < rich[j].endMin && rich[j].startMin < rich[i].endMin) {
        // They overlap — merge groups
        const gi = groupId[i] === -1 ? -1 : groupId[i];
        const gj = groupId[j] === -1 ? -1 : groupId[j];
        if (gi === -1 && gj === -1) {
          groupId[i] = nextGroupId;
          groupId[j] = nextGroupId;
          nextGroupId++;
        } else if (gi === -1) {
          groupId[i] = gj;
        } else if (gj === -1) {
          groupId[j] = gi;
        } else if (gi !== gj) {
          // Merge smaller into larger
          for (let k = 0; k < rich.length; k++) {
            if (groupId[k] === gj) groupId[k] = gi;
          }
        }
      }
    }
    // Isolated block gets its own group
    if (groupId[i] === -1) {
      groupId[i] = nextGroupId++;
    }
  }

  // columnCount per group = max(colIndex in group) + 1
  const groupColCount = new Map<number, number>();
  for (let i = 0; i < rich.length; i++) {
    const g = groupId[i];
    const cur = groupColCount.get(g) ?? 0;
    groupColCount.set(g, Math.max(cur, colIndex[i] + 1));
  }

  return rich.map((b, i) => {
    const clampedStart = Math.max(b.startMin, dayStartMin);
    const clampedEnd = Math.min(b.endMin, dayStartMin + dayTotalMin);

    const topPercent = ((clampedStart - dayStartMin) / dayTotalMin) * 100;
    const heightPercent = (Math.max(0, clampedEnd - clampedStart) / dayTotalMin) * 100;

    return {
      appointmentId: b.appointmentId,
      patientId: b.patientId,
      status: b.status,
      careMode: b.careMode,
      startsAtIso: b.startsAtIso,
      endsAtIso: b.endsAtIso,
      durationMinutes: b.durationMinutes,
      seriesId: b.seriesId,
      seriesPattern: b.seriesPattern,
      topPercent,
      heightPercent,
      columnIndex: colIndex[i],
      columnCount: groupColCount.get(groupId[i]) ?? 1,
    };
  });
}
