/**
 * GET /api/backup
 *
 * Full workspace backup (SECU-04).
 * Returns all workspace data as a downloadable JSON file.
 *
 * Re-auth gate (v1 stub): Checks for "psivault_backup_auth" cookie set by
 * confirmBackupAuthAction. If absent or older than 10 minutes, returns 401.
 * Production: replace cookie check with evaluateSensitiveAction from real session.
 */

import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getPatientRepository } from "../../../lib/patients/store";
import { getAppointmentRepository } from "../../../lib/appointments/store";
import { getClinicalNoteRepository } from "../../../lib/clinical/store";
import { getDocumentRepository } from "../../../lib/documents/store";
import { getFinanceRepository } from "../../../lib/finance/store";
import { buildWorkspaceBackup } from "../../../lib/export/serializer";

const WORKSPACE_ID = "ws_1";
const REAUTH_WINDOW_MS = 1000 * 60 * 10; // 10 minutes

export async function GET(
  _request: NextRequest,
) {
  // ── Re-auth gate (v1 stub) ──────────────────────────────────────────────
  // Production: replace with evaluateSensitiveAction from real session.
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("psivault_backup_auth");

  if (!authCookie?.value) {
    return Response.json(
      { error: "Re-autenticação necessária" },
      { status: 401 },
    );
  }

  const issuedAt = parseInt(authCookie.value, 10);
  if (isNaN(issuedAt) || Date.now() - issuedAt > REAUTH_WINDOW_MS) {
    return Response.json(
      { error: "Re-autenticação necessária" },
      { status: 401 },
    );
  }

  // ── Load all workspace data ─────────────────────────────────────────────
  const patientRepo = getPatientRepository();
  const appointmentRepo = getAppointmentRepository();
  const clinicalRepo = getClinicalNoteRepository();
  const docRepo = getDocumentRepository();
  const financeRepo = getFinanceRepository();

  const [activePatients, archivedPatients] = await Promise.all([
    patientRepo.listActive(WORKSPACE_ID),
    patientRepo.listArchived(WORKSPACE_ID),
  ]);
  const patients = [...activePatients, ...archivedPatients];

  // Load all appointments (Asynchronous)
  const appointmentsResults = await Promise.all(patients.map((p) =>
    appointmentRepo.listByPatient(p.id, WORKSPACE_ID),
  ));
  const appointments = appointmentsResults.flat();

  // Load clinical notes per patient (Asynchronous)
  const clinicalNotesResults = await Promise.all(patients.map((p) =>
    clinicalRepo.listByPatient(p.id, WORKSPACE_ID),
  ));
  const clinicalNotes = clinicalNotesResults.flat();
  const documentsResults = await Promise.all(patients.map((p) =>
    docRepo.listByPatient(p.id, WORKSPACE_ID),
  ));
  const documents = documentsResults.flat();
  const charges = patients.flatMap((p) =>
    financeRepo.listByPatient(p.id, WORKSPACE_ID),
  );

  // Audit events: in-memory v1 does not maintain a global singleton audit store.
  // Production: replace with getAuditRepository().listForWorkspace(WORKSPACE_ID).
  const auditEvents: never[] = [];

  // ── Build and return backup ─────────────────────────────────────────────
  const backupData = buildWorkspaceBackup({
    workspaceId: WORKSPACE_ID,
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
