import { describe, it, expect } from "vitest";
import {
  createAppointment,
  updateAppointmentOnlineCare,
} from "../src/lib/appointments/model";

let counter = 0;
const makeId = () => `id_${++counter}`;
const NOW = new Date("2026-01-15T10:00:00Z");

const BASE_INPUT = {
  workspaceId: "ws_1",
  patientId: "pat_1",
  startsAt: new Date("2026-02-01T09:00:00Z"),
  durationMinutes: 50,
  careMode: "ONLINE" as const,
};

describe("appointment online care model extension", () => {
  describe("Appointment interface — new fields", () => {
    it("createAppointment includes priceInCents from input", () => {
      const appt = createAppointment(
        { ...BASE_INPUT, priceInCents: 15000 },
        { now: NOW, createId: makeId },
      );
      expect(appt.priceInCents).toBe(15000);
    });

    it("createAppointment defaults priceInCents to null when not provided", () => {
      const appt = createAppointment(BASE_INPUT, { now: NOW, createId: makeId });
      expect(appt.priceInCents).toBeNull();
    });

    it("createAppointment includes meetingLink from input", () => {
      const appt = createAppointment(
        { ...BASE_INPUT, meetingLink: "https://meet.example.com/abc123" },
        { now: NOW, createId: makeId },
      );
      expect(appt.meetingLink).toBe("https://meet.example.com/abc123");
    });

    it("createAppointment defaults meetingLink to null when not provided", () => {
      const appt = createAppointment(BASE_INPUT, { now: NOW, createId: makeId });
      expect(appt.meetingLink).toBeNull();
    });

    it("createAppointment sets remoteIssueNote to null", () => {
      const appt = createAppointment(BASE_INPUT, { now: NOW, createId: makeId });
      expect(appt.remoteIssueNote).toBeNull();
    });

    it("existing createAppointment callers that omit priceInCents and meetingLink still work", () => {
      // This mirrors callers from Phase 2 that don't pass the new optional fields
      const appt = createAppointment(
        {
          workspaceId: "ws_1",
          patientId: "pat_1",
          startsAt: new Date("2026-02-01T09:00:00Z"),
          durationMinutes: 50,
          careMode: "IN_PERSON",
        },
        { now: NOW, createId: makeId },
      );
      expect(appt.priceInCents).toBeNull();
      expect(appt.meetingLink).toBeNull();
      expect(appt.remoteIssueNote).toBeNull();
    });
  });

  describe("updateAppointmentOnlineCare", () => {
    it("updates meetingLink", () => {
      const appt = createAppointment(BASE_INPUT, { now: NOW, createId: makeId });
      const updateTime = new Date("2026-01-16T10:00:00Z");
      const updated = updateAppointmentOnlineCare(
        appt,
        { meetingLink: "https://meet.example.com/xyz" },
        { now: updateTime },
      );
      expect(updated.meetingLink).toBe("https://meet.example.com/xyz");
    });

    it("updates remoteIssueNote on ONLINE appointment", () => {
      const appt = createAppointment(BASE_INPUT, { now: NOW, createId: makeId });
      const updated = updateAppointmentOnlineCare(
        appt,
        { remoteIssueNote: "Paciente com problema de conexão" },
        { now: NOW },
      );
      expect(updated.remoteIssueNote).toBe("Paciente com problema de conexão");
    });

    it("sets updatedAt to deps.now", () => {
      const appt = createAppointment(BASE_INPUT, { now: NOW, createId: makeId });
      const updateTime = new Date("2026-01-20T10:00:00Z");
      const updated = updateAppointmentOnlineCare(
        appt,
        { meetingLink: "https://meet.example.com/abc" },
        { now: updateTime },
      );
      expect(updated.updatedAt).toEqual(updateTime);
    });

    it("throws if remoteIssueNote is set on IN_PERSON appointment", () => {
      const inPersonAppt = createAppointment(
        { ...BASE_INPUT, careMode: "IN_PERSON" },
        { now: NOW, createId: makeId },
      );
      expect(() =>
        updateAppointmentOnlineCare(
          inPersonAppt,
          { remoteIssueNote: "Some note" },
          { now: NOW },
        ),
      ).toThrow("remoteIssueNote is only valid for ONLINE appointments");
    });

    it("does NOT throw when remoteIssueNote is null/undefined on IN_PERSON appointment", () => {
      const inPersonAppt = createAppointment(
        { ...BASE_INPUT, careMode: "IN_PERSON" },
        { now: NOW, createId: makeId },
      );
      expect(() =>
        updateAppointmentOnlineCare(
          inPersonAppt,
          { meetingLink: null },
          { now: NOW },
        ),
      ).not.toThrow();
    });
  });
});
