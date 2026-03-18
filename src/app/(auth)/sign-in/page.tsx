import { signIn } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "../components/submit-button";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; field?: string; success?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error
    ? translateAuthError(decodeURIComponent(params.error))
    : null;
  const errorField = params.field ?? null;
  const successMessage = params.success
    ? decodeURIComponent(params.success)
    : null;

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Entrar</p>
        <h1 style={titleStyle}>Retome sua sessão com segurança.</h1>
        <p style={copyStyle}>
          A sessão permanece ativa no dia a dia, mas o vault exige e-mail
          verificado e MFA concluído antes da área protegida.
        </p>

        {successMessage && (
          <div style={successBlockStyle}>{successMessage}</div>
        )}

        <form style={formStyle} action={signIn}>
          <AuthForm>
            <label style={labelStyle}>
              E-mail
              <input
                style={inputStyle}
                type="email"
                name="email"
                placeholder="voce@consultorio.com.br"
                required
              />
              {errorField === "email" && errorMessage && (
                <span style={fieldErrorStyle}>{errorMessage}</span>
              )}
            </label>

            <label style={labelStyle}>
              Senha
              <input
                style={inputStyle}
                type="password"
                name="password"
                placeholder="Sua senha"
                required
              />
              {errorField === "password" && errorMessage && (
                <span style={fieldErrorStyle}>{errorMessage}</span>
              )}
            </label>

            <div style={{ textAlign: "right" }}>
              <a href="/reset-password" style={forgotLinkStyle}>
                Esqueceu a senha?
              </a>
            </div>

            <SubmitButton label="Entrar" />

            {errorMessage && !errorField && (
              <div style={errorBlockStyle}>{errorMessage}</div>
            )}
          </AuthForm>
        </form>

        <p style={footerTextStyle}>
          Não tem conta?{" "}
          <a href="/sign-up" style={footerLinkStyle}>
            Criar conta
          </a>
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

const successBlockStyle = {
  background: "#dcfce7",
  border: "1px solid #86efac",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  color: "#166534",
  fontSize: "0.875rem",
  marginBottom: "1rem",
} satisfies React.CSSProperties;

const errorBlockStyle = {
  background: "rgba(239, 68, 68, 0.08)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  color: "#dc2626",
  fontSize: "0.875rem",
} satisfies React.CSSProperties;

const fieldErrorStyle = {
  color: "#dc2626",
  fontSize: "0.8rem",
} satisfies React.CSSProperties;

const forgotLinkStyle = {
  fontSize: "0.875rem",
  color: "#78716c",
  textDecoration: "none",
} satisfies React.CSSProperties;

const footerTextStyle = {
  marginTop: "1.25rem",
  fontSize: "0.875rem",
  color: "#78716c",
  textAlign: "center",
} satisfies React.CSSProperties;

const footerLinkStyle = {
  color: "#9a3412",
  fontWeight: 600,
  textDecoration: "none",
} satisfies React.CSSProperties;
