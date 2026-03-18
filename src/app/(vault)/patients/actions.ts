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

// Stub — real workspace resolution comes from session in production
const DEFAULT_WORKSPACE_ID = "ws_1";
const DEFAULT_ACCOUNT_ID = "acct_1";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "pat_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function createPatientAction(formData: FormData): Promise<{ ok: boolean; error?: string } | void> {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();

  let createdPatientId: string | null = null;

  try {
    const patient = createPatient(
      {
        workspaceId: DEFAULT_WORKSPACE_ID,
        fullName: String(formData.get("fullName") ?? ""),
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
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );

    createdPatientId = patient.id;
  } catch (err) {
    console.error("[createPatientAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }

  if (createdPatientId) redirect(`/patients/${createdPatientId}`);
}

export async function updatePatientAction(formData: FormData): Promise<{ ok: boolean; error?: string } | void> {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  let redirectPath: string | null = null;

  try {
    const existing = await repo.findById(patientId, DEFAULT_WORKSPACE_ID);
    if (!existing) return;

    const updated = updatePatient(
      existing,
      {
        fullName: String(formData.get("fullName") ?? ""),
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
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );

    redirectPath = `/patients/${patientId}`;
  } catch (err) {
    console.error("[updatePatientAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }

  if (redirectPath) redirect(redirectPath);
}

export async function archivePatientAction(formData: FormData): Promise<{ ok: boolean; error?: string } | void> {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  let shouldRedirect = false;

  try {
    const existing = await repo.findById(patientId, DEFAULT_WORKSPACE_ID);
    if (!existing) return;

    const archived = archivePatient(existing, {
      now,
      archivedByAccountId: DEFAULT_ACCOUNT_ID,
    });

    await repo.save(archived);

    audit.append(
      createPatientAuditEvent(
        {
          type: "patient.archived",
          patient: archived,
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );

    shouldRedirect = true;
  } catch (err) {
    console.error("[archivePatientAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }

  if (shouldRedirect) redirect("/patients");
}

export async function recoverPatientAction(formData: FormData): Promise<{ ok: boolean; error?: string } | void> {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  let shouldRedirect = false;

  try {
    const existing = await repo.findById(patientId, DEFAULT_WORKSPACE_ID);
    if (!existing) return;

    const recovered = recoverPatient(existing, { now });
    await repo.save(recovered);

    audit.append(
      createPatientAuditEvent(
        {
          type: "patient.recovered",
          patient: recovered,
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );

    shouldRedirect = true;
  } catch (err) {
    console.error("[recoverPatientAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }

  // Return user directly to recovered patient profile (not a generic list)
  if (shouldRedirect) redirect(`/patients/${patientId}`);
}
