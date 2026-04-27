"use client";

import { useEffect } from "react";
import { useFocusMode } from "./focus-mode-context";

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { toggleFocusMode } = useFocusMode();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        toggleFocusMode();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleFocusMode]);

  return <>{children}</>;
}
