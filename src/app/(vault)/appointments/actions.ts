"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  noShowAppointment,
  updateAppointmentOnlineCare,
} from "../../../lib/appointments/model";
import type { AppointmentCareMode } from "../../../lib/appointments/model";
import { checkConflicts, assertPatientSchedulable } from "../../../lib/appointments/conflicts";
import { generateWeeklySeries, applySeriesEdit } from "../../../lib/appointments/recurrence";
import type { RecurrenceEditScope } from "../../../lib/appointments/recurrence";
import { getAppointmentRepository } from "../../../lib/appointments/store";
import { getPatientRepository } from "../../../lib/patients/store";
import { createAppointmentAuditEvent } from "../../../lib/appointments/audit";
import { createInMemoryAuditRepository } from "../../../lib/audit/repository";
import { getFinanceRepository } from "../../../lib/finance/store";
import { createSessionCharge, updateSessionCharge } from "../../../lib/finance/model";
import type { ChargeStatus, PaymentMethod } from "../../../lib/finance/model";
import { createChargeAuditEvent } from "../../../lib/finance/audit";

// ─── Module-level audit repository ────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __psivaultAppointmentAudit__: ReturnType<typeof createInMemoryAuditRepository> | undefined;
}

function getAuditRepository() {
  globalThis.__psivaultAppointmentAudit__ ??= createInMemoryAuditRepository();
  return globalThis.__psivaultAppointmentAudit__;
}

// ─── Stub identity (real resolution comes from session in production) ──────────

const DEFAULT_WORKSPACE_ID = "ws_1";
const DEFAULT_ACCOUNT_ID = "acct_1";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "appt_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

function generateSeriesId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "series_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

// ─── Create appointment ────────────────────────────────────────────────────────

export async function createAppointmentAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const patientRepo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const patientId = String(formData.get("patientId") ?? "");
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const careMode = String(formData.get("careMode") ?? "IN_PERSON") as AppointmentCareMode;
  const isRecurring = formData.get("isRecurring") === "true";
  const recurrenceCount = Number(formData.get("recurrenceCount") ?? 1);

  // Guard: patient must be active
  const patient = await patientRepo.findById(patientId, DEFAULT_WORKSPACE_ID);
  if (!patient) return;
  assertPatientSchedulable(patient);

  if (isRecurring && recurrenceCount > 1) {
    // Generate weekly series
    const occurrences = generateWeeklySeries(
      {
        workspaceId: DEFAULT_WORKSPACE_ID,
        patientId,
        startsAt,
        durationMinutes,
        careMode,
      },
      { count: recurrenceCount },
      {
        now,
        createId: generateId,
        createSeriesId: generateSeriesId,
      },
    );

    // Check conflicts for each occurrence before saving any
    const allExisting = await repo.listByDateRange(
      DEFAULT_WORKSPACE_ID,
      occurrences[0].startsAt,
      occurrences[occurrences.length - 1].endsAt,
    );

    for (const occurrence of occurrences) {
      const conflictResult = checkConflicts(occurrence, allExisting);
      if (conflictResult.hasConflict) {
        // In a production action this would return an error; here we throw
        throw new Error(
          `Scheduling conflict detected for ${occurrence.startsAt.toISOString()}.`,
        );
      }
    }

    for (const occurrence of occurrences) {
      await repo.save(occurrence);
      audit.append(
        createAppointmentAuditEvent(
          {
            type: "appointment.created",
            appointment: occurrence,
            actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
          },
          { now, createId: generateId },
        ),
      );
    }

    redirect(`/appointments`);
    return;
  }

  // Single appointment
  const existing = await repo.listByDateRange(
    DEFAULT_WORKSPACE_ID,
    startsAt,
    new Date(startsAt.getTime() + durationMinutes * 60_000),
  );

  const appointment = createAppointment(
    {
      workspaceId: DEFAULT_WORKSPACE_ID,
      patientId,
      startsAt,
      durationMinutes,
      careMode,
    },
    { now, createId: generateId },
  );

  const conflictResult = checkConflicts(appointment, existing);
  if (conflictResult.hasConflict) {
    throw new Error("Scheduling conflict: the selected time overlaps an existing appointment.");
  }

  await repo.save(appointment);

  audit.append(
    createAppointmentAuditEvent(
      {
        type: "appointment.created",
        appointment,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
      },
      { now, createId: generateId },
    ),
  );

  redirect(`/appointments/${appointment.id}`);
}

// ─── Reschedule appointment ────────────────────────────────────────────────────

