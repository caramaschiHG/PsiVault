"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import {
  type AppNotification,
  type CreateNotificationInput,
  type NotificationStorage,
  defaultStorage,
} from "@/lib/notifications";
import { useSessionActive } from "@/app/(vault)/components/session-active-context";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: CreateNotificationInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  storage?: NotificationStorage;
}

export function NotificationProvider({
  children,
  storage = defaultStorage,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [blockedModals, setBlockedModals] = useState<CreateNotificationInput[]>([]);
  const initialized = useRef(false);
  const { isSessionActive } = useSessionActive();
  const wasSessionActive = useRef(isSessionActive);

  // Load from storage on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setNotifications(storage.load());
    }
  }, [storage]);

  // Persist to storage on change (blockedModals intentionally NOT persisted)
  useEffect(() => {
    if (initialized.current) {
      storage.save(notifications);
    }
  }, [notifications, storage]);

  // Release blocked modals when session ends
  useEffect(() => {
    if (wasSessionActive.current && !isSessionActive && blockedModals.length > 0) {
      setNotifications((prev) => {
        const released = blockedModals.map((n) => ({
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          read: false,
          createdAt: Date.now(),
        })) as AppNotification[];
        return [...released, ...prev].slice(0, 50);
      });
      setBlockedModals([]);
    }
    wasSessionActive.current = isSessionActive;
  }, [isSessionActive, blockedModals]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: CreateNotificationInput) => {
    const { level, ...rest } = n;

    if (level === "modal" && isSessionActive) {
      setBlockedModals((prev) => {
        const next = [...prev, n];
        return next.slice(-50); // cap at 50, drop oldest
      });
      return;
    }

    setNotifications((prev) => {
      const newNotif = {
        ...rest,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        read: false,
        createdAt: Date.now(),
      } as AppNotification;
      return [newNotif, ...prev].slice(0, 50);
    });
  }, [isSessionActive]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setBlockedModals([]);
    storage.clear();
  }, [storage]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

// Re-export for backward compatibility
export type { AppNotification } from "@/lib/notifications";
