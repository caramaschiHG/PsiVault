export default function SignUpPage() {
  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Criar conta</p>
        <h1 style={titleStyle}>Abra sua conta com e-mail e senha.</h1>
        <p style={copyStyle}>
          O acesso completo ao vault só é liberado depois da verificação de
          e-mail e da configuração do segundo fator.
        </p>
        <form style={formStyle}>
          <label style={labelStyle}>
            Nome profissional
            <input style={inputStyle} placeholder="Dra. Helena Prado" />
          </label>
          <label style={labelStyle}>
            E-mail
            <input style={inputStyle} placeholder="voce@consultorio.com.br" type="email" />
          </label>
          <label style={labelStyle}>
            Senha
            <input style={inputStyle} placeholder="Crie uma senha forte" type="password" />
          </label>
          <button style={buttonStyle} type="submit">
            Continuar para verificação
          </button>
        </form>
      </section>
    </main>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "2rem",
};

const cardStyle: React.CSSProperties = {
  width: "min(480px, 100%)",
  padding: "2rem",
  borderRadius: "28px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 28px 90px rgba(120, 53, 15, 0.14)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: "0.75rem",
  color: "#b45309",
};

const titleStyle: React.CSSProperties = {
  marginBottom: "0.75rem",
  fontSize: "2rem",
};

const copyStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "1.5rem",
  lineHeight: 1.6,
  color: "#57534e",
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.4rem",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  borderRadius: "16px",
  border: "1px solid rgba(120, 53, 15, 0.16)",
  padding: "0.9rem 1rem",
  background: "#fffdfa",
};

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: "16px",
  padding: "1rem 1.2rem",
  background: "#9a3412",
  color: "#fff",
  fontWeight: 700,
};

