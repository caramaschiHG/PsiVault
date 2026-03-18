import { db } from "../db";
import { Prisma } from "@prisma/client";
import type { AuditEvent } from "./events";
import type { AuditEventRepository } from "./repository";
import type { AuditEvent as PrismaAuditEvent } from "@prisma/client";

function mapToDomain(e: PrismaAuditEvent): AuditEvent {
  return {
    id: e.id,
    type: e.type,
    occurredAt: e.occurredAt,
    actor: {
      accountId: e.actorAccountId,
      workspaceId: e.workspaceId,
      sessionId: e.actorSessionId,
      displayName: e.actorDisplayName,
    },
    subject:
      e.subjectKind != null && e.subjectId != null
        ? { kind: e.subjectKind, id: e.subjectId, label: e.subjectLabel }
        : undefined,
    summary: e.summary,
    metadata: (e.metadata as Record<string, unknown>) ?? {},
  };
}

export function createPrismaAuditRepository(): AuditEventRepository {
  return {
    append(event: AuditEvent): AuditEvent {
      // Fire-and-forget async write — returns synchronously to satisfy interface.
      // Audit failures must not block or fail the primary action (SECU-05).
      void db.auditEvent.create({
        data: {
          id: event.id,
          workspaceId: event.actor.workspaceId,
          type: event.type,
          occurredAt: event.occurredAt,
          actorAccountId: event.actor.accountId,
          actorSessionId: event.actor.sessionId ?? null,
          actorDisplayName: event.actor.displayName ?? null,
          subjectKind: event.subject?.kind ?? null,
          subjectId: event.subject?.id ?? null,
          subjectLabel: event.subject?.label ?? null,
          summary: event.summary,
          metadata: event.metadata as Prisma.JsonObject,
        },
      });
      return event;
    },

    async listForWorkspace(workspaceId: string): Promise<AuditEvent[]> {
      const events = await db.auditEvent.findMany({
        where: { workspaceId },
        orderBy: { occurredAt: "desc" },
      });
      return events.map(mapToDomain);
    },
  };
}
