import { signUp } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "../components/submit-button";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; field?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error
    ? translateAuthError(decodeURIComponent(params.error))
    : null;
  const errorField = params.field ?? null;

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Criar conta</p>
        <h1 style={titleStyle}>Abra sua conta com e-mail e senha.</h1>
        <p style={copyStyle}>
          O acesso completo ao vault só é liberado depois da verificação de
          e-mail e da configuração do segundo fator.
        </p>
        <form style={formStyle} action={signUp}>
          <AuthForm>
            <label style={labelStyle}>
              Nome profissional
              <input
                style={inputStyle}
                name="displayName"
                placeholder="Dra. Helena Prado"
                required
              />
              {errorField === "displayName" && errorMessage && (
                <span style={fieldErrorStyle}>{errorMessage}</span>
              )}
            </label>

            <label style={labelStyle}>
              E-mail
              <input
                style={inputStyle}
                name="email"
                placeholder="voce@consultorio.com.br"
                type="email"
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
                name="password"
                placeholder="Crie uma senha forte"
                type="password"
                required
              />
              {errorField === "password" && errorMessage && (
                <span style={fieldErrorStyle}>{errorMessage}</span>
              )}
            </label>

            <SubmitButton label="Continuar para verificação" />

            {errorMessage && !errorField && (
              <div style={errorBlockStyle}>{errorMessage}</div>
            )}
          </AuthForm>
        </form>

        <p style={footerTextStyle}>
          Já tem conta?{" "}
          <a href="/sign-in" style={footerLinkStyle}>
            Entrar
          </a>
        </p>
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

const errorBlockStyle: React.CSSProperties = {
  background: "rgba(239, 68, 68, 0.08)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  color: "#dc2626",
  fontSize: "0.875rem",
};

const fieldErrorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "0.8rem",
};

const footerTextStyle: React.CSSProperties = {
  marginTop: "1.25rem",
  fontSize: "0.875rem",
  color: "#78716c",
  textAlign: "center",
};

const footerLinkStyle: React.CSSProperties = {
  color: "#9a3412",
  fontWeight: 600,
  textDecoration: "none",
};
