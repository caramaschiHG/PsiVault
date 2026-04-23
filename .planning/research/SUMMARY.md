# Project Research Summary

**Project:** PsiVault / PsiLock
**Domain:** Next.js 15 SaaS — Prontuário Eletrônico para Psicólogos
**Researched:** 2026-04-23
**Confidence:** HIGH

## Executive Summary

PsiVault is a production multi-tenant SaaS for Brazilian psychologists, built on Next.js 15 with React 19, Prisma 6, and Supabase PostgreSQL. The v1.3 milestone resolved systemic slowness by eliminating N+1 queries, enabling caching, and removing forced dynamic rendering. The v1.4 "Performance Profunda" milestone goes deeper: streaming UI with granular Suspense, strategic bundle splitting, database indexing, connection pooling tuning, and Core Web Vitals instrumentation — all as progressive enhancements atop an existing architecture with 407 passing tests, real users, MFA auth, workspace-scoped queries, soft deletes, and audit trails.

Research confirms the recommended approach is **measure first, optimize second**. The stack requires no radical changes — only additive diagnostics (`@next/bundle-analyzer`, `react-scan`, `web-vitals`), infrastructure configuration (Supabase Supavisor pooling), and architectural patterns already native to Next.js 15 / React 19 (Suspense streaming, `next/dynamic`, `unstable_cache`). Critically, every optimization must preserve the non-negotiable repository pattern, workspace-scoped multi-tenancy, and soft-delete invariants. The highest risks are cross-tenant cache poisoning, connection pool exhaustion under serverless load, and inadvertently reintroducing N+1 queries or `force-dynamic` during refactoring.

## Key Findings

### Recommended Stack

The base stack (Next.js 15.2.4, React 19, TypeScript 5.8, Prisma 6.6.0, Supabase Auth SSR) is sound and requires no replacements. v1.4 adds diagnostics, measurement, and infrastructure tuning layers.

**Core additions:**
- **`@next/bundle-analyzer@15.2.4`** — Bundle size visualization; official wrapper, version-locked to Next.js. Must match major/minor.
- **`react-scan@0.5.3`** — Zero-config re-render overlay for dev; more actionable than React DevTools Profiler for spotting unnecessary renders.
- **`web-vitals@5.2.0`** — Google's RUM library for LCP, INP, CLS, TTFB, FCP. Install as production dependency (runs in browser).
- **`lighthouse@13.1.0`** + **`@lhci/cli@0.15.1`** — Automated lab auditing + CI gates to prevent performance regressions.
- **`memlab@2.0.1`** — Meta's automated E2E memory leak detection via heap snapshot diffing.
- **`@prisma/sqlcommenter-query-insights`** — SQL comment tagging for observability; groups slow query logs by Prisma model/action.
- **Supabase Supavisor (Transaction Mode, port 6543)** — Already provisioned; only requires connection string change with `pgbouncer=true` and `prepareThreshold=0`. No new package.

**What NOT to add:** Prisma Accelerate (redundant lock-in), TanStack Query (conflicts with Server Components + `React.cache`), Partytown (`next/script` `worker` strategy suffices), raw `webpack-bundle-analyzer` (use official wrapper), or a custom Redis cache layer (Next.js built-in caching is sufficient at current scale).

### Expected Features

**Must have (table stakes):**
- Bundle size analysis (`@next/bundle-analyzer` / `next experimental-analyze`)
- Image/font/script optimization (`next/image`, `next/font`, `next/script`)
- Core Web Vitals measurement (`web-vitals` + analytics endpoint)
- Database composite indexing (`workspaceId` as leading column)
- Connection pooling (Supavisor transaction mode)
- Query deduplication (`React.cache()` — already in use for `resolveSession`)
- Streaming with Suspense (`loading.tsx` + manual `<Suspense>` boundaries)
- Selective field queries (Prisma `select` / `LIST_SELECT` pattern)
- Targeted cache invalidation (`revalidatePath` with `'page'` scope, `revalidateTag`)

