"use client";

/**
 * KeyboardShortcutsModal — discoverable keyboard shortcuts overlay.
 * Triggered by "?". Shows grouped shortcuts. Dismissed by Escape.
 *
 * Usage:
 *   <KeyboardShortcutsModal groups={groups} open={open} onOpenChange={setOpen} />
 */

import { useEffect } from "react";

interface ShortcutGroup { label: string; shortcuts: { keys: string[]; description: string }[]; }

export function KeyboardShortcutsModal({ groups, open, onOpenChange }: {
  groups: ShortcutGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    window.addEventListener("keydown", h);

    // Focus trap
    const modal = document.querySelector<HTMLElement>("[data-modal-content]");
    if (modal) {
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const elements = Array.from(focusable);
      const first = elements[0];
      const last = elements[elements.length - 1];
      first?.focus();

      const trap = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };
      modal.addEventListener("keydown", trap);
      return () => { window.removeEventListener("keydown", h); modal.removeEventListener("keydown", trap); };
    }

    return () => { window.removeEventListener("keydown", h); };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="kbd-overlay"
      onClick={() => onOpenChange(false)}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: "var(--z-modal)", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      role="dialog" aria-modal="true" aria-label="Atalhos de teclado"
    >
      <div
        data-modal-content
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface-1)", borderRadius: "20px", border: "1px solid rgba(146,64,14,0.15)",
          boxShadow: "var(--shadow-xl)", maxWidth: 540, width: "90vw",
          maxHeight: "80vh", overflow: "auto", padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--color-text-1)" }}>Atalhos de teclado</h2>
          <button onClick={() => onOpenChange(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-2)", minWidth: "44px", minHeight: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-xs)" }} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {groups.map((g) => (
          <div key={g.label} style={{ marginBottom: "1.25rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-4)" }}>{g.label}</p>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              {g.shortcuts.map((s) => (
                <div key={s.description} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-warm-brown)" }}>{s.description}</span>
                  <div style={{ display: "flex", gap: "0.2rem" }}>
                    {s.keys.map((k) => (
                      <kbd key={k} style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        minWidth: "1.6rem", height: "1.6rem", padding: "0 0.35rem",
                        borderRadius: "6px", background: "var(--color-kbd-bg)", border: "1px solid var(--color-kbd-border)",
                        fontSize: "0.72rem", fontWeight: 600, color: "var(--color-kbd-text)",
                        boxShadow: "0 1px 0 var(--color-text-4)",
                      }}>{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p style={{ margin: "0.5rem 0 0", fontSize: "0.72rem", color: "var(--color-text-4)", textAlign: "center" }}>
          Pressione <kbd style={{ fontSize: "0.7rem", padding: "0.1rem 0.3rem", borderRadius: "4px", background: "var(--color-kbd-bg)", border: "1px solid var(--color-kbd-border)" }}>Esc</kbd> para fechar
        </p>
      </div>
    </div>
  );
}

// ─── Hook: useGlobalShortcuts ────────────────────────────────────────────────

interface Binding { key: string; handler: () => void; description?: string; }

let _bindings: Binding[] = [];
let _attached = false;

function handleGlobal(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement).isContentEditable) return;
  for (const b of _bindings) {
    if (e.key.toLowerCase() === b.key.toLowerCase() && !e.metaKey && !e.ctrlKey) {
      b.handler(); break;
    }
  }
}

export function useGlobalShortcuts(bindings: Binding[]) {
  useEffect(() => {
    _bindings = bindings;
    if (!_attached) { window.addEventListener("keydown", handleGlobal); _attached = true; }
    return () => { _bindings = []; };
  }, [bindings]);
}
