# Phase 36: Polish, Accessibility & Measurement — Plan

## Overview

Motion é consistente, acessível e não regressa a performance objetiva.

## Changes

### 1. Fix Inline Popover Animation for `prefers-reduced-motion`
- **File:** `src/styles/motion.css`
  - Add `.popover-enter` class with `animation: popoverFadeIn 120ms ease forwards`
  - Add `.popover-enter` to `@media (prefers-reduced-motion: reduce)`
- **File:** `src/app/(vault)/agenda/components/quick-create-popover.tsx`
  - Replace inline `animation: "popoverFadeIn ..."` with `className="popover-enter"`

### 2. Document Motion Patterns in CLAUDE.md
- **File:** `CLAUDE.md`
  - Add "Motion & Animation" section with tokens, utility classes, patterns, and anti-patterns

## Success Criteria Verification
- [x] Audit page-by-page: todas as animações usam tokens `--duration-*` e `--ease-*`
- [x] `prefers-reduced-motion: reduce` cobre todas as classes animadas (incluindo `.popover-enter`)
- [x] Zero regressão em tests (453 passing)
- [x] CLAUDE.md documenta padrões de motion

## Test Plan
- `pnpm test` — 453 tests passing
- `pnpm build` — zero TypeScript errors
