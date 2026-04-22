import { describe, it, expect } from "vitest";
import { materializeSeries, applySeriesEdit } from "@/lib/expenses/series";
import type { MaterializeSeriesInput, MaterializeSeriesDeps } from "@/lib/expenses/series";

let idCounter = 0;

const baseDeps: MaterializeSeriesDeps = {
  now: new Date("2026-01-01T00:00:00Z"),
  createId: () => `exp_${++idCounter}`,
  createSeriesId: () => "series_1",
};

const baseInput: MaterializeSeriesInput = {
  workspaceId: "ws_1",
  categoryId: "excat_1",
  description: "Plano de saúde",
  amountInCents: 50000,
  firstOccurrenceDate: new Date("2026-01-15"),
  recurrencePattern: "MENSAL",
  createdByAccountId: "acct_1",
};

describe("materializeSeries — MENSAL", () => {
  it("generates exactly 12 occurrences", () => {
    idCounter = 0;
    const result = materializeSeries(baseInput, baseDeps);
    expect(result).toHaveLength(12);
  });

  it("first occurrence has the original dueDate", () => {
    idCounter = 0;
    const result = materializeSeries(baseInput, baseDeps);
    expect(result[0].dueDate).toEqual(new Date("2026-01-15"));
  });

  it("MENSAL end-of-month clamps correctly (Jan 31 → Feb 28)", () => {
    idCounter = 0;
    // Use explicit UTC noon to avoid local timezone shifting the date to the next day
    const jan31 = new Date("2026-01-31T12:00:00Z");
    const input: MaterializeSeriesInput = { ...baseInput, firstOccurrenceDate: jan31 };
    const result = materializeSeries(input, baseDeps);
    // date-fns addMonths clamps to last day of Feb
    const feb = result[1].dueDate;
    expect(feb.getUTCMonth()).toBe(1); // February
    expect(feb.getUTCDate()).toBe(28);
  });

  it("all occurrences share the same seriesId", () => {
    idCounter = 0;
    const result = materializeSeries(baseInput, baseDeps);
    const ids = new Set(result.map((o) => o.seriesId));
    expect(ids.size).toBe(1);
  });

  it("seriesIndex is sequential 0..11", () => {
    idCounter = 0;
    const result = materializeSeries(baseInput, baseDeps);
    expect(result.map((o) => o.seriesIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe("materializeSeries — QUINZENAL", () => {
  it("generates exactly 12 occurrences", () => {
    idCounter = 0;
    const input: MaterializeSeriesInput = { ...baseInput, recurrencePattern: "QUINZENAL" };
    const result = materializeSeries(input, baseDeps);
    expect(result).toHaveLength(12);
  });

  it("occurrences are separated by exactly 14 days", () => {
    idCounter = 0;
    const input: MaterializeSeriesInput = { ...baseInput, recurrencePattern: "QUINZENAL" };
    const result = materializeSeries(input, baseDeps);
    for (let i = 1; i < result.length; i++) {
      const diff = result[i].dueDate.getTime() - result[i - 1].dueDate.getTime();
      expect(diff).toBe(14 * 24 * 60 * 60 * 1000);
    }
  });
});

describe("applySeriesEdit", () => {
  function buildSeries() {
    idCounter = 0;
    return materializeSeries(baseInput, baseDeps);
  }

  it('"this" scope only changes the occurrence at fromIndex', () => {
    const series = buildSeries();
    const patchedNow = new Date("2026-06-01");
    const result = applySeriesEdit(series, 3, "this", { amountInCents: 99999 }, { now: patchedNow });
    expect(result[3].amountInCents).toBe(99999);
    expect(result[2].amountInCents).toBe(50000);
    expect(result[4].amountInCents).toBe(50000);
  });

  it('"this_and_future" scope changes occurrences >= fromIndex', () => {
    const series = buildSeries();
    const patchedNow = new Date("2026-06-01");
    const result = applySeriesEdit(series, 5, "this_and_future", { amountInCents: 77777 }, { now: patchedNow });
    for (let i = 0; i < 5; i++) expect(result[i].amountInCents).toBe(50000);
    for (let i = 5; i < 12; i++) expect(result[i].amountInCents).toBe(77777);
  });

  it('"all" scope changes all 12 occurrences', () => {
    const series = buildSeries();
    const patchedNow = new Date("2026-06-01");
    const result = applySeriesEdit(series, 0, "all", { categoryId: "excat_new" }, { now: patchedNow });
    expect(result.every((o) => o.categoryId === "excat_new")).toBe(true);
  });
});
