import { describe, it, expect } from "vitest";

describe("CLIN-05: deriveSessionNumber", () => {
  it("returns the 1-based index of the target appointment among COMPLETED appointments sorted by startsAt asc", async () => {
    const { deriveSessionNumber } = await import("../src/lib/clinical/model");

    const appointments = [
      { id: "appt_b", startsAt: new Date("2026-02-10T10:00:00.000Z"), status: "COMPLETED" as const },
      { id: "appt_c", startsAt: new Date("2026-03-10T10:00:00.000Z"), status: "COMPLETED" as const },
      { id: "appt_a", startsAt: new Date("2026-01-10T10:00:00.000Z"), status: "COMPLETED" as const },
    ];

    // appt_a is earliest → session 1
    expect(deriveSessionNumber("appt_a", appointments)).toBe(1);
    // appt_b is middle → session 2
    expect(deriveSessionNumber("appt_b", appointments)).toBe(2);
    // appt_c is latest → session 3
    expect(deriveSessionNumber("appt_c", appointments)).toBe(3);
  });

  it("returns null when targetId is not in the COMPLETED list", async () => {
    const { deriveSessionNumber } = await import("../src/lib/clinical/model");

    const appointments = [
      { id: "appt_1", startsAt: new Date("2026-01-10T10:00:00.000Z"), status: "COMPLETED" as const },
      { id: "appt_2", startsAt: new Date("2026-02-10T10:00:00.000Z"), status: "SCHEDULED" as const },
    ];

    // appt_2 is SCHEDULED not COMPLETED → should return null
    expect(deriveSessionNumber("appt_2", appointments)).toBeNull();
    // unknown id → should return null
    expect(deriveSessionNumber("no-such-appt", appointments)).toBeNull();
  });

  it("ignores non-COMPLETED appointments when computing index", async () => {
    const { deriveSessionNumber } = await import("../src/lib/clinical/model");

    const appointments = [
      { id: "appt_done_1", startsAt: new Date("2026-01-10T10:00:00.000Z"), status: "COMPLETED" as const },
      { id: "appt_canceled", startsAt: new Date("2026-01-15T10:00:00.000Z"), status: "CANCELED" as const },
      { id: "appt_done_2", startsAt: new Date("2026-02-10T10:00:00.000Z"), status: "COMPLETED" as const },
      { id: "appt_no_show", startsAt: new Date("2026-02-15T10:00:00.000Z"), status: "NO_SHOW" as const },
      { id: "appt_done_3", startsAt: new Date("2026-03-10T10:00:00.000Z"), status: "COMPLETED" as const },
    ];

    // Only COMPLETED ones count — CANCELED and NO_SHOW are skipped
    expect(deriveSessionNumber("appt_done_1", appointments)).toBe(1);
    expect(deriveSessionNumber("appt_done_2", appointments)).toBe(2);
    expect(deriveSessionNumber("appt_done_3", appointments)).toBe(3);
  });

  it("returns 1 when there is only one COMPLETED appointment and it is the target", async () => {
    const { deriveSessionNumber } = await import("../src/lib/clinical/model");

    const appointments = [
      { id: "appt_only", startsAt: new Date("2026-03-14T10:00:00.000Z"), status: "COMPLETED" as const },
      { id: "appt_future", startsAt: new Date("2026-04-01T10:00:00.000Z"), status: "SCHEDULED" as const },
    ];

    expect(deriveSessionNumber("appt_only", appointments)).toBe(1);
  });

  it("returns null for an empty appointment list", async () => {
    const { deriveSessionNumber } = await import("../src/lib/clinical/model");

    expect(deriveSessionNumber("appt_any", [])).toBeNull();
  });
});
