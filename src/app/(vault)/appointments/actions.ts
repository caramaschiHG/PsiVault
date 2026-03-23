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
import type { AppointmentCareMode, CancellationActor } from "../../../lib/appointments/model";
import { checkConflicts, assertPatientSchedulable } from "../../../lib/appointments/conflicts";
import { generateWeeklySeries, generateBiweeklySeries, generateTwiceWeeklySeries, applySeriesEdit } from "../../../lib/appointments/recurrence";
import type { RecurrenceEditScope } from "../../../lib/appointments/recurrence";
import { getAppointmentRepository } from "../../../lib/appointments/store";
import { getPatientRepository } from "../../../lib/patients/store";
import { createAppointmentAuditEvent } from "../../../lib/appointments/audit";
import { getAuditRepository } from "../../../lib/audit/store";
import { getFinanceRepository } from "../../../lib/finance/store";
import { createSessionCharge, updateSessionCharge } from "../../../lib/finance/model";
import type { ChargeStatus, PaymentMethod } from "../../../lib/finance/model";
import { createChargeAuditEvent } from "../../../lib/finance/audit";
import { resolveSession } from "../../../lib/supabase/session";
import { queueAppointmentNotifications } from "../../../lib/notifications/queue";
import { getSmtpConfigRepository } from "../../../lib/notifications/smtp-config-store";

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

export async function createAppointmentAction(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const patientRepo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const patientId = String(formData.get("patientId") ?? "");
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const careMode = String(formData.get("careMode") ?? "IN_PERSON") as AppointmentCareMode;
  const isRecurring = formData.get("isRecurring") === "true";
  const recurrenceType = String(formData.get("recurrenceType") ?? "weekly") as "weekly" | "biweekly" | "twice_weekly";
  const recurrenceCountRaw = formData.get("recurrenceCount");
  const recurrenceCount: number | "OPEN_ENDED" =
    recurrenceCountRaw === "OPEN_ENDED" ? "OPEN_ENDED" : Number(recurrenceCountRaw ?? 1);
  const recurrenceDaysOfWeekRaw = formData.get("recurrenceDaysOfWeek");
  const recurrenceDaysOfWeek: [number, number] = recurrenceDaysOfWeekRaw
    ? (JSON.parse(String(recurrenceDaysOfWeekRaw)) as [number, number])
    : [1, 4];

  let redirectPath: string | null = null;

  try {
    // Guard: patient must be active
    const patient = await patientRepo.findById(patientId, workspaceId);
    if (!patient) return { error: "Paciente não encontrado." };
    assertPatientSchedulable(patient);

    if (isRecurring) {
      // Generate series based on recurrence type
      const seed = { workspaceId, patientId, startsAt, durationMinutes, careMode };
      const seriesDeps = { now, createId: generateId, createSeriesId: generateSeriesId };

      const occurrences =
        recurrenceType === "biweekly"
          ? generateBiweeklySeries(seed, { count: recurrenceCount }, seriesDeps)
          : recurrenceType === "twice_weekly"
            ? generateTwiceWeeklySeries(
                { ...seed, daysOfWeek: recurrenceDaysOfWeek },
                { count: recurrenceCount },
                seriesDeps,
              )
            : generateWeeklySeries(seed, { count: recurrenceCount }, seriesDeps);

      // Check conflicts for each occurrence before saving any
      const allExisting = await repo.listByDateRange(
        workspaceId,
        occurrences[0].startsAt,
        occurrences[occurrences.length - 1].endsAt,
      );

      for (const occurrence of occurrences) {
        const conflictResult = checkConflicts(occurrence, allExisting);
        if (conflictResult.hasConflict) {
          throw new Error(
            `Scheduling conflict detected for ${occurrence.startsAt.toISOString()}.`,
          );
        }
      }

      // Save all occurrences atomically
      await repo.saveBatch(occurrences);

      for (const occurrence of occurrences) {
        audit.append(
          createAppointmentAuditEvent(
            {
              type: "appointment.created",
              appointment: occurrence,
              actor: { accountId: accountId, workspaceId: workspaceId },
            },
            { now, createId: generateId },
          ),
        );
      }

      redirectPath = `/agenda`;
    } else {
      // Single appointment
      const existing = await repo.listByDateRange(
        workspaceId,
        startsAt,
        new Date(startsAt.getTime() + durationMinutes * 60_000),
      );

      const appointment = createAppointment(
        {
          workspaceId: workspaceId,
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
            actor: { accountId: accountId, workspaceId: workspaceId },
          },
          { now, createId: generateId },
        ),
      );

      if (patient.email) {
        const smtpPrefs = await getSmtpConfigRepository().findByWorkspace(workspaceId);
        await queueAppointmentNotifications({
          workspaceId, appointmentId: appointment.id, patientId,
          recipientEmail: patient.email, startsAt: appointment.startsAt,
          type: "CREATED", smtpPrefs, now, createId: generateId,
        });
      }

      redirectPath = `/agenda`;
    }
  } catch (err) {
    console.error("[createAppointmentAction]", err);
    if (err instanceof Error) {
      if (err.message.includes("conflict") || err.message.includes("Scheduling conflict")) {
        return { error: "Conflito de horário: o horário escolhido já está ocupado." };
      }
      if (err.message.includes("archived") || err.message.includes("schedulable")) {
        return { error: "Este paciente está arquivado e não pode ser agendado." };
      }
      return { error: "Erro ao criar consulta. Tente novamente." };
    }
    return { error: "Erro inesperado. Tente novamente." };
  }

  if (redirectPath) redirect(redirectPath);
  return null;
}

