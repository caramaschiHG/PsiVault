/**
 * PracticeDocument lifecycle audit helpers.
 *
 * Plugs into the Phase 1 audit contract (createAuditEvent) so document events
 * share the same shape as patient and appointment events.
 *
 * Security policy (SECU-05):
 * - Document content must NEVER appear in audit metadata.
 * - Only documentType is included in metadata for traceability.
 */

import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { PracticeDocument } from "./model";

export type DocumentAuditEventType =
  | "document.created"
  | "document.updated"
  | "document.archived";

interface CreateDocumentAuditEventInput {
  type: DocumentAuditEventType;
  document: PracticeDocument;
  actor: AuditActor;
}

interface CreateDocumentAuditEventDeps {
  now: Date;
  createId: () => string;
}

const AUDIT_SUMMARIES: Record<DocumentAuditEventType, string> = {
  "document.created": "Documento criado.",
  "document.updated": "Documento editado.",
  "document.archived": "Documento arquivado.",
};

export function createDocumentAuditEvent(
  input: CreateDocumentAuditEventInput,
  deps: CreateDocumentAuditEventDeps,
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: {
        kind: "practice_document",
        id: input.document.id,
      },
      summary: AUDIT_SUMMARIES[input.type],
      // SECU-05: only documentType in metadata — never document content
      metadata: {
        documentType: input.document.type,
      },
    },
    {
      now: deps.now,
      createId: deps.createId,
    },
  );
}
