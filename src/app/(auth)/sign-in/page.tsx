import { signIn } from "../actions";

export default function SignInPage() {
  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Entrar</p>
        <h1 style={titleStyle}>Retome sua sessão com segurança.</h1>
        <p style={copyStyle}>
          A sessão permanece ativa no dia a dia, mas o vault exige e-mail
          verificado e MFA concluído antes da área protegida.
        </p>
        <form style={formStyle} action={signIn}>
          <label style={labelStyle}>
            E-mail
            <input style={inputStyle} type="email" name="email" placeholder="voce@consultorio.com.br" required />
          </label>
          <label style={labelStyle}>
            Senha
            <input style={inputStyle} type="password" name="password" placeholder="Sua senha" required />
          </label>
          <button style={buttonStyle} type="submit">
            Entrar
          </button>
        </form>
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
  width: "min(460px, 100%)",
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

const formStyle = {
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.4rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const inputStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(120, 53, 15, 0.16)",
  padding: "0.9rem 1rem",
  background: "#fffdfa",
} satisfies React.CSSProperties;

const buttonStyle = {
  border: 0,
  borderRadius: "16px",
  padding: "1rem 1.2rem",
  background: "#9a3412",
  color: "#fff",
  fontWeight: 700,
} satisfies React.CSSProperties;
