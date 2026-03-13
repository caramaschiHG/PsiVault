export interface AuditActor {
  accountId: string;
  workspaceId: string;
  sessionId?: string | null;
  displayName?: string | null;
}

export interface AuditSubject {
  kind: string;
  id: string;
  label?: string | null;
}

export interface AuditEvent {
  id: string;
  type: string;
  occurredAt: Date;
  actor: AuditActor;
  subject?: AuditSubject;
  summary: string;
  metadata: Record<string, unknown>;
}

interface CreateAuditEventDependencies {
  now: Date;
  createId?: () => string;
  redact?: (value: unknown) => unknown;
}

function createOpaqueId() {
  const buffer = new Uint8Array(12);
  globalThis.crypto.getRandomValues(buffer);

  return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
}

function normalizeSummary(summary: string) {
  return summary.trim().replace(/\s+/g, " ");
}

export function createAuditEvent(
  input: {
    type: string;
    actor: AuditActor;
    subject?: AuditSubject;
    summary: string;
    metadata?: Record<string, unknown>;
  },
  deps: CreateAuditEventDependencies,
): AuditEvent {
  const createId = deps.createId ?? createOpaqueId;
  const redact = deps.redact ?? ((value: unknown) => value);
  const metadata = redact(input.metadata ?? {});

  return {
    id: createId(),
    type: input.type,
    occurredAt: deps.now,
    actor: input.actor,
    subject: input.subject,
    summary: normalizeSummary(input.summary),
    metadata:
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : {},
  };
}

export function describeAuditEvent(event: AuditEvent) {
  if (event.type === "security.session.revoked") {
    if (event.subject?.label) {
      return `Você encerrou a sessão “${event.subject.label}”.`;
    }

    return "Você encerrou uma sessão ativa.";
  }

  return event.summary;
}

export interface AuditActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAtLabel: string;
}

export function buildAuditActivityItem(event: AuditEvent, locale = "pt-BR"): AuditActivityItem {
  const title =
    event.type === "security.session.revoked"
      ? "Sessão encerrada"
      : event.type === "security.sensitive_action.reauth_confirmed"
        ? "Confirmação reforçada"
        : "Atividade registrada";

  return {
    id: event.id,
    title,
    description: describeAuditEvent(event),
    occurredAtLabel: new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(event.occurredAt),
  };
}
