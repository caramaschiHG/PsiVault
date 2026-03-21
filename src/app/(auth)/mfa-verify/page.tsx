"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    if (!supabase) return;
    if (loaded.current) return;
    loaded.current = true;
    const client = supabase;

    client.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === "verified");
      if (totp) setFactorId(totp.id);
    });
  }, [supabase]);

  const verify = useCallback(async (currentCode: string) => {
    if (!supabase || !factorId || currentCode.length !== 6) return;
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: currentCode });

    setLoading(false);
    if (error) {
      setError("Código inválido. Tente novamente.");
      return;
    }

    router.push("/complete-profile");
  }, [supabase, factorId, router]);

  // Auto-submit ao completar os 6 dígitos
  useEffect(() => {
    if (code.length === 6 && !loading && factorId) {
      verify(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

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
          onSubmit={(e) => { e.preventDefault(); verify(code); }}
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
