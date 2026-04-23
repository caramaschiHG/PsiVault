"use server";

/**
 * Search server action — aggregates all searchable data and delegates to
 * the pure searchAll function.
 *
 * Security note: This is a read-only query action. revalidatePath is NOT
 * called. "use server" is the correct Next.js 15 pattern for client-called
 * data fetching via server actions (established pattern from RESEARCH.md).
 *
 * Workspace: resolved from authenticated session via resolveSession().
 */

import { searchAll } from "@/lib/search/search";
import type { SearchResultItem } from "@/lib/search/search";
import { getPatientRepository } from "@/lib/patients/store";
import { getAppointmentRepository } from "@/lib/appointments/store";
import { getDocumentRepository } from "@/lib/documents/store";
import { getFinanceRepository } from "@/lib/finance/store";
import { resolveSession } from "@/lib/supabase/session";

export async function searchAllAction(query: string): Promise<SearchResultItem[]> {
  const { workspaceId } = await resolveSession();
  const patientRepo = getPatientRepository();
  const appointmentRepo = getAppointmentRepository();
  const documentRepo = getDocumentRepository();
  const chargeRepo = getFinanceRepository();

  // Load matching patients via database search (PERF-06)
  const allPatients = await patientRepo.searchByName(workspaceId, query);

  // Load all appointments using a wide date range stub
  // (no listAll method available — use wide date range)
  // Cap date range to avoid loading excessive data; extends as needed.
  const appointments = await appointmentRepo.listByDateRange(
    workspaceId,
    new Date(2020, 0, 1),
    new Date(2027, 11, 31),
  );

  // Load all documents by iterating over all patients (Asynchronous)
  const documentsResults = await Promise.all(
    allPatients.map((p) => documentRepo.listByPatient(p.id, workspaceId)),
  );
  const documents = documentsResults.flat();

  // Load all charges by iterating over all patients (Asynchronous)
  const chargesResults = await Promise.all(
    allPatients.map((p) => chargeRepo.listByPatient(p.id, workspaceId)),
  );
  const charges = chargesResults.flat();

  return searchAll({
    query,
    workspaceId,
    patients: allPatients,
    appointments,
    clinicalNotes: [], // clinical notes excluded from search per plan scope (SECU-05)
    documents,
    charges,
  });
}
