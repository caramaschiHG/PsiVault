import { SERVICE_MODE_OPTIONS } from "../../../lib/setup/constants";
import { buildSetupReadiness } from "../../../lib/setup/readiness";
import { SetupChecklist } from "./components/setup-checklist";

const draftProfile = {
  fullName: "Dra. Helena Prado",
  crp: "CRP 06/123456",
  contactEmail: "contato@consultorio.com.br",
  contactPhone: "",
  defaultAppointmentDurationMinutes: 50,
  defaultSessionPriceInCents: 18000,
  serviceModes: [SERVICE_MODE_OPTIONS.inPerson, SERVICE_MODE_OPTIONS.online],
  signatureAsset: null,
};

export default function VaultSetupPage() {
  const readiness = buildSetupReadiness(draftProfile);

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <div style={copyBlockStyle}>
          <p style={eyebrowStyle}>Setup hub</p>
          <h1 style={titleStyle}>Prepare o consultório antes de abrir o vault no ritmo do dia a dia.</h1>
          <p style={copyStyle}>
            Este hub organiza o que ainda falta para o PsiVault operar com
            identidade profissional, preferências do consultório e sinais claros
            de prontidão. O que é obrigatório fica na frente. O que pode esperar
            aparece sem ruído.
          </p>
        </div>

        <aside style={summaryCardStyle}>
          <p style={summaryLabelStyle}>Prontidão do vault</p>
          <strong style={summaryValueStyle}>{readiness.progressLabel}</strong>
          <p style={summaryCopyStyle}>
            {readiness.vaultReady
              ? "O consultório já cumpre a base mínima de identidade e operação."
              : "Ainda há pendências obrigatórias antes de tratar o vault como pronto."}
          </p>

          <div style={meterTrackStyle}>
            <div
              style={{
                ...meterFillStyle,
                width: `${(readiness.completedSteps / readiness.totalSteps) * 100}%`,
              }}
            />
          </div>

          <div style={totalsGridStyle}>
            <div style={totalsCardStyle}>
              <span style={totalsLabelStyle}>Obrigatórias</span>
              <strong style={totalsValueStyle}>
                {readiness.required.completed}/{readiness.required.total}
              </strong>
            </div>
            <div style={totalsCardStyle}>
              <span style={totalsLabelStyle}>Para depois</span>
              <strong style={totalsValueStyle}>
                {readiness.optional.completed}/{readiness.optional.total}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <section style={contentGridStyle}>
        <SetupChecklist readiness={readiness} />

        <aside style={sidebarCardStyle}>
          <p style={sidebarEyebrowStyle}>Próxima ação recomendada</p>
          <h2 style={sidebarTitleStyle}>Complete os dados de contato do consultório.</h2>
          <p style={sidebarCopyStyle}>
            O vault só é marcado como pronto quando identidade, contato e
            padrões básicos do consultório ficam consistentes. A assinatura
            profissional pode entrar depois sem travar a operação inicial.
          </p>

          <div style={sidebarListStyle}>
            <div style={sidebarListItemStyle}>Atualizar telefone e e-mail operacional</div>
            <div style={sidebarListItemStyle}>Revisar duração e valor padrão da sessão</div>
            <div style={sidebarListItemStyle}>Anexar assinatura quando quiser reutilizar em documentos</div>
          </div>

          <a href="/vault/settings/profile" style={sidebarLinkStyle}>
            Abrir perfil profissional
          </a>
        </aside>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
  gap: "1.25rem",
  alignItems: "stretch",
  maxWidth: "1180px",
  width: "100%",
  margin: "0 auto",
} satisfies React.CSSProperties;

const copyBlockStyle = {
  padding: "2rem",
  borderRadius: "32px",
  background:
    "linear-gradient(145deg, rgba(255, 251, 245, 0.98), rgba(251, 241, 224, 0.96))",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 28px 90px rgba(120, 53, 15, 0.14)",
} satisfies React.CSSProperties;

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
  gap: "1.25rem",
  maxWidth: "1180px",
  width: "100%",
  margin: "0 auto",
} satisfies React.CSSProperties;

const summaryCardStyle = {
  padding: "1.6rem",
  borderRadius: "28px",
  background: "rgba(125, 53, 15, 0.94)",
  color: "#fff7ed",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.24)",
  display: "grid",
  gap: "0.9rem",
} satisfies React.CSSProperties;

const summaryLabelStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  color: "rgba(255, 237, 213, 0.84)",
} satisfies React.CSSProperties;

const summaryValueStyle = {
  fontSize: "1.9rem",
  lineHeight: 1.1,
} satisfies React.CSSProperties;

const summaryCopyStyle = {
  margin: 0,
  color: "rgba(255, 247, 237, 0.84)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const meterTrackStyle = {
  height: "0.8rem",
  borderRadius: "999px",
  background: "rgba(255, 237, 213, 0.18)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const meterFillStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(90deg, #fdba74, #fde68a)",
} satisfies React.CSSProperties;

const totalsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.8rem",
} satisfies React.CSSProperties;

const totalsCardStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "18px",
  background: "rgba(255, 247, 237, 0.1)",
  border: "1px solid rgba(255, 237, 213, 0.16)",
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const totalsLabelStyle = {
  fontSize: "0.78rem",
  color: "rgba(255, 237, 213, 0.78)",
} satisfies React.CSSProperties;

const totalsValueStyle = {
  fontSize: "1.35rem",
} satisfies React.CSSProperties;

const sidebarCardStyle = {
  padding: "1.5rem",
  borderRadius: "28px",
  background: "rgba(255, 252, 247, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
  display: "grid",
  gap: "0.9rem",
} satisfies React.CSSProperties;

const sidebarEyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: "0.75rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  marginBottom: "0.75rem",
  fontSize: "2.6rem",
  lineHeight: 1.02,
} satisfies React.CSSProperties;

const copyStyle = {
  marginTop: 0,
  lineHeight: 1.6,
  color: "#57534e",
  maxWidth: "58ch",
} satisfies React.CSSProperties;

const sidebarTitleStyle = {
  margin: 0,
  fontSize: "1.45rem",
  lineHeight: 1.2,
} satisfies React.CSSProperties;

const sidebarCopyStyle = {
  margin: 0,
  lineHeight: 1.6,
  color: "#57534e",
} satisfies React.CSSProperties;

const sidebarListStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const sidebarListItemStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.78)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
  color: "#44403c",
} satisfies React.CSSProperties;

const sidebarLinkStyle = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "0.95rem 1.1rem",
  borderRadius: "16px",
  background: "#9a3412",
  color: "#fff7ed",
  fontWeight: 700,
  textDecoration: "none",
} satisfies React.CSSProperties;
