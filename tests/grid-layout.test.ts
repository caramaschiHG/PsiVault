import { describe, it, expect } from "vitest";
import { layoutGridBlocks } from "../src/lib/appointments/grid-layout";
import type { GridBlock } from "../src/lib/appointments/grid-layout";

const OPTIONS = { dayStartHour: 7, dayEndHour: 21 };

function block(id: string, startHour: number, endHour: number): GridBlock {
  const date = "2026-03-20";
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    appointmentId: id,
    patientId: "pat_1",
    status: "SCHEDULED",
    careMode: "IN_PERSON",
    startsAtIso: `${date}T${pad(startHour)}:00:00.000Z`,
    endsAtIso: `${date}T${pad(endHour)}:00:00.000Z`,
    durationMinutes: (endHour - startHour) * 60,
    seriesId: null,
    seriesPattern: null,
  };
}

describe("layoutGridBlocks", () => {
  it("single block → columnIndex 0, columnCount 1", () => {
    const [b] = layoutGridBlocks([block("a", 9, 10)], OPTIONS);
    expect(b.columnIndex).toBe(0);
    expect(b.columnCount).toBe(1);
  });

  it("single block topPercent and heightPercent are correct", () => {
    // 9:00–10:00, day 7–21 (840 min total), start offset 120 min
    const [b] = layoutGridBlocks([block("a", 9, 10)], OPTIONS);
    expect(b.topPercent).toBeCloseTo((120 / 840) * 100);
    expect(b.heightPercent).toBeCloseTo((60 / 840) * 100);
  });

  it("two overlapping blocks → different columns, columnCount 2", () => {
    const result = layoutGridBlocks([block("a", 9, 11), block("b", 10, 12)], OPTIONS);
    const cols = result.map((b) => b.columnIndex).sort();
    expect(cols).toEqual([0, 1]);
    expect(result.every((b) => b.columnCount === 2)).toBe(true);
  });

  it("adjacent blocks (end == start) → no conflict, each in column 0", () => {
    const result = layoutGridBlocks([block("a", 9, 10), block("b", 10, 11)], OPTIONS);
    expect(result.every((b) => b.columnIndex === 0)).toBe(true);
    expect(result.every((b) => b.columnCount === 1)).toBe(true);
  });

  it("transitively connected group A∩B, B∩C, A!∩C → 2 columns (A and C share col 0)", () => {
    // A: 9–11, B: 10–12, C: 11–13
    // A overlaps B, B overlaps C. A and C are adjacent (end==start), so no direct overlap.
    // Sweep: A→col0, B→col1 (A active), C→col0 (A expired, B active at col1)
    // Connected group via B → columnCount = 2 for all
    const result = layoutGridBlocks(
      [block("a", 9, 11), block("b", 10, 12), block("c", 11, 13)],
      OPTIONS,
    );
    const byId = Object.fromEntries(result.map((b) => [b.appointmentId, b]));
    expect(byId["a"].columnIndex).toBe(0);
    expect(byId["b"].columnIndex).toBe(1);
    expect(byId["c"].columnIndex).toBe(0);
    expect(result.every((b) => b.columnCount === 2)).toBe(true);
  });

  it("three fully overlapping blocks → 3 unique columns, columnCount 3", () => {
    const result = layoutGridBlocks(
      [block("a", 9, 12), block("b", 9, 12), block("c", 9, 12)],
      OPTIONS,
    );
    const cols = result.map((b) => b.columnIndex).sort((x, y) => x - y);
    expect(cols).toEqual([0, 1, 2]);
    expect(result.every((b) => b.columnCount === 3)).toBe(true);
  });

  it("two non-overlapping blocks → each columnIndex 0, columnCount 1", () => {
    const result = layoutGridBlocks([block("a", 8, 9), block("b", 13, 14)], OPTIONS);
    expect(result.every((b) => b.columnIndex === 0)).toBe(true);
    expect(result.every((b) => b.columnCount === 1)).toBe(true);
  });

  it("empty input returns empty array", () => {
    expect(layoutGridBlocks([], OPTIONS)).toEqual([]);
  });
});