export async function rescheduleAppointmentAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const newStartsAt = new Date(String(formData.get("startsAt") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const scope = (formData.get("recurrenceScope") ?? "THIS") as RecurrenceEditScope;

  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  if (existing.seriesId && scope !== "THIS") {
    // Series reschedule — delegate to series edit for THIS_AND_FUTURE or ALL
    // For time changes, each occurrence gets its time shifted; for simplicity
    // this action only supports changing the time of the targeted scope
    // by computing the delta and applying it.
    const deltaMs = newStartsAt.getTime() - existing.startsAt.getTime();
    const allInSeries = await repo.listBySeries(existing.seriesId, DEFAULT_WORKSPACE_ID);

    let inScope =
      scope === "ALL"
        ? allInSeries
        : allInSeries.filter(
            (o) =>
              (o.seriesIndex ?? o.startsAt.getTime()) >=
              (existing.seriesIndex !== null
                ? (existing.seriesIndex as number)
                : existing.startsAt.getTime()),
          );

    for (const occurrence of inScope) {
      if (["COMPLETED", "CANCELED", "NO_SHOW"].includes(occurrence.status)) continue;

      const newOccurrenceStart = new Date(occurrence.startsAt.getTime() + deltaMs);

      const conflictCheck = await repo.listByDateRange(
        DEFAULT_WORKSPACE_ID,
        newOccurrenceStart,
        new Date(newOccurrenceStart.getTime() + durationMinutes * 60_000),
      );

      const conflictResult = checkConflicts(
        {
          id: occurrence.id,
          startsAt: newOccurrenceStart,
          endsAt: new Date(newOccurrenceStart.getTime() + durationMinutes * 60_000),
        },
        conflictCheck,
      );

      if (conflictResult.hasConflict) continue; // Skip conflicting occurrences in series reschedule

      const rescheduled = rescheduleAppointment(
        occurrence,
        { startsAt: newOccurrenceStart, durationMinutes },
        { now, createId: generateId },
      );

      await repo.save(rescheduled);

      audit.append(
        createAppointmentAuditEvent(
          {
            type: "appointment.rescheduled",
            appointment: rescheduled,
            actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
            metadata: { originalId: occurrence.id },
          },
          { now, createId: generateId },
        ),
      );
    }
  } else {
    // Single occurrence reschedule
    const conflictCheck = await repo.listByDateRange(
      DEFAULT_WORKSPACE_ID,
      newStartsAt,
      new Date(newStartsAt.getTime() + durationMinutes * 60_000),
    );

    const conflictResult = checkConflicts(
      {
        id: appointmentId,
        startsAt: newStartsAt,
        endsAt: new Date(newStartsAt.getTime() + durationMinutes * 60_000),
      },
      conflictCheck,
    );

    if (conflictResult.hasConflict) {
      throw new Error("Scheduling conflict: the new time overlaps an existing appointment.");
    }

    const rescheduled = rescheduleAppointment(
      existing,
      { startsAt: newStartsAt, durationMinutes },
      { now, createId: generateId },
    );

    await repo.save(rescheduled);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.rescheduled",
          appointment: rescheduled,
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
          metadata: { originalId: appointmentId },
        },
        { now, createId: generateId },
      ),
    );
  }

  redirect(`/appointments/${appointmentId}`);
}

// ─── Cancel appointment ────────────────────────────────────────────────────────

export async function cancelAppointmentAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const scope = (formData.get("recurrenceScope") ?? "THIS") as RecurrenceEditScope;

  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  if (existing.seriesId && scope !== "THIS") {
    const allInSeries = await repo.listBySeries(existing.seriesId, DEFAULT_WORKSPACE_ID);

    const inScope =
      scope === "ALL"
        ? allInSeries
        : allInSeries.filter(
            (o) =>
              (o.seriesIndex ?? o.startsAt.getTime()) >=
              (existing.seriesIndex !== null
                ? (existing.seriesIndex as number)
                : existing.startsAt.getTime()),
          );

    for (const occurrence of inScope) {
      if (["COMPLETED", "CANCELED", "NO_SHOW"].includes(occurrence.status)) continue;

      const canceled = cancelAppointment(occurrence, {
        now,
        canceledByAccountId: DEFAULT_ACCOUNT_ID,
      });

      await repo.save(canceled);

      audit.append(
        createAppointmentAuditEvent(
          {
            type: "appointment.canceled",
            appointment: canceled,
            actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
          },
          { now, createId: generateId },
        ),
      );
    }
  } else {
    const canceled = cancelAppointment(existing, {
      now,
      canceledByAccountId: DEFAULT_ACCOUNT_ID,
    });

    await repo.save(canceled);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.canceled",
          appointment: canceled,
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );
  }

  redirect(`/appointments`);
}

// ─── Confirm appointment ───────────────────────────────────────────────────────

export async function confirmAppointmentAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const confirmed = confirmAppointment(existing, { now });
  await repo.save(confirmed);

  audit.append(
    createAppointmentAuditEvent(
      {
        type: "appointment.confirmed",
        appointment: confirmed,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
      },
      { now, createId: generateId },
    ),
  );

  redirect(`/appointments/${appointmentId}`);
}

// ─── Complete appointment ──────────────────────────────────────────────────────

