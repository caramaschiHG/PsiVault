---
phase: 27-diagn-stico-e-funda-o-de-dados
plan: "02"
subsystem: performance
tags:
  - bundle-analyzer
  - web-vitals
  - metrics
  - cwv
dependency_graph:
  requires:
    - 27-01-PLAN.md
  provides:
    - Bundle analyzer configuration
    - CWV collection infrastructure
    - Performance metrics endpoint
  affects:
    - next.config.ts
    - src/app/(vault)/layout.tsx
tech_stack:
  added:
    - "@next/bundle-analyzer"
    - "web-vitals"
  patterns:
    - Repository pattern for metrics domain
    - Batch metric collection with sendBeacon fallback
key_files:
  created:
    - src/lib/metrics/model.ts
    - src/lib/metrics/repository.ts
    - src/lib/metrics/repository.prisma.ts
    - src/lib/metrics/store.ts
    - src/app/api/metrics/route.ts
    - src/components/cwv-collector.tsx
  modified:
    - next.config.ts
    - package.json
    - src/app/(vault)/layout.tsx
decisions:
  - Bundle analyzer enabled conditionally via ANALYZE=true to avoid build overhead
  - CWV metrics collected via web-vitals library and batched to /api/metrics
  - Metrics endpoint accepts anonymous sessions (workspaceId null) for CWV data
  - Batch flush triggers on 5-second timeout or 5-item buffer limit
metrics:
  duration: "20 min"
  completed_date: "2026-04-23"
---

# Phase 27 Plan 02: Bundle Analyzer e CWV Summary

**One-liner:** Bundle analyzer baseline and Core Web Vitals instrumentation with browser collection, backend endpoint, and PostgreSQL persistence.

## What Was Built

- **@next/bundle-analyzer** configured conditionally in `next.config.ts` via `ANALYZE=true` env var.
- **Metrics domain** following repository pattern: `model.ts` → `repository.ts` → `repository.prisma.ts` → `store.ts`.
- **POST /api/metrics** endpoint accepting batched CWV payloads, resolving workspaceId from session when available.
- **CwvCollector** client component mounted in vault layout collecting LCP, INP, CLS, TTFB, FCP via `web-vitals` library.
- **Batch delivery** to `/api/metrics` using `navigator.sendBeacon` with `fetch` fallback, flushing every 5 seconds or at 5 items.

## Deviations from Plan

None — plan executed exactly as written.

## Auth Gates

None.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- [x] `package.json` contains `@next/bundle-analyzer` in devDependencies
- [x] `package.json` contains `web-vitals` in dependencies
- [x] `next.config.ts` exports `bundleAnalyzer(nextConfig)` with conditional enable
- [x] `src/lib/metrics/repository.prisma.ts` exports `createPrismaMetricsRepository`
- [x] `src/app/api/metrics/route.ts` exports `POST` handler
- [x] `src/components/cwv-collector.tsx` exports `CwvCollector` with `"use client"`
- [x] `src/app/(vault)/layout.tsx` imports and renders `<CwvCollector />`
- [x] `pnpm build` completes without TypeScript errors
- [x] `pnpm test` passes (407 tests)

## Commits

- `ad8b311`: chore(27-02): install bundle analyzer and web-vitals, configure next.config.ts
- `736ecd6`: feat(27-02): create metrics domain and API endpoint
- `0037508`: feat(27-02): add CWV collector component to vault layout
