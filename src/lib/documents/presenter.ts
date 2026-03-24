import type { DocumentType } from "./model";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  declaration_of_attendance: "Declaração de Comparecimento",
  receipt: "Recibo de Pagamento",
  anamnesis: "Anamnese",
  psychological_report: "Laudo Psicológico",
  consent_and_service_contract: "Contrato de Prestação de Serviços",
  session_note: "Evolução de Sessão",
  session_record: "Registro de Sessão",
  referral_letter: "Carta de Encaminhamento",
  patient_record_summary: "Resumo de Prontuário",
};

export function canExportDocumentAsPdf(type: DocumentType): boolean {
  return type === "patient_record_summary";
}

export function isPrivateDocumentType(type: DocumentType): boolean {
  return type === "session_record";
}

export function canShareDocument(type: DocumentType): boolean {
  return !isPrivateDocumentType(type);
}

export function canIncludeDocumentInPatientExports(type: DocumentType): boolean {
  return !isPrivateDocumentType(type);
}
