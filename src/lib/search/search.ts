/**
 * Global search pure function.
 *
 * Security policy (SECU-05):
 * - SearchResultItem must NEVER contain clinical content (freeText, demand,
 *   observedMood, clinicalEvolution, nextSteps) or financial details
 *   (amountInCents, paymentMethod) or document body (content).
 * - Session search matches on patient name only — clinical note content is
 *   never used as a search index.
 *
 * API contract (from tests/search-domain.test.ts):
 * - Accepts a flat SearchInput with all domain data; returns a flat SearchResultItem[].
 * - Empty or whitespace-only query returns [].
 * - Each result has at minimum: id, type, label.
 * - Results are capped at 10 per domain before being merged into the flat array.
 */

import type { Patient } from "../patients/model";
import type { Appointment } from "../appointments/model";
import type { ClinicalNote } from "../clinical/model";
import type { PracticeDocument, DocumentType } from "../documents/model";
import type { SessionCharge, ChargeStatus } from "../finance/model";

// ─── types ───────────────────────────────────────────────────────────────────

export type SearchDomain = "patient" | "session" | "document" | "charge";

/**
 * A single search result item.
 *
 * SECU-05 enforcement: This type deliberately omits freeText, demand,
 * observedMood, clinicalEvolution, nextSteps, amountInCents, paymentMethod,
 * and document content. Any attempt to add those fields is a security violation.
 */
export interface SearchResultItem {
  id: string;
  type: SearchDomain;
  patientName: string;
  label: string;
  href: string;
  date?: string; // ISO date string — present for sessions, documents, charges
}

export interface SearchInput {
  query: string;
  workspaceId: string;
  patients: Patient[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[]; // accepted for API compatibility; NOT used for search indexing (SECU-05)
  documents: PracticeDocument[];
  charges: SessionCharge[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDatePtBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function translateDocumentType(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    declaration_of_attendance: "Declaração de comparecimento",
    receipt: "Recibo",
    anamnesis: "Anamnese",
    psychological_report: "Laudo psicológico",
    consent_and_service_contract: "Contrato e consentimento",
    session_note: "Evolução de sessão",
    session_record: "Registro de sessão",
    referral_letter: "Carta de encaminhamento",
    patient_record_summary: "Resumo de prontuário",
  };
  return labels[type] ?? type;
}

function translateChargeStatus(status: ChargeStatus): string {
  const labels: Record<ChargeStatus, string> = {
    pendente: "pendente",
    pago: "pago",
    atrasado: "atrasado",
  };
  return labels[status] ?? status;
}

const CAP = 10;

// ─── searchAll ───────────────────────────────────────────────────────────────

/**
 * Pure search function — no side effects, no repository calls.
 *
 * Returns a flat array of SearchResultItem, capped at 10 per domain.
 * Empty or whitespace-only query always returns [].
 */
export function searchAll(input: SearchInput): SearchResultItem[] {
  const { query, patients, appointments, documents, charges } = input;

  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Build a patient lookup map for O(1) access in session/document/charge filters.
  const patientMap = new Map<string, Patient>(patients.map((p) => [p.id, p]));

  // ── patient results ─────────────────────────────────────────────────────
  const patientResults: SearchResultItem[] = patients
    .filter((p) => p.fullName.toLowerCase().includes(q))
    .slice(0, CAP)
    .map((p) => ({
      id: p.id,
      type: "patient" as const,
      patientName: p.fullName,
      label: "Paciente",
      href: `/patients/${p.id}`,
    }));

  // ── session results ─────────────────────────────────────────────────────
  // Match on patient name only — clinical content never used (SECU-05)
  const sessionResults: SearchResultItem[] = appointments
    .filter((a) => {
      const patient = patientMap.get(a.patientId);
      return patient?.fullName.toLowerCase().includes(q) ?? false;
    })
    .slice(0, CAP)
    .map((a) => {
      const patient = patientMap.get(a.patientId);
      return {
        id: a.id,
        type: "session" as const,
        patientName: patient?.fullName ?? "",
        label: `Sessão — ${formatDatePtBR(a.startsAt)}`,
        href: `/appointments/${a.id}`,
        date: a.startsAt.toISOString(),
      };
    });

  // ── document results ────────────────────────────────────────────────────
  // Match on patient name or document type label — document content never used (SECU-05)
  const documentResults: SearchResultItem[] = documents
    .filter((d) => {
      const patient = patientMap.get(d.patientId);
      const nameMatch = patient?.fullName.toLowerCase().includes(q) ?? false;
      const typeMatch = translateDocumentType(d.type).toLowerCase().includes(q);
      return nameMatch || typeMatch;
    })
    .slice(0, CAP)
    .map((d) => {
      const patient = patientMap.get(d.patientId);
      return {
        id: d.id,
        type: "document" as const,
        patientName: patient?.fullName ?? "",
        label: translateDocumentType(d.type),
        href: `/patients/${d.patientId}/documents/${d.id}`,
        date: d.createdAt.toISOString(),
      };
    });

  // ── charge results ──────────────────────────────────────────────────────
  // Match on patient name only — amounts and payment methods never exposed (SECU-05)
  const chargeResults: SearchResultItem[] = charges
    .filter((c) => {
      const patient = patientMap.get(c.patientId);
      return patient?.fullName.toLowerCase().includes(q) ?? false;
    })
    .slice(0, CAP)
    .map((c) => {
      const patient = patientMap.get(c.patientId);
      return {
        id: c.id,
        type: "charge" as const,
        patientName: patient?.fullName ?? "",
        label: `Cobrança ${translateChargeStatus(c.status)}`,
        href: `/patients/${c.patientId}#finance`,
        date: c.createdAt.toISOString(),
      };
    });

  return [...patientResults, ...sessionResults, ...documentResults, ...chargeResults];
}

// ─── grouped results helper (for SearchBar dropdown) ─────────────────────────

export interface SearchResults {
  patients: SearchResultItem[];
  sessions: SearchResultItem[];
  documents: SearchResultItem[];
  charges: SearchResultItem[];
}

/**
 * Convert a flat SearchResultItem[] into grouped SearchResults for the dropdown UI.
 * Called by the SearchBar component after receiving results from searchAllAction.
 */
export function groupSearchResults(items: SearchResultItem[]): SearchResults {
  return {
    patients: items.filter((i) => i.type === "patient"),
    sessions: items.filter((i) => i.type === "session"),
    documents: items.filter((i) => i.type === "document"),
    charges: items.filter((i) => i.type === "charge"),
  };
}