// ─── Reschedule appointment ────────────────────────────────────────────────────

export async function rescheduleAppointmentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const newStartsAt = new Date(String(formData.get("startsAt") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const scope = (formData.get("recurrenceScope") ?? "THIS") as RecurrenceEditScope;

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };

    if (existing.seriesId && scope !== "THIS") {
      // Series reschedule — delegate to series edit for THIS_AND_FUTURE or ALL
      const deltaMs = newStartsAt.getTime() - existing.startsAt.getTime();
      const allInSeries = await repo.listBySeries(existing.seriesId, workspaceId);

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

      // First pass: check all conflicts before saving any
      const toReschedule: Array<{ occurrence: typeof inScope[0]; newStart: Date }> = [];
      for (const occurrence of inScope) {
        if (["COMPLETED", "CANCELED", "NO_SHOW"].includes(occurrence.status)) continue;

        const newOccurrenceStart = new Date(occurrence.startsAt.getTime() + deltaMs);

        const conflictCheck = await repo.listByDateRange(
          workspaceId,
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

        if (conflictResult.hasConflict) {
          throw new Error(`Scheduling conflict detected for ${newOccurrenceStart.toISOString()}.`);
        }

        toReschedule.push({ occurrence, newStart: newOccurrenceStart });
      }

      // Second pass: build rescheduled list, then save atomically
      const rescheduledOccurrences = toReschedule.map(({ occurrence, newStart }) =>
        rescheduleAppointment(
          occurrence,
          { startsAt: newStart, durationMinutes },
          { now, createId: generateId },
        ),
      );

      await repo.saveBatch(rescheduledOccurrences);

      for (let i = 0; i < rescheduledOccurrences.length; i++) {
        audit.append(
          createAppointmentAuditEvent(
            {
              type: "appointment.rescheduled",
              appointment: rescheduledOccurrences[i],
              actor: { accountId: accountId, workspaceId: workspaceId },
              metadata: { originalId: toReschedule[i].occurrence.id },
            },
            { now, createId: generateId },
          ),
        );
      }

      const patientForSeriesNotif = await getPatientRepository().findById(existing.patientId, workspaceId);
      if (patientForSeriesNotif?.email) {
        const smtpPrefs = await getSmtpConfigRepository().findByWorkspace(workspaceId);
        for (const occ of rescheduledOccurrences) {
          await queueAppointmentNotifications({
            workspaceId, appointmentId: occ.id, patientId: occ.patientId,
            recipientEmail: patientForSeriesNotif.email, startsAt: occ.startsAt,
            type: "RESCHEDULED", smtpPrefs, now, createId: generateId,
          });
        }
      }
    } else {
      // Single occurrence reschedule
      const conflictCheck = await repo.listByDateRange(
        workspaceId,
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
            actor: { accountId: accountId, workspaceId: workspaceId },
            metadata: { originalId: appointmentId },
          },
          { now, createId: generateId },
        ),
      );

      const patientForNotif = await getPatientRepository().findById(rescheduled.patientId, workspaceId);
      if (patientForNotif?.email) {
        const smtpPrefs = await getSmtpConfigRepository().findByWorkspace(workspaceId);
        await queueAppointmentNotifications({
          workspaceId, appointmentId: rescheduled.id, patientId: rescheduled.patientId,
          recipientEmail: patientForNotif.email, startsAt: rescheduled.startsAt,
          type: "RESCHEDULED", smtpPrefs, now, createId: generateId,
        });
      }
    }

    revalidatePath("/agenda");
    return { success: true };
  } catch (err) {
    console.error("[rescheduleAppointmentAction]", err);
    return { success: false, error: "Erro ao reagendar consulta. Tente novamente." };
  }
}

