"use client";

import { useEffect, useRef, useCallback } from "react";

interface ChargeSidePanelProps {
  drawerId: string | null;
  onClose: () => void;
  children?: React.ReactNode;
}

export function ChargeSidePanel({ drawerId, onClose, children }: ChargeSidePanelProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key !== "Tab" || !drawerRef.current) return;

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!drawerId) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the drawer when it opens
    requestAnimationFrame(() => {
      drawerRef.current?.focus();
    });

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus when panel closes
      previousFocusRef.current?.focus();
    };
  }, [drawerId, handleKeyDown]);

  if (!drawerId) return null;

  return (
    <>
      {/* Overlay */}
      <div className="side-panel-overlay" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="side-panel-drawer"
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes da cobrança"
        tabIndex={-1}
      >
        <button
          className="side-panel-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div style={drawerBodyStyle}>
          {children}
        </div>
      </aside>
    </>
  );
}

const drawerStyle = {
  position: "fixed",
  right: 0,
  top: 0,
  height: "100%",
  width: "26rem",
  maxWidth: "100vw",
  zIndex: "var(--z-modal)",
  background: "var(--color-surface-1)",
  borderLeft: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-side-panel)",
  display: "flex",
  flexDirection: "column",
  outline: "none",
} satisfies React.CSSProperties;

const drawerBodyStyle = {
  flex: 1,
  overflowY: "auto" as const,
  padding: "3rem 1.25rem 1.5rem",
} satisfies React.CSSProperties;
