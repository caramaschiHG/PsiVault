# Technology Stack: v1.4 Performance Optimization Additions

**Project:** PsiVault / PsiLock
**Base Stack:** Next.js 15.2.4, React 19, TypeScript 5.8, Prisma 6.6.0, PostgreSQL (Supabase), Supabase Auth SSR
**Researched:** 2026-04-23
**Confidence:** HIGH

---

## Recommended Stack Additions

### Diagnostics & Profiling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@next/bundle-analyzer` | `15.2.4` | Bundle size visualization and dependency bloat detection | Official Next.js wrapper for webpack-bundle-analyzer. Must match Next.js major/minor version. Integrates via `next.config.js` with `ANALYZE=true` env flag. |
| `react-scan` | `0.5.3` | Automatic re-render detection and performance issue highlighting | Zero-config dev tool that overlays re-render highlights directly on the UI. Supports React 19. More actionable than React DevTools Profiler alone because it surfaces the exact components causing unnecessary renders without manual tracing. |
| React DevTools (Browser Extension) | `latest` | Component tree inspection, Flamegraph profiling, Timeline analysis | Still required for deep inspection of component props/state and the Commit Timeline. `react-scan` complements but does not replace DevTools. |

### Database Performance

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@prisma/sqlcommenter-query-insights` | `latest` | Automatic SQL comment tagging for query shape observability | Injects structured comments into generated SQL so slow query logs and `pg_stat_statements` can group by Prisma model/action rather than literal query text. Essential for identifying N+1 patterns and slow query families in Supabase Observability. |
| Prisma Client `$extends` query middleware | built-in | Per-query timing logging and pattern detection | No package needed. Use Prisma Client extension (already available in Prisma 6) to wrap `$allOperations` with `performance.now()` timers. Log slow queries (>100ms) to console/datadog in dev/staging. |
| `pg_stat_statements` / Supabase Observability | built-in | PostgreSQL-level query statistics and EXPLAIN plans | Supabase dashboard provides `pg_stat_statements` view and connection monitoring. No install required. Use for validating that Prisma optimizations actually reduce DB load. |

### Connection Pooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Supavisor (Transaction Mode) | built-in | Server-side connection pooling for Prisma's transient connections | Supabase already provisions Supavisor on port `6543`. Prisma's connection model (especially in serverless/edge contexts) exhausts Postgres `max_connections` without a pooler. **No additional package required** — only a connection string change. |
| `PgBouncer` (Dedicated Pooler) | built-in (paid tier) | Lower-latency dedicated pooling co-located with Postgres | Available on paid Supabase tiers. Use if Supavisor latency becomes a bottleneck. Same port (`6543`), different host. |

> **Integration note:** Prisma 6 + Supavisor Transaction Mode requires `?pgbouncer=true` in the connection string and **must disable prepared statements** (`?prepareThreshold=0` or driver adapter equivalent) because transaction-mode poolers do not support session-scoped prepared statements.

### Streaming & Suspense

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `React.Suspense` + `loading.tsx` | built-in (React 19 / Next.js 15) | Granular Server Component streaming with fallback UI | Already available. No new packages. Strategic placement of `Suspense` boundaries around async data fetches (charts, lists) prevents slow queries from blocking TTFB and enables React 19 selective hydration. |
| `next/dynamic` | built-in | Client Component code splitting | Already available. No new packages. Use for heavy client-only components (PDF preview, cropper, calendars) to split them out of the initial JS bundle. |

### Asset Optimization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next/image` | built-in | Automatic image optimization, WebP/AVIF conversion, responsive srcset | Already available. No new packages. If the app still uses raw `<img>` tags anywhere, migrate them. Critical for LCP improvement. |
| `next/font` | built-in | Automatic font subsetting, `font-display: swap`, zero layout shift | Already available. No new packages. If Google Fonts or custom fonts are loaded via `<link>`, migrate to `next/font` to eliminate font-related CLS. |
| `next/script` | built-in | Third-party script loading strategies (`beforeInteractive`, `afterInteractive`, `lazyOnload`, `worker`) | Already available. No new packages. Use for analytics, chat widgets, or PDF renderer lazy loading to prevent render-blocking. |

