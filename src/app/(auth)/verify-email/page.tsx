export default function VerifyEmailPage() {
  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Verificação</p>
        <h1 style={titleStyle}>Confirme seu e-mail antes de entrar no vault.</h1>
        <p style={copyStyle}>
          Assim que o endereço for confirmado, a próxima etapa é registrar o
          segundo fator e preparar o ambiente seguro do consultório.
        </p>
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
  width: "min(540px, 100%)",
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
  lineHeight: 1.6,
  color: "#57534e",
} satisfies React.CSSProperties;

