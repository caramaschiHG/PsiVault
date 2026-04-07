"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseKeyboardShortcutsOptions {
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange?: (view: "day" | "week" | "month") => void;
  onClose?: () => void;
  enabled?: boolean;
}

/**
 * Register keyboard shortcuts for agenda navigation.
 *
 * Shortcuts:
 * - ArrowLeft: previous period
 * - ArrowRight: next period
 * - T / t: today
 * - D / d: day view
 * - W / w: week view
 * - M / m: month view
 * - Escape: close panel/popover
 *
 * Ignores key events when focus is on an input, textarea, or select.
 */
export function useKeyboardShortcuts({
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onClose,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handlersRef = useRef({ onPrev, onNext, onToday, onViewChange, onClose });
  handlersRef.current = { onPrev, onNext, onToday, onViewChange, onClose };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore when typing in form elements
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const { onPrev, onNext, onToday, onViewChange, onClose } = handlersRef.current;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        onPrev();
        break;
      case "ArrowRight":
        e.preventDefault();
        onNext();
        break;
      case "t":
      case "T":
        e.preventDefault();
        onToday();
        break;
      case "d":
      case "D":
        e.preventDefault();
        onViewChange?.("day");
        break;
      case "w":
      case "W":
        e.preventDefault();
        onViewChange?.("week");
        break;
      case "m":
      case "M":
        e.preventDefault();
        onViewChange?.("month");
        break;
      case "Escape":
        if (onClose) {
          e.preventDefault();
          onClose();
        }
        break;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}
