# Feature Landscape: Deep Performance Optimization

**Domain:** Next.js 15 SaaS (PsiVault — Prontuário Eletrônico para Psicólogos)
**Stack Context:** Next.js 15, React 19, Prisma 6, PostgreSQL (Supabase), Supabase Auth SSR, CSS tokens (no Tailwind)
**Researched:** 2026-04-23
**Overall confidence:** HIGH

---

## Table Stakes

Features users (and Google) expect from a "performance-optimized" modern web app. Missing these means the product feels technically immature.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Bundle size analysis** | Essential to identify bloat before optimizing | Low | `@next/bundle-analyzer` or `next experimental-analyze` (Turbopack). Must be first step, not afterthought. |
| **Image optimization** | LCP is directly impacted by unoptimized images | Low | `next/image` with static imports (auto width/height/blurDataURL). For PsiVault, minimal image use (avatars, logos) but critical for landing. |
| **Font optimization** | Fonts block render; unoptimized fonts hurt LCP/FCP | Low | `next/font/local` or `next/font/google`. PsiVault uses local fonts → self-host with `font-display: swap`. |
| **Third-party script control** | Analytics/monitoring scripts block main thread | Low | `next/script` with `strategy="lazyOnload"` or `"afterInteractive"`. PsiVault has minimal 3rd-party scripts currently. |
| **Core Web Vitals measurement** | "Fast" is subjective; CWV are objective | Low | `web-vitals` library + send to analytics endpoint. Must measure LCP, INP, CLS, TTFB at 75th percentile. |
| **Database indexing** | Queries slow down as data grows; indexes are table stakes | Medium | Prisma `@index`, `@@index`, partial indexes (`where: raw(...)`). Critical for `workspaceId`-scoped queries. |
| **Connection pooling** | Serverless environments exhaust DB connections without pooling | Low-Med | Supabase provides connection pooling via PgBouncer. Prisma 6 + `pgbouncer=true` in connection string. |
| **Query deduplication** | Duplicate requests in same render pass waste resources | Low | `React.cache()` for request deduplication. PsiVault v1.3 already uses this for `resolveSession`. |
| **Streaming with Suspense** | Next.js 15 + React 19 expectation for progressive rendering | Medium | `loading.tsx` or manual `<Suspense>` boundaries. Enables TTFB improvement by sending shell immediately. |
| **Selective field queries** | Over-fetching wastes bandwidth and DB CPU | Low | Prisma `select` / Prisma Client `select`. PsiVault v1.3 already excludes `importantObservations` via `LIST_SELECT`. |
| **Targeted cache invalidation** | Stale data is a bug; blanket revalidation is wasteful | Low | `revalidatePath('/path', 'page')` (page scope). v1.3 already adopted this. |
| **Client-side navigation** | Full page reloads feel slow in modern apps | Low | `next/link` with prefetching. v1.3 already shipped. |

---

## Differentiators

