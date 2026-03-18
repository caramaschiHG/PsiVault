/**
 * GET /api/export/patient/[patientId]
 *
 * Per-patient JSON export (SECU-03).
 * Returns all records for the specified patient as a downloadable JSON file.
 *
 * Re-auth gate: Checks for "psivault_export_auth" cookie set by
 * exportPatientAuthAction. Cookie carries Max-Age of 10 minutes (httpOnly).
 * If absent (expired or never set), returns 401.
 */

import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getPatientRepository } from "../../../../../lib/patients/store";
import { getAppointmentRepository } from "../../../../../lib/appointments/store";
import { getClinicalNoteRepository } from "../../../../../lib/clinical/store";
import { getDocumentRepository } from "../../../../../lib/documents/store";
import { getFinanceRepository } from "../../../../../lib/finance/store";
import { buildPatientExport } from "../../../../../lib/export/serializer";

const WORKSPACE_ID = "ws_1";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  // ── Re-auth gate ────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("psivault_export_auth");

  if (!authCookie?.value) {
    return Response.json(
      { error: "Não autorizado." },
      { status: 401 },
    );
  }

  // ── Load patient ────────────────────────────────────────────────────────
  const { patientId } = await params;
  const patientRepo = getPatientRepository();
  const patient = await patientRepo.findById(patientId, WORKSPACE_ID);

  if (!patient) {
    return Response.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  // ── Load all patient-scoped data ────────────────────────────────────────
  const appointmentRepo = getAppointmentRepository();
  const clinicalRepo = getClinicalNoteRepository();
  const docRepo = getDocumentRepository();
  const financeRepo = getFinanceRepository();

  const appointments = await appointmentRepo.listByPatient(patientId, WORKSPACE_ID);
  const clinicalNotes = await clinicalRepo.listByPatient(patientId, WORKSPACE_ID);
  const documents = await docRepo.listActiveByPatient(patientId, WORKSPACE_ID);
  const charges = await financeRepo.listByPatient(patientId, WORKSPACE_ID);

  // ── Build and return export ─────────────────────────────────────────────
  const exportData = buildPatientExport({
    patient,
    appointments,
    clinicalNotes,
    documents,
    charges,
    now: new Date(),
  });

  const json = JSON.stringify(exportData, null, 2);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="paciente-${patientId}-${date}.json"`,
    },
  });
}
