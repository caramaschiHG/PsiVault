import type { DocumentType, DocumentStatus } from "./model";

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

export function canExportDocumentAsPdf(_type: DocumentType): boolean {
  return true;
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

export function statusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    draft: "Rascunho",
    finalized: "Finalizado",
    signed: "Assinado",
    delivered: "Entregue",
    archived: "Arquivado",
  };
  return labels[status];
}
