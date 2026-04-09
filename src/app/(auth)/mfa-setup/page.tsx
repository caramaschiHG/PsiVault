"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OtpInput } from "../components/otp-input";
import type { SupabaseClient } from "@supabase/supabase-js";

type Step = "install" | "qr" | "verify" | "success";

const STEPS: { key: Step; label: string }[] = [
  { key: "install", label: "Instalar" },
  { key: "qr", label: "Escanear" },
  { key: "verify", label: "Confirmar" },
  { key: "success", label: "Pronto" },
];

export default function MfaSetupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("install");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const enrolled = useRef(false);
  const submitting = useRef(false);
  const verified = useRef(false);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (step !== "qr") return;
    if (enrolled.current) return;
    enrolled.current = true;
    const client = supabase;

    async function enroll() {
      const { data: factorsData } = await client.auth.mfa.listFactors();
      if (factorsData) {
        for (const factor of factorsData.totp) {
          await client.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "PsiVault", issuer: "PsiVault" });
      if (error || !data) {
        console.error("MFA enroll error:", JSON.stringify(error));
        setError(`Erro ao iniciar configuração MFA: ${error?.message ?? "erro desconhecido"}`);
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    }

    enroll();
  }, [step, supabase]);

  function submitVerify(otp: string, client: SupabaseClient, fId: string) {
    if (submitting.current || verified.current) return;
    submitting.current = true;
    setError(null);
    setLoading(true);

    client.auth.mfa.challengeAndVerify({ factorId: fId, code: otp }).then(({ error }) => {
      submitting.current = false;
      setLoading(false);
      if (error) {
        setError("Código inválido. Tente novamente.");
        setCode("");
      } else {
        verified.current = true;
        setCode("");
        setStep("success");
        setTimeout(() => router.push("/inicio"), 1500);
      }
    });
  }

  function handleCodeChange(v: string) {
    setCode(v);
    if (v.length === 6 && step === "verify" && supabase && factorId) {
      submitVerify(v, supabase, factorId);
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card auth-card--wide">
        <p className="auth-eyebrow">MFA obrigatório</p>

        <div className="auth-steps">
          {STEPS.map((s, i) => {
            const isDone = i < currentStepIndex;
            const isActive = i === currentStepIndex;
            return (
              <span key={s.key} style={{ display: "contents" }}>
                <span
                  className={`auth-step${isActive ? " auth-step--active" : ""}${isDone ? " auth-step--done" : ""}`}
                >
                  <span className="auth-step-dot">{isDone ? "✓" : i + 1}</span>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="auth-step-sep" />}
              </span>
            );
          })}
        </div>

        {step === "install" && (
          <>
            <h1 className="auth-title">Configure o verificador de dois fatores.</h1>
            <p className="auth-copy">
              Para proteger seus pacientes e dados clínicos, o PsiLock exige
              autenticação em duas etapas. Você precisará de um aplicativo
              autenticador no celular.
            </p>

            <div className="auth-app-grid">
              <div className="auth-app-card">
                <span className="auth-app-card-name">Authy</span>
                <span className="auth-app-badge">Recomendado</span>
                <a
                  className="auth-app-link"
                  href="https://apps.apple.com/br/app/twilio-authy/id494168017"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iOS
                </a>
                <a
                  className="auth-app-link"
                  href="https://play.google.com/store/apps/details?id=com.authy.authy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Android
                </a>
              </div>
              <div className="auth-app-card">
                <span className="auth-app-card-name">Google Auth</span>
                <a
                  className="auth-app-link"
                  href="https://apps.apple.com/br/app/google-authenticator/id388497605"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iOS
                </a>
                <a
                  className="auth-app-link"
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Android
                </a>
              </div>
              <div className="auth-app-card">
                <span className="auth-app-card-name">Microsoft Auth</span>
                <a
                  className="auth-app-link"
                  href="https://apps.apple.com/br/app/microsoft-authenticator/id983156458"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iOS
                </a>
                <a
                  className="auth-app-link"
                  href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Android
                </a>
              </div>
            </div>

            <div
              style={
                { display: "flex", gap: "0.75rem" } satisfies React.CSSProperties
              }
            >
              <a
                href="https://apps.apple.com/br/app/twilio-authy/id494168017"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ flex: 1, textAlign: "center" } satisfies React.CSSProperties}
              >
                Ver aplicativos
              </a>
              <button
                className="btn-primary"
                style={{ flex: 2 } satisfies React.CSSProperties}
                onClick={() => setStep("qr")}
              >
                Já tenho um app — continuar →
              </button>
            </div>
          </>
        )}

        {step === "qr" && (
          <>
            <h1 className="auth-title">Escaneie o QR code.</h1>
            <ol
              style={
                {
                  paddingLeft: "1.25rem",
                  color: "var(--color-text-2)",
                  lineHeight: 2,
                  marginBottom: "1.25rem",
                } satisfies React.CSSProperties
              }
            >
              <li>Abra o aplicativo autenticador</li>
              <li>Toque em &ldquo;+&rdquo; para adicionar conta</li>
              <li>Escolha &ldquo;Escanear QR code&rdquo;</li>
            </ol>

            {qrCode ? (
              <div
                style={
                  {
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  } satisfies React.CSSProperties
                }
              >
                <div
                  style={
                    {
                      padding: "0.75rem",
                      background: "var(--color-surface-0)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      display: "inline-block",
                    } satisfies React.CSSProperties
                  }
                >
                  <img src={qrCode} alt="QR code TOTP" width={200} height={200} />
                </div>
              </div>
            ) : (
              <div
                style={
                  {
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  } satisfies React.CSSProperties
                }
              >
                <div
                  style={
                    {
                      width: 200,
                      height: 200,
                      background: "var(--color-surface-warm2)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-3)",
                      fontSize: "0.875rem",
                    } satisfies React.CSSProperties
                  }
                >
                  Carregando...
                </div>
              </div>
            )}

            {secret && (
              <details style={{ marginBottom: "1.25rem" } satisfies React.CSSProperties}>
                <summary
                  style={
                    {
                      fontSize: "0.85rem",
                      color: "var(--color-text-3)",
                      cursor: "pointer",
                    } satisfies React.CSSProperties
                  }
                >
                  Não consigo escanear — mostrar código manual
                </summary>
                <div
                  className="auth-alert"
                  style={
                    {
                      background: "var(--color-surface-1)",
                      border: "1px solid var(--color-border)",
                      marginTop: "0.5rem",
                    } satisfies React.CSSProperties
                  }
                >
                  <code
                    style={
                      {
                        fontSize: "0.8rem",
                        letterSpacing: "0.1em",
                        wordBreak: "break-all",
                      } satisfies React.CSSProperties
                    }
                  >
                    {secret}
                  </code>
                </div>
              </details>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%" } satisfies React.CSSProperties}
              onClick={() => setStep("verify")}
              disabled={!qrCode}
            >
              Escaneei o código — continuar →
            </button>
          </>
        )}

        {step === "verify" && (
          <>
            <h1 className="auth-title">Confirme o código.</h1>
            <p className="auth-copy">
              Digite o código de 6 dígitos gerado pelo autenticador.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: "grid", gap: "1rem" } satisfies React.CSSProperties}
            >
              <OtpInput
                value={code}
                onValueChange={handleCodeChange}
                hasError={!!error}
                autoFocus
              />

              {error && (
                <p
                  aria-live="polite"
                  className="auth-alert auth-alert--error"
                  style={{ margin: 0 } satisfies React.CSSProperties}
                >
                  {error}
                </p>
              )}

              <p
                style={
                  {
                    fontSize: "0.8rem",
                    color: "var(--color-text-3)",
                    margin: 0,
                    textAlign: "center",
                  } satisfies React.CSSProperties
                }
              >
                {loading ? "Verificando…" : "O código expira em 30 segundos."}
              </p>
            </form>
          </>
        )}

        {step === "success" && (
          <>
            <div
              style={
                {
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                } satisfies React.CSSProperties
              }
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill="#dcfce7" />
                <path
                  d="M7 12.5l3.5 3.5 6.5-7"
                  stroke="#166534"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="auth-title">Tudo certo!</h1>
            <p className="auth-copy">Autenticação configurada. Redirecionando...</p>
            <div
              style={
                {
                  height: "4px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--color-border)",
                  overflow: "hidden",
                } satisfies React.CSSProperties
              }
            >
              <div
                style={
                  {
                    height: "100%",
                    background: "var(--color-success-text)",
                    borderRadius: "var(--radius-pill)",
                    animation: "auth-progress-bar 1.5s ease forwards",
                  } satisfies React.CSSProperties
                }
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
