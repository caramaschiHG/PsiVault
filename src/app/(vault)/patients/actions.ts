"use server";

import { redirect } from "next/navigation";
import {
  createPatient,
  archivePatient,
  recoverPatient,
  updatePatient,
} from "../../../lib/patients/model";
import { getPatientRepository } from "../../../lib/patients/store";
import { createPatientAuditEvent } from "../../../lib/patients/audit";
import { getAuditRepository } from "../../../lib/audit/store";
import { resolveSession } from "../../../lib/supabase/session";
import { getAppointmentRepository } from "../../../lib/appointments/store";
import { cancelAppointment } from "../../../lib/appointments/model";
import { createAppointmentAuditEvent } from "../../../lib/appointments/audit";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "pat_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function createPatientAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();

  let createdPatientId: string | null = null;

  try {
    const fullName = String(formData.get("fullName") ?? "").trim();
    if (!fullName) return;

    const patient = createPatient(
      {
        workspaceId: workspaceId,
        fullName,
        socialName: formData.get("socialName") ? String(formData.get("socialName")) : null,
        email: formData.get("email") ? String(formData.get("email")) : null,
        phone: formData.get("phone") ? String(formData.get("phone")) : null,
        guardianName: formData.get("guardianName") ? String(formData.get("guardianName")) : null,
        guardianPhone: formData.get("guardianPhone") ? String(formData.get("guardianPhone")) : null,
        emergencyContactName: formData.get("emergencyContactName")
          ? String(formData.get("emergencyContactName"))
          : null,
        emergencyContactPhone: formData.get("emergencyContactPhone")
          ? String(formData.get("emergencyContactPhone"))
          : null,
        importantObservations: formData.get("importantObservations")
          ? String(formData.get("importantObservations"))
          : null,
      },
      { now, createId: generateId },
    );

    await repo.save(patient);

    audit.append(
      createPatientAuditEvent(
        {
          type: "patient.created",
          patient,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    createdPatientId = patient.id;
  } catch (err) {
    console.error("[createPatientAction]", err);
    return;
  }

  if (createdPatientId) redirect(`/patients/${createdPatientId}`);
}

export async function updatePatientAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  let redirectPath: string | null = null;

  try {
    const existing = await repo.findById(patientId, workspaceId);
    if (!existing) return;

    const fullName = String(formData.get("fullName") ?? "").trim();
    if (!fullName) return;

    const updated = updatePatient(
      existing,
      {
        fullName,
        socialName: formData.get("socialName") ? String(formData.get("socialName")) : null,
        email: formData.get("email") ? String(formData.get("email")) : null,
        phone: formData.get("phone") ? String(formData.get("phone")) : null,
        guardianName: formData.get("guardianName") ? String(formData.get("guardianName")) : null,
        guardianPhone: formData.get("guardianPhone") ? String(formData.get("guardianPhone")) : null,
        emergencyContactName: formData.get("emergencyContactName")
          ? String(formData.get("emergencyContactName"))
          : null,
        emergencyContactPhone: formData.get("emergencyContactPhone")
          ? String(formData.get("emergencyContactPhone"))
          : null,
        importantObservations: formData.get("importantObservations")
          ? String(formData.get("importantObservations"))
          : null,
      },
      { now },
    );

    await repo.save(updated);

    audit.append(
      createPatientAuditEvent(
        {
          type: "patient.updated",
          patient: updated,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    redirectPath = `/patients/${patientId}`;
  } catch (err) {
    console.error("[updatePatientAction]", err);
    return;
  }

  if (redirectPath) redirect(redirectPath);
}

export async function archivePatientAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getPatientRepository();
  const apptRepo = getAppointmentRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");
  const cancelFuture = formData.get("cancelFutureSessions") === "true";

  let shouldRedirect = false;

  try {
    const existing = await repo.findById(patientId, workspaceId);
    if (!existing) return;

    if (cancelFuture) {
      const futureAppts = await apptRepo.listFutureActiveByPatient(patientId, workspaceId, now);
      for (const appt of futureAppts) {
        const canceled = cancelAppointment(appt, {
          now,
          canceledByAccountId: accountId,
          canceledBy: "THERAPIST",
        });
        await apptRepo.save(canceled);
        audit.append(
          createAppointmentAuditEvent(
            {
              type: "appointment.canceled",
              appointment: canceled,
              actor: { accountId, workspaceId },
            },
            { now, createId: generateId },
          ),
        );
      }
    }

    const archived = archivePatient(existing, {
      now,
      archivedByAccountId: accountId,
    });

    await repo.save(archived);

    audit.append(
      createPatientAuditEvent(
        {
          type: "patient.archived",
          patient: archived,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    shouldRedirect = true;
  } catch (err) {
    console.error("[archivePatientAction]", err);
    return;
  }

  if (shouldRedirect) redirect("/patients");
}

export async function recoverPatientAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  let shouldRedirect = false;

  try {
    const existing = await repo.findById(patientId, workspaceId);
    if (!existing) return;

    const recovered = recoverPatient(existing, { now });
    await repo.save(recovered);

    audit.append(
      createPatientAuditEvent(
        {
          type: "patient.recovered",
          patient: recovered,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    shouldRedirect = true;
  } catch (err) {
    console.error("[recoverPatientAction]", err);
    return;
  }

  // Return user directly to recovered patient profile (not a generic list)
  if (shouldRedirect) redirect(`/patients/${patientId}`);
}
