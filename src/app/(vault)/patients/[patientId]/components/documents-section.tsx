/**
 * DocumentsSection — redesigned: chronological timeline with status badges and filters.
 *
 * Design principles:
 * - Chronological order (most recent first)
 * - Status badges with color coding
 * - Quick filters by status
 * - Inline actions per document state
 * - Empty state with clear CTA
 */

import Link from "next/link";
import type { PracticeDocument } from "../../../../../lib/documents/model";
import type { AppointmentCareMode } from "../../../../../lib/appointments/model";
import { EmptyState } from "../../../components/empty-state";
import { DocumentTimeline } from "./document-timeline";

interface DocumentsSectionProps {
  documents: PracticeDocument[];
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  appointmentMap?: Record<string, { startsAt: Date; careMode: AppointmentCareMode }>;
}

export function DocumentsSection({ documents, patientId, patientName, appointmentMap }: DocumentsSectionProps) {
  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "0.72rem", color: "var(--color-brown-mid)" }}>Documentos clínicos</p>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Documentos</h2>
        </div>
        <Link href={`/patients/${patientId}/documents/new`} style={{
          fontSize: "0.85rem", fontWeight: 500, color: "var(--color-accent)", textDecoration: "none",
          padding: "0.35rem 0.85rem", borderRadius: "var(--radius-pill)",
          border: "1px solid rgba(146,64,14,0.3)", background: "rgba(255,247,237,0.6)",
        }}>
          Novo documento +
        </Link>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}
          title="Nenhum documento gerado ainda"
          description="Crie declarações, recibos, laudos e registros privados para este paciente."
          actionLabel="Novo documento"
          actionHref={`/patients/${patientId}/documents/new`}
        />
      ) : (
        <DocumentTimeline
          documents={documents}
          patientId={patientId}
          patientName={patientName}
          appointments={appointmentMap}
        />
      )}
    </section>
  );
}
