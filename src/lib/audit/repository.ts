import type { AuditEvent } from "./events";

export interface AuditEventRepository {
  append(event: AuditEvent): AuditEvent;
  listForWorkspace(workspaceId: string): AuditEvent[];
}

export function createInMemoryAuditRepository(seed: AuditEvent[] = []): AuditEventRepository {
  const events = [...seed];

  return {
    append(event) {
      events.unshift(event);

      return event;
    },
    listForWorkspace(workspaceId) {
      return events.filter((event) => event.actor.workspaceId === workspaceId);
    },
  };
}
