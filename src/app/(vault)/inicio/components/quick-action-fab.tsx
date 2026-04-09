"use client";

import { useState } from "react";
import Link from "next/link";

const fabContainerStyle = {
  position: "fixed",
  bottom: "5rem",
  right: "1.5rem",
  zIndex: "var(--z-overlay)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const fabButtonStyle = {
  width: 56,
  height: 56,
  borderRadius: 999,
  background: "var(--color-accent)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 16px rgba(154, 52, 18, 0.35)",
  transition: "transform 120ms ease",
} satisfies React.CSSProperties;

const fabMenuStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const fabItemStyle = {
  background: "#fff",
  border: "1px solid rgba(154, 52, 18, 0.2)",
  borderRadius: 12,
  padding: "0.6rem 1rem",
  fontSize: "0.875rem",
  color: "#1c1917",
  textDecoration: "none",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  whiteSpace: "nowrap" as const,
  transition: "background 120ms ease",
} satisfies React.CSSProperties;

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function QuickActionFab() {
  const [open, setOpen] = useState(false);

  return (
    <div style={fabContainerStyle}>
      {open && (
        <div style={fabMenuStyle}>
          <Link href="/appointments/new" style={fabItemStyle}>
            Nova sessão
          </Link>
          <Link href="/patients#form" style={fabItemStyle}>
            Novo paciente
          </Link>
          <Link href="/patients" style={fabItemStyle}>
            Ver pacientes
          </Link>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        style={fabButtonStyle}
        className="fab-enter"
        aria-label={open ? "Fechar menu de ações" : "Abrir menu de ações rápidas"}
      >
        {open ? <CloseIcon /> : <PlusIcon />}
      </button>
    </div>
  );
}
