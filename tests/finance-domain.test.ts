import { describe, it, expect } from "vitest";
import {
  createSessionCharge,
  updateSessionCharge,
  deriveFinancialStatus,
  deriveMonthlyFinancialSummary,
} from "../src/lib/finance/model";
import { createInMemorySessionChargeRepository } from "../src/lib/finance/repository";
import { createChargeAuditEvent } from "../src/lib/finance/audit";

let counter = 0;
const makeId = () => `id_${++counter}`;
const NOW = new Date("2026-01-15T10:00:00Z");

const BASE_INPUT = {
  workspaceId: "ws_1",
  patientId: "pat_1",
  appointmentId: "appt_1",
  amountInCents: 15000,
};

const ACTOR = { accountId: "acct_1", workspaceId: "ws_1" };

describe("finance domain", () => {
  describe("createSessionCharge", () => {
    it("creates charge with status 'pendente'", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(charge.status).toBe("pendente");
    });

    it("stores amountInCents from input", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(charge.amountInCents).toBe(15000);
    });

    it("accepts null amountInCents", () => {
      const charge = createSessionCharge(
        { ...BASE_INPUT, amountInCents: null },
        { now: NOW, createId: makeId },
      );
      expect(charge.amountInCents).toBeNull();
    });

    it("paymentMethod is null on creation", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(charge.paymentMethod).toBeNull();
    });

    it("paidAt is null on creation", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(charge.paidAt).toBeNull();
    });

    it("stores workspaceId, patientId, appointmentId", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(charge.workspaceId).toBe("ws_1");
      expect(charge.patientId).toBe("pat_1");
      expect(charge.appointmentId).toBe("appt_1");
    });

    it("createdAt and updatedAt set to deps.now", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(charge.createdAt).toEqual(NOW);
      expect(charge.updatedAt).toEqual(NOW);
    });
  });

  describe("updateSessionCharge", () => {
    it("transitions status from pendente to pago", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const updated = updateSessionCharge(
        charge,
        { status: "pago", paymentMethod: "pix" },
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      expect(updated.status).toBe("pago");
    });

    it("sets paidAt to deps.now when transitioning to pago", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const paidTime = new Date("2026-01-16T10:00:00Z");
      const updated = updateSessionCharge(
        charge,
        { status: "pago", paymentMethod: "transferencia" },
        { now: paidTime },
      );
      expect(updated.paidAt).toEqual(paidTime);
    });

    it("transitions status from pendente to atrasado", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const updated = updateSessionCharge(charge, { status: "atrasado" }, { now: NOW });
      expect(updated.status).toBe("atrasado");
    });

    it("clears paidAt when transitioning away from pago", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const paid = updateSessionCharge(
        charge,
        { status: "pago", paymentMethod: "pix" },
        { now: new Date("2026-01-16T10:00:00Z") },
      );
      const reverted = updateSessionCharge(
        paid,
        { status: "pendente" },
        { now: new Date("2026-01-17T10:00:00Z") },
      );
      expect(reverted.paidAt).toBeNull();
    });

    it("stores paymentMethod on update", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const updated = updateSessionCharge(
        charge,
        { status: "pago", paymentMethod: "dinheiro" },
        { now: NOW },
      );
      expect(updated.paymentMethod).toBe("dinheiro");
    });

    it("updates amountInCents when provided", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const updated = updateSessionCharge(
        charge,
        { status: "pago", amountInCents: 20000 },
        { now: NOW },
      );
      expect(updated.amountInCents).toBe(20000);
    });
  });

  describe("deriveFinancialStatus", () => {
    it("returns 'no_data' for empty list", () => {
      expect(deriveFinancialStatus([])).toBe("no_data");
    });

    it("returns 'up_to_date' when all charges are pago", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const paid = updateSessionCharge(charge, { status: "pago" }, { now: NOW });
      expect(deriveFinancialStatus([paid])).toBe("up_to_date");
    });

    it("returns 'overdue' when any charge is atrasado (takes priority)", () => {
      const c1 = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const c2 = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const atrasado = updateSessionCharge(c1, { status: "atrasado" }, { now: NOW });
      const pendente = updateSessionCharge(c2, { status: "pendente" }, { now: NOW });
      expect(deriveFinancialStatus([atrasado, pendente])).toBe("overdue");
    });

    it("returns 'pending_payment' when charges are pendente but none atrasado", () => {
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      expect(deriveFinancialStatus([charge])).toBe("pending_payment");
    });

    it("returns 'up_to_date' when mix of pago charges", () => {
      const c1 = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const c2 = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const p1 = updateSessionCharge(c1, { status: "pago" }, { now: NOW });
      const p2 = updateSessionCharge(c2, { status: "pago" }, { now: NOW });
      expect(deriveFinancialStatus([p1, p2])).toBe("up_to_date");
    });
  });

  describe("deriveMonthlyFinancialSummary", () => {
    it("counts all charges as totalSessions", () => {
      const c1 = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const c2 = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      const summary = deriveMonthlyFinancialSummary([c1, c2]);
      expect(summary.totalSessions).toBe(2);
    });

    it("sums pago charges with non-null amount as totalReceivedCents", () => {
      const c1 = createSessionCharge({ ...BASE_INPUT, amountInCents: 10000 }, { now: NOW, createId: makeId });
      const c2 = createSessionCharge({ ...BASE_INPUT, amountInCents: 5000 }, { now: NOW, createId: makeId });
      const paid1 = updateSessionCharge(c1, { status: "pago" }, { now: NOW });
      const paid2 = updateSessionCharge(c2, { status: "pago" }, { now: NOW });
      const summary = deriveMonthlyFinancialSummary([paid1, paid2]);
      expect(summary.totalReceivedCents).toBe(15000);
    });

    it("sums pendente and atrasado charges with non-null amount as totalPendingCents", () => {
      const c1 = createSessionCharge({ ...BASE_INPUT, amountInCents: 8000 }, { now: NOW, createId: makeId });
      const c2 = createSessionCharge({ ...BASE_INPUT, amountInCents: 4000 }, { now: NOW, createId: makeId });
      const pendente = c1; // stays pendente
      const atrasado = updateSessionCharge(c2, { status: "atrasado" }, { now: NOW });
      const summary = deriveMonthlyFinancialSummary([pendente, atrasado]);
      expect(summary.totalPendingCents).toBe(12000);
    });

    it("excludes null amountInCents from totals", () => {
      const c1 = createSessionCharge({ ...BASE_INPUT, amountInCents: null }, { now: NOW, createId: makeId });
      const paid = updateSessionCharge(c1, { status: "pago" }, { now: NOW });
      const summary = deriveMonthlyFinancialSummary([paid]);
      expect(summary.totalReceivedCents).toBe(0);
    });

    it("returns zeros for empty list", () => {
      const summary = deriveMonthlyFinancialSummary([]);
      expect(summary.totalSessions).toBe(0);
      expect(summary.totalReceivedCents).toBe(0);
      expect(summary.totalPendingCents).toBe(0);
    });
  });

  describe("SessionChargeRepository", () => {
    it("save + findById returns the saved charge", async () => {
      const repo = createInMemorySessionChargeRepository();
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(charge);
      const found = await repo.findById(charge.id, BASE_INPUT.workspaceId);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(charge.id);
    });

    it("findById returns null for wrong workspaceId", async () => {
      const repo = createInMemorySessionChargeRepository();
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(charge);
      const found = await repo.findById(charge.id, "ws_other");
      expect(found).toBeNull();
    });

    it("findByAppointmentId returns null when no charge exists for that appointmentId", async () => {
      const repo = createInMemorySessionChargeRepository();
      const result = await repo.findByAppointmentId("appt_nonexistent");
      expect(result).toBeNull();
    });

    it("findByAppointmentId returns charge when one exists", async () => {
      const repo = createInMemorySessionChargeRepository();
      const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });
      await repo.save(charge);
      const found = await repo.findByAppointmentId("appt_1");
      expect(found?.id).toBe(charge.id);
    });

    it("listByPatient returns all charges for a patient", async () => {
      const repo = createInMemorySessionChargeRepository();
      const c1 = createSessionCharge({ ...BASE_INPUT, patientId: "pat_10" }, { now: NOW, createId: makeId });
      const c2 = createSessionCharge({ ...BASE_INPUT, patientId: "pat_10" }, { now: NOW, createId: makeId });
      const c3 = createSessionCharge({ ...BASE_INPUT, patientId: "pat_99" }, { now: NOW, createId: makeId });
      await repo.save(c1);
      await repo.save(c2);
      await repo.save(c3);
      const list = await repo.listByPatient("pat_10", "ws_1");
      expect(list).toHaveLength(2);
    });

    it("listByMonth uses UTC boundaries — charge at midnight on first of next month is excluded", async () => {
      const repo = createInMemorySessionChargeRepository();
      // January 2026 charge
      const janCharge = createSessionCharge(
        BASE_INPUT,
        { now: new Date("2026-01-15T12:00:00Z"), createId: makeId },
      );
      // Charge exactly at midnight Feb 1 UTC — must NOT be included in January
      const febBoundaryCharge = createSessionCharge(
        { ...BASE_INPUT, appointmentId: "appt_feb" },
        { now: new Date("2026-02-01T00:00:00Z"), createId: makeId },
      );
      await repo.save(janCharge);
      await repo.save(febBoundaryCharge);

      const janList = await repo.listByMonth("ws_1", "pat_1", 2026, 1);
      expect(janList).toHaveLength(1);
      expect(janList[0].id).toBe(janCharge.id);
    });

    it("listByMonth includes charge at midnight on first of the month", async () => {
      const repo = createInMemorySessionChargeRepository();
      const firstDayCharge = createSessionCharge(
        BASE_INPUT,
        { now: new Date("2026-01-01T00:00:00Z"), createId: makeId },
      );
      await repo.save(firstDayCharge);
      const list = await repo.listByMonth("ws_1", "pat_1", 2026, 1);
      expect(list).toHaveLength(1);
    });
  });

  describe("createChargeAuditEvent (SECU-05)", () => {
    const charge = createSessionCharge(BASE_INPUT, { now: NOW, createId: makeId });

    it("charge.created event metadata contains chargeId and appointmentId only", () => {
      const event = createChargeAuditEvent(
        { type: "charge.created", charge, actor: ACTOR },
        { now: NOW, createId: makeId },
      );
      expect(event.metadata).toHaveProperty("chargeId");
      expect(event.metadata).toHaveProperty("appointmentId");
      expect(event.metadata).not.toHaveProperty("amountInCents");
      expect(event.metadata).not.toHaveProperty("paymentMethod");
    });

    it("charge.updated event metadata contains chargeId, appointmentId, and newStatus only", () => {
      const updated = updateSessionCharge(charge, { status: "pago" }, { now: NOW });
      const event = createChargeAuditEvent(
        { type: "charge.updated", charge: updated, actor: ACTOR, newStatus: "pago" },
        { now: NOW, createId: makeId },
      );
      expect(event.metadata).toHaveProperty("chargeId");
      expect(event.metadata).toHaveProperty("appointmentId");
      expect(event.metadata).toHaveProperty("newStatus", "pago");
      expect(event.metadata).not.toHaveProperty("amountInCents");
      expect(event.metadata).not.toHaveProperty("paymentMethod");
    });

    it("type is 'charge.created' or 'charge.updated'", () => {
      const eventCreated = createChargeAuditEvent(
        { type: "charge.created", charge, actor: ACTOR },
        { now: NOW, createId: makeId },
      );
      expect(eventCreated.type).toBe("charge.created");
    });

    it("subject.kind is 'session_charge'", () => {
      const event = createChargeAuditEvent(
        { type: "charge.created", charge, actor: ACTOR },
        { now: NOW, createId: makeId },
      );
      expect(event.subject?.kind).toBe("session_charge");
    });
  });
});
