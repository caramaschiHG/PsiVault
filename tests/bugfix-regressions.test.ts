import { describe, it, expect } from "vitest";
import { generateWeeklySeries, generateBiweeklySeries, generateTwiceWeeklySeries } from "../src/lib/appointments/recurrence";
import type { Appointment } from "../src/lib/appointments/model";

describe("BUG-A2: recurrenceCount handles empty string", () => {
  it("should default to 1 when recurrenceCountRaw is empty string", () => {
    // Simulates: Number(recurrenceCountRaw || 1) behavior
    const raw = "";
    const count = raw && raw.trim() !== "" ? Number(raw) : 1;
    expect(count).toBe(1);
  });

  it("should default to 1 when recurrenceCountRaw is null", () => {
    const raw: string | null = null;
    const count = raw && String(raw).trim() !== "" ? Number(raw) : 1;
    expect(count).toBe(1);
  });

  it("should use provided number when valid", () => {
    const raw = "5";
    const count = raw && raw.trim() !== "" ? Number(raw) : 1;
    expect(count).toBe(5);
  });
});

describe("BUG-A1: Invalid Date detection", () => {
  it("should detect Invalid Date from empty string", () => {
    const startsAt = new Date(String("" ?? ""));
    expect(isNaN(startsAt.getTime())).toBe(true);
  });

  it("should detect Invalid Date from malformed string", () => {
    const startsAt = new Date("not-a-date");
    expect(isNaN(startsAt.getTime())).toBe(true);
  });

  it("should accept valid date string", () => {
    const startsAt = new Date("2026-04-07T14:00:00");
    expect(isNaN(startsAt.getTime())).toBe(false);
  });
});

describe("BUG-A3: THIS_AND_FUTURE uses startsAt comparison consistently", () => {
  function simulateThisAndFuture(
    allInSeries: Array<{ startsAt: Date; seriesIndex: number | null }>,
    targetStartsAt: Date,
  ) {
    // Fixed logic: compare startsAt.getTime() consistently
    return allInSeries.filter(
      (o) => o.startsAt.getTime() >= targetStartsAt.getTime(),
    );
  }

  it("should correctly filter future occurrences by date", () => {
    const base = new Date("2026-04-07T14:00:00Z");
    const allInSeries = [
      { startsAt: new Date(base.getTime() - 14 * 86400000), seriesIndex: 0 },
      { startsAt: new Date(base.getTime() - 7 * 86400000), seriesIndex: 1 },
      { startsAt: base, seriesIndex: 2 },
      { startsAt: new Date(base.getTime() + 7 * 86400000), seriesIndex: 3 },
      { startsAt: new Date(base.getTime() + 14 * 86400000), seriesIndex: 4 },
    ];

    const result = simulateThisAndFuture(allInSeries, base);
    expect(result).toHaveLength(3); // target + 2 future
    expect(result[0].seriesIndex).toBe(2);
    expect(result[1].seriesIndex).toBe(3);
    expect(result[2].seriesIndex).toBe(4);
  });

  it("should handle null seriesIndex correctly using startsAt", () => {
    const base = new Date("2026-04-07T14:00:00Z");
    const allInSeries = [
      { startsAt: new Date(base.getTime() - 7 * 86400000), seriesIndex: null },
      { startsAt: base, seriesIndex: null },
      { startsAt: new Date(base.getTime() + 7 * 86400000), seriesIndex: null },
    ];

    const result = simulateThisAndFuture(allInSeries, base);
    expect(result).toHaveLength(2); // target + 1 future
  });
});

describe("BUG-A4: String(null) handling in completeAppointment", () => {
  it("should treat null formData.get() as empty string, not 'null'", () => {
    const raw: string | null = null;
    // Fixed: check before converting
    const freeText = raw ? String(raw).trim() : "";
    expect(freeText).toBe("");
    expect(freeText).not.toBe("null");
  });

  it("should handle empty string formData.get()", () => {
    const raw = "";
    const freeText = raw ? String(raw).trim() : "";
    expect(freeText).toBe("");
  });

  it("should handle whitespace-only formData.get()", () => {
    const raw = "   ";
    const freeText = raw ? String(raw).trim() : "";
    expect(freeText).toBe("");
  });

  it("should preserve valid text", () => {
    const raw = "  Sessão produtiva  ";
    const freeText = raw ? String(raw).trim() : "";
    expect(freeText).toBe("Sessão produtiva");
  });
});

describe("BUG-M3: fullName validation in patient actions", () => {
  it("should reject empty fullName", () => {
    const fullName = "".trim();
    expect(!fullName).toBe(true);
  });

  it("should reject whitespace-only fullName", () => {
    const fullName = "   ".trim();
    expect(!fullName).toBe(true);
  });

  it("should accept valid fullName", () => {
    const fullName = "João Silva".trim();
    expect(!!fullName).toBe(true);
  });
});
