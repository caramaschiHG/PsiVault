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
    <div ref={ref} className="notif-bell-wrap">
      <button
        onClick={() => setOpen((v) => !v)}
        className="notif-bell"
        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notificações">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notificações</span>
            <div className="notif-dropdown-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="notif-action">
                  Marcar todas como lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="notif-action notif-action--danger">
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                  className={`notif-item${!n.read ? " notif-item--unread" : ""}`}
                >
                  <div className="notif-item-content">
                    {!n.read && <span className="notif-unread-dot" />}
                    <div className="notif-item-body">
                      <div className="notif-item-header">
                        <span className={`notif-item-title${!n.read ? " notif-item-title--unread" : ""}`}>
                          {n.title}
                        </span>
                      </div>
                      {n.description && (
                        <p className="notif-item-desc">
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
