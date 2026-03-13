export default function VaultSetupPage() {
  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Vault setup hub</p>
        <h1 style={titleStyle}>Seu acesso está pronto. Agora prepare o consultório.</h1>
        <p style={copyStyle}>
          Este hub concentra a preparação inicial do ambiente seguro antes das
          próximas fases aprofundarem agenda, prontuário, documentos e finanças.
        </p>
        <div
          style={{
            display: "grid",
            gap: "0.9rem",
            marginTop: "1.5rem",
          }}
        >
          {[
            "Confirmar identidade profissional e CRP",
            "Definir preferências básicas do consultório",
            "Concluir os sinais de prontidão do vault",
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "1rem 1.1rem",
                borderRadius: "18px",
                background: "rgba(255, 255, 255, 0.74)",
                border: "1px solid rgba(146, 64, 14, 0.12)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
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
  width: "min(620px, 100%)",
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
