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
import { createInMemoryAuditRepository } from "../../../lib/audit/repository";

// Module-level audit repository (Phase 1 pattern)
declare global {
  // eslint-disable-next-line no-var
  var __psivaultPatientAudit__: ReturnType<typeof createInMemoryAuditRepository> | undefined;
}

function getAuditRepository() {
  globalThis.__psivaultPatientAudit__ ??= createInMemoryAuditRepository();
  return globalThis.__psivaultPatientAudit__;
}

// Stub — real workspace resolution comes from session in production
const DEFAULT_WORKSPACE_ID = "ws_1";
const DEFAULT_ACCOUNT_ID = "acct_1";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "pat_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function createPatientAction(formData: FormData) {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();

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

  repo.save(patient);

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

  redirect(`/patients/${patient.id}`);
}

export async function updatePatientAction(formData: FormData) {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  const existing = repo.findById(patientId, DEFAULT_WORKSPACE_ID);
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

  repo.save(updated);

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

  redirect(`/patients/${patientId}`);
}

export async function archivePatientAction(formData: FormData) {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  const existing = repo.findById(patientId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const archived = archivePatient(existing, {
    now,
    archivedByAccountId: DEFAULT_ACCOUNT_ID,
  });

  repo.save(archived);

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

  redirect("/patients");
}

export async function recoverPatientAction(formData: FormData) {
  const repo = getPatientRepository();
  const audit = getAuditRepository();
  const now = new Date();
  const patientId = String(formData.get("patientId") ?? "");

  const existing = repo.findById(patientId, DEFAULT_WORKSPACE_ID);
  if (!existing) return;

  const recovered = recoverPatient(existing, { now });
  repo.save(recovered);

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

  // Return user directly to recovered patient profile (not a generic list)
  redirect(`/patients/${patientId}`);
}
