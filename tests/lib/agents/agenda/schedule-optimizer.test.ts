import { describe, it, expect } from "vitest";
import { getTopSuggestions, formatSuggestionLabel } from "../../../../src/lib/agents/agenda/schedule-optimizer";
import type { SlotSuggestion } from "../../../../src/lib/agents/agenda/schedule-optimizer";

describe("getTopSuggestions", () => {
  it("returns slots with rate >= 0.5, max 2", () => {
    const slots: SlotSuggestion[] = [
      { dayOfWeek: 1, hour: 10, total: 10, completed: 10, rate: 1.0 },
      { dayOfWeek: 2, hour: 14, total: 10, completed: 3, rate: 0.3 },
      { dayOfWeek: 3, hour: 16, total: 10, completed: 8, rate: 0.8 },
    ];
    const result = getTopSuggestions(slots);
    expect(result).toHaveLength(2);
    expect(result[0].rate).toBe(1.0);
    expect(result[1].rate).toBe(0.8);
  });

  it("returns empty array when all rates are below 0.5", () => {
    const slots: SlotSuggestion[] = [
      { dayOfWeek: 1, hour: 10, total: 10, completed: 2, rate: 0.2 },
      { dayOfWeek: 2, hour: 14, total: 10, completed: 4, rate: 0.4 },
    ];
    expect(getTopSuggestions(slots)).toHaveLength(0);
  });
});

describe("formatSuggestionLabel", () => {
  it("formats pt-BR slot label", () => {
    const slot: SlotSuggestion = { dayOfWeek: 3, hour: 14, total: 5, completed: 5, rate: 1.0 };
    expect(formatSuggestionLabel(slot)).toBe("quartas 14h");
  });

  it("formats midnight correctly", () => {
    const slot: SlotSuggestion = { dayOfWeek: 1, hour: 0, total: 5, completed: 5, rate: 1.0 };
    expect(formatSuggestionLabel(slot)).toBe("segundas 00h");
  });
});