**Should have (differentiators):**
- Granular Suspense boundaries for heavy pages (`/financeiro`, `/inicio`)
- Prisma query plan analysis (`EXPLAIN`, `@prisma/sqlcommenter-query-insights`)
- Partial (filtered) indexes for soft-deleted data (`deletedAt IS NULL`)
- `unstable_after` for non-blocking audit/telemetry writes
- `relationLoadStrategy: "join"` where query constraints allow
- Column-level selection extended to search endpoints
- Server Component boundary audit to reduce client JS
- `next/dynamic` for heavy client components (charts, PDF, editors)

**Defer (post-v1.4):**
- React Compiler (Babel-only currently, slower builds; wait for build-time performance improvements)
- Deep memory leak investigation (only if field data shows INP degradation over time)
- Raw SQL for report queries (optimize with ORM first; escalate only if reports are slow)
- Full OpenTelemetry/Sentry instrumentation pipeline (start simple with `instrumentation.ts`)

### Architecture Approach

The guiding principle is **progressive enhancement**: every optimization is an additive layer. Repository interfaces, domain models, Server Actions, and the 407 existing tests remain unchanged. The presentation layer decomposes heavy pages into independent async Server Components wrapped in `<Suspense>` boundaries. Data access stays behind the repository pattern. Caching and deduplication sit between presentation and database. The database layer gets composite indexes and pooled connections underneath.

**Major components:**
1. **Page (Server Component)** — Orchestrates data fetching, defines Suspense boundaries, awaits only `resolveSession()`
2. **AsyncSection (Server Component)** — Fetches data for one independent slice; child of a Suspense boundary
3. **Skeleton (Server/Client Component)** — Fallback UI matching final dimensions to prevent CLS
4. **PageClient (Client Component)** — Interactivity: modals, forms, charts; receives props from Page
5. **DynamicChunk (dynamically imported)** — Heavy libraries loaded on demand via `next/dynamic`
6. **Repository (Prisma implementation)** — Database access, workspace-scoped, soft-delete aware
7. **Store (singleton via `globalThis`)** — Caches repository instance per request; must survive HMR

### Critical Pitfalls

1. **Cache poisoning / cross-tenant data leak** — Any `unstable_cache`, `use cache`, or `fetch` caching without `workspaceId` in the key/tag can serve Tenant A's patients to Tenant B. **Prevention:** Every cache key MUST include `workspaceId`; prefer `revalidateTag` scoped per workspace. This is a HIPAA-level breach risk.

2. **Connection pool exhaustion** — Prisma 6's pool + Supavisor compete; serverless invocations multiply pool usage. Small Supabase tiers cap at 200–400 pooler clients. **Prevention:** Use transaction mode (`:6543?pgbouncer=true`), keep `connection_limit` low (start with 1–2), use `DIRECT_URL` (port 5432) ONLY for migrations.

3. **N+1 reintroduced by "optimization"** — Extracting a lean `select` then looping to fetch related data reverts v1.3 fixes. **Prevention:** Ban loops with DB queries in Server Components; extend batch repository methods (`findByAppointmentIds`) instead.

4. **`importantObservations` leaked** — Consolidating selects or adding cached queries may accidentally include sensitive clinical notes in list/search views. **Prevention:** Explicitly exclude in all list/search queries; add `SafePatientSelect` TypeScript guard; grep for `importantObservations` in repository files.

5. **`dynamic = "force-dynamic"` reintroduced** — Adding auth checks or `cookies()` at layout level, or copying old page templates, opts entire subtrees out of static optimization. **Prevention:** `grep -r "dynamic = 'force-dynamic'" src/app` must stay empty; keep session resolution scoped to pages, not layouts.

6. **Suspense boundaries without fallbacks or with DB queries above them** — Awaiting data in the parent component before passing it into `<Suspense>` negates streaming. **Prevention:** Fetch INSIDE the Suspense-wrapped component; fallback skeletons must match final layout dimensions exactly.

## Implications for Roadmap

Based on research, suggested phase structure for v1.4:

### Phase 1: Diagnóstico e Fundação de Dados
**Rationale:** Measure before optimizing. Database fixes benefit every subsequent phase, and diagnostics establish the baseline against which all improvements are validated.
**Delivers:**
- Bundle size baseline (`ANALYZE=true pnpm build`)
- Core Web Vitals instrumentation endpoint (`web-vitals` + `useReportWebVitals`)
- Missing composite indexes added to `schema.prisma` (`Appointment`, `SessionCharge`)
- Supavisor transaction mode configured (`DATABASE_URL` with `pgbouncer=true`, `DIRECT_URL` for migrations)
- Prisma query logging extension (`$extends` with `performance.now()` slow query warnings)
**Addresses (FEATURES):** Bundle analysis, DB indexing, connection pooling, CWV measurement, query deduplication
**Avoids (PITFALLS):** Connection pool exhaustion, unused indexes, optimizing dev instead of prod, `pgbouncer=true` missing in new envs

