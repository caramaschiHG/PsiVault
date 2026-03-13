import { describe, it, expect } from "vitest";

describe("quick next-session defaults", () => {
  describe("deriveNextSessionDefaults — precedence rules", () => {
    it("uses last appointment values when available (duration, careMode, price)", async () => {
      const { deriveNextSessionDefaults } = await import(
        "../src/lib/appointments/defaults"
      );

      const defaults = deriveNextSessionDefaults({
        patientId: "pat_1",
        lastAppointment: {
          durationMinutes: 60,
          careMode: "ONLINE",
          priceInCents: 20000,
        },
        profileDefaults: {
          defaultDurationMinutes: 50,
          defaultPriceInCents: 18000,
          defaultCareMode: "IN_PERSON",
        },
      });

      expect(defaults.patientId).toBe("pat_1");
      expect(defaults.durationMinutes).toBe(60);
      expect(defaults.careMode).toBe("ONLINE");
      expect(defaults.priceInCents).toBe(20000);
    });

    it("falls back to practice profile defaults when no last appointment exists", async () => {
      const { deriveNextSessionDefaults } = await import(
        "../src/lib/appointments/defaults"
      );

      const defaults = deriveNextSessionDefaults({
        patientId: "pat_2",
        lastAppointment: null,
        profileDefaults: {
          defaultDurationMinutes: 50,
          defaultPriceInCents: 18000,
          defaultCareMode: "IN_PERSON",
        },
      });

      expect(defaults.durationMinutes).toBe(50);
      expect(defaults.careMode).toBe("IN_PERSON");
      expect(defaults.priceInCents).toBe(18000);
    });

    it("falls back to practice profile defaults when lastAppointment is undefined", async () => {
      const { deriveNextSessionDefaults } = await import(
        "../src/lib/appointments/defaults"
      );

      const defaults = deriveNextSessionDefaults({
        patientId: "pat_3",
        profileDefaults: {
          defaultDurationMinutes: 45,
          defaultPriceInCents: null,
          defaultCareMode: "ONLINE",
        },
      });

      expect(defaults.durationMinutes).toBe(45);
      expect(defaults.careMode).toBe("ONLINE");
      expect(defaults.priceInCents).toBeNull();
    });

    it("does NOT include a date or time in the defaults (professional must choose)", async () => {
      const { deriveNextSessionDefaults } = await import(
        "../src/lib/appointments/defaults"
      );

      const defaults = deriveNextSessionDefaults({
        patientId: "pat_4",
        lastAppointment: {
          durationMinutes: 50,
          careMode: "IN_PERSON",
          priceInCents: 15000,
        },
        profileDefaults: {
          defaultDurationMinutes: 50,
          defaultPriceInCents: 15000,
          defaultCareMode: "IN_PERSON",
        },
      });

      // No startsAt, no endsAt — date/time must remain absent
      expect((defaults as Record<string, unknown>).startsAt).toBeUndefined();
      expect((defaults as Record<string, unknown>).endsAt).toBeUndefined();
      expect((defaults as Record<string, unknown>).date).toBeUndefined();
    });

    it("priceInCents is null when neither last appointment nor profile has a price", async () => {
      const { deriveNextSessionDefaults } = await import(
        "../src/lib/appointments/defaults"
      );

      const defaults = deriveNextSessionDefaults({
        patientId: "pat_5",
        lastAppointment: {
          durationMinutes: 50,
          careMode: "IN_PERSON",
          priceInCents: null,
        },
        profileDefaults: {
          defaultDurationMinutes: 50,
          defaultPriceInCents: null,
          defaultCareMode: "IN_PERSON",
        },
      });

      expect(defaults.priceInCents).toBeNull();
    });
  });
});
