"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OtpInput } from "../components/otp-input";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function MfaVerifyPage() {
  const router = useRouter();

  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase || loaded.current) return;
    loaded.current = true;
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === "verified");
      if (totp) setFactorId(totp.id);
    });
  }, [supabase]);

  // Auto-submit: dispara ao completar 6 dígitos.
  // setTimeout(50ms) + cancelled flag previnem double-invoke do React StrictMode:
  // o cleanup do primeiro mount cancela o timer antes de disparar — só o segundo
  // mount (o "real") executa, garantindo um único challengeAndVerify por código.
  useEffect(() => {
    if (code.length !== 6 || !supabase || !factorId) return;

    let cancelled = false;

    const timer = setTimeout(() => {
      if (cancelled) return;
      setError(null);
      setLoading(true);

      supabase.auth.mfa.challengeAndVerify({ factorId, code }).then(({ error }) => {
        if (cancelled) return;
        setLoading(false);
        if (error) {
          setError("Código inválido. Tente novamente.");
          setCode(""); // limpa para nova tentativa com código fresco
        } else {
          router.push("/complete-profile");
        }
      });
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, supabase, factorId, router]);

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card">
        <p className="auth-eyebrow">Verificação em 2 etapas</p>
        <h1 className="auth-title">Confirme sua identidade.</h1>
        <p className="auth-copy">
          Digite o código de 6 dígitos gerado pelo aplicativo autenticador.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
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
            {loading ? "Verificando…" : "O código expira em 30 segundos."}
          </p>
        </form>
      </section>
    </main>
  );
}