### Phase 2: Streaming e Suspense Granular
**Rationale:** The biggest perceived performance win for users. Heavy pages (`/financeiro`, `/inicio`) currently block on `Promise.all([...])`. Streaming requires fast queries (Phase 1) to be effective.
**Delivers:**
- `loading.tsx` for heavy routes
- Section-level skeleton components matching design tokens
- Async section components (`TodaySection`, `RemindersSection`, `TrendChartSection`, etc.)
- Suspense boundaries around each section; data fetch happens INSIDE the wrapped component
- React 19 `use` API for streaming promises into Client Components (with Error Boundaries)
**Addresses (FEATURES):** Streaming with Suspense, granular Suspense boundaries, preload patterns
**Avoids (PITFALLS):** Suspense boundaries blocking, layout shift from poor fallbacks, `use` API without Error Boundary, awaiting everything in the page component

### Phase 3: Cache Seletivo e Seguro
**Rationale:** Reduce redundant DB hits for read-heavy, rarely-changing data. Must come after streaming architecture is stable so caching doesn't mask structural slowness.
**Delivers:**
- `unstable_cache` wrappers for read-heavy repository methods (`PracticeProfile`, `ExpenseCategory` list, workspace metadata)
- `revalidateTag` calls in mutation Server Actions
- Cache key discipline enforced: `['domain', workspaceId, ...params]`
- Audit of all existing `revalidatePath` calls to ensure `'page'` scope
**Addresses (FEATURES):** Targeted cache invalidation, selective field queries, column-level selection for search
**Avoids (PITFALLS):** Cross-tenant cache leakage, stale auth/session caching, `revalidatePath` scope misuse causing cache stampedes, `React.cache()` misunderstood as cross-request cache

### Phase 4: Otimização de Assets e Bundle
**Rationale:** Low-hanging fruit for LCP/CLS improvement and JS bundle reduction. Independent of prior phases but best measured after streaming and caching are in place.
**Delivers:**
- `next/dynamic()` wrappers for heavy Client Components (charts, PDF preview, date pickers, rich text editors)
- `optimizePackageImports` in `next.config.ts` for any adopted utility libraries
- Font loading audit; migrate external fonts to `next/font` if applicable
- Image audit; replace raw `<img>` with `next/image` where applicable
- `next/script` strategies for any third-party scripts
**Addresses (FEATURES):** Image/font/script optimization, bundle splitting, `optimizePackageImports`
**Avoids (PITFALLS):** Bundle bloat from chart libs, dynamic imports with `ssr: false` in Server Components, optimizing dev instead of prod

### Phase 5: Medição, Observabilidade e Iteração
**Rationale:** Validate all prior work with objective metrics and establish continuous performance monitoring.
**Delivers:**
- Lighthouse CI configuration (`lighthouserc.js`) with pass/fail thresholds (LCP < 2.5s, CLS < 0.1)
- Real User Monitoring (RUM) pipeline for CWV at 75th percentile
- `memlab` scenario for patient navigation flow (heap snapshot diffing)
- `react-scan` integrated into dev environment
- `instrumentation.ts` with `register()` and `onRequestError` hooks
- Before/after performance report with actionable next steps
**Addresses (FEATURES):** Memory leak detection, instrumentation/observability, CWV measurement automation
**Avoids (PITFALLS):** Misreading dev vs prod bundle, ignoring `pg_stat_statements`, unbounded `Promise.all()` in server actions

### Phase Ordering Rationale