### Core Web Vitals Measurement

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `web-vitals` | `5.2.0` | Programmatic measurement of LCP, INP, CLS, TTFB, FCP | The standard library by Google. Next.js 15's `useReportWebVitals` hook (from `next/web-vitals`) wraps this. Install as a **dependency** (not devDependency) because it runs in the browser to report real-user metrics (RUM). |
| `useReportWebVitals` | built-in (Next.js 15) | Next.js wrapper hook for `web-vitals` | Already available. Import from `next/web-vitals`. Use in a Client Component to send metrics to logging endpoint or console. |
| `lighthouse` | `13.1.0` | Automated lab-based performance auditing (Lighthouse CI) | Install as **devDependency**. Run locally via `npx lighthouse` or automate with `@lhci/cli`. Provides objective pass/fail thresholds for LCP, INP, CLS. |
| `@lhci/cli` | `0.15.1` | Lighthouse CI for CI/CD integration | Install as **devDependency**. Gates merges on Lighthouse scores. Essential for preventing performance regressions in v1.4+ pull requests. |

### Memory Leak Detection

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `memlab` | `2.0.1` | Automated E2E memory leak detection via heap snapshot diffing | Facebook's framework for finding JS memory leaks. Write Puppeteer scenarios for PsiVault flows (open patient list → open patient → go back) and memlab compares heap snapshots to find retained objects. Install as **devDependency**. |
| Chrome DevTools Memory tab | built-in | Manual heap snapshot analysis and retainer tracing | No package needed. Use when memlab flags a leak to pinpoint the exact retaining path in React component trees or closures. |

---

## What NOT to Add

| Tool / Package | Why Not | What to Use Instead |
|----------------|---------|---------------------|
| `@prisma/extension-accelerate` | Adds vendor lock-in to Prisma Data Platform. Supabase already provides Supavisor pooling at the infrastructure layer. Accelerate is redundant and introduces a paid third-party dependency for a solved problem. | Supabase Supavisor + Prisma Client singleton with `?pgbouncer=true` |
| `why-did-you-render` | Requires manual instrumentation of every component (`whyDidYouRender = true`). `react-scan` achieves the same goal with zero code changes and has better React 19 compatibility. | `react-scan` (dev overlay) |
| `webpack-bundle-analyzer` (direct) | `@next/bundle-analyzer` is the official, version-locked wrapper. Installing the raw analyzer directly risks version skew with Next.js internal webpack config. | `@next/bundle-analyzer@15.2.4` |
| `bundlesize` / `size-limit` | Bundle size budgets are better enforced via Lighthouse CI (`@lhci/cli`) which already includes bundle size signals and integrates with CI pass/fail gates. Adding separate size tools creates redundant CI checks. | `@lhci/cli` with performance budget assertions |
| `@builder.io/partytown` | Next.js `next/script` already supports `strategy="worker"` (experimental) for offloading third-party scripts to web workers. Partytown adds complexity and compatibility issues with React 19 hydration. | `next/script` with `lazyOnload` or `worker` strategy |
| `tanstack-query` (React Query) | The app already uses Server Components + `React.cache()` for request deduplication. Adding TanStack Query introduces client-side caching complexity that conflicts with Next.js 15's built-in fetching and cache semantics. | Continue with Server Components + `React.cache()` + `Suspense` |
| `clsx` / `classnames` "for performance" | Not a performance bottleneck in this codebase. The design token system already uses plain string concatenation and `satisfies React.CSSProperties`. Adding a runtime class merging library is unnecessary overhead. | Continue with existing inline style pattern and token utilities |

---

## Integration Points

### `@next/bundle-analyzer`
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)
```
Run: `ANALYZE=true pnpm build`

Also use Turbopack's built-in analyzer: `pnpm next experimental-analyze` (Next.js 15 native, no install).

### `react-scan` (Development Only)
```tsx
// app/layout.tsx — inside <head> via next/script
import Script from 'next/script'

{process.env.NODE_ENV === 'development' && (
  <Script
    src="//unpkg.com/react-scan/dist/auto.global.js"
    strategy="beforeInteractive"
    crossOrigin="anonymous"
  />
)}
```
No code changes required. Overlay appears automatically in dev.

### `web-vitals` + `useReportWebVitals`
```tsx
// app/components/web-vitals.tsx
'use client'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint or log
    console.log(metric)
  })
  return null
}
```
Import `<WebVitals />` in `app/layout.tsx`.

### Prisma Query Logging Extension
```typescript
// src/lib/prisma.ts — extend existing singleton
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}).$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now()
        const result = await query(args)
        const duration = performance.now() - start
        if (duration > 100) {
          console.warn(`[SLOW QUERY] ${model}.${operation} took ${duration.toFixed(1)}ms`)
        }
        return result
      },
    },
  },
})
```

### Supabase Pooler Connection String
```
# Transaction mode (for Prisma runtime traffic)
DATABASE_URL=postgresql://postgres:[PWD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true&prepareThreshold=0

