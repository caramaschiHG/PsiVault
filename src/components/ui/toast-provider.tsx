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
    success: "#2d6a4f",
    error: "#9f1239",
    info: "#b45309",
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
                transition: t.fading ? "opacity 0.5s ease" : "none",
              }}
              role="status"
            >
              {t.message}
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
  borderRadius: "8px",
  background: "rgba(28, 25, 23, 0.92)",
  color: "#fff7ed",
  fontSize: "0.875rem",
  borderLeft: "3px solid transparent",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  transition: "opacity 0.5s ease",
  maxWidth: "320px",
  lineHeight: 1.4,
} satisfies React.CSSProperties;
