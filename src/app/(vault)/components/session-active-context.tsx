"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { getTodayConfirmedAppointmentsAction } from "../actions/session";

interface SessionActiveContextValue {
  isSessionActive: boolean;
}

const SessionActiveContext = createContext<SessionActiveContextValue | null>(null);

const TOLERANCE_MS = 5 * 60 * 1000; // ±5min margin
const POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Detects whether the user is currently in a clinical session.
 *
 * Interruption hierarchy (Calm UX):
 *   status_light > badge > dropdown > modal
 *
 * During an active session, only outputs up to "dropdown" are allowed.
 * Modal-level notifications are queued and released after the session ends.
 */
export function SessionActiveProvider({ children }: { children: React.ReactNode }) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const appointmentsRef = useRef<{ startsAt: string; endsAt: string }[]>([]);

  const checkSession = useCallback(() => {
    const now = Date.now();
    const active = appointmentsRef.current.some((a) => {
      const start = new Date(a.startsAt).getTime() - TOLERANCE_MS;
      const end = new Date(a.endsAt).getTime() + TOLERANCE_MS;
      return now >= start && now <= end;
    });
    setIsSessionActive(active);
  }, []);

  useEffect(() => {
    let mounted = true;

    getTodayConfirmedAppointmentsAction()
      .then((apps) => {
        if (!mounted) return;
        appointmentsRef.current = apps;
        checkSession();
      })
      .catch(() => {
        // Silently fail — session detection is a UX feature, not a security boundary
      });

    const interval = setInterval(() => {
      getTodayConfirmedAppointmentsAction()
        .then((apps) => {
          if (!mounted) return;
          appointmentsRef.current = apps;
          checkSession();
        })
        .catch(() => {
          // Silently fail
        });
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [checkSession]);

  return (
    <SessionActiveContext.Provider value={{ isSessionActive }}>
      {children}
    </SessionActiveContext.Provider>
  );
}

export function useSessionActive(): SessionActiveContextValue {
  const ctx = useContext(SessionActiveContext);
  if (!ctx) throw new Error("useSessionActive must be used within SessionActiveProvider");
  return ctx;
}