# Direct connection (for migrations only)
DIRECT_URL=postgresql://postgres:[PWD]@db.[REF].supabase.co:5432/postgres
```
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### `memlab` Scenario
```javascript
// tests/memory/patient-navigation.scenario.js
function url() { return 'http://localhost:3000/app/pacientes' }
async function action(page) { await page.click('text=Primeiro Paciente') }
async function back(page) { await page.click('text=Pacientes') }
module.exports = { action, back, url }
```
Run: `npx memlab run --scenario tests/memory/patient-navigation.scenario.js`

### Lighthouse CI
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: { url: ['http://localhost:3000/app'] },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
}
```

---

## Installation

```bash
# Production dependency (runs in browser for RUM)
pnpm add web-vitals@5.2.0

# Dev dependencies
pnpm add -D @next/bundle-analyzer@15.2.4
pnpm add -D react-scan@0.5.3
pnpm add -D @prisma/sqlcommenter-query-insights
pnpm add -D lighthouse@13.1.0
pnpm add -D @lhci/cli@0.15.1
pnpm add -D memlab@2.0.1
```

---

## Sources

- **Next.js Bundle Analyzer & Turbopack analyze**: Context7 `/websites/nextjs` — official docs on lazy loading, dynamic imports, and `experimental-analyze`
- **Next.js Script & Image/Font Optimization**: Context7 `/websites/nextjs` — `next/script` API reference, migration guides
- **React Profiler & DevTools**: Context7 `/reactjs/react.dev` — `<Profiler>` API reference, memoization profiling guidance
- **React Scan**: GitHub `aidenybai/react-scan` README (v0.5.3) — installation, Next.js App Router setup, zero-config rationale
- **Prisma Performance & Query Middleware**: Context7 `/prisma/prisma` — `$extends` query middleware, performance benchmarks, `@prisma/sqlcommenter-query-insights`
- **Prisma Connection Pooling / Accelerate**: Context7 `/websites/prisma_io` — Accelerate connection pool evaluation, Prisma Postgres pooling docs
- **Supabase Connection Pooling**: Supabase official docs (`supabase.com/docs/guides/database/connecting-to-postgres`) — Supavisor transaction/session mode, PgBouncer dedicated pooler, connection string formats, pool sizing
- **Next.js Web Vitals**: Context7 `/websites/nextjs` — `useReportWebVitals` hook API, metric object schema
- **web-vitals npm**: npm registry — version `5.2.0` (latest stable)
- **Lighthouse & LHCI**: npm registry — `lighthouse@13.1.0`, `@lhci/cli@0.15.1`
- **memlab**: GitHub `facebook/memlab` README (v2.0.1) — E2E memory leak detection, scenario file API, heap analysis CLI
- **npm version verification**: `npm view` commands executed 2026-04-23 for all recommended packages

---

## Confidence Notes

| Area | Confidence | Reason |
|------|------------|--------|
| Bundle analysis | HIGH | `@next/bundle-analyzer` is official; `next experimental-analyze` is built-in. Version verified against npm. |
| Re-render debugging | HIGH | `react-scan` is widely adopted (21k+ stars), explicitly supports React 19 and Next.js App Router. |
| DB query analysis | HIGH | Prisma `$extends` middleware is a stable Prisma 6 feature. `@prisma/sqlcommenter-query-insights` is an official Prisma package. |
| Connection pooling | HIGH | Supabase docs explicitly describe Supavisor and PgBouncer integration patterns for Prisma. |
| Streaming / Suspense | HIGH | Core Next.js 15 / React 19 features with extensive official documentation. |
| Asset optimization | HIGH | `next/image`, `next/font`, `next/script` are mature, built-in APIs. |
| Core Web Vitals | HIGH | `web-vitals` v5 is the current Google standard; `useReportWebVitals` is documented in Next.js official API reference. |
| Memory leak detection | MEDIUM-HIGH | `memlab` is a mature Meta tool, but requires writing Puppeteer scenarios which is project-specific effort. No blocker identified. |
