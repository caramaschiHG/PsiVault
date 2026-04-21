"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  type AppNotification,
  type CreateNotificationInput,
  type NotificationStorage,
  defaultStorage,
} from "@/lib/notifications";

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
  const initialized = useRef(false);

  // Load from storage on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setNotifications(storage.load());
    }
  }, [storage]);

  // Persist to storage on change
  useEffect(() => {
    if (initialized.current) {
      storage.save(notifications);
    }
  }, [notifications, storage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (n: CreateNotificationInput) => {
    const newNotif = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
      createdAt: Date.now(),
    } as AppNotification;
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    storage.clear();
  };

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
