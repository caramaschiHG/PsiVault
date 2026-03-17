"use server";

/**
 * Search server action — aggregates all searchable data and delegates to
 * the pure searchAll function.
 *
 * Security note: This is a read-only query action. revalidatePath is NOT
 * called. "use server" is the correct Next.js 15 pattern for client-called
 * data fetching via server actions (established pattern from RESEARCH.md).
 *
 * Workspace stub: WORKSPACE_ID is hardcoded to "ws_1" for in-memory MVP.
 * Production replacement: derive workspaceId from session context.
 */

import { searchAll } from "@/lib/search/search";
import type { SearchResultItem } from "@/lib/search/search";
import { getPatientRepository } from "@/lib/patients/store";
import { getAppointmentRepository } from "@/lib/appointments/store";
import { getDocumentRepository } from "@/lib/documents/store";
import { getFinanceRepository } from "@/lib/finance/store";

const WORKSPACE_ID = "ws_1"; // stub — replace with session in production

export async function searchAllAction(query: string): Promise<SearchResultItem[]> {
  const patientRepo = getPatientRepository();
  const appointmentRepo = getAppointmentRepository();
  const documentRepo = getDocumentRepository();
  const chargeRepo = getFinanceRepository();

  // Load all patients (active + archived)
  const [activePatients, archivedPatients] = await Promise.all([
    patientRepo.listActive(WORKSPACE_ID),
    patientRepo.listArchived(WORKSPACE_ID),
  ]);
  const allPatients = [...activePatients, ...archivedPatients];

  // Load all appointments using a wide date range stub
  // (no listAll method available — use wide date range)
  const appointments = await appointmentRepo.listByDateRange(
    WORKSPACE_ID,
    new Date(2020, 0, 1),
    new Date(2030, 11, 31),
  );

  // Load all documents by iterating over all patients (Asynchronous)
  const documentsResults = await Promise.all(
    allPatients.map((p) => documentRepo.listByPatient(p.id, WORKSPACE_ID)),
  );
  const documents = documentsResults.flat();

  // Load all charges by iterating over all patients (Synchronous)
  const charges = allPatients.flatMap((p) =>
    chargeRepo.listByPatient(p.id, WORKSPACE_ID),
  );

  return searchAll({
    query,
    workspaceId: WORKSPACE_ID,
    patients: allPatients,
    appointments,
    clinicalNotes: [], // clinical notes excluded from search per plan scope (SECU-05)
    documents,
    charges,
  });
}
