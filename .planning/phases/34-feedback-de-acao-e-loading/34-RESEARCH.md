# Phase 34: Feedback de Ação e Loading - Research

**Researched:** 2026-04-24
**Domain:** CSS-first animation, React state synchronization, loading state patterns, form error feedback
**Confidence:** HIGH

## Summary

This phase delivers calm, immediate visual feedback for user actions across the PsiVault app. It builds on the motion token foundation (Phase 32) and micro-interactions (Phase 33) to complete the feedback layer: refined toast enter/exit animations, consistent loading states for Server Action buttons, organic skeleton shimmer, a reusable Spinner component, and wired form error shake feedback.

The codebase already contains 90% of the structural pieces. The ToastProvider has a working vanilla React system with portal rendering. The Button component supports `isLoading` with an inline SVG spinner. The Skeleton component uses a `skeleton-shimmer` CSS animation. Form error shake keyframes exist in `motion.css`. The work here is **refinement and standardization** — not greenfield invention.

**Primary recommendation:** Edit existing files in place. Do not create new wrappers or abstractions unless the current pattern is genuinely broken. The executor's discretion areas (D-07, D-08, D-09, D-10) all lean toward "keep it simple" given the project's anti-bloat rule.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Toast animation | Browser / Client | — | CSS keyframes + React state for exit timing; no server involvement |
| Button loading state | Browser / Client | — | `useTransition` / `useFormStatus` are client-side React hooks |
| Skeleton shimmer | Browser / Client | CDN / Static | CSS animation only; rendered by SSR but stateless |
| Spinner component | Browser / Client | — | Pure SVG + CSS; no JS logic |
| Form error feedback | Browser / Client | — | CSS class toggling driven by client-side validation state |

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** CSS-first approach — no Framer Motion or AnimatePresence. Refine existing `toast-provider.tsx` with keyframes and CSS classes.
- **D-02:** Toast enter: slide + fade, duration ≤300ms. Reuse/adapt existing `toastSlideIn` keyframe in `motion.css`.
- **D-03:** Toast exit: pure fade, duration ≤300ms. Keep `fading` React state to delay DOM removal until animation completes.
- **D-04:** Toast visible for ~3s before exit animation starts.
- **D-05:** Do NOT animate stack repositioning. When a toast dismisses, remaining toasts jump instantly to new position.
- **D-06:** Max 4 toasts, fixed bottom-right position.
- **D-07:** Button loading — executor decides whether to standardize ~10 `useTransition` components or create a wrapper. Existing `Button` already has `isLoading` + `SpinnerIcon`; `SubmitButton` already connects `useFormStatus`.
- **D-08:** Skeleton shimmer — executor evaluates if current gradient is "organic enough" or needs color/speed adjustment.
- **D-09:** Spinner — executor decides whether to extract `SpinnerIcon` from `button.tsx` into standalone `Spinner` component.
- **D-10:** Form error feedback — executor verifies if `.input-error-shake` is wired in all forms and completes where missing.

### the agent's Discretion
- Exact technical approach for toast exit animation (CSS class vs inline style vs both).
- Whether to adjust toast easing curve to differentiate enter (snappier) from exit (softer).
- Shimmer gradient colors, loop speed.
- Whether to create a reusable hook (`useActionButton`) or standardize manually.

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEED-01 | Toast enter (slide+fade) and exit (fade), ≤300ms | `motion.css` already has `toastSlideIn` keyframe; `toast-provider.tsx` has `fading` state pattern; needs timing adjustment from 500ms→300ms |
| FEED-02 | Buttons firing Server Actions show loading visual via `useTransition` | `Button` has `isLoading` + `SpinnerIcon`; `SubmitButton` uses `useFormStatus`; ~10 manual `useTransition` callers need audit for visual consistency |
| FEED-03 | Skeletons use organic gradient shimmer instead of mechanical pulse | `skeleton-shimmer` keyframe exists; current gradient `#f0ebe2 → #e8e2d9 → #f0ebe2` at 1.4s is already organic; minor tuning possible |
| FEED-04 | Lightweight reusable `Spinner` component (SVG + CSS, no external libs) | `SpinnerIcon` inline in `button.tsx` is already the correct implementation; extraction to `src/components/ui/spinner.tsx` is low effort |
| FEED-05 | Form errors provide immediate visual feedback (border color transition + subtle shake) | `.input-error-shake` keyframe exists in `motion.css`; already wired in auth pages and `expense-side-panel.tsx`; needs audit of remaining forms |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 `useTransition` | 19.0 | Server Action loading state | Canonical React hook for non-blocking transitions |
| React 19 `useFormStatus` | 19.0 | Form submission pending state | Built-in, no custom context needed |
| CSS keyframes | — | All animations | Project constraint: CSS-first, no Framer Motion |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `createPortal` | React DOM | Toast rendering outside tree | Already in use; keep as-is |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS keyframes + class toggling | Framer Motion `AnimatePresence` | Framer would simplify exit animations but violates locked D-01 decision |
| Standalone `Spinner` component | Keep inline in `Button` | Extraction improves reusability with near-zero cost; aligns with D-09 discretion |
| Custom `useActionButton` hook | Manual `useTransition` in each component | Hook reduces boilerplate but adds abstraction; manual standardization is simpler for ~10 callers |

