"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/lib/notifications";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: () => void;
  onCloseDropdown: () => void;
}

export function NotificationItem({ notification: n, onMarkAsRead, onCloseDropdown }: NotificationItemProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (!n.read) onMarkAsRead();

    if (n.type === "update") {
      setExpanded((v) => !v);
    } else if (n.type === "session_reminder") {
      router.push("/agenda");
      onCloseDropdown();
    } else if (n.type === "payment_pending") {
      router.push("/financeiro");
      onCloseDropdown();
    } else if (n.type === "patient_noshow" || n.type === "birthday") {
      // n is narrowed but TypeScript might need a check to access patientId
      if ("patientId" in n) {
        router.push(`/patients/${n.patientId}`);
      } else {
        router.push("/patients");
      }
      onCloseDropdown();
    } else {
      // Default fallback
      onCloseDropdown();
    }
  };

  const getIcon = () => {
    switch (n.type) {
      case "update":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        );
      case "session_reminder":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case "payment_pending":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case "patient_noshow":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case "birthday":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const getModifierClass = () => {
    switch (n.type) {
      case "update": return "notif-item--update";
      case "session_reminder": return "notif-item--reminder";
      case "payment_pending": return "notif-item--payment";
      case "patient_noshow": return "notif-item--noshow";
      case "birthday": return "notif-item--birthday";
      default: return "";
    }
  };

  const containerClass = `notif-item ${!n.read ? "notif-item--unread" : ""} ${getModifierClass()}`;

  return (
    <div className={containerClass}>
      <div className="notif-item-content">
        <button 
          className="notif-item-body" 
          onClick={handleClick} 
          style={{ display: 'flex', gap: '12px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}
        >
          {!n.read && <div style={{ paddingTop: '8px' }}><span className="notif-unread-dot" /></div>}
          
          <div className="notif-icon-wrap">
            {getIcon()}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="notif-item-header">
              <span className={`notif-item-title ${!n.read ? "notif-item-title--unread" : ""}`}>
                {n.title}
              </span>
            </div>
            {n.description && (
              <p className="notif-item-desc">
                {n.description}
              </p>
            )}
            
            {expanded && n.type === "update" && n.changelog && (
              <div className="notif-item-changelog">
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {n.changelog.map((item, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
