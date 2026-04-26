"use client";

/**
 * PatientDocumentosTab — "Documentos" tab content.
 * Shows: documents list with "New document" link.
 */

import type { PracticeDocument } from "@/lib/documents/model";
import type { AppointmentCareMode } from "@/lib/appointments/model";
import { DocumentsSection } from "./documents-section";

interface PatientDocumentosTabProps {
  documents: PracticeDocument[];
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  appointmentMap?: Record<string, { startsAt: Date; careMode: AppointmentCareMode }>;
}

export function PatientDocumentosTab({
  documents,
  patientId,
  patientName,
  patientPhone,
  appointmentMap,
}: PatientDocumentosTabProps) {
  return (
    <DocumentsSection
      documents={documents}
      patientId={patientId}
      patientName={patientName}
      patientPhone={patientPhone}
      appointmentMap={appointmentMap}
    />
  );
}
