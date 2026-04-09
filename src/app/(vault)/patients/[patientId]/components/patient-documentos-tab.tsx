"use client";

/**
 * PatientDocumentosTab — "Documentos" tab content.
 * Shows: documents list with "New document" link.
 */

import type { PracticeDocument } from "@/lib/documents/model";
import { DocumentsSection } from "./documents-section";

interface PatientDocumentosTabProps {
  documents: PracticeDocument[];
  patientId: string;
  patientName: string;
  patientPhone: string | null;
}

export function PatientDocumentosTab({
  documents,
  patientId,
  patientName,
  patientPhone,
}: PatientDocumentosTabProps) {
  return (
    <DocumentsSection
      documents={documents}
      patientId={patientId}
      patientName={patientName}
      patientPhone={patientPhone}
    />
  );
}
