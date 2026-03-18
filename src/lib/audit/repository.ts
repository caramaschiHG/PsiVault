import type { AuditEvent } from "./events";

export interface AuditEventRepository {
  append(event: AuditEvent): AuditEvent;
  listForWorkspace(workspaceId: string): Promise<AuditEvent[]>;
}

export function createInMemoryAuditRepository(seed: AuditEvent[] = []): AuditEventRepository {
  const events = [...seed];

  return {
    append(event) {
      events.unshift(event);

      return event;
    },
    listForWorkspace(workspaceId) {
      return Promise.resolve(events.filter((event) => event.actor.workspaceId === workspaceId));
    },
  };
}
