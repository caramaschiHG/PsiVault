/**
 * Dados e Privacidade settings page.
 *
 * Three sections:
 * 1. Exportar dados do paciente — explanation + link to patient profiles
 * 2. Backup do consultório — full workspace backup download with re-auth gate
 * 3. Verificar backup — file-upload validation flow (purely client-side)
 */

import { WorkspaceBackupButton } from "./components/workspace-backup-button";
import { VerifyBackupForm } from "./components/verify-backup-form";

export default function DadosEPrivacidadePage() {
  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Controle e portabilidade</p>
        <h1 style={titleStyle}>Dados e Privacidade</h1>
        <p style={copyStyle}>
          Os dados do consultório pertencem a você. Exporte registros individuais de pacientes,
          faça um backup completo do workspace ou verifique um arquivo de backup existente.
        </p>
      </section>

      <div style={sectionsStyle}>
        {/* Section 1 — Per-patient export */}
        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={cardEyebrowStyle}>Exportação</p>
            <h2 style={cardTitleStyle}>Exportar dados do paciente</h2>
          </div>
          <p style={cardDescStyle}>
            Para exportar todos os dados de um paciente (perfil, consultas, prontuários,
            documentos e cobranças), acesse o perfil do paciente e clique em{" "}
            <strong>Exportar dados</strong> na seção de exportação ao final da página.
          </p>
          <p style={cardHintStyle}>
            O arquivo JSON gerado contém o histórico completo e pode ser reimportado em
            sistemas futuros. A exportação requer confirmação de senha.
          </p>
          <a href="/patients" style={linkStyle}>
            Ir para a lista de pacientes
          </a>
        </section>

        {/* Section 2 — Full workspace backup */}
        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={cardEyebrowStyle}>Backup</p>
            <h2 style={cardTitleStyle}>Backup do consultório</h2>
          </div>
          <p style={cardDescStyle}>
            Gera um arquivo JSON com todos os dados do workspace: pacientes, consultas,
            prontuários, documentos e cobranças. Guarde em local seguro.
          </p>
          <p style={cardHintStyle}>
            Requer confirmação de senha. O arquivo fica disponível por 10 minutos após a
            confirmação.
          </p>
          <WorkspaceBackupButton />
        </section>

        {/* Section 3 — Verify backup */}
        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={cardEyebrowStyle}>Verificação</p>
            <h2 style={cardTitleStyle}>Verificar backup</h2>
          </div>
          <p style={cardDescStyle}>
            Carregue um arquivo de backup (.json) para confirmar que ele está íntegro e tem
            a estrutura esperada. A verificação é feita localmente — o arquivo não é enviado
            para servidores.
          </p>
          <VerifyBackupForm />
        </section>
      </div>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  boxShadow: "var(--shadow-2xl)",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
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

const sectionsStyle = {
  display: "grid",
  gap: "1.25rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  alignItems: "start",
} satisfies React.CSSProperties;

const cardStyle = {
  padding: "1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const cardHeaderStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const cardEyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "var(--font-size-label)",
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const cardTitleStyle = {
  margin: 0,
  fontSize: "1.2rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const cardDescStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "var(--color-text-2)",
  lineHeight: 1.65,
} satisfies React.CSSProperties;

const cardHintStyle = {
  margin: 0,
  fontSize: "0.82rem",
  color: "var(--color-text-3)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const linkStyle = {
  display: "inline-block",
  fontSize: "0.875rem",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;
