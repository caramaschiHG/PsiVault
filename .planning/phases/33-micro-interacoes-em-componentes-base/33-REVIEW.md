---
phase: 33-micro-interacoes-em-componentes-base
reviewed: 2026-04-24T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/app/globals.css
  - src/styles/motion.css
  - src/components/ui/card.tsx
  - src/app/(auth)/components/password-input.tsx
  - src/app/(auth)/sign-in/page.tsx
  - src/app/(auth)/sign-up/page.tsx
  - src/app/(auth)/reset-password/page.tsx
  - src/app/(auth)/complete-profile/page.tsx
  - src/app/(vault)/financeiro/components/expense-filters.tsx
  - src/app/(vault)/financeiro/components/expense-side-panel.tsx
  - src/app/(vault)/financeiro/components/expense-category-modal.tsx
  - src/app/(vault)/inicio/components/reminders-section.tsx
  - src/app/(vault)/components/search-bar.tsx
findings:
  critical: 0
  warning: 6
  info: 5
  total: 11
status: issues_found
---

# Phase 33: Code Review Report

**Reviewed:** 2026-04-24
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 33 introduced micro-interaction CSS foundations (focus rings, card hover, error shake, floating labels) and refactored auth and vault forms to use the new floating-label DOM structure. The changes are well-scoped and test-passing. However, several accessibility gaps, timezone bugs, and fragile string comparisons were found. No security vulnerabilities (injections, secrets, XSS vectors) were detected in the changed files.

## Warnings

### WR-01: Broken label–input association in PasswordInput

**File:** `src/app/(auth)/components/password-input.tsx:58,79`
**Issue:** The `<label>` uses `htmlFor={name}`, but the `<input>` does not receive a matching `id`. Unless the parent explicitly passes an `id` prop, screen readers will not associate the label with the input. The floating-label CSS (`:placeholder-shown`) works visually, but the a11y contract is broken by default.
**Fix:**
```tsx
<input
  id={name}   // add this
  className={`auth-input ${shake ? "input-error input-error-shake" : ""}`}
  type={visible ? "text" : "password"}
  name={name}
  placeholder=" "
  {...props}
  ...
/>
```

### WR-02: Fragile English string check for expired token

**File:** `src/app/(auth)/reset-password/page.tsx:47-49`
**Issue:** `isTokenExpired` checks `rawError === "Token has expired or is invalid"`. If the backend ever returns localized or differently worded errors, this branch becomes dead code. The secondary check (`errorMessage?.includes("expirou")`) is safer but makes the English comparison redundant and misleading.
**Fix:** Remove the hardcoded English comparison and rely on a canonical error code (e.g., `params.errorCode`) or the translated substring check only.

### WR-03: UTC timezone drift in date helpers

**File:** `src/app/(vault)/financeiro/components/expense-side-panel.tsx:512-518`
**Issue:** `today()` and `toDateInput()` use `toISOString().split("T")[0]`, which yields UTC. In Brazil (UTC-3), after 21:00 local time the date string rolls forward to the next day, causing the form to pre-fill the wrong date.
**Fix:**
```ts
function today(): string {
  const d = new Date();
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}
```

### WR-04: Unstable useEffect dependency causes unnecessary form resets

**File:** `src/app/(vault)/financeiro/components/expense-side-panel.tsx:65-87`
**Issue:** The reset `useEffect` depends on `[open, expense, categories]`. Because `categories` is an array reference, any parent re-render that recreates the array will wipe user input even if the data is unchanged.
**Fix:** Stabilize the array upstream (e.g., `useMemo`) or compare by content inside the effect before resetting state.

### WR-05: Silent zero-amount fallback on parse failure

**File:** `src/app/(vault)/financeiro/components/expense-side-panel.tsx:135`
**Issue:** `getFormPatch` returns `amountInCents: parseBRLToCents(amountDisplay) ?? 0`. If the user types an invalid amount, the form silently falls back to 0 cents, which may create an unintended zero-value expense.
**Fix:** Surface the parse failure as a validation error instead of coercing to zero.

### WR-06: asLink prop does not render accessible link element

**File:** `src/components/ui/card.tsx:62,64,78`
**Issue:** `asLink` sets `isInteractive = true` and adds `cursor: pointer` + `card-hover`, but the rendered element is still `"div"` unless `onClick` is also provided. A card marked `asLink` without `onClick` is not keyboard-focusable and has no link semantics.
**Fix:** Accept an optional `href` prop and render `<a>` when `asLink` is true, or document that `asLink` requires an `onClick` wrapper for accessibility.

## Info

### IN-01: Redundant aria-label on search input

**File:** `src/app/(vault)/components/search-bar.tsx:139`
**Issue:** The `<input>` has `aria-label="Buscar"` while a visually hidden `<label htmlFor="vault-search">` also exists. Screen readers will read the label association; the `aria-label` is redundant.
**Fix:** Remove `aria-label` and let the visible/visually-hidden label serve as the accessible name.

### IN-02: Intl.DateTimeFormat recreated every render

**File:** `src/app/(vault)/inicio/components/reminders-section.tsx:33`
**Issue:** `new Intl.DateTimeFormat("pt-BR", ...)` is instantiated inside the component body. This is a minor allocation on every render.
**Fix:** Move the formatter to module scope.

### IN-03: Numeric inputs use type="text"

**File:** `src/app/(vault)/financeiro/components/expense-filters.tsx:90,104`
**Issue:** The min/max value filters use `type="text"` without `inputMode="numeric"`, degrading mobile UX.
**Fix:** Change to `type="text" inputMode="numeric"` or `type="number"` if appropriate.

### IN-04: Hardcoded default price constant

**File:** `src/app/(auth)/complete-profile/page.tsx:119`
**Issue:** `defaultValue={profile.defaultSessionPriceInCents ?? 18000}` uses a magic number.
**Fix:** Extract a named constant, e.g., `const DEFAULT_SESSION_PRICE_CENTS = 18000;`.

### IN-05: Repeated onAnimationEnd handler pattern

**Files:** Multiple (`sign-in/page.tsx`, `sign-up/page.tsx`, `reset-password/page.tsx`, `expense-side-panel.tsx`)
**Issue:** The same `onAnimationEnd` inline handler is copy-pasted in many inputs. This is a maintainability tax.
**Fix:** Extract a shared helper such as:
```ts
function removeShakeOnEnd(e: React.AnimationEvent<HTMLElement>) {
  if (e.animationName === "inputShake") {
    e.currentTarget.classList.remove("input-error-shake");
  }
}
```

---

_Reviewed: 2026-04-24_
_Reviewer: gsd-code-reviewer_
_Depth: standard_