- **Phase 1 first** because database performance is the foundation: indexes and pooling make streaming actually fast, and diagnostics provide the baseline metric.
- **Phase 2 follows Phase 1** because Suspense streaming is only perceptually fast if the queries it streams are themselves fast.
- **Phase 3 follows Phase 2** because caching should not be used to mask slow queries; once streaming architecture is correct, selective caching reduces redundant work safely.
- **Phase 4 is parallel-friendly** after Phase 2 (asset optimization doesn't structurally depend on caching), but keeping it after Phase 3 prevents bundle-size wins from being confused with caching wins during measurement.
- **Phase 5 last** because measurement requires all prior optimizations to be in place for a valid before/after comparison.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Streaming):** React 19 `use` API integration with existing Client Components may need a spike to validate Error Boundary behavior in Next.js 15 App Router. The "pass promise to client" pattern is new to most teams.
- **Phase 4 (Assets):** If the team adopts a charting library (e.g., Recharts, Chart.js) for v1.4 reports, research the specific bundling impact and dynamic import configuration. Not needed if reports use server-rendered SVG.

Phases with standard patterns (skip dedicated `/gsd-research-phase`):
- **Phase 1 (Database Foundation):** Well-documented Prisma + Supabase patterns; `pgbouncer=true` is explicit in official docs.
- **Phase 5 (Measurement):** Lighthouse CI and `web-vitals` are mature, well-documented Google tools with stable APIs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against npm registry; `@next/bundle-analyzer` is official; Supavisor is built-in Supabase infrastructure |
| Features | HIGH | Based on stable Next.js 15, React 19, and Prisma 6 APIs; no experimental features required for MVP scope |
| Architecture | HIGH | Progressive enhancement on a solid v1.3 foundation; repository pattern and domain models remain unchanged |
| Pitfalls | HIGH | Extensive official documentation plus domain-specific analysis of multi-tenant, soft-delete, and HIPAA-sensitive patterns |

**Overall confidence:** HIGH

### Gaps to Address

The following gaps need resolution during planning or early implementation:

1. **Actual production query performance data:** Index recommendations are based on schema analysis, not `EXPLAIN ANALYZE` from production-like data volumes. During Phase 1, run `EXPLAIN ANALYZE` on the top 10 slowest queries to validate index choices.
2. **Bundle size baseline:** The `@next/bundle-analyzer` run in Phase 1 will identify the largest JS chunks. This determines which components most urgently need `next/dynamic` splitting in Phase 4.
3. **Font loading audit:** Current codebase uses CSS custom properties for typography. Need to verify whether any external font requests exist before deciding if `next/font` migration is needed.
4. **Cache invalidation granularity per domain:** `revalidateTag` strategy needs explicit definition per domain (finance, patients, appointments) to avoid over-invalidation or stale data. Define tags during Phase 3 planning.
5. **Edge runtime compatibility:** If PsiVault ever moves middleware or routes to Edge Runtime, Prisma Client will need a driver adapter. Current Node.js runtime is unaffected; document as architectural decision.

## Sources

### Primary (HIGH confidence)
- **Context7 `/vercel/next.js`** — Next.js 15 App Router caching, streaming, Suspense, `unstable_after`, `useReportWebVitals`, lazy loading, `optimizePackageImports`
- **Context7 `/prisma/prisma`** — Prisma 6 query middleware (`$extends`), connection pooling, `relationLoadStrategy`, partial indexes, `$queryRaw`
- **Context7 `/websites/supabase`** — Supavisor transaction/session mode, connection string formats, PgBouncer integration, `pg_stat_statements`
- **React 19 Official Docs** — `use` API, Suspense improvements, React Compiler (experimental)
- **web.dev** — Core Web Vitals thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1)

### Secondary (MEDIUM-HIGH confidence)
- **GitHub `aidenybai/react-scan`** (v0.5.3) — Zero-config re-render detection, Next.js App Router setup
- **GitHub `facebook/memlab`** (v2.0.1) — E2E memory leak detection, scenario file API
- **npm registry** — Version verification for `web-vitals@5.2.0`, `lighthouse@13.1.0`, `@lhci/cli@0.15.1`, `memlab@2.0.1`
- **PsiVault internal codebase** — `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/*/repository.prisma.ts`, `src/app/(vault)/*/page.tsx` (v1.3 state with 407 tests)

### Tertiary (MEDIUM confidence)
- **React Compiler (Experimental)** — Build-time performance impact not yet benchmarked for this codebase; adopt incrementally
- **Memory leak patterns** — General React knowledge; specific leaks require profiling with `memlab` and Chrome DevTools

---
*Research completed: 2026-04-23*
*Ready for roadmap: yes*