## Architecture Patterns

### System Architecture Diagram

```
User Action
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│  Form Submit    │────▶│ useFormStatus   │──▶ SubmitButton ──▶ Button[isLoading]
│  or Button Click│     │ (React 19)      │                      │
└─────────────────┘     └─────────────────┘                      ▼
    │                                                      ┌─────────────┐
    ▼                                                      │  Spinner    │
┌─────────────────┐     ┌─────────────────┐                │  (SVG+CSS)  │
│ useTransition   │────▶│  startTransition│──▶ Server Action│             │
│ (React 19)      │     │                 │                └─────────────┘
└─────────────────┘     └─────────────────┘
    │
    ▼
┌─────────────────┐
│ isPending state │──▶ Button disabled + opacity + spinner
└─────────────────┘

Toast Notification Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  toast()    │───▶│  React state│───▶│  CSS .toast-enter│──▶│  DOM mount  │
│  (context)  │    │  (toasts[]) │    │  (slide+fade)    │    │  (portal)   │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │  3000ms     │
                              │  timer      │
                              └─────────────┘
                                     │
                                     ▼
                              ┌─────────────┐    ┌─────────────┐
                              │  fading=true│───▶│  CSS opacity│──▶ unmount
                              │  (setState) │    │  transition │
                              └─────────────┘    └─────────────┘

Skeleton Loading Flow:
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Route load │───▶│  loading.tsx    │───▶│  <Skeleton />   │
│  (Next.js)  │    │  (streaming)    │    │  + shimmer CSS  │
└─────────────┘    └─────────────────┘    └─────────────────┘

Form Error Feedback Flow:
┌─────────────┐    ┌─────────────────┐    ┌─────────────────────────┐
│  Validation │───▶│  error state    │───▶│  .input-error-shake     │
│  failure    │    │  (React)        │    │  + border-color change  │
└─────────────┘    └─────────────────┘    └─────────────────────────┘
```

### Recommended Project Structure

```
src/
├── components/ui/
│   ├── toast-provider.tsx      # (edit) refine enter/exit timing
│   ├── button.tsx              # (edit) extract SpinnerIcon → import Spinner
│   ├── submit-button.tsx       # (no change needed)
│   ├── spinner.tsx             # (new OR skip) standalone Spinner
│   ├── skeleton.tsx            # (edit) adjust shimmer if needed
│   └── ...
├── styles/
│   └── motion.css              # (edit) refine toast keyframes, add exit keyframe if needed
└── app/
    └── globals.css             # (edit) ensure .skeleton-shimmer uses refined tokens
```

### Pattern 1: Toast Exit Animation with React State Synchronization
**What:** Use React state (`fading: boolean`) to trigger a CSS transition, then remove from DOM after transition completes.
**When to use:** Any component that needs to animate out before unmounting, without Framer Motion.
**Example:**
```tsx
// Source: src/components/ui/toast-provider.tsx (existing pattern)
const [toasts, setToasts] = useState<Toast[]>([]);

// On create: add toast with fading=false
setToasts((prev) => [...prev, { id, message, type, fading: false }]);

// Start exit at 3000ms
setTimeout(() => {
  setToasts((prev) => prev.map((t) => t.id === id ? { ...t, fading: true } : t));
}, 3000);

// Remove from DOM at 3000ms + exitDuration(300ms)
setTimeout(() => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}, 3300);

// Render: class for enter, inline style for exit
<div
  className={t.fading ? "" : "toast-enter"}
  style={{
    opacity: t.fading ? 0 : 1,
    transition: t.fading ? "opacity var(--duration-300) var(--ease-out)" : "none",
  }}
/>
```

