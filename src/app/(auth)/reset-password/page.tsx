import { requestPasswordReset, updatePassword } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "../components/submit-button";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?: string;
    field?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const code = params.code ? decodeURIComponent(params.code) : null;
  const rawError = params.error ? decodeURIComponent(params.error) : null;
  const errorMessage = rawError ? translateAuthError(rawError) : null;
  const errorField = params.field ?? null;
  const successMessage = params.success
    ? decodeURIComponent(params.success)
    : null;

  const isTokenExpired =
    rawError === "Token has expired or is invalid" ||
    (errorMessage?.includes("expirou") ?? false);

  if (code) {
    return (
      <main style={shellStyle}>
        <section style={cardStyle}>
          <p style={eyebrowStyle}>Nova senha</p>
          <h1 style={titleStyle}>Crie uma nova senha para o vault.</h1>
          <p style={copyStyle}>
            Escolha uma senha forte. Ela será sua única credencial de acesso.
          </p>

          <form style={formStyle} action={updatePassword}>
            <AuthForm>
              <input type="hidden" name="code" value={code} />

              <label style={labelStyle}>
                Nova senha
                <input
                  style={inputStyle}
                  type="password"
                  name="password"
                  placeholder="Nova senha segura"
                  required
                />
              </label>

              <label style={labelStyle}>
                Confirmar nova senha
                <input
                  style={inputStyle}
                  type="password"
                  name="confirmPassword"
                  placeholder="Repita a nova senha"
                  required
                />
                {errorField === "confirmPassword" && errorMessage && (
                  <span style={fieldErrorStyle}>{errorMessage}</span>
                )}
              </label>

              <SubmitButton label="Atualizar senha" />

              {errorMessage && !errorField && !isTokenExpired && (
                <div style={errorBlockStyle}>{errorMessage}</div>
              )}

              {isTokenExpired && (
                <div style={expiredBlockStyle}>
                  {errorMessage}{" "}
                  <a href="/reset-password" style={expiredLinkStyle}>
                    Solicitar novo link
                  </a>
                </div>
              )}
            </AuthForm>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Recuperar acesso</p>
        <h1 style={titleStyle}>Recupere o acesso ao seu vault.</h1>
        <p style={copyStyle}>
          Enviaremos um link de recuperação para o seu e-mail.
        </p>

        {successMessage && (
          <div style={successBlockStyle}>{successMessage}</div>
        )}

        <form style={formStyle} action={requestPasswordReset}>
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
            </label>

            <SubmitButton label="Enviar link de recuperação" />

            {errorMessage && !errorField && (
              <div style={errorBlockStyle}>{errorMessage}</div>
            )}
          </AuthForm>
        </form>

        <p style={footerTextStyle}>
          Lembrou a senha?{" "}
          <a href="/sign-in" style={footerLinkStyle}>
            Entrar
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
  width: "min(500px, 100%)",
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

const expiredBlockStyle = {
  background: "rgba(239, 68, 68, 0.08)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  color: "#dc2626",
  fontSize: "0.875rem",
} satisfies React.CSSProperties;

const expiredLinkStyle = {
  color: "#9a3412",
  fontWeight: 600,
  textDecoration: "underline",
} satisfies React.CSSProperties;

const fieldErrorStyle = {
  color: "#dc2626",
  fontSize: "0.8rem",
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
