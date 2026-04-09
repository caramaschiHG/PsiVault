import { resolveSession } from "../../../../lib/supabase/session";
import { getSmtpConfigRepository } from "../../../../lib/notifications/smtp-config-store";
import { SmtpConfigForm } from "./components/smtp-config-form";

export default async function NotificacoesSettingsPage() {
  const { workspaceId } = await resolveSession();
  const smtpConfig = await getSmtpConfigRepository().findByWorkspace(workspaceId);

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Notificações</p>
        <h1 style={titleStyle}>E-mail automático para pacientes</h1>
        <p style={copyStyle}>
          Configure seu servidor SMTP para enviar lembretes, confirmações e cancelamentos automaticamente. Nenhum serviço externo necessário — use seu próprio e-mail (Gmail, Outlook ou qualquer SMTP).
        </p>
      </section>

      <SmtpConfigForm existing={smtpConfig} />
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 720,
  width: "100%",
  display: "grid",
  gap: "2rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  width: "min(880px, 100%)",
  padding: "1.6rem 1.7rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
  boxShadow: "var(--shadow-2xl)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "var(--font-size-page-title)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const copyStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "var(--color-text-2)",
  lineHeight: 1.6,
  maxWidth: "52ch",
} satisfies React.CSSProperties;
