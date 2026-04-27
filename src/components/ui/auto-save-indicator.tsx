"use client";

/**
 * AutoSaveIndicator — visual feedback for auto-save status.
 *
 * Usage:
 *   <AutoSaveIndicator status="saved" lastSaved={date} />
 */

import { useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function CheckCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: "spin 0.6s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ─── Hook: useAutoSave (localStorage-based — used by clinical notes, NOT documents) ─────────────

export function useAutoSave(storageKey: string, value: string, debounceMs = 2000) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    timer.current = setTimeout(() => {
      localStorage.setItem(storageKey, value);
      setLastSaved(new Date());
      setStatus("saved");
    }, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, isDirty, storageKey, debounceMs]);

  // Re-render indicator every 30s
  useEffect(() => {
    if (!lastSaved) return;
    const t = setInterval(() => setLastSaved((d) => d ? new Date(d) : null), 30_000);
    return () => clearInterval(t);
  }, [lastSaved]);

  return { status, lastSaved, isDirty, markDirty: () => setIsDirty(true) };
}

const CONFIG: Record<SaveStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  idle: { icon: <CheckCircleIcon />, color: "var(--color-success-text)", bg: "rgba(240,253,244,0.95)" },
  saving: { icon: <LoaderIcon />, color: "var(--color-brown-mid)", bg: "rgba(254,243,199,0.95)" },
  saved: { icon: <CheckCircleIcon />, color: "var(--color-success-text)", bg: "rgba(240,253,244,0.95)" },
  error: { icon: <AlertTriangleIcon />, color: "var(--color-error-text)", bg: "rgba(254,226,226,0.95)" },
};

function formatRelative(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 5) return "agora";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}min`;
}

export function AutoSaveIndicator({ status, lastSaved, className = "" }: {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
}) {
  const cfg = CONFIG[status];
  const labels: Record<SaveStatus, string> = {
    idle: "Salvo",
    saving: "Salvando…",
    saved: lastSaved ? `Salvo ${formatRelative(lastSaved)}` : "Salvo",
    error: "Erro ao salvar",
  };

  return (
    <div
      className={`autosave ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "var(--radius-pill)",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "0.72rem",
        fontWeight: 500,
        transition: "opacity 150ms ease, background-color 150ms ease, color 150ms ease",
      }}
      aria-live="polite"
    >
      <span style={{ lineHeight: 1, display: "flex" }}>{cfg.icon}</span>
      <span>{labels[status]}</span>
    </div>
  );
}


