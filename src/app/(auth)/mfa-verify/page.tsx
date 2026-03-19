"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OtpInput } from "../components/otp-input";

export default function MfaVerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === "verified");
      if (totp) setFactorId(totp.id);
    });
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });

    setLoading(false);
    if (error) {
      setError("Código inválido. Tente novamente.");
      return;
    }

    router.push("/inicio");
  }

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card">
        <p className="auth-eyebrow">Verificação em 2 etapas</p>
        <h1 className="auth-title">Confirme sua identidade.</h1>
        <p className="auth-copy">
          Digite o código gerado pelo aplicativo autenticador.
        </p>

        <form
          onSubmit={handleVerify}
          style={{ display: "grid", gap: "1rem" } satisfies React.CSSProperties}
        >
          <OtpInput
            value={code}
            onValueChange={setCode}
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
            O código expira em 30 segundos.
          </p>

          <button
            className="btn-primary"
            style={{ width: "100%" } satisfies React.CSSProperties}
            type="submit"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verificando..." : "Confirmar"}
          </button>
        </form>
      </section>
    </main>
  );
}