### Pattern 2: Server Action Button with useTransition
**What:** Wrap the server action in `startTransition`, read `isPending` for visual feedback.
**When to use:** Buttons outside of `<form>` that trigger server actions.
**Example:**
```tsx
// Source: src/app/(vault)/financeiro/page-client.tsx (existing, good)
const [isPending, startTransition] = useTransition();

<Button type="submit" variant="primary" isLoading={isPending}>
  {isPending ? "Salvando…" : "Salvar"}
</Button>
```

### Pattern 3: Form Button with useFormStatus
**What:** Use React 19's `useFormStatus` inside a button rendered within a `<form action>`.
**When to use:** Submit buttons inside forms using Server Actions.
**Example:**
```tsx
// Source: src/components/ui/submit-button.tsx (existing, good)
const { pending } = useFormStatus();

<Button variant="primary" isLoading={pending} loadingLabel="Salvando...">
  Salvar
</Button>
```

### Pattern 4: Form Error Shake (One-Shot)
**What:** Add `.input-error-shake` class conditionally; remove it after `animationend` so it can be re-triggered.
**When to use:** Any input field that can show validation errors.
**Example:**
```tsx
// Source: src/app/(vault)/financeiro/components/expense-side-panel.tsx (existing)
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

### Anti-Patterns to Avoid
- **Using `useTransition` without `isPending` visual feedback:** Several components (`quick-create-wrapper.tsx`, `calendar-grid.tsx`, `week-calendar-grid.tsx`) call `useTransition` but discard `isPending`. Users get no loading indication.
- **Multiple toast animation durations:** The current toast uses 500ms for fade-out (hardcoded in inline style), while the requirement says ≤300ms. Standardize on motion tokens.
- **Re-creating spinner SVG in every component:** The inline `SpinnerIcon` in `button.tsx` should be extracted or imported if reused elsewhere.
- **Not clearing `.input-error-shake` after animation:** If the class persists, re-triggering the same error won't replay the shake.
- **Toast exit without reduced-motion fallback:** Ensure `prefers-reduced-motion: reduce` disables both enter and exit transitions (instant show/hide).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast enter/exit animation | Custom JS animation loop | CSS keyframes + React state timeout | battle-tested, GPU-accelerated, respects reduced motion |
| Server Action loading state | Custom `isSubmitting` state | `useTransition` or `useFormStatus` | React 19 built-ins, automatically synced with concurrent features |
| Spinner SVG | Third-party spinner lib | Inline SVG + CSS `spin` keyframe | Already exists, zero dependency, 14×14px lightweight |
| Form error shake | JS-driven position animation | CSS `@keyframes inputShake` | Already exists, performs better, simpler |

**Key insight:** Every piece needed for this phase already exists in the codebase. The risk is over-engineering — adding wrappers, hooks, or libraries that duplicate existing functionality.

## Runtime State Inventory

> This phase involves no rename/refactor/migration. No runtime state changes required.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None | — |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None | — |
| Build artifacts | None | — |

## Common Pitfalls

### Pitfall 1: Toast Exit Timing Drift
**What goes wrong:** The setTimeout that removes the toast from DOM (currently 3500ms) is not synchronized with the CSS transition duration. If CSS fade is 300ms but timeout is 3500ms (only 500ms after fade starts), the toast might be removed too early or linger too long.
**Why it happens:** Hardcoded milliseconds in JS not matching CSS transition duration.
**How to avoid:** Align all durations to motion tokens. If toast stays 3000ms + fades 300ms, remove at 3300ms total.
**Warning signs:** Toast disappears abruptly or stays visible without content after fade.

### Pitfall 2: prefers-reduced-motion Gap for New Toast Exit
**What goes wrong:** The current `prefers-reduced-motion` media query in `motion.css` covers `.toast-enter` but not the inline `transition` used for toast exit (since inline styles bypass CSS media queries).
**Why it happens:** Inline `style={{ transition: "..." }}` is not subject to CSS media query overrides.
**How to avoid:** Use a CSS class for exit transition too (e.g., `.toast-exit`), or conditionally set inline transition to `"none"` when reduced motion is preferred via `window.matchMedia` — but simpler is to use a class. The planner should prefer a `.toast-exit` class in `motion.css`.
**Warning signs:** Toasts still fade out slowly when user has `prefers-reduced-motion: reduce`.

### Pitfall 3: useTransition Components Without Visual Feedback
**What goes wrong:** `calendar-grid.tsx` and `week-calendar-grid.tsx` destructure `useTransition` as `const [, startTransition] = useTransition()`, discarding `isPending`. Users clicking to navigate weeks/months get no loading feedback.
**Why it happens:** These components may have felt fast enough without loading state, but consistency matters.
**How to avoid:** Audit all `useTransition` callers. Where the action is fast (<200ms), a simple `opacity` dip or `cursor: wait` may suffice. Where it's slower, wire `isPending` to a visual indicator.
**Warning signs:** User double-clicks navigation buttons because nothing happened visually.

### Pitfall 4: Skeleton Shimmer Colors Clash After Theme Changes
**What goes wrong:** The shimmer gradient colors (`#f0ebe2`, `#e8e2d9`) are hardcoded hex values that may not match if the app background color changes.
**Why it happens:** CSS `linear-gradient` uses hex values instead of CSS variables.
**How to avoid:** Use `var(--color-surface-3)` and `var(--color-bg)` or similar semantic tokens in the gradient. The current colors already closely match the warm palette, but tokenization prevents drift.
**Warning signs:** Skeleton looks noticeably different from surrounding unloaded content.

