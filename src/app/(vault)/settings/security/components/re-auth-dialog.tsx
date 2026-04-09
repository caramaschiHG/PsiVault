import type { SensitiveActionChallenge, SensitiveActionDecision } from "../../../../../lib/security/sensitive-actions";

export function ReAuthDialog({
  challenge,
  decision,
}: {
  challenge: SensitiveActionChallenge;
  decision?: SensitiveActionDecision;
}) {
  return (
    <section style={dialogStyle}>
      <p style={eyebrowStyle}>Confirmação reforçada</p>
      <h2 style={titleStyle}>{challenge.title}</h2>
      <p style={copyStyle}>{challenge.reason}</p>

      <div style={panelStyle}>
        <strong>Antes de seguir</strong>
        <p style={bodyStyle}>
          Reconfirme sua identidade e digite <strong>{challenge.confirmationLabel}</strong>. Isso mantém a ação
          deliberada sem transformar a experiência em um alerta agressivo.
        </p>
      </div>

      {decision ? (
        <p style={decision.status === "approved" ? approvedStyle : warningStyle}>{decision.message}</p>
      ) : null}
    </section>
  );
}

const dialogStyle = {
  display: "grid",
  gap: "0.9rem",
  padding: "1.4rem",
  borderRadius: "24px",
  background: "rgba(255, 252, 247, 0.96)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
} satisfies React.CSSProperties;

const panelStyle = {
  display: "grid",
  gap: "0.45rem",
  padding: "0.95rem 1rem",
  borderRadius: "18px",
  background: "rgba(255, 255, 255, 0.88)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.3rem",
} satisfies React.CSSProperties;

const copyStyle = {
  margin: 0,
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const bodyStyle = {
  margin: 0,
  color: "var(--color-kbd-text)",
  lineHeight: 1.55,
} satisfies React.CSSProperties;

const approvedStyle = {
  margin: 0,
  color: "var(--color-emerald)",
} satisfies React.CSSProperties;

const warningStyle = {
  margin: 0,
  color: "var(--color-accent)",
} satisfies React.CSSProperties;
