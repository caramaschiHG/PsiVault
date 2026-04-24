# Phase 34: Feedback de Ação e Loading - Pattern Map

**Mapped:** 2026-04-24
**Files analyzed:** 14
**Analogs found:** 12 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ui/toast-provider.tsx` | component | event-driven | itself (refinement) | exact |
| `src/components/ui/button.tsx` | component | request-response | itself (refinement) | exact |
| `src/components/ui/spinner.tsx` | component | static-render | `SpinnerIcon` in `src/components/ui/button.tsx` | exact |
| `src/components/ui/skeleton.tsx` | component | static-render | itself (refinement) | exact |
| `src/styles/motion.css` | config | static | itself (additions) | exact |
| `src/app/globals.css` | config | static | itself (adjustments) | exact |
| `src/app/(vault)/agenda/components/calendar-grid.tsx` | component | event-driven | `src/app/(vault)/financeiro/page-client.tsx` | role-match |
| `src/app/(vault)/agenda/components/week-calendar-grid.tsx` | component | event-driven | `src/app/(vault)/agenda/components/calendar-grid.tsx` | role-match |
| `src/app/(vault)/agenda/components/quick-create-wrapper.tsx` | component | event-driven | itself (audit) | exact |
| `src/app/(vault)/financeiro/components/expense-side-panel.tsx` | component | request-response | itself (reference pattern) | exact |
| Form components (auth, patients, settings) | component | request-response | `expense-side-panel.tsx` | role-match |
| `tests/components/ui/toast-provider.test.tsx` | test | static | `tests/streaming/integration.test.tsx` | role-match |
| `tests/components/ui/button.test.tsx` | test | static | `tests/streaming/integration.test.tsx` | role-match |
| `tests/components/ui/spinner.test.tsx` | test | static | `tests/streaming/integration.test.tsx` | role-match |
| `tests/components/ui/form-error-feedback.test.tsx` | test | static | `tests/streaming/integration.test.tsx` | role-match |

## Pattern Assignments

### `src/components/ui/toast-provider.tsx` (component, event-driven)

**Analog:** itself (existing pattern being refined)

**Imports pattern** (lines 1-4):
```typescript
"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
```

**Core toast state pattern** (lines 36-50):
```typescript
const toast = useCallback((message: string, type: ToastType = "success") => {
  const id = `toast-${++counterRef.current}`;
  setToasts((prev) => {
    const next = [...prev, { id, message, type, fading: false }];
    return next.slice(-4); // max 4
  });

  // Start fade at 3000ms, remove at 3500ms
  setTimeout(() => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, fading: true } : t));
  }, 3000);
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3500);
}, []);
```

**Exit animation pattern** (lines 64-74):
```tsx
<div
  key={t.id}
  className={t.fading ? "" : "toast-enter"}
  style={{
    ...toastStyle,
    borderLeftColor: borderColors[t.type],
    opacity: t.fading ? 0 : 1,
    transition: t.fading ? "opacity 500ms ease" : "none",
    position: "relative",
    pointerEvents: "auto",
  }}
  role="status"
>
```

**Pattern to copy for refinement:**
- Keep the `fading` boolean state + dual `setTimeout` pattern.
- Change inline `transition: "opacity 500ms ease"` to `var(--duration-300)` and `var(--ease-out)`.
- Align removal timeout to `3000ms + 300ms = 3300ms`.
- Add `.toast-exit` class (to be defined in `motion.css`) instead of inline transition for better `prefers-reduced-motion` support.

---

### `src/components/ui/button.tsx` (component, request-response)

**Analog:** itself (existing pattern being refined)

**Imports pattern** (lines 1-3):
```typescript
"use client";

import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from "react";
```

**SpinnerIcon pattern** (lines 45-67):
```typescript
function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 0.6s linear infinite", flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="22"
        strokeDashoffset="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

**Loading state wiring** (lines 84, 99-100, 114-117):
```typescript
const isDisabled = disabled || isLoading;
// ...
{isLoading && <SpinnerIcon />}
{isLoading && loadingLabel ? loadingLabel : children}
```

