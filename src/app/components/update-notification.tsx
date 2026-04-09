"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "psivault_update_seen_v3";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    title: "Botões com feedback visual",
    desc: "Todo clique agora tem resposta visual: spinner durante envio, estado disabled visível, e animação suave de feedback.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    title: "Carregamento consistente",
    desc: "Todos os loading states agora usam o mesmo efeito shimmer — visual unificado em toda a aplicação.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
    title: "Financeiro com ações",
    desc: "Marque cobranças como pagas, adicione cobranças manuais, filtre por paciente e exporte CSV com um clique.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Transições de página",
    desc: "Navegação entre páginas agora tem transição suave — o conteúdo aparece com fade sutil.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Toasts animados",
    desc: "Notificações deslizam pela lateral ao aparecer — mais natural e menos brusco.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Gráfico de tendência",
    desc: "Financeiro agora mostra receita dos últimos 6 meses com grid lines e total acumulado.",
  },
];

export function UpdateNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!seen) {
      // Small delay so it doesn't compete with initial paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: "var(--z-modal)",
          transition: "opacity 200ms",
        }}
        onClick={handleDismiss}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Novidades da atualização"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(460px, 90vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--color-surface-0, #fff)",
          borderRadius: "var(--radius-xl, 16px)",
          border: "1px solid var(--color-border, #e7e5e4)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.12)",
          zIndex: "var(--z-toast)",
          padding: "1.5rem",
          animation: "slideUp 250ms ease-out",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-brown-mid, #92400e)" }}>
              Novidades
            </p>
            <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-serif, serif)", color: "var(--color-text-1, #1c1917)" }}>
              PsiVault ficou mais fluido
            </h2>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              width: "1.75rem",
              height: "1.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              color: "var(--color-text-3, #a8a29e)",
              borderRadius: "6px",
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <div
                style={{
                  flexShrink: 0,
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "8px",
                  background: "rgba(154, 52, 18, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-brown-mid, #92400e)",
                }}
              >
                {f.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-1, #1c1917)" }}>
                  {f.title}
                </p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", lineHeight: 1.4, color: "var(--color-text-2, #57534e)" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleDismiss}
          style={{
            width: "100%",
            padding: "0.6rem 0",
            borderRadius: "10px",
            border: "none",
            background: "var(--color-accent, #9a3412)",
            color: "var(--color-surface-0)",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Explorar novidades
        </button>
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
