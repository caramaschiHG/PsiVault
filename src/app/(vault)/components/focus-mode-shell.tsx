"use client";

import { useFocusMode } from "./focus-mode-context";

export function FocusModeShell({ children }: { children: React.ReactNode }) {
  const { focusMode } = useFocusMode();
  return (
    <div data-focus-mode={focusMode ? "true" : "false"} style={shellStyle}>
      {children}
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "var(--color-surface-0)",
};
