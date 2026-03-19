import { createSession } from "../../../../lib/auth/session";
import { createAuditEvent } from "../../../../lib/audit/events";
import { createInMemoryAuditRepository } from "../../../../lib/audit/repository";
import {
  buildSecurityActivityItems,
  buildVisibleSessionList,
  revokeSessionAccess,
} from "../../../../lib/security/session-control";
import { redactForLogs } from "../../../../lib/logging/redaction";
import { ActivityFeed } from "./components/activity-feed";
import { SessionList } from "./components/session-list";
import { resolveSession } from "../../../../lib/supabase/session";

export default async function SecuritySettingsPage() {
  const model = await buildSecurityPageModel();

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Segurança e confiança</p>
        <h1 style={titleStyle}>Controles calmos para manter o vault sob controle</h1>
        <p style={copyStyle}>
          Veja onde o vault está aberto, encerre sessões antigas e acompanhe ações sensíveis em linguagem simples.
        </p>
      </section>

      <section style={gridStyle}>
        <SessionList sessions={model.sessions} />
        <ActivityFeed items={model.activity} />
      </section>
    </main>
  );
}

async function buildSecurityPageModel() {
  const { accountId, workspaceId } = await resolveSession();
  const now = new Date("2026-03-13T14:30:00.000Z");
  const currentSession = {
    ...createSession(
      {
        accountId: accountId,
        workspaceId: workspaceId,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36",
      },
      {
        now: new Date("2026-03-13T14:00:00.000Z"),
        createId: () => "sess_current",
        createToken: () => "sess_current_token",
      },
    ),
    lastSeenAt: new Date("2026-03-13T14:25:00.000Z"),
  };
  const mobileSession = {
    ...createSession(
      {
        accountId: accountId,
        workspaceId: workspaceId,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1",
      },
      {
        now: new Date("2026-03-13T09:00:00.000Z"),
        createId: () => "sess_mobile",
        createToken: () => "sess_mobile_token",
      },
    ),
    lastSeenAt: new Date("2026-03-13T11:45:00.000Z"),
  };
  const desktopSession = {
    ...createSession(
      {
        accountId: accountId,
        workspaceId: workspaceId,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      },
      {
        now: new Date("2026-03-12T18:00:00.000Z"),
        createId: () => "sess_windows",
        createToken: () => "sess_windows_token",
      },
    ),
    lastSeenAt: new Date("2026-03-12T20:20:00.000Z"),
  };
  const repository = createInMemoryAuditRepository([
    createAuditEvent(
      {
        type: "security.sensitive_action.reauth_confirmed",
        actor: {
          accountId: accountId,
          workspaceId: workspaceId,
          sessionId: "sess_current",
        },
        summary: "Uma confirmação reforçada foi concluída antes de alterar dados sensíveis.",
        metadata: {
          challengeToken: "reauth_token",
          ipAddress: "203.0.113.10",
        },
      },
      {
        now: new Date("2026-03-13T13:40:00.000Z"),
        createId: () => "audit_seed_1",
        redact: redactForLogs,
      },
    ),
  ]);

  const revoked = revokeSessionAccess(
    {
      sessions: [currentSession, mobileSession, desktopSession],
      sessionId: "sess_windows",
      currentSessionId: "sess_current",
      actingAccountId: accountId,
      workspaceId: workspaceId,
    },
    {
      now,
      repository,
      createAuditEventId: () => "audit_seed_2",
    },
  );

  return {
    sessions: buildVisibleSessionList({
      sessions: revoked.sessions,
      currentSessionId: "sess_current",
      now,
    }),
    activity: buildSecurityActivityItems(await repository.listForWorkspace(workspaceId)),
  };
}

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem 2.5rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  width: "min(880px, 100%)",
  padding: "1.6rem 1.7rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
  boxShadow: "0 28px 90px rgba(120, 53, 15, 0.12)",
} satisfies React.CSSProperties;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "1.25rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "var(--font-size-label)",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  marginBottom: "0.75rem",
  fontSize: "var(--font-size-page-title)",
} satisfies React.CSSProperties;

const copyStyle = {
  marginTop: 0,
  lineHeight: 1.7,
  color: "var(--color-text-2)",
  maxWidth: "65ch",
} satisfies React.CSSProperties;
