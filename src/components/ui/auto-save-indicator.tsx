"use client";

/**
 * AutoSaveIndicator — visual feedback for auto-save status.
 *
 * Usage:
 *   <AutoSaveIndicator status="saved" lastSaved={date} />
 */

import { useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const CONFIG: Record<SaveStatus, { icon: string; color: string; bg: string }> = {
  idle: { icon: "✓", color: "#15803d", bg: "rgba(240,253,244,0.95)" },
  saving: { icon: "⟳", color: "#a16207", bg: "rgba(254,243,199,0.95)" },
  saved: { icon: "✓", color: "#15803d", bg: "rgba(240,253,244,0.95)" },
  error: { icon: "!", color: "#dc2626", bg: "rgba(254,226,226,0.95)" },
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
        borderRadius: "999px",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "0.72rem",
        fontWeight: 500,
        transition: "all 150ms ease",
      }}
      aria-live="polite"
    >
      <span style={{ fontSize: "0.8rem", lineHeight: 1 }}>{cfg.icon}</span>
      <span>{labels[status]}</span>
    </div>
  );
}

// ─── Hook: useAutoSave ──────────────────────────────────────────────────────

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
