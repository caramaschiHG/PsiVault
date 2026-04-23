/**
 * GET /api/backup
 *
 * Full workspace backup (SECU-04).
 * Returns all workspace data as a downloadable JSON file.
 *
 * Re-auth gate: Checks for "psivault_backup_auth" cookie set by
 * confirmBackupAuthAction. Cookie carries Max-Age of 10 minutes (httpOnly).
 * If absent (expired or never set), returns 401.
 */

import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getPatientRepository } from "../../../lib/patients/store";
import { getAppointmentRepository } from "../../../lib/appointments/store";
import { getClinicalNoteRepository } from "../../../lib/clinical/store";
import { getDocumentRepository } from "../../../lib/documents/store";
import { getFinanceRepository } from "../../../lib/finance/store";
import { getAuditRepository } from "../../../lib/audit/store";
import { buildWorkspaceBackup } from "../../../lib/export/serializer";
import { resolveSession } from "../../../lib/supabase/session";

export async function GET(
  _request: NextRequest,
) {
  // ── Re-auth gate ────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("psivault_backup_auth");

  if (!authCookie?.value) {
    return Response.json(
      { error: "Não autorizado." },
      { status: 401 },
    );
  }

  const { workspaceId } = await resolveSession();

  // ── Load all workspace data ─────────────────────────────────────────────
  const patientRepo = getPatientRepository();
  const appointmentRepo = getAppointmentRepository();
  const clinicalRepo = getClinicalNoteRepository();
  const docRepo = getDocumentRepository();
  const financeRepo = getFinanceRepository();

  const patients = await patientRepo.listAllByWorkspace(workspaceId);

  // Load all appointments (Asynchronous)
  const appointmentsResults = await Promise.all(patients.map((p) =>
    appointmentRepo.listByPatient(p.id, workspaceId),
  ));
  const appointments = appointmentsResults.flat();

  // Load clinical notes per patient (Asynchronous)
  const clinicalNotesResults = await Promise.all(patients.map((p) =>
    clinicalRepo.listByPatient(p.id, workspaceId),
  ));
  const clinicalNotes = clinicalNotesResults.flat();
  const documentsResults = await Promise.all(patients.map((p) =>
    docRepo.listByPatient(p.id, workspaceId),
  ));
  const documents = documentsResults.flat();
  const chargesResults = await Promise.all(patients.map((p) => financeRepo.listByPatient(p.id, workspaceId)));
  const charges = chargesResults.flat();

  const auditRepo = getAuditRepository();
  const auditEvents = await auditRepo.listForWorkspace(workspaceId);

  // ── Build and return backup ─────────────────────────────────────────────
  const backupData = buildWorkspaceBackup({
    workspaceId: workspaceId,
    patients,
    appointments,
    clinicalNotes,
    documents,
    charges,
    auditEvents,
    now: new Date(),
  });

  const json = JSON.stringify(backupData, null, 2);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="psivault-backup-${date}.json"`,
    },
  });
}