// ─── Cancel appointment ────────────────────────────────────────────────────────

export async function cancelAppointmentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const scope = (formData.get("recurrenceScope") ?? "THIS") as RecurrenceEditScope;
  const canceledBy = (formData.get("canceledBy") === "PATIENT" ? "PATIENT" : "THERAPIST") as CancellationActor;

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };

    if (existing.seriesId && scope !== "THIS") {
      const allInSeries = await repo.listBySeries(existing.seriesId, workspaceId);

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
          canceledByAccountId: accountId,
          canceledBy,
        });

        await repo.save(canceled);

        audit.append(
          createAppointmentAuditEvent(
            {
              type: "appointment.canceled",
              appointment: canceled,
              actor: { accountId: accountId, workspaceId: workspaceId },
            },
            { now, createId: generateId },
          ),
        );
      }

      const patientForSeriesNotif = await getPatientRepository().findById(existing.patientId, workspaceId);
      if (patientForSeriesNotif?.email) {
        const smtpPrefs = await getSmtpConfigRepository().findByWorkspace(workspaceId);
        const canceledOccurrences = inScope.filter(
          (o) => !["COMPLETED", "CANCELED", "NO_SHOW"].includes(o.status),
        );
        for (const occ of canceledOccurrences) {
          await queueAppointmentNotifications({
            workspaceId, appointmentId: occ.id, patientId: occ.patientId,
            recipientEmail: patientForSeriesNotif.email, startsAt: occ.startsAt,
            type: "CANCELED", smtpPrefs, now, createId: generateId,
          });
        }
      }
    } else {
      const canceled = cancelAppointment(existing, {
        now,
        canceledByAccountId: accountId,
        canceledBy,
      });

      await repo.save(canceled);

      audit.append(
        createAppointmentAuditEvent(
          {
            type: "appointment.canceled",
            appointment: canceled,
            actor: { accountId: accountId, workspaceId: workspaceId },
          },
          { now, createId: generateId },
        ),
      );

      const patientForNotif = await getPatientRepository().findById(canceled.patientId, workspaceId);
      if (patientForNotif?.email) {
        const smtpPrefs = await getSmtpConfigRepository().findByWorkspace(workspaceId);
        await queueAppointmentNotifications({
          workspaceId, appointmentId: canceled.id, patientId: canceled.patientId,
          recipientEmail: patientForNotif.email, startsAt: canceled.startsAt,
          type: "CANCELED", smtpPrefs, now, createId: generateId,
        });
      }
    }

    revalidatePath("/agenda");
    return { success: true };
  } catch (err) {
    console.error("[cancelAppointmentAction]", err);
    return { success: false, error: "Erro ao cancelar consulta. Tente novamente." };
  }
}

// ─── Confirm appointment ───────────────────────────────────────────────────────

export async function confirmAppointmentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };

    const confirmed = confirmAppointment(existing, { now });
    await repo.save(confirmed);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.confirmed",
          appointment: confirmed,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    revalidatePath("/agenda");
    return { success: true };
  } catch (err) {
    console.error("[confirmAppointmentAction]", err);
    return { success: false, error: "Erro ao confirmar consulta. Tente novamente." };
  }
}

// ─── Complete appointment ──────────────────────────────────────────────────────

export async function completeAppointmentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };

    const completed = completeAppointment(existing, { now });
    await repo.save(completed);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.completed",
          appointment: completed,
          actor: { accountId: accountId, workspaceId: workspaceId },
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
          workspaceId: workspaceId,
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
            actor: { accountId: accountId, workspaceId: workspaceId },
          },
          { now, createId: generateId },
        ),
      );
    }

    revalidatePath("/agenda");
    revalidatePath(`/patients/${completed.patientId}`);
    return { success: true };
  } catch (err) {
    console.error("[completeAppointmentAction]", err);
    return { success: false, error: "Erro ao concluir consulta. Tente novamente." };
  }
}

