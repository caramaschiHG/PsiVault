"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "psivault_update_seen_v1";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Visão mensal",
    desc: "Nova aba Mês na agenda para visualizar sessões do mês inteiro de relance.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    title: "Agendamento rápido",
    desc: "Clique em qualquer horário vazio da agenda para criar uma sessão sem preencher o formulário completo.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M8 7h.01M12 7h.01M16 7h.01" />
        <path d="M7 12h10M7 16h6" />
      </svg>
    ),
    title: "Mini calendário",
    desc: "Barra lateral com mini calendário — navegue entre dias com os horários marcados.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="18" height="18">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    title: "Atalhos de teclado",
    desc: "← → para navegar, T para hoje, D/W/M para trocar de visão. Veja atalhos disponíveis pressionando ?",
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
          zIndex: 1000,
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
          width: "min(420px, 90vw)",
          background: "var(--color-surface-0, #fff)",
          borderRadius: "var(--radius-xl, 16px)",
          border: "1px solid var(--color-border, #e7e5e4)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.12)",
          zIndex: 1001,
          padding: "1.5rem",
          animation: "slideUp 250ms ease-out",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-brown-mid, #92400e)" }}>
              Atualização
            </p>
            <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-serif, serif)", color: "var(--color-text-1, #1c1917)" }}>
              Agenda renovada
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
            color: "#fff7ed",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Explorar a agenda
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