export async function completeAppointmentAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const completed = completeAppointment(existing, { now });
  await repo.save(completed);

  audit.append(
    createAppointmentAuditEvent(
      {
        type: "appointment.completed",
        appointment: completed,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
      },
      { now, createId: generateId },
    ),
  );

  // Auto-create a SessionCharge (idempotent: skip if one already exists for this appointment)
  const financeRepo = getFinanceRepository();
  const existingCharge = await financeRepo.findByAppointmentId(completed.id);
  if (!existingCharge) {
    const charge = createSessionCharge(
      {
        workspaceId: DEFAULT_WORKSPACE_ID,
        patientId: completed.patientId,
        appointmentId: completed.id,
        amountInCents: completed.priceInCents ?? null,
      },
      { now, createId: generateId },
    );
    await financeRepo.save(charge);
    audit.append(
      createChargeAuditEvent(
        {
          type: "charge.created",
          charge,
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );
  }

  redirect(`/appointments/${appointmentId}`);
}

// ─── No-show ──────────────────────────────────────────────────────────────────

export async function noShowAppointmentAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const noShow = noShowAppointment(existing, { now });
  await repo.save(noShow);

  audit.append(
    createAppointmentAuditEvent(
      {
        type: "appointment.no_show",
        appointment: noShow,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
      },
      { now, createId: generateId },
    ),
  );

  redirect(`/appointments/${appointmentId}`);
}

// ─── Update charge ─────────────────────────────────────────────────────────────

export async function updateChargeAction(formData: FormData) {
  const financeRepo = getFinanceRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const chargeId = String(formData.get("chargeId") ?? "");
  const status = String(formData.get("status") ?? "pendente") as ChargeStatus;
  const amountStr = String(formData.get("amount") ?? "");
  const paymentMethodRaw = formData.get("paymentMethod");
  const paymentMethod: PaymentMethod | null =
    paymentMethodRaw && String(paymentMethodRaw) !== ""
      ? (String(paymentMethodRaw) as PaymentMethod)
      : null;

  // Convert R$ string to cents
  const amountInCents: number | null =
    amountStr.trim() !== "" ? Math.round(parseFloat(amountStr) * 100) : null;

  const charge = await financeRepo.findById(chargeId);
  if (!charge) return;

  const updated = updateSessionCharge(charge, { status, amountInCents, paymentMethod }, { now });
  await financeRepo.save(updated);

  audit.append(
    createChargeAuditEvent(
      {
        type: "charge.updated",
        charge: updated,
        newStatus: updated.status,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
      },
      { now, createId: generateId },
    ),
  );

  revalidatePath(`/patients/${charge.patientId}`);
}

// ─── Edit meeting link (ONLN-01) ──────────────────────────────────────────────

export async function editMeetingLinkAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const meetingLinkRaw = String(formData.get("meetingLink") ?? "");
  const meetingLink = meetingLinkRaw.trim() || null;

  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;
  if (existing.careMode !== "ONLINE") return;

  const updated = updateAppointmentOnlineCare(existing, { meetingLink }, { now });
  await repo.save(updated);

  audit.append(
    createAppointmentAuditEvent(
      {
        type: "appointment.updated",
        appointment: updated,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        metadata: { summary: "Link da sessão online atualizado." },
      },
      { now, createId: generateId },
    ),
  );

  revalidatePath("/agenda");
  revalidatePath(`/patients/${existing.patientId}`);
}

// ─── Add remote issue note (ONLN-03) ──────────────────────────────────────────

export async function addRemoteIssueNoteAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const remoteIssueNoteRaw = String(formData.get("remoteIssueNote") ?? "");
  const remoteIssueNote = remoteIssueNoteRaw.trim() || null;

  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  // Domain function guards against non-ONLINE appointments — let error propagate to Next.js error boundary
  const updated = updateAppointmentOnlineCare(existing, { remoteIssueNote }, { now });
  await repo.save(updated);

  audit.append(
    createAppointmentAuditEvent(
      {
        type: "appointment.updated",
        appointment: updated,
        actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        metadata: { summary: "Registro de problema de conexão adicionado." },
      },
      { now, createId: generateId },
    ),
  );

  revalidatePath("/agenda");
  revalidatePath(`/patients/${existing.patientId}`);
}

// ─── Edit recurrence series ────────────────────────────────────────────────────

export async function editSeriesAction(formData: FormData) {
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const scope = String(formData.get("recurrenceScope") ?? "THIS") as RecurrenceEditScope;
  const durationMinutes = formData.get("durationMinutes")
    ? Number(formData.get("durationMinutes"))
    : undefined;
  const careMode = formData.get("careMode")
    ? (String(formData.get("careMode")) as AppointmentCareMode)
    : undefined;

  const existing = await repo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const mutated = await applySeriesEdit(
    {
      scope,
      targetId: appointmentId,
      changes: {
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
        ...(careMode !== undefined ? { careMode } : {}),
      },
    },
    repo,
    { workspaceId: DEFAULT_WORKSPACE_ID, now, createId: generateId },
  );

  for (const occurrence of mutated) {
    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.series_edited",
          appointment: occurrence,
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
          metadata: { scope, targetId: appointmentId },
        },
        { now, createId: generateId },
      ),
    );
  }

  redirect(`/appointments/${appointmentId}`);
}