Features that demonstrate *deep* performance maturity. Not expected by default, but highly valued by technical stakeholders and power users.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **React Compiler (Experimental)** | Automatic memoization eliminates manual `useMemo`/`useCallback`/`memo` bugs and boilerplate | Medium | Next.js 15 supports via Babel plugin. Slower build times currently. Best adopted incrementally. HIGH confidence for React 19. |
| **Prisma query plan analysis** | Identifies missing indexes, full table scans, slow queries before they hit production | Medium | Use `EXPLAIN` via `$queryRaw` or Supabase Query Insights. Prisma 6 + `@prisma/sqlcommenter-query-insights` for attribution. |
| **Partial (filtered) indexes** | Smaller indexes, faster writes, faster queries for soft-delete patterns | Medium | Prisma `partialIndexes` preview feature. E.g., `@@index([workspaceId], where: { deletedAt: null })`. Perfect for PsiVault's soft-delete architecture. |
| **Raw SQL for critical paths** | Prisma ORM overhead matters at scale; raw SQL for report queries | Medium | `$queryRaw` for read-heavy aggregations (finance reports, DRE). Safer with tagged templates. |
| **`unstable_after` for non-blocking tasks** | Analytics, logging, side effects don't block response streaming | Low | Next.js 15 experimental. Execute after response finishes. Ideal for audit trails and telemetry. |
| **Granular Suspense boundaries** | Per-component streaming instead of page-level blocking | Medium | Manual `<Suspense>` around charts, slow widgets. `loading.tsx` is coarse; granular boundaries improve perceived performance. |
| **Column-level selection for search endpoints** | Search endpoints often return unused fields | Low | PsiVault's `column selection` for patient search (already in Active backlog) → extend pattern to other list endpoints. |
| **Server Component boundary optimization** | Reducing JS sent to client by maximizing Server Components | Medium | Audit `"use client"` boundaries. Move data transformation, formatting, PDF generation to Server Components. |
| **Memory leak detection** | Prevents degradation over long sessions | High | Chrome DevTools Memory tab, `performance.measureUserAgentSpecificMemory()`. Look for unclosed event listeners, growing closures. |
| **Instrumentation / Observability** | Server lifecycle hooks for performance monitoring | Low | `instrumentation.ts` with `register()` + `onRequestError`. Stable in Next.js 15. Integrate with OpenTelemetry or Sentry. |
| **Preload patterns for data fetching** | Initiate fetches before component renders | Low | `preload()` utility with `React.cache()` + `server-only`. Call before blocking work. |
| **`relationLoadStrategy: "join"`** | Single query instead of two for relations | Low | Prisma 6 preview. Replaces query+subquery with JOIN. Reduces round-trips for `include` queries. |
| **Bundle optimization via `optimizePackageImports`** | Tree-shaking for heavy icon/utility libraries | Low | Next.js 15 auto-optimizes `lucide-react`, `date-fns`, `lodash-es`, etc. PsiVault uses custom icons (SVG) but may adopt libraries. |

---

## Anti-Features

Features to explicitly NOT build — they add complexity without commensurate value, or conflict with PsiVault's constraints.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Manual `useMemo`/`useCallback` everywhere** | React Compiler handles this automatically in React 19. Manual memoization is error-prone and clutters code. | Adopt React Compiler incrementally; remove manual memoization where compiler covers it. Measure, don't assume. |
| **Custom caching layer (Redis/etc.)** | Next.js 15 has `unstable_cache`, Data Cache, Full Route Cache. Adding Redis before exhausting built-in caching is premature optimization. | Use `unstable_cache` for DB queries, `revalidateTag`/`revalidatePath` for invalidation. Revisit Redis at 10K+ users. |
| **Service Worker / PWA complexity** | Adds significant maintenance, caching bugs, and update issues. PsiVault is a desk tool, not an offline-first mobile app. | Defer PWA. Focus on server-side caching and fast navigation. |
| **CDN edge caching for dynamic routes** | Auth routes are workspace-scoped and user-specific. Edge caching dynamic HTML is complex and risky with Supabase Auth. | Cache at application level (Next.js Data Cache) + database level (connection pooling, query caching). |
| **GraphQL for internal API** | Adds bundle size, complexity, and N+1 risks. Prisma + Server Actions is already optimal for PsiVault's CRUD-heavy model. | Keep Prisma ORM with raw SQL escape hatches. Use Server Actions for mutations. |
| **Over-eager prefetching** | Prefetching every link wastes bandwidth and server resources. | Use Next.js `<Link>` default prefetching (intersection observer). Avoid `prefetch={true}` globally. |
| **Complex virtual scrolling for lists** | PsiVault lists (patients, appointments) are not massive. Virtual scrolling adds complexity for <500 items. | Optimize queries + pagination. Consider virtual scrolling only if lists exceed 1,000 items consistently. |
| **Webpack-level micro-optimizations** | Turbopack is stable in Next.js 15 dev. Manual webpack config is fragile. | Use Next.js defaults. Configure `serverExternalPackages` and `optimizePackageImports` only where needed. |

---

## Feature Dependencies

