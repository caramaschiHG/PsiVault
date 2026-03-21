"use client";

import { useState } from "react";
import Link from "next/link";

const fabContainerStyle = {
  position: "fixed",
  bottom: "5rem",
  right: "1.5rem",
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const fabButtonStyle = {
  width: 56,
  height: 56,
  borderRadius: 999,
  background: "#9a3412",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: "1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 16px rgba(154, 52, 18, 0.35)",
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
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;

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
        aria-label={open ? "Fechar menu de ações" : "Abrir menu de ações rápidas"}
      >
        {open ? "✕" : "+"}
      </button>
    </div>
  );
}