### Pitfall 5: Form Error Shake Not Re-Triggering
**What goes wrong:** If `.input-error-shake` is added and never removed, adding it again on a subsequent validation failure won't re-run the animation.
**Why it happens:** CSS animations only re-trigger when the element is re-created or the class is removed and re-added.
**How to avoid:** Always remove the shake class on `animationend` (as already done in `expense-side-panel.tsx` and auth pages). Ensure all form inputs follow this pattern.
**Warning signs:** First error shakes; second error on same field does not.

## Code Examples

### Verified Toast Exit with CSS Class (Recommended over inline style)
```css
/* Source: src/styles/motion.css (addition) */
@keyframes toastFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

.toast-enter {
  animation: toastSlideIn var(--duration-200) var(--ease-out);
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

```tsx
// Source: adapted from toast-provider.tsx
<div
  key={t.id}
  className={t.fading ? "toast-exit" : "toast-enter"}
  style={toastStyle}
>
  {t.message}
</div>
```

### Standalone Spinner Component
```tsx
// Source: extracted from button.tsx pattern
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
        cx="7" cy="7" r="5.5"
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

### Tokenized Skeleton Shimmer
```css
/* Source: globals.css (refinement) */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-3) 25%,
    var(--color-bg) 50%,
    var(--color-surface-3) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Toast fade-out 500ms hardcoded | Toast fade-out ≤300ms using `--duration-300` | This phase (34) | Faster, snappier dismissal; consistent with motion tokens |
| Inline `SpinnerIcon` in Button only | Extracted `Spinner` reusable component | This phase (34) | Consistent loading icon across all UI |
| Some `useTransition` without visual feedback | All `useTransition` callers wire `isPending` | This phase (34) | Users always see action is in progress |
| Hardcoded hex skeleton shimmer | Tokenized gradient shimmer | Phase 32 foundation | Theme-safe, maintainable |

**Deprecated/outdated:**
- `toast-enter` with 500ms inline transition: replace with token-based ≤300ms.
- Manual `opacity` + `disabled` without spinner in some action buttons: standardize on `Button[isLoading]`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The ~10 `useTransition` components that don't wire `isPending` should be updated for consistency. | Button Loading State | Low — some may be fast enough that visual feedback is unnecessary; planner can audit per-component |
| A2 | Extracting `SpinnerIcon` to `spinner.tsx` is worth the small file addition. | Spinner Component | Low — can be skipped if planner prefers keeping inline; no functional impact |
| A3 | Skeleton gradient at 1.4s is close enough to "organic"; planner may adjust to 1.6s. | Skeleton Shimmer | Low — purely aesthetic preference |
| A4 | All form inputs in the app use either `.input-field` or `.auth-input` classes. | Form Error Feedback | Medium — if there are custom inputs not using these classes, shake won't apply automatically |

## Open Questions (RESOLVED)

1. **Should `useTransition` callers in calendar navigation show loading state?** ✅ RESOLVED
   - Decision: Calendar navigation (`calendar-grid.tsx`, `week-calendar-grid.tsx`) does NOT need visual loading feedback. Date changes are fast enough that `cursor: wait` on the grid container is sufficient if any loading state is added. The executor decides per the plan.

2. **Are there form inputs outside `.input-field` / `.auth-input` that need error shake wiring?** ✅ RESOLVED
   - Decision: All form components must be audited for `.input-error-shake` application on validation errors. The executor will grep for error patterns (`formError`, `errorField`, `state?.error`) and wire shake classes where missing.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| React 19 | `useTransition`, `useFormStatus` | ✓ | 19.x | — |
| Next.js 15 | App Router, Server Components | ✓ | 15.x | — |
| Vitest | Running tests | ✓ | — | — |
| TypeScript 5.8 | Type checking | ✓ | 5.8.x | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | `vitest.config.ts` (implied by project setup) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEED-01 | Toast renders with `.toast-enter` class | unit | `pnpm test` | ❌ Wave 0 |
| FEED-01 | Toast exit applies `.toast-exit` class after 3s | unit | `pnpm test` | ❌ Wave 0 |
| FEED-02 | Button with `isLoading=true` shows spinner and `aria-busy` | unit | `pnpm test` | ❌ Wave 0 |
| FEED-03 | Skeleton has `.skeleton-shimmer` class | unit | `pnpm test` | ✅ `tests/streaming/integration.test.tsx` |
| FEED-04 | Spinner component renders SVG with `spin` animation | unit | `pnpm test` | ❌ Wave 0 |
| FEED-05 | Input with error has `.input-error-shake` class | unit | `pnpm test` | ❌ Wave 0 |
| FEED-05 | `.input-error-shake` triggers `inputShake` keyframe | integration (CSS) | `pnpm test` | ❌ Wave 0 |
| POLI-02 | `prefers-reduced-motion` disables toast/skeleton/spinner animations | integration | `pnpm test` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/components/ui/toast-provider.test.tsx` — covers FEED-01 enter/exit
- [ ] `tests/components/ui/button.test.tsx` — covers FEED-02 loading state
- [ ] `tests/components/ui/spinner.test.tsx` — covers FEED-04
- [ ] `tests/components/ui/skeleton.test.tsx` — already partially covered by streaming tests; may extend
- [ ] `tests/components/ui/form-error-feedback.test.tsx` — covers FEED-05

