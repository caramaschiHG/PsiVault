import { describe, it, expect } from "vitest";
import {
  buildReminderWhatsAppUrl,
  buildRescheduleWhatsAppUrl,
  buildDocumentDeliveryWhatsAppUrl,
  buildReminderMailtoUrl,
  buildRescheduleMailtoUrl,
  buildDocumentDeliveryMailtoUrl,
} from "../src/lib/communication/templates";

describe("communication templates", () => {
  describe("buildReminderWhatsAppUrl", () => {
    it("returns a wa.me URL", () => {
      const url = buildReminderWhatsAppUrl({
        patientName: "João",
        patientPhone: "11987654321",
        appointmentDate: "15/01/2026",
        appointmentTime: "10:00",
      });
      expect(url).toMatch(/^https:\/\/wa\.me\//);
    });

    it("includes phone with 55 country code (strips non-digits)", () => {
      const url = buildReminderWhatsAppUrl({
        patientName: "Maria",
        patientPhone: "(11) 98765-4321",
        appointmentDate: "15/01/2026",
        appointmentTime: "14:00",
      });
      expect(url).toContain("wa.me/5511987654321");
    });

    it("includes encoded text parameter with patient name", () => {
      const url = buildReminderWhatsAppUrl({
        patientName: "Ana",
        patientPhone: "11912345678",
        appointmentDate: "20/01/2026",
        appointmentTime: "09:00",
      });
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain("Ana");
    });

    it("when patientPhone is null, URL still uses wa.me with empty phone part", () => {
      const url = buildReminderWhatsAppUrl({
        patientName: "Pedro",
        patientPhone: null,
        appointmentDate: "15/01/2026",
        appointmentTime: "10:00",
      });
      // wa.me URL is still valid — WhatsApp prompts user to enter number
      expect(url).toMatch(/^https:\/\/wa\.me\//);
      expect(url).toContain("?text=");
    });

    it("text includes Portuguese reminder message", () => {
      const url = buildReminderWhatsAppUrl({
        patientName: "Carlos",
        patientPhone: "11912345678",
        appointmentDate: "15/01/2026",
        appointmentTime: "10:00",
      });
      const decoded = decodeURIComponent(url);
      expect(decoded).toMatch(/Ol[aá]/i);
    });
  });

  describe("buildRescheduleWhatsAppUrl", () => {
    it("returns a wa.me URL", () => {
      const url = buildRescheduleWhatsAppUrl({
        patientName: "João",
        patientPhone: "11987654321",
        originalDate: "10/01/2026",
        originalTime: "10:00",
      });
      expect(url).toMatch(/^https:\/\/wa\.me\//);
    });

    it("includes phone with 55 country code", () => {
      const url = buildRescheduleWhatsAppUrl({
        patientName: "Maria",
        patientPhone: "21987654321",
        originalDate: "10/01/2026",
        originalTime: "14:00",
      });
      expect(url).toContain("wa.me/5521987654321");
    });

    it("text includes original date", () => {
      const url = buildRescheduleWhatsAppUrl({
        patientName: "Ana",
        patientPhone: "11912345678",
        originalDate: "10/01/2026",
        originalTime: "09:00",
      });
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain("10/01/2026");
    });

    it("text includes reschedule-related Portuguese copy", () => {
      const url = buildRescheduleWhatsAppUrl({
        patientName: "Beatriz",
        patientPhone: "11912345678",
        originalDate: "10/01/2026",
        originalTime: "10:00",
      });
      const decoded = decodeURIComponent(url);
      expect(decoded).toMatch(/reagend/i);
    });
  });

  describe("buildDocumentDeliveryWhatsAppUrl", () => {
    it("returns a wa.me URL", () => {
      const url = buildDocumentDeliveryWhatsAppUrl({
        patientName: "João",
        patientPhone: "11987654321",
        documentType: "Laudo Psicológico",
      });
      expect(url).toMatch(/^https:\/\/wa\.me\//);
    });

    it("includes phone with 55 country code", () => {
      const url = buildDocumentDeliveryWhatsAppUrl({
        patientName: "Maria",
        patientPhone: "31987654321",
        documentType: "Atestado",
      });
      expect(url).toContain("wa.me/5531987654321");
    });

    it("text references document type", () => {
      const url = buildDocumentDeliveryWhatsAppUrl({
        patientName: "Lucas",
        patientPhone: "11912345678",
        documentType: "Laudo Psicológico",
      });
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain("Laudo Psicológico");
    });

    it("text includes delivery-related Portuguese copy", () => {
      const url = buildDocumentDeliveryWhatsAppUrl({
        patientName: "Sofia",
        patientPhone: "11912345678",
        documentType: "Anamnese",
      });
      const decoded = decodeURIComponent(url);
      expect(decoded).toMatch(/document/i);
    });
  });

  describe("buildReminderMailtoUrl", () => {
    it("returns a mailto: URL", () => {
      const url = buildReminderMailtoUrl({
        patientName: "João",
        patientEmail: "joao@example.com",
        appointmentDate: "15/01/2026",
        appointmentTime: "10:00",
      });
      expect(url).toMatch(/^mailto:/);
    });

    it("includes subject and body params", () => {
      const url = buildReminderMailtoUrl({
        patientName: "Maria",
        patientEmail: "maria@example.com",
        appointmentDate: "15/01/2026",
        appointmentTime: "14:00",
      });
      expect(url).toContain("subject=");
      expect(url).toContain("body=");
    });

    it("when patientEmail is null, mailto has no recipient", () => {
      const url = buildReminderMailtoUrl({
        patientName: "Pedro",
        patientEmail: null,
        appointmentDate: "15/01/2026",
        appointmentTime: "10:00",
      });
      expect(url).toMatch(/^mailto:\?/);
    });
  });

  describe("buildRescheduleMailtoUrl", () => {
    it("returns a mailto: URL", () => {
      const url = buildRescheduleMailtoUrl({
        patientName: "João",
        patientEmail: "joao@example.com",
        originalDate: "10/01/2026",
        originalTime: "10:00",
      });
      expect(url).toMatch(/^mailto:/);
    });
  });

  describe("buildDocumentDeliveryMailtoUrl", () => {
    it("returns a mailto: URL", () => {
      const url = buildDocumentDeliveryMailtoUrl({
        patientName: "Ana",
        patientEmail: "ana@example.com",
        documentType: "Recibo",
      });
      expect(url).toMatch(/^mailto:/);
    });
  });

  describe("phone formatting", () => {
    it("strips all non-digit characters and prepends 55", () => {
      const url1 = buildReminderWhatsAppUrl({
        patientName: "Test",
        patientPhone: "(11) 9 8765-4321",
        appointmentDate: "01/01/2026",
        appointmentTime: "10:00",
      });
      expect(url1).toContain("wa.me/55119876543");
    });
  });
});
