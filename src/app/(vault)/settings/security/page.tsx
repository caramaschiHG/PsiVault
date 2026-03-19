import { headers } from "next/headers";
import { createSession } from "../../../../lib/auth/session";
import {
  buildSecurityActivityItems,
  buildVisibleSessionList,
} from "../../../../lib/security/session-control";
import { ActivityFeed } from "./components/activity-feed";
import { SessionList } from "./components/session-list";
import { resolveSession } from "../../../../lib/supabase/session";
import { createClient } from "../../../../lib/supabase/server";
import { getAuditRepository } from "../../../../lib/audit/store";

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
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userAgent = (await headers()).get("user-agent") ?? "";
  const now = new Date();

  const currentSession = {
    ...createSession(
      { accountId, workspaceId, userAgent },
      {
        now: session?.created_at ? new Date(session.created_at) : now,
        createId: () => session?.access_token?.slice(-8) ?? "sess_current",
        createToken: () => session?.access_token ?? "current",
      },
    ),
    lastSeenAt: now,
  };

  const repository = getAuditRepository();
  const events = await repository.listForWorkspace(workspaceId);

  return {
    sessions: buildVisibleSessionList({
      sessions: [currentSession],
      currentSessionId: currentSession.id,
      now,
    }),
    activity: buildSecurityActivityItems(events),
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
