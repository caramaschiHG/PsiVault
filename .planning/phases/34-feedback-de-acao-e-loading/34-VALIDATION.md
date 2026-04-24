---
phase: 34
slug: feedback-de-acao-e-loading
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
---

# Phase 34 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (node env, globals) |
| **Config file** | `vitest.config.ts` (implied by project setup) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 34-01-01 | 01 | 1 | FEED-01 | — | Toast enter animation uses `.toast-enter` class | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-01-02 | 01 | 1 | FEED-01 | — | Toast exit animation uses `.toast-exit` class after 3s | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-02-01 | 02 | 1 | FEED-03 | — | Skeleton has `.skeleton-shimmer` class | unit | `pnpm test` | ✅ `tests/streaming/integration.test.tsx` | ✅ green |
| 34-02-02 | 02 | 1 | FEED-04 | — | Spinner component renders SVG with `spin` animation | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-03-01 | 03 | 1 | FEED-02 | — | Button with `isLoading=true` shows spinner and `aria-busy` | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-03-02 | 03 | 1 | FEED-02 | — | Calendar grid shows `cursor: wait` during date navigation | integration | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-04-01 | 04 | 1 | FEED-05 | — | Input with error has `.input-error-shake` class | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-04-02 | 04 | 1 | FEED-05 | — | `.input-error-shake` triggers `inputShake` keyframe | integration (CSS) | `pnpm test` | ❌ W0 | ⬜ pending |
| 34-04-03 | 04 | 1 | POLI-02 | — | `prefers-reduced-motion` disables toast/skeleton/spinner animations | integration | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/ui/toast-provider.test.tsx` — covers FEED-01 enter/exit
- [ ] `tests/components/ui/button.test.tsx` — covers FEED-02 loading state
- [ ] `tests/components/ui/spinner.test.tsx` — covers FEED-04
- [ ] `tests/components/ui/form-error-feedback.test.tsx` — covers FEED-05

*Existing infrastructure: `tests/streaming/integration.test.tsx` already validates `.skeleton-shimmer` class presence (FEED-03).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Toast timing feels natural (not too fast/slow) | FEED-01 | Visual/temporal judgment | Open app, trigger success toast, observe enter (slide+fade ≤300ms), wait 3s, observe exit (fade ≤300ms) |
| Loading state doesn't block interaction | FEED-02 | Interaction timing | Click a Server Action button, verify page remains interactive during loading |
| Shimmer appears organic (not mechanical pulse) | FEED-03 | Visual judgment | Navigate to /inicio or /financeiro, observe skeleton loading state |
| Reduced motion disables all animations | POLI-02 | Browser setting | Enable prefers-reduced-motion in OS, refresh page, verify no animations run |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
