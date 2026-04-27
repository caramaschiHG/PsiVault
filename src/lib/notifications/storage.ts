import type { AppNotification } from "./types";

// Abstract storage interface — swap implementation for server-side later
export interface NotificationStorage {
  load(): AppNotification[];
  save(notifications: AppNotification[]): void;
  clear(): void;
}

const STORAGE_KEY = "psivault_notifications_v2";
const MAX_STORED = 50;
const AGENT_SUMMARY_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// localStorage implementation
export class LocalNotificationStorage implements NotificationStorage {
  load(): AppNotification[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const all = JSON.parse(raw) as AppNotification[];
      const now = Date.now();
      // Remove agent_summary notifications older than 7 days
      const filtered = all.filter((n) => {
        if (n.type === "agent_summary") {
          return now - n.createdAt < AGENT_SUMMARY_MAX_AGE_MS;
        }
        return true;
      });
      // Persist the cleanup
      if (filtered.length < all.length) {
        this.save(filtered);
      }
      return filtered;
    } catch {
      return [];
    }
  }

  save(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // quota exceeded — keep only last 10
      const trimmed = notifications.slice(0, Math.floor(MAX_STORED / 5));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // still failing — clear entirely
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Default singleton — used by NotificationProvider
export const defaultStorage = new LocalNotificationStorage();
