"use client";

import { useEffect } from "react";

interface AppointmentSidePanelProps {
  appointmentId: string | null;
  panels: Record<string, React.ReactNode>;
  onClose: () => void;
}

export function AppointmentSidePanel({ appointmentId, panels, onClose }: AppointmentSidePanelProps) {
  useEffect(() => {
    if (!appointmentId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [appointmentId, onClose]);

  if (!appointmentId) return null;

  const content = panels[appointmentId];

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} aria-hidden />

      {/* Drawer */}
      <aside style={drawerStyle} aria-label="Detalhes da consulta">
        <button style={closeButtonStyle} onClick={onClose} aria-label="Fechar painel">
          ×
        </button>
        <div style={drawerBodyStyle}>
          {content ?? (
            <p style={{ color: "var(--color-text-3)", fontSize: "0.9rem" }}>
              Sem detalhes disponíveis.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: "var(--z-sticky)",
  background: "rgba(0, 0, 0, 0.18)",
} satisfies React.CSSProperties;

const drawerStyle = {
  position: "fixed",
  right: 0,
  top: 0,
  height: "100%",
  width: "22rem",
  maxWidth: "100vw",
  zIndex: "var(--z-sticky)",
  background: "var(--color-surface-1)",
  borderLeft: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-side-panel)",
  display: "flex",
  flexDirection: "column",
} satisfies React.CSSProperties;

const closeButtonStyle = {
  position: "absolute",
  top: "0.75rem",
  right: "0.75rem",
  width: "2rem",
  height: "2rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const drawerBodyStyle = {
  flex: 1,
  overflowY: "auto" as const,
  padding: "3rem 1.25rem 1.5rem",
} satisfies React.CSSProperties;