**Pattern to copy for refinement:**
- If extracting `Spinner` to standalone file, move `SpinnerIcon` markup verbatim and import it.
- Keep `aria-busy={isLoading ? "true" : undefined}` and `disabled={isDisabled}` patterns.

---

### `src/components/ui/spinner.tsx` (component, static-render) — NEW

**Analog:** `SpinnerIcon` inside `src/components/ui/button.tsx` (lines 45-67)

**Core pattern to copy:**
```tsx
"use client";

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 0.6s linear infinite", flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="22"
        strokeDashoffset="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

---

### `src/components/ui/skeleton.tsx` (component, static-render)

**Analog:** itself (existing pattern being refined)

**Core pattern** (lines 12-31):
```tsx
export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "var(--radius-sm)",
  className = "",
  style,
  delay = 0,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    />
  );
}
```

**Pattern to copy:** Keep component signature unchanged. Only adjust `.skeleton-shimmer` CSS in `globals.css` / `motion.css` if gradient colors or speed need tuning.

---

### `src/styles/motion.css` (config, static)

**Analog:** itself (additions)

**Existing keyframe pattern** (lines 84-87):
```css
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}
```

**Existing reduced-motion pattern** (lines 138-161):
```css
@media (prefers-reduced-motion: reduce) {
  .motion-fade-in,
  .toast-enter,
  .skeleton-shimmer,
  .input-error-shake {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

**Pattern to add:**
```css
@keyframes toastFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

.toast-exit {
  animation: toastFadeOut var(--duration-300) var(--ease-out) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .toast-exit {
    animation: none !important;
    opacity: 0 !important;
  }
}
```

---

### `src/app/globals.css` (config, static)

**Analog:** itself (adjustments)

**Existing skeleton-shimmer** (lines 532-537):
```css
.skeleton-shimmer {
  background: linear-gradient(90deg, #f0ebe2 25%, #e8e2d9 50%, #f0ebe2 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: var(--radius-sm);
}
```

**Pattern to copy for refinement:**
- Optionally tokenize gradient colors to `var(--color-surface-3)` and `var(--color-bg)`.
- Optionally adjust duration from `1.4s` to `1.6s` for more organic feel.

---

### `src/app/(vault)/agenda/components/calendar-grid.tsx` (component, event-driven)

**Analog:** `src/app/(vault)/financeiro/page-client.tsx` (good useTransition pattern)

**Bad pattern (discard)** (line 40):
```typescript
const [, startTransition] = useTransition();
```

**Good pattern to copy** (from `financeiro/page-client.tsx`, lines 71, 123-135):
```typescript
const [isPending, startTransition] = useTransition();
// ...
<Button type="submit" variant="primary" isLoading={isPending}>
  {isPending ? "Salvando…" : "Salvar"}
</Button>
```

**Pattern to apply:**
- Capture `isPending` from `useTransition()`.
- Pass `isPending` to a visual indicator (opacity, spinner, or `cursor: wait`) on the interactive element.
- For calendar navigation, subtle opacity dip on grid container during `isPending` is sufficient.

---

### `src/app/(vault)/agenda/components/week-calendar-grid.tsx` (component, event-driven)

**Analog:** `src/app/(vault)/agenda/components/calendar-grid.tsx`

**Bad pattern (discard)** (line 50):
```typescript
const [, startTransition] = useTransition();
```

**Good pattern to copy:** Same as `calendar-grid.tsx` — capture `isPending` and wire to visual feedback.

---

### `src/app/(vault)/agenda/components/quick-create-wrapper.tsx` (component, event-driven)

**Analog:** itself (audit)

**Existing pattern** (lines 25, 39-51):
```typescript
const [isPending, startTransition] = useTransition();
// ...
const handleCreate = useCallback(
  async (formData: FormData) => {
    const result = await onCreate(formData);
    if (result.success) {
      startTransition(() => {
        router.refresh();
        handleClose();
      });
    }
    return result;
  },
  [onCreate, router, handleClose],
);
```

**Note:** `isPending` is captured but not wired to any visual indicator in this file. The `QuickCreatePopover` child receives no `isPending` prop. Pattern to copy from `financeiro/page-client.tsx`: wire `isPending` to a loading state on the submit trigger.

---

### Form error feedback — various form components

**Analog:** `src/app/(vault)/financeiro/components/expense-side-panel.tsx`

**Shake class application** (lines 267, 306-318):
```typescript
const shakeClass = formError ? "input-error input-error-shake" : "";
// ...
<input
  className={`input-field ${shakeClass}`}
  onAnimationEnd={(e) => {
    if (e.animationName === "inputShake") {
      e.currentTarget.classList.remove("input-error-shake");
    }
  }}
/>
```

**Pattern to copy:**
- Compute `shakeClass` from error state.
- Apply to `.input-field` or `.auth-input`.
- Always add `onAnimationEnd` handler to remove `.input-error-shake` so animation can re-trigger.
- For selects, apply `.select-has-value` alongside shake class.

---

### Test files (new)

**Analog:** `tests/streaming/integration.test.tsx`

**Test setup pattern** (lines 1-9):
```typescript
/** @vitest-environment jsdom */
import React, { use } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
```

**Query pattern** (lines 44-45, 72-73):
```typescript
const skeletons = document.querySelectorAll(".skeleton-shimmer");
expect(skeletons.length).toBeGreaterThanOrEqual(1);
```

**Async pattern** (lines 25-39):
```typescript
await act(async () => {
  render(<Component />);
});
expect(await screen.findByTestId("async-section")).toHaveTextContent("Section loaded");
```

**Pattern to copy for new UI tests:**
- Use `/** @vitest-environment jsdom */` at top.
- Import `render`, `screen`, `act` from `@testing-library/react`.
- For class-based assertions, use `document.querySelectorAll`.
- For toast exit tests, use `act` + `jest.advanceTimersByTime` (or `vi.advanceTimersByTime`) to simulate timeouts.

---

## Shared Patterns

### Toast State Synchronization
**Source:** `src/components/ui/toast-provider.tsx` (lines 36-50)
**Apply to:** `toast-provider.tsx` only
```typescript
const toast = useCallback((message: string, type: ToastType = "success") => {
  const id = `toast-${++counterRef.current}`;
  setToasts((prev) => {
    const next = [...prev, { id, message, type, fading: false }];
    return next.slice(-4);
  });
  setTimeout(() => setToasts((prev) => prev.map((t) => t.id === id ? { ...t, fading: true } : t)), 3000);
  setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3300);
}, []);
```

### prefers-reduced-motion Override
**Source:** `src/styles/motion.css` (lines 138-161)
**Apply to:** All new animation classes added in this phase
```css
@media (prefers-reduced-motion: reduce) {
  .toast-exit {
    animation: none !important;
    opacity: 0 !important;
  }
}
```

### useTransition Loading State
**Source:** `src/app/(vault)/financeiro/page-client.tsx` (lines 71, 379-381)
**Apply to:** All components using `useTransition` for Server Actions
```typescript
const [isPending, startTransition] = useTransition();
// ...
<Button type="submit" variant="primary" isLoading={isPending}>
  {isPending ? "Salvando…" : "Salvar"}
</Button>
```

### Form Error Shake
**Source:** `src/app/(vault)/financeiro/components/expense-side-panel.tsx` (lines 267, 312-318)
**Apply to:** All form inputs with validation errors
```typescript
const shakeClass = formError ? "input-error input-error-shake" : "";
<input
  className={`input-field ${shakeClass}`}
  onAnimationEnd={(e) => {
    if (e.animationName === "inputShake") {
      e.currentTarget.classList.remove("input-error-shake");
    }
  }}
/>
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/app/(vault)/settings/dados-e-privacidade/components/workspace-backup-button.tsx` | component | event-driven | Audit only — no structural changes expected, just wiring `isPending` to visual state if missing. Pattern is identical to other useTransition components. |
| `src/app/(vault)/patients/[patientId]/components/reminders-section.tsx` | component | event-driven | Same as above — audit-only file. |
| `src/app/(vault)/patients/[patientId]/components/export-section.tsx` | component | event-driven | Same as above — audit-only file. |

## Metadata

**Analog search scope:** `src/components/ui/`, `src/app/(vault)/`, `src/styles/`, `src/app/globals.css`, `tests/`
**Files scanned:** 20
**Pattern extraction date:** 2026-04-24