// ─── No-show ──────────────────────────────────────────────────────────────────

export async function noShowAppointmentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };

    const noShow = noShowAppointment(existing, { now });
    await repo.save(noShow);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.no_show",
          appointment: noShow,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    revalidatePath("/agenda");
    return { success: true };
  } catch (err) {
    console.error("[noShowAppointmentAction]", err);
    return { success: false, error: "Erro ao registrar não comparecimento. Tente novamente." };
  }
}

// ─── Update charge ─────────────────────────────────────────────────────────────

export async function updateChargeAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
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

  let patientIdForRevalidate: string | null = null;

  try {
    const charge = await financeRepo.findById(chargeId, workspaceId);
    if (!charge) return;

    const updated = updateSessionCharge(charge, { status, amountInCents, paymentMethod }, { now });
    await financeRepo.save(updated);

    audit.append(
      createChargeAuditEvent(
        {
          type: "charge.updated",
          charge: updated,
          newStatus: updated.status,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    patientIdForRevalidate = charge.patientId;
  } catch (err) {
    console.error("[updateChargeAction]", err);
    return;
  }

  if (patientIdForRevalidate) revalidatePath(`/patients/${patientIdForRevalidate}`);
}

// ─── Edit meeting link (ONLN-01) ──────────────────────────────────────────────

export type ActionResult = { success: boolean; error?: string };

export async function editMeetingLinkAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const meetingLinkRaw = String(formData.get("meetingLink") ?? "");
  const meetingLink = meetingLinkRaw.trim() || null;

  let patientIdForRevalidate: string | null = null;

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };
    if (existing.careMode !== "ONLINE") return { success: false, error: "Consulta não é online." };

    const updated = updateAppointmentOnlineCare(existing, { meetingLink }, { now });
    await repo.save(updated);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.updated",
          appointment: updated,
          actor: { accountId: accountId, workspaceId: workspaceId },
          metadata: { summary: "Link da sessão online atualizado." },
        },
        { now, createId: generateId },
      ),
    );

    patientIdForRevalidate = existing.patientId;
  } catch (err) {
    console.error("[editMeetingLinkAction]", err);
    return { success: false, error: "Erro ao salvar link." };
  }

  revalidatePath("/agenda");
  if (patientIdForRevalidate) revalidatePath(`/patients/${patientIdForRevalidate}`);
  return { success: true };
}

// ─── Add remote issue note (ONLN-03) ──────────────────────────────────────────

export async function addRemoteIssueNoteAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const remoteIssueNoteRaw = String(formData.get("remoteIssueNote") ?? "");
  const remoteIssueNote = remoteIssueNoteRaw.trim() || null;

  let patientIdForRevalidate: string | null = null;

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
    if (!existing) return { success: false, error: "Consulta não encontrada." };

    const updated = updateAppointmentOnlineCare(existing, { remoteIssueNote }, { now });
    await repo.save(updated);

    audit.append(
      createAppointmentAuditEvent(
        {
          type: "appointment.updated",
          appointment: updated,
          actor: { accountId: accountId, workspaceId: workspaceId },
          metadata: { summary: "Registro de problema de conexão adicionado." },
        },
        { now, createId: generateId },
      ),
    );

    patientIdForRevalidate = existing.patientId;
  } catch (err) {
    console.error("[addRemoteIssueNoteAction]", err);
    return { success: false, error: "Erro ao registrar." };
  }

  revalidatePath("/agenda");
  if (patientIdForRevalidate) revalidatePath(`/patients/${patientIdForRevalidate}`);
  return { success: true };
}

// ─── Edit recurrence series ────────────────────────────────────────────────────

export async function editSeriesAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
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

  let shouldRedirect = false;

  try {
    const existing = await repo.findById(appointmentId, workspaceId);
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
      { workspaceId: workspaceId, now, createId: generateId },
    );

    for (const occurrence of mutated) {
      audit.append(
        createAppointmentAuditEvent(
          {
            type: "appointment.series_edited",
            appointment: occurrence,
            actor: { accountId: accountId, workspaceId: workspaceId },
            metadata: { scope, targetId: appointmentId },
          },
          { now, createId: generateId },
        ),
      );
    }

    shouldRedirect = true;
  } catch (err) {
    console.error("[editSeriesAction]", err);
    return;
  }

  if (shouldRedirect) redirect(`/agenda`);
}