```
React Compiler (automatic memoization)
  → Requires React 19 (already in stack)
  → Depends on: Server Component boundary audit (to maximize compiler benefit)

Granular Suspense boundaries
  → Requires: Streaming-enabled hosting (Node.js/Docker, not static export)
  → Depends on: Component architecture review (which parts are independent)

Prisma partial indexes
  → Requires: `partialIndexes` preview feature in Prisma schema
  → Depends on: Soft-delete pattern maturity (v1.3 already has `deletedAt`)

Raw SQL for reports (DRE, IRPF)
  → Requires: `$queryRaw` with tagged templates
  → Depends on: Report feature implementation (RELA-01, RELA-02 in Active backlog)

unstable_after for audit/logging
  → Requires: `experimental.after` in next.config
  → Depends on: Audit trail architecture (already mature)

Column selection for search
  → Depends on: Patient search endpoint refactoring
  → Extends: LIST_SELECT pattern (v1.3) to other domains

Memory leak detection
  → Requires: Chrome DevTools profiling
  → Depends on: Long-running session patterns (dashboard stays open for hours)
```

---

## MVP Recommendation for v1.4

### Prioritize (High Impact, Low-Medium Complexity)
1. **Bundle analysis** — `next experimental-analyze` to establish baseline. Identifies immediate wins.
2. **Core Web Vitals instrumentation** — `web-vitals` library + endpoint. Measure before optimizing.
3. **Database index audit** — Add missing indexes on `workspaceId` + query hotspots. Use Prisma `@@index`.
4. **Streaming visual de charts** — Suspense boundaries around finance/agenda charts (already in Active backlog).
5. **Column selection for patient search** — Extend `LIST_SELECT` pattern to search (already in Active backlog).

### Medium Priority (High Impact, Medium Complexity)
6. **Prisma query plan analysis** — Enable Query Insights or manual `EXPLAIN` on slow queries.
7. **Partial indexes** — For soft-deleted data (`deletedAt IS NULL`) on high-volume tables.
8. **Server Component boundary audit** — Reduce client bundle by moving non-interactive logic to server.
9. **`unstable_after` for non-blocking audit logs** — Fire-and-forget audit writes after response.
10. **`relationLoadStrategy: "join"`** — Replace two-query `include` patterns with single JOIN where beneficial.

### Defer (High Complexity or Low Current Value)
- **React Compiler**: Wait for build-time performance improvements (currently Babel-only, slower builds).
- **Memory leak deep-dive**: Only if CWV field data shows INP degradation over time.
- **Raw SQL for reports**: Build with Prisma ORM first; optimize to raw SQL only if reports are slow.
- **Instrumentation/Observability full setup**: Start with simple `instrumentation.ts`; deep OpenTelemetry integration is v1.5+.

---

## Complexity Matrix

| Feature | Implementation | Validation | Risk |
|---------|---------------|------------|------|
| Bundle analysis | Low | Low | None |
| CWV measurement | Low | Low | None |
| DB indexes | Low | Medium | Low (test on staging) |
| Streaming/Suspense | Medium | Medium | Low (fallback UI) |
| Column selection | Low | Low | Low |
| Query plan analysis | Medium | Medium | None |
| Partial indexes | Medium | Medium | Low (preview feature) |
| Server Component audit | Medium | High | Medium (regression risk) |
| `unstable_after` | Low | Medium | Low (experimental) |
| `relationLoadStrategy: "join"` | Low | Medium | Low (preview feature) |
| React Compiler | Medium | High | Medium (build time, edge cases) |
| Memory leak detection | High | High | None (diagnostic only) |

---

## Sources

- Next.js 15 Docs: Caching, Streaming, Bundle Analyzer, `optimizePackageImports`, `serverExternalPackages`, `staleTimes`, `unstable_after`
- React 19 Docs: React Compiler, `use`, Suspense improvements, Actions
- Prisma 6 Docs: Indexes (partial, Hash/GIN/GiST/BRIN), Query Optimization, `relationLoadStrategy`, Connection Pooling, `$queryRaw`
- web.dev: Core Web Vitals thresholds (LCP <2.5s, INP <200ms, CLS <0.1)
- Google Chrome Labs: `web-vitals` library usage

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Next.js 15 performance features | HIGH | Official docs verified, stable APIs |
| React 19 / React Compiler | HIGH | Stable release, Next.js 15 integration documented |
| Prisma 6 query optimization | HIGH | Official docs verified, preview features noted |
| PostgreSQL/Supabase optimization | MEDIUM-HIGH | Prisma docs + Supabase best practices; partial indexes are preview |
| CWV thresholds | HIGH | web.dev official guidance |
| Memory leak patterns | MEDIUM | General React knowledge; specific leaks require profiling |