*(Note: Given the project rule "Zero impact nos 407 testes existentes" from STATE.md, new tests should be additive and must not break existing tests. The existing streaming skeleton tests already validate `.skeleton-shimmer` class presence.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No | — |
| V6 Cryptography | No | — |
| V13 API | No | — |
| V14 Configuration | No | — |

> This phase is purely UI/UX polish with no security-sensitive changes. The `aria-live="polite"` on toast container is already present and correct for accessibility.

## Sources

### Primary (HIGH confidence)
- `src/components/ui/toast-provider.tsx` — existing toast system, portal, state management
- `src/components/ui/button.tsx` — existing `isLoading` + `SpinnerIcon` implementation
- `src/components/ui/submit-button.tsx` — existing `useFormStatus` integration
- `src/components/ui/skeleton.tsx` — existing shimmer component
- `src/styles/motion.css` — existing keyframes and reduced-motion media query
- `src/app/globals.css` — existing `.skeleton-shimmer`, `.input-error-shake`, button/input classes
- `34-CONTEXT.md` — locked decisions and discretion areas
- `33-CONTEXT.md` — Phase 33 decisions on input shake, focus rings

### Secondary (MEDIUM confidence)
- Grep results for `useTransition` (22 matches) — showing ~10 components with manual `useTransition`
- Grep results for `isPending` (35 matches) — showing inconsistent visual feedback wiring
- Grep results for `input-error-shake` (19 matches) — showing existing usage patterns

### Tertiary (LOW confidence)
- None — all claims verified against codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tech already in use, no new dependencies needed
- Architecture: HIGH — existing patterns are solid, refinement only
- Pitfalls: HIGH — all identified via direct code inspection

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (stable stack, low churn expected)
