"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  fading: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const counterRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => {
      const next = [...prev, { id, message, type, fading: false }];
      return next.slice(-4); // max 4
    });

    // Start fade at 3000ms, remove at 3500ms
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, fading: true } : t));
    }, 3000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const borderColors: Record<ToastType, string> = {
    success: "var(--color-forest)",
    error: "var(--color-rose)",
    info: "var(--color-brown-mid)",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && createPortal(
        <div style={containerStyle} aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={t.fading ? "" : "toast-enter"}
              style={{
                ...toastStyle,
                borderLeftColor: borderColors[t.type],
                opacity: t.fading ? 0 : 1,
                transition: t.fading ? "opacity 500ms ease" : "none",
                position: "relative",
                pointerEvents: "auto",
              }}
              role="status"
            >
              {t.message}
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                style={toastDismissStyle}
                aria-label="Fechar notificação"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

const containerStyle = {
  position: "fixed",
  bottom: "1.5rem",
  right: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  zIndex: "var(--z-toast)",
  pointerEvents: "none",
} satisfies React.CSSProperties;

const toastStyle = {
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius-sm)",
  background: "rgba(28, 25, 23, 0.92)",
  color: "#fff7ed",
  fontSize: "0.875rem",
  borderLeft: "3px solid transparent",
  boxShadow: "var(--shadow-md)",
  transition: "opacity 500ms ease",
  maxWidth: "320px",
  lineHeight: 1.4,
} satisfies React.CSSProperties;

const toastDismissStyle = {
  position: "absolute",
  top: "0.35rem",
  right: "0.35rem",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.5)",
  padding: "0.2rem",
  borderRadius: "var(--radius-xs)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 120ms ease",
} satisfies React.CSSProperties;
