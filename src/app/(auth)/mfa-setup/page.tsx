export default function MfaSetupPage() {
  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>MFA obrigatório</p>
        <h1 style={titleStyle}>Proteja o vault com autenticação por aplicativo.</h1>
        <p style={copyStyle}>
          PsiVault usa TOTP como segundo fator inicial: simples de operar hoje e
          pronto para evoluir sem trocar o modelo de segurança.
        </p>
        <ol style={listStyle}>
          <li>Escaneie o segredo no aplicativo autenticador.</li>
          <li>Confirme um código de 6 dígitos.</li>
          <li>Guarde os códigos de recuperação em local seguro.</li>
        </ol>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "2rem",
} satisfies React.CSSProperties;

const cardStyle = {
  width: "min(560px, 100%)",
  padding: "2rem",
  borderRadius: "28px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 28px 90px rgba(120, 53, 15, 0.14)",
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
  fontSize: "2rem",
} satisfies React.CSSProperties;

const copyStyle = {
  marginTop: 0,
  marginBottom: "1.5rem",
  lineHeight: 1.6,
  color: "#57534e",
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  paddingLeft: "1.25rem",
  lineHeight: 1.8,
  color: "#44403c",
} satisfies React.CSSProperties;

