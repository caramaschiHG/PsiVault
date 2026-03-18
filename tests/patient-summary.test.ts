import { describe, it, expect } from "vitest";

describe("patient operational summary", () => {
  describe("summary contract shape", () => {
    it("derives a summary with all fallback states when no data exists", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      const summary = derivePatientSummary({ patientId: "pat_1" });

      expect(summary).toMatchObject({
        patientId: "pat_1",
        lastSession: null,
        nextSession: null,
        pendingItemsCount: 0,
        documentCount: 0,
        financialStatus: "no_data",
      });
    });

    it("accepts partial data and fills missing fields with safe fallbacks", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      const summary = derivePatientSummary({
        patientId: "pat_2",
        documentCount: 3,
        pendingItemsCount: 1,
      });

      expect(summary.documentCount).toBe(3);
      expect(summary.pendingItemsCount).toBe(1);
      expect(summary.lastSession).toBeNull();
      expect(summary.nextSession).toBeNull();
      expect(summary.financialStatus).toBe("no_data");
    });

    it("accepts a lastSession date when provided", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      const lastSession = new Date("2026-03-10T14:00:00.000Z");
      const summary = derivePatientSummary({
        patientId: "pat_3",
        lastSession,
      });

      expect(summary.lastSession).toEqual(lastSession);
    });

    it("accepts a nextSession date when provided", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      const nextSession = new Date("2026-03-17T14:00:00.000Z");
      const summary = derivePatientSummary({
        patientId: "pat_4",
        nextSession,
      });

      expect(summary.nextSession).toEqual(nextSession);
    });

    it("accepts a financialStatus value", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      const summary = derivePatientSummary({
        patientId: "pat_5",
        financialStatus: "up_to_date",
      });

      expect(summary.financialStatus).toBe("up_to_date");
    });
  });

  describe("summary fallback label helpers", () => {
    it("returns a human-readable label for lastSession null state", async () => {
      const { getSummaryLabel } = await import("../src/lib/patients/summary");

      expect(getSummaryLabel("lastSession", null)).toBe("Nenhuma sessão ainda");
    });

    it("returns a human-readable label for nextSession null state", async () => {
      const { getSummaryLabel } = await import("../src/lib/patients/summary");

      expect(getSummaryLabel("nextSession", null)).toBe("Sem próxima sessão agendada");
    });

    it("returns a formatted date label when lastSession has a value", async () => {
      const { getSummaryLabel } = await import("../src/lib/patients/summary");

      const date = new Date("2026-03-10T14:00:00.000Z");
      const label = getSummaryLabel("lastSession", date);

      // Should contain the formatted date, not be null state copy
      expect(label).not.toBe("Nenhuma sessão ainda");
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    });

    it("returns a human-readable label for financialStatus no_data", async () => {
      const { getSummaryLabel } = await import("../src/lib/patients/summary");

      expect(getSummaryLabel("financialStatus", "no_data")).toBe("Sem dados financeiros");
    });

    it("returns a human-readable label for financialStatus up_to_date", async () => {
      const { getSummaryLabel } = await import("../src/lib/patients/summary");

      expect(getSummaryLabel("financialStatus", "up_to_date")).toBe("Em dia");
    });

    it("returns a human-readable label for financialStatus pending_payment", async () => {
      const { getSummaryLabel } = await import("../src/lib/patients/summary");

      expect(getSummaryLabel("financialStatus", "pending_payment")).toBe("Pagamento pendente");
    });
  });

  describe("summary is stable before scheduling domain exists", () => {
    it("summary does not claim real appointment data — all session fields must default to null", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      // When called with only the required patientId, sessions must be null
      // so the profile surface is safe before 02-02 hydrates them
      const summary = derivePatientSummary({ patientId: "pat_stability" });

      expect(summary.lastSession).toBeNull();
      expect(summary.nextSession).toBeNull();
    });

    it("pendingItemsCount and documentCount default to 0 — safe initial state", async () => {
      const { derivePatientSummary } = await import("../src/lib/patients/summary");

      const summary = derivePatientSummary({ patientId: "pat_stability_2" });

      expect(summary.pendingItemsCount).toBe(0);
      expect(summary.documentCount).toBe(0);
    });
  });

  describe("scheduling-domain hydration (02-03)", () => {
    it("derivePatientSummaryFromAppointments extracts lastSession from most recent completed appointment", async () => {
      const { derivePatientSummaryFromAppointments } = await import(
        "../src/lib/patients/summary"
      );

      const earlier = new Date("2026-02-10T14:00:00.000Z");
      const later = new Date("2026-03-10T14:00:00.000Z");

      const appointments = [
        {
          id: "a1",
          patientId: "pat_h1",
          workspaceId: "ws_1",
          startsAt: earlier,
          status: "COMPLETED" as const,
        },
        {
          id: "a2",
          patientId: "pat_h1",
          workspaceId: "ws_1",
          startsAt: later,
          status: "COMPLETED" as const,
        },
      ];

      const summary = derivePatientSummaryFromAppointments({
        patientId: "pat_h1",
        appointments,
      });

      expect(summary.lastSession).toEqual(later);
    });

    it("derivePatientSummaryFromAppointments extracts nextSession from the earliest future scheduled/confirmed appointment", async () => {
      const { derivePatientSummaryFromAppointments } = await import(
        "../src/lib/patients/summary"
      );

      const sooner = new Date("2027-01-10T09:00:00.000Z");
      const later = new Date("2027-01-17T09:00:00.000Z");

      const appointments = [
        {
          id: "b1",
          patientId: "pat_h2",
          workspaceId: "ws_1",
          startsAt: later,
          status: "SCHEDULED" as const,
        },
        {
          id: "b2",
          patientId: "pat_h2",
          workspaceId: "ws_1",
          startsAt: sooner,
          status: "CONFIRMED" as const,
        },
      ];

      const summary = derivePatientSummaryFromAppointments({
        patientId: "pat_h2",
        appointments,
      });

      expect(summary.nextSession).toEqual(sooner);
    });

    it("pendingItemsCount reflects upcoming appointments needing confirmation (SCHEDULED)", async () => {
      const { derivePatientSummaryFromAppointments } = await import(
        "../src/lib/patients/summary"
      );

      const future = new Date("2026-03-20T10:00:00.000Z");

      const appointments = [
        {
          id: "c1",
          patientId: "pat_h3",
          workspaceId: "ws_1",
          startsAt: future,
          status: "SCHEDULED" as const,
        },
        {
          id: "c2",
          patientId: "pat_h3",
          workspaceId: "ws_1",
          startsAt: new Date("2026-03-27T10:00:00.000Z"),
          status: "SCHEDULED" as const,
        },
        {
          id: "c3",
          patientId: "pat_h3",
          workspaceId: "ws_1",
          startsAt: new Date("2026-03-10T10:00:00.000Z"),
          status: "COMPLETED" as const,
        },
      ];

      const summary = derivePatientSummaryFromAppointments({
        patientId: "pat_h3",
        appointments,
        now: new Date("2026-03-13T00:00:00.000Z"),
      });

      // Two future SCHEDULED appointments need confirmation
      expect(summary.pendingItemsCount).toBe(2);
    });

    it("returns null lastSession and nextSession when no appointments exist", async () => {
      const { derivePatientSummaryFromAppointments } = await import(
        "../src/lib/patients/summary"
      );

      const summary = derivePatientSummaryFromAppointments({
        patientId: "pat_h_empty",
        appointments: [],
      });

      expect(summary.lastSession).toBeNull();
      expect(summary.nextSession).toBeNull();
      expect(summary.pendingItemsCount).toBe(0);
    });

    it("does not count canceled or no-show appointments as pending", async () => {
      const { derivePatientSummaryFromAppointments } = await import(
        "../src/lib/patients/summary"
      );

      const appointments = [
        {
          id: "d1",
          patientId: "pat_h4",
          workspaceId: "ws_1",
          startsAt: new Date("2026-03-20T10:00:00.000Z"),
          status: "CANCELED" as const,
        },
        {
          id: "d2",
          patientId: "pat_h4",
          workspaceId: "ws_1",
          startsAt: new Date("2026-03-21T10:00:00.000Z"),
          status: "NO_SHOW" as const,
        },
      ];

      const summary = derivePatientSummaryFromAppointments({
        patientId: "pat_h4",
        appointments,
        now: new Date("2026-03-13T00:00:00.000Z"),
      });

      expect(summary.pendingItemsCount).toBe(0);
    });
  });
});
