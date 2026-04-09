"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "./notification-context";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={bellButtonStyle}
        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={badgeStyle}
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={dropdownStyle} role="dialog" aria-label="Notificações">
          <div style={dropdownHeaderStyle}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-1)" }}>
              Notificações
            </span>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={dropdownActionStyle}>
                  Marcar todas como lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} style={{ ...dropdownActionStyle, color: "var(--color-rose)" }}>
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--color-text-3)", fontSize: "0.8rem" }}>
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                  style={{
                    ...notifItemStyle,
                    background: n.read ? "transparent" : "rgba(154, 52, 18, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    {!n.read && <span style={unreadDotStyle} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {n.icon && <span style={{ flexShrink: 0 }}>{n.icon}</span>}
                        <span style={{ fontSize: "0.82rem", fontWeight: n.read ? 500 : 600, color: "var(--color-text-1)", lineHeight: 1.3 }}>
                          {n.title}
                        </span>
                      </div>
                      {n.description && (
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--color-text-3)", lineHeight: 1.4 }}>
                          {n.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const bellButtonStyle: React.CSSProperties = {
  position: "relative",
  width: "36px",
  height: "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.6)",
  borderRadius: "var(--radius-sm)",
  transition: "color 120ms ease, background-color 120ms ease",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "2px",
  right: "2px",
  minWidth: "16px",
  height: "16px",
  borderRadius: "999px",
  background: "var(--color-rose)",
  color: "#fff",
  fontSize: "0.6rem",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 3px",
  lineHeight: 1,
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: "50%",
  transform: "translateX(-50%)",
  width: "340px",
  background: "var(--color-surface-0)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-xl)",
  zIndex: "var(--z-dropdown)",
  overflow: "hidden",
};

const dropdownHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
};

const dropdownActionStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "0.7rem",
  color: "var(--color-accent)",
  fontWeight: 500,
  padding: "0.15rem 0.3rem",
  borderRadius: "var(--radius-xs)",
};

const notifItemStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  borderBottom: "1px solid rgba(0,0,0,0.04)",
  transition: "background-color 120ms ease",
};

const unreadDotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "var(--color-accent)",
  marginTop: "6px",
  flexShrink: 0,
};
