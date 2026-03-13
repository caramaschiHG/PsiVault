import type { SessionRecord } from "../auth/session";
import type { AuditEventRepository } from "../audit/repository";
import { createAuditEvent, type AuditActivityItem, buildAuditActivityItem } from "../audit/events";
import { redactForLogs } from "../logging/redaction";

export interface VisibleSession {
  id: string;
  title: string;
  detail: string;
  lastSeenLabel: string;
  canRevoke: boolean;
  isCurrent: boolean;
}

interface RevokeSessionDependencies {
  now: Date;
  repository?: AuditEventRepository;
  createAuditEventId?: () => string;
}

export function buildVisibleSessionList(input: {
  sessions: SessionRecord[];
  currentSessionId?: string | null;
  now: Date;
  locale?: string;
}): VisibleSession[] {
  const formatter = new Intl.DateTimeFormat(input.locale ?? "pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return input.sessions
    .filter(
      (session) =>
        session.revokedAt === null && session.expiresAt.getTime() > input.now.getTime(),
    )
    .sort((left, right) => {
      const leftCurrent = left.id === input.currentSessionId;
      const rightCurrent = right.id === input.currentSessionId;

      if (leftCurrent !== rightCurrent) {
        return leftCurrent ? -1 : 1;
      }

      return right.lastSeenAt.getTime() - left.lastSeenAt.getTime();
    })
    .map((session) => {
      const isCurrent = session.id === input.currentSessionId;
      const surface = describeSessionSurface(session);

      return {
        id: session.id,
        title: isCurrent ? "Sessão atual" : surface,
        detail: isCurrent
          ? `${surface}. Este acesso permanece protegido enquanto você estiver trabalhando.`
          : `${surface}. Você pode encerrar este acesso se ele não fizer mais sentido.`,
        lastSeenLabel: `Última atividade em ${formatter.format(session.lastSeenAt)}`,
        canRevoke: !isCurrent,
        isCurrent,
      };
    });
}

export function revokeSessionAccess(
  input: {
    sessions: SessionRecord[];
    sessionId: string;
    currentSessionId?: string | null;
    actingAccountId: string;
    workspaceId: string;
  },
  deps: RevokeSessionDependencies,
) {
  const target = input.sessions.find((session) => session.id === input.sessionId);

  if (!target) {
    return {
      status: "not_found" as const,
      sessions: input.sessions,
      auditEvent: null,
    };
  }

  if (target.workspaceId !== input.workspaceId || target.accountId !== input.actingAccountId) {
    return {
      status: "forbidden" as const,
      sessions: input.sessions,
      auditEvent: null,
    };
  }

  if (target.id === input.currentSessionId) {
    return {
      status: "blocked" as const,
      sessions: input.sessions,
      auditEvent: null,
    };
  }

  if (target.revokedAt) {
    return {
      status: "already_revoked" as const,
      sessions: input.sessions,
      auditEvent: null,
    };
  }

  const nextSessions = input.sessions.map((session) =>
    session.id === target.id
      ? {
          ...session,
          revokedAt: deps.now,
          updatedAt: deps.now,
        }
      : session,
  );
  const auditEvent = createAuditEvent(
    {
      type: "security.session.revoked",
      actor: {
        accountId: input.actingAccountId,
        workspaceId: input.workspaceId,
        sessionId: input.currentSessionId,
      },
      subject: {
        kind: "session",
        id: target.id,
        label: describeSessionSurface(target),
      },
      summary: "Sessão encerrada manualmente nas configurações de segurança.",
      metadata: {
        sessionToken: target.sessionToken,
        ipAddress: target.ipAddress,
        userAgent: target.userAgent,
      },
    },
    {
      now: deps.now,
      createId: deps.createAuditEventId,
      redact: redactForLogs,
    },
  );

  deps.repository?.append(auditEvent);

  return {
    status: "revoked" as const,
    sessions: nextSessions,
    auditEvent,
  };
}

export function buildSecurityActivityItems(events: Parameters<typeof buildAuditActivityItem>[0][]) {
  return events.map((event) => buildAuditActivityItem(event));
}

function describeSessionSurface(session: Pick<SessionRecord, "userAgent">) {
  const agent = session.userAgent?.toLowerCase() ?? "";
  const device = agent.includes("iphone")
    ? "iPhone"
    : agent.includes("android")
      ? "Celular Android"
      : agent.includes("mac")
        ? "Mac"
        : agent.includes("windows")
          ? "Computador Windows"
          : "Dispositivo confiável";
  const browser = agent.includes("edg")
    ? "Edge"
    : agent.includes("chrome")
      ? "Chrome"
      : agent.includes("firefox")
        ? "Firefox"
        : agent.includes("safari")
          ? "Safari"
          : "navegador";

  return `${device} com ${browser}`;
}
