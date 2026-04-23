# Domain Pitfalls: Performance Optimization in Next.js 15 + Prisma 6 + Supabase

**Domain:** Multi-tenant SaaS (PsiVault — prontuário eletrônico para psicólogos)
**Researched:** 2026-04-23
**Context:** Adding deep performance optimizations to an existing production system with 407 tests, real users, MFA auth, workspace-scoped queries, soft deletes, and audit trail.

---

## Critical Pitfalls

Mistakes that cause rewrites, outages, data leaks, or security regressions.

### Pitfall 1: Cache Poisoning / Cross-Tenant Data Leak via `unstable_cache` or `use cache`

**What goes wrong:** Adding Next.js caching (`unstable_cache`, `use cache`, or `fetch` with `force-cache`) without including `workspaceId` in the cache key causes Tenant A's data to be served to Tenant B. The cache is shared across requests by default.

**Why it happens:** Developers cache expensive queries (e.g., patient list, financial reports) keyed only by generic parameters like date range or pagination, forgetting that the same query shape returns different data per workspace.

**Consequences:** HIPAA-level breach — one psychologist sees another's patients, appointments, or financial data.

**Prevention:**
- Every cache key MUST include `workspaceId` (and `accountId` where relevant).
- Prefer `revalidateTag` scoped to workspace: `revalidateTag(\`patients:${workspaceId}\`)`.
- Never cache `fetch` or ORM calls at the route level without explicit tag-based invalidation per workspace.
- If using `unstable_cache`, the key array must be: `['patients', workspaceId, ...otherParams]`.

**Detection:**
- Code review rule: any `unstable_cache`, `use cache`, or `cache: 'force-cache'` must be accompanied by a workspace-scoped tag or key.
- Integration test: two sessions, different workspaces, same query → assert different responses.

**Phase to address:** Phase 1 (Diagnóstico e Cache Seguro) — audit all existing caches before adding new ones.

---

### Pitfall 2: Connection Pool Exhaustion from Prisma + Supabase Under Load

**What goes wrong:** After optimizing queries to run in parallel (e.g., `Promise.all([query1, query2, query3])`), the app hits `P1001` or `connection pool timeout` errors under load. Supabase compute tier has a hard connection limit.

**Why it happens:**
- Prisma 6's connection pool + Supabase's Supavisor pooler compete. Each Next.js serverless invocation creates its own Prisma client instance with its own pool.
- Supabase transaction mode (port 6543) has a `max_pooler_clients` limit per compute tier. Small tiers (e.g., free/Pro) cap at 200–400 clients.
- Prisma defaults to a pool size that, multiplied by concurrent Vercel functions, exceeds Supabase limits.

**Consequences:** Cascading 500s, slow queries, database unavailability. In a clinical SaaS, this means psychologists cannot access patient records during sessions.

**Prevention:**
- Use Supabase **transaction mode** (port 6543) for runtime queries with `pgbouncer=true` in `DATABASE_URL`.
- Set `connection_limit` low in the pooled URL (start with 1–2 for serverless; Prisma docs recommend 1 with PgBouncer).
- Use `DIRECT_URL` (port 5432, session mode) ONLY for Prisma Migrate/CLI — never for runtime.
- Monitor `pg_stat_activity` before and after optimization. Baseline current connections.
- Avoid excessive `Promise.all()` parallelism against the same DB. Batch instead.

**Detection:**
- Supabase Dashboard → Observability → Database Connections.
- Alert when connections exceed 80% of tier limit.
- Load test with `k6` or `artillery` after each optimization.

**Phase to address:** Phase 2 (Otimização de Queries e Pool) — connection tuning must be validated under load.

---

### Pitfall 3: N+1 Reintroduced by "Optimizing" with Selective Queries

**What goes wrong:** A developer extracts a lean `select` for a list view to improve performance, then loops through results in a Server Component or utility to fetch related data (e.g., appointment status per patient), reintroducing N+1.

**Why it happens:** The v1.3 fix used `include` or batch queries (`findByAppointmentIds`). When adding column selection or new endpoints, developers may revert to loop-based fetching for "flexibility."

**Consequences:** What was 1 query becomes N+1. At 100 patients, that's 101 queries. At 1,000, the page times out.

**Prevention:**
- Ban loops with DB queries in Server Components. Use `include`, `in` filters, or `relationLoadStrategy: "join"`.
- If column selection is needed, use Prisma's `select` WITH nested `select` or `include` — never loop.
- Maintain the existing repository pattern: batch methods like `findByAppointmentIds` must be extended, not replaced with loops.

**Detection:**
- Enable Prisma query logging in staging: `log: ['query']`.
- Assert query count in integration tests (e.g., `expect(queries).toHaveLength(3)`).

**Phase to address:** Phase 2 (Otimização de Queries) — every new endpoint needs query-count assertion.

---

### Pitfall 4: `importantObservations` Leaked via Cache or Over-Fetching

**What goes wrong:** While optimizing queries, a developer removes the `LIST_SELECT` exclusion or adds a cached query that inadvertently fetches `importantObservations` for list views.

**Why it happens:** Performance optimization focuses on reducing queries, and in consolidating selects, the sensitive field exclusion is missed.

**Consequences:** Clinical observations (highly sensitive psychotherapy notes) appear in patient lists, search results, or cached payloads.

**Prevention:**
- `importantObservations` must be explicitly excluded in all list/search queries — never rely on "default" selects.
- Add a TypeScript-level guard: create a `SafePatientSelect` type that omits `importantObservations`.
- In code review, any change to `select` or `include` in Patient/Prontuario queries must be flagged.

**Detection:**
- Static analysis: grep for `importantObservations` in `src/lib/**/repository*.ts`. Should only appear in `findById` and backup-export paths.
- Integration test: list patients → assert `importantObservations` is `undefined` for every record.

**Phase to address:** Every phase — this is a cross-cutting invariant.

---

### Pitfall 5: `dynamic = "force-dynamic"` Reintroduced During Refactoring

**What goes wrong:** While adding Suspense boundaries or reorganizing pages, a developer copies an old page template that includes `export const dynamic = 'force-dynamic'`, or adds `cookies()`/`headers()` at the layout level, forcing the entire route tree dynamic.

**Why it happens:** Next.js 15 makes routes dynamic by default when request-time APIs are used. Developers may add auth checks or session resolution at the layout level without realizing it opts the entire subtree out of static optimization.

**Consequences:** Loss of all caching gains. Every request hits the database. CPU and connection usage spike.

**Prevention:**
- `dynamic = 'force-dynamic'` should not exist in the codebase post-v1.3. Any reintroduction is a regression.
- Keep session resolution scoped to pages or specific Server Components, not layouts, where possible.
- Use `React.cache()` for `resolveSession` (already done in v1.3) — it deduplicates without forcing dynamic.
- If `cookies()` is needed in a layout, isolate it behind a Suspense boundary so the shell can still be cached.

**Detection:**
- `grep -r "dynamic = 'force-dynamic'" src/app` should return empty.
- Build log analysis: check which routes are marked "dynamic" unexpectedly.

**Phase to address:** Phase 1 (Diagnóstico) — audit route configs; Phase 3 (Streaming) — verify Suspense boundaries don't force dynamic unnecessarily.

---

### Pitfall 6: Over-Caching Auth/Session Data Causing Stale MFA/Role State

**What goes wrong:** Caching `resolveSession` or auth checks with a long TTL causes users to retain old roles, workspace assignments, or MFA status after changes.

**Why it happens:** `React.cache()` only deduplicates within a single render pass — this is safe. But if someone wraps session resolution in `unstable_cache` or `use cache` with `revalidate: 3600`, the session becomes stale.

**Consequences:**
- A revoked user retains access for the cache duration.
- Workspace role changes (e.g., admin → member) don't propagate.
- MFA enforcement state is stale.

**Prevention:**
- NEVER cache auth/session resolution across requests. `React.cache()` (per-render-pass) is the only acceptable caching layer for auth.
- If caching user metadata (name, avatar), use very short TTLs (≤ 60s) and tag with user ID for immediate revalidation on profile update.
- MFA and role checks must always hit the session/token directly.

**Detection:**
- Security test: change a user's role → assert the change is reflected on next navigation within < 5s.

**Phase to address:** Phase 1 (Diagnóstico) — audit what is cached; auth must be excluded.

---

### Pitfall 7: Prisma `relationLoadStrategy: "join"` Used with Supabase RLS or Complex Filters

**What goes wrong:** Using `relationLoadStrategy: "join"` (introduced in Prisma 5+) to reduce queries from 2 to 1, but the query includes relation filters, boolean operators, or workspace-scoped conditions that Prisma cannot translate into a valid JOIN.

**Why it happens:** Prisma's `relationLoadStrategy: "join"` has strict limitations (from docs): all `where` criteria must be on scalar fields of the same model, using only `equals`, with no boolean operators or relation filters. In a multi-tenant app with `workspaceId` filtering and soft-delete conditions, it's easy to violate these constraints.

**Consequences:** Silent fallback to query strategy (2 queries) — not a bug, but the optimization is ineffective. Or, in edge cases, incorrect query plans causing full table scans.

**Prevention:**
- Only use `relationLoadStrategy: "join"` when `where` contains ONLY scalar `equals` on the queried model.
- For workspace-scoped lists with soft deletes, the existing 2-query pattern (findMany + in-filter) is often safer and more predictable.
- Always verify with `EXPLAIN ANALYZE` when introducing JOINs.

**Detection:**
- Prisma query log: check if the optimized query still emits 2 SQL statements.
- PostgreSQL slow query log after deployment.

**Phase to address:** Phase 2 (Otimização de Queries) — validate each JOIN strategy with query log.

---

### Pitfall 8: Suspense Boundaries Without Fallbacks or With DB Queries Above Them

**What goes wrong:** Adding `<Suspense>` around charts or widgets, but the parent Server Component still awaits all data before rendering, negating streaming. Or, fallbacks are missing/ugly, causing layout shift (CLS).

**Why it happens:**
- Developers wrap a component in Suspense but call its data fetcher directly in the parent: `const data = await getData(); return <Suspense><Widget data={data} /></Suspense>` — the await blocks streaming.
- The data fetch must happen *inside* the Suspense-wrapped component.
- Fallback UI doesn't match the final component dimensions, causing CLS.

**Consequences:**
- TTFB and LCP don't improve because the server still waits for all data.
- CLS scores worsen, failing Core Web Vitals.

**Prevention:**
- Data fetching must happen INSIDE the component wrapped by Suspense, not in the parent.
- Fallback must have explicit `width`/`height` or skeleton that matches final layout.
- Use `loading.tsx` only for initial page loads; prefer explicit `<Suspense>` boundaries for granular streaming.

**Detection:**
- Web Vitals monitoring: if INP/TTFB don't improve after adding Suspense, the boundary is wrong.
- Lighthouse CLS audit.

**Phase to address:** Phase 3 (Streaming e Suspense) — each boundary must be validated with Lighthouse.

---

### Pitfall 9: Hot Module Replacement (HMR) Creating Multiple Prisma Clients in Dev

**What goes wrong:** While optimizing, a developer refactors `prisma.ts` and accidentally removes the `globalThis` singleton pattern. In dev, every file save creates a new PrismaClient, exhausting the local/dev connection pool.

**Why it happens:** The existing pattern stores PrismaClient on `globalThis` in dev to survive HMR. If refactored into a class or factory without preserving this guard, connections leak.

**Consequences:**
- Dev environment becomes unusable with connection errors.
- The same pattern, if deployed, causes connection exhaustion in production (though Vercel's serverless model is less prone to HMR, container reuse still matters).

**Prevention:**
- Never refactor `prisma.ts` singleton without preserving the `globalThis` guard:
  ```ts
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```
- If introducing a driver adapter (e.g., for connection pooling), ensure the adapter instance is also singleton.

**Detection:**
- Dev console: watch for `FATAL: sorry, too many clients already` after a few saves.
- `pg_stat_activity` in dev/staging: count connections from `postgres` role.

**Phase to address:** Phase 0 (Setup/Infra) — validate before any query changes.

---

### Pitfall 10: `revalidatePath` Scope Misuse Causing Cache Stampedes

**What goes wrong:** Using `revalidatePath('/vault/pacientes', 'layout')` instead of `'page'` causes Next.js to revalidate the entire route subtree, including layouts, on every patient mutation. Under load, this creates a cache stampede.

**Why it happens:** v1.3 correctly used `revalidatePath(..., 'page')` in 13 server actions. If new actions are added during v1.4 without specifying scope, the default may revalidate more than intended.

**Consequences:**
- Database load spikes after every mutation (all revalidated routes refetch).
- Next.js server CPU spikes.
- Degraded user experience as cached pages are regenerated synchronously.

**Prevention:**
- Always specify `'page'` scope for `revalidatePath` unless layout revalidation is explicitly required.
- Prefer `revalidateTag` over `revalidatePath` — it's more granular and doesn't walk the route tree.

**Detection:**
- Vercel function logs: look for spikes in execution duration after mutations.
- Next.js build output: check which paths are revalidated.

**Phase to address:** Phase 1 (Diagnóstico) — audit all `revalidatePath` calls; Phase 4 (Ações e Mutações).

---

### Pitfall 11: Adding Indexes Without Analyzing Workspace-Scoped Query Patterns

**What goes wrong:** Creating indexes on `patient.name` or `appointment.date` without including `workspaceId` as the leading column. PostgreSQL cannot use the index efficiently for the app's actual query pattern (`WHERE workspaceId = X AND ...`).

**Why it happens:** Developers optimize based on generic advice ("index the filter columns") without considering that EVERY query in this app is scoped to `workspaceId`.

**Consequences:**
- Index is unused or only partially used.
- Write performance degrades (index maintenance overhead) with no read benefit.
- Disk usage grows.

**Prevention:**
- Every new index must be composite with `workspaceId` as the FIRST column: `[workspaceId, status, date]` not `[status, date]`.
- Use `EXPLAIN ANALYZE` on production-like data volumes before adding indexes.
- Test index impact on write paths (patient creation, appointment booking) — these are user-facing.

**Detection:**
- `EXPLAIN (ANALYZE, BUFFERS)` on slow queries — verify Index Scan vs Seq Scan.
- `pg_stat_user_indexes` — check `idx_scan` count after deployment. Zero scans = unused index.

**Phase to address:** Phase 2 (Otimização de Queries) — each index must be justified with query plan.

---

### Pitfall 12: Soft-Delete Bypass in Optimized Raw Queries or Aggregations

**What goes wrong:** To optimize a slow aggregation (e.g., financial reports), a developer uses `prisma.$queryRaw` or `prisma.$executeRaw`. The raw query forgets the `deletedAt IS NULL` condition, returning archived/deleted records.

**Why it happens:** Prisma's ORM layer normally handles soft deletes transparently via `findMany({ where: { deletedAt: null } })`. Raw SQL bypasses this guard.

**Consequences:**
- Financial reports include deleted transactions.
- Patient counts include archived patients.
- Audit trail integrity is compromised.

**Prevention:**
- Ban raw queries for standard CRUD/list operations. Use only for complex analytics where ORM is insufficient.
- If raw queries are unavoidable, require a mandatory `WHERE deleted_at IS NULL` clause, validated in code review.
- Maintain a `BaseRepository` method for raw queries that auto-injects soft-delete filtering.

**Detection:**
- Code review: any `$queryRaw` must have a comment explaining why ORM can't be used, plus explicit soft-delete filter.
- Integration test: create + soft-delete a record → assert it's excluded from all optimized endpoints.

**Phase to address:** Phase 2 (Otimização de Queries) — raw queries are high-risk; gate them.

---

### Pitfall 13: Streaming Data with `use` API and Unhandled Promise Rejections

**What goes wrong:** Using React 19's `use` API to stream data from Server Component to Client Component, but the promise rejects (e.g., DB timeout). The error is not caught by an Error Boundary, crashing the Client Component tree.

**Why it happens:** `use(promise)` throws on rejection. If the Client Component doesn't have an Error Boundary, the entire subtree unmounts. In Next.js, this can cause a white screen or confusing error UI.

**Consequences:**
- Poor UX — instead of a graceful fallback, the user sees an error or blank area.
- Error boundaries may not catch Server Component errors properly in all Next.js 15 configurations.

**Prevention:**
- Always wrap `use`-consuming components in `<ErrorBoundary>` (or Next.js `error.tsx`).
- Prefer `Suspense` + async Server Components for data fetching where possible; use `use` only for true streaming props.
- Handle promise rejection before passing to Client Component, or pass a `Promise<Result | Error>` and handle inside.

**Detection:**
- Simulate slow DB (e.g., `pg_sleep(10)`) and verify graceful fallback.
- Error tracking (Sentry/etc.): monitor for `use` related unhandled rejections.

**Phase to address:** Phase 3 (Streaming e Suspense).

---

### Pitfall 14: Over-Optimization Breaking the Repository Pattern

**What goes wrong:** Developers inline Prisma queries into Server Components or pages "for performance," bypassing the repository abstraction. This duplicates query logic, breaks testability, and makes future optimizations harder.

**Why it happens:** "The repository adds indirection — let's query directly in the page for speed."

**Consequences:**
- Query logic fragments across the codebase.
- Unit tests with in-memory repositories break.
- The 407 existing tests may pass, but new code paths are untested.
- Security checks (workspace scoping, soft deletes) may be inconsistently applied.

**Prevention:**
- The repository pattern is non-negotiable. Optimizations belong in the repository implementation (`repository.prisma.ts`), not in pages/actions.
- If a query is slow, optimize the repository method (add index, batch query, select tuning) — don't bypass it.

**Detection:**
- `grep -r "prisma\." src/app` should return minimal hits (only repository imports).
- Code review: any `prisma.patient.findMany` outside `src/lib/**/repository*.ts` is rejected.

**Phase to address:** Every phase — architectural invariant.

---

## Moderate Pitfalls

### Pitfall 1: `React.cache()` Misunderstood as Cross-Request Cache

**What goes wrong:** A developer thinks `React.cache()` persists across requests and skips adding proper Next.js caching, or conversely, adds `unstable_cache` where `React.cache()` was already sufficient.

**Why it happens:** `React.cache()` only deduplicates within a SINGLE render pass. It does NOT cache across requests. The names are confusing.

**Prevention:**
- Use `React.cache()` for deduplication (e.g., `resolveSession` called 3x in one render).
- Use `unstable_cache` or `use cache` for cross-request caching (with workspace-scoped keys).
- Document the distinction in the codebase.

**Phase to address:** Phase 1 (Diagnóstico).

---

### Pitfall 2: `fetchCache = 'only-cache'` or Aggressive Static Rendering on Auth Routes

**What goes wrong:** Applying aggressive caching configs to routes that contain user-specific data (e.g., `/vault/financeiro` with workspace-scoped charts).

**Prevention:**
- Auth-protected routes under `(vault)` should remain dynamic by default. Only cache sub-components or data segments explicitly.
- Never use `fetchCache = 'only-cache'` or `dynamic = 'error'` in authenticated areas.

**Phase to address:** Phase 1 (Diagnóstico).

---

### Pitfall 3: Missing `pgbouncer=true` in New Environment Variables

**What goes wrong:** When adding staging/preview environments for performance testing, the `DATABASE_URL` uses direct connection (port 5432) instead of pooled connection (port 6543).

**Prevention:**
- Enforce `DATABASE_URL` validation at startup: must contain `pooler.supabase.com:6543` and `pgbouncer=true` in production/staging.
- Document connection string requirements in `CLAUDE.md` and `.env.example`.

**Phase to address:** Phase 0 (Infra).

---

### Pitfall 4: Bundle Bloat from New Charting/Visualization Libraries

**What goes wrong:** Adding heavy charting libraries (e.g., Recharts, Chart.js, D3) for financial reports without code-splitting, increasing the client bundle significantly.

**Prevention:**
- Use dynamic imports (`next/dynamic`) for chart components.
- Prefer Server-Rendered SVG charts where possible (no client JS).
- Audit bundle size with `@next/bundle-analyzer` before and after adding visualization libs.

**Phase to address:** Phase 3 (Assets e Bundle) / Phase 5 (Relatórios e PDFs).

---

### Pitfall 5: `Promise.all()` with Uncapped Concurrency in Server Actions

**What goes wrong:** A server action uses `Promise.all(array.map(...))` with an unbounded array (e.g., generating 100 PDF receipts at once), overwhelming the event loop and DB.

**Prevention:**
- Cap concurrency with `p-limit` or custom semaphore (e.g., max 5 parallel ops).
- For bulk operations, use Prisma's `createMany`, `updateMany`, or queue jobs — don't parallelize unbounded arrays.

**Phase to address:** Phase 4 (Ações e Mutações) / Phase 5 (Recibos e Relatórios).

---

## Minor Pitfalls

### Pitfall 1: Optimizing Dev Build Instead of Production

**What goes wrong:** Measuring performance in `next dev` (no caching, no optimization) and making wrong conclusions.

**Prevention:**
- Always measure with `next build && next start` or production deployment.
- Use Vercel Speed Insights or Web Vitals library for real-user monitoring.

**Phase to address:** Phase 1 (Diagnóstico).

---

### Pitfall 2: Ignoring `pg_stat_statements` and Query Plans

**What goes wrong:** Adding indexes and caches without checking PostgreSQL's own slow-query log.

**Prevention:**
- Enable `pg_stat_statements` extension in Supabase.
- Run `EXPLAIN ANALYZE` before and after every optimization.

**Phase to address:** Phase 2 (Otimização de Queries).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Diagnóstico de bundle | Misreading dev vs prod bundle | Measure production builds only |
| Diagnóstico de bundle | Not checking client vs server split | Use bundle analyzer; verify Server Components aren't bloating client |
| Cache | Cross-tenant cache leakage | Workspace ID in every key/tag |
| Cache | Stale auth/session | No cross-request auth caching |
| Queries | N+1 reintroduced | Ban loops with DB queries; enforce batch methods |
| Queries | Connection pool exhaustion | Pooled URL, low connection_limit, monitor `pg_stat_activity` |
| Queries | Unused indexes | `EXPLAIN ANALYZE`; verify `idx_scan > 0` after deploy |
| Queries | Raw SQL soft-delete bypass | Gate raw queries; auto-inject `deleted_at IS NULL` |
| Streaming | Suspense boundaries blocking | Fetch INSIDE Suspense component, not parent |
| Streaming | Layout shift from poor fallbacks | Skeletons must match final dimensions |
| Streaming | `use` API without Error Boundary | Wrap all `use` consumers in error handling |
| Assets | Heavy chart libs without code-split | `next/dynamic` for charts; prefer server-rendered SVG |
| Server Actions | `revalidatePath` without scope | Always use `'page'` scope or `revalidateTag` |
| Server Actions | Unbounded `Promise.all` | Cap concurrency; use batch operations |
| PDF/Reports | Generating large payloads in request | Stream PDFs; use background jobs for bulk exports |
| Auth/MFA | Cache poisoning of session | Never cache auth; verify MFA state on every sensitive action |

---

## Sources

- Next.js Caching Docs (v16.2.4): https://nextjs.org/docs/app/guides/caching-without-cache-components — HIGH confidence
- Next.js Streaming & Suspense: https://nextjs.org/docs/app/guides/streaming — HIGH confidence
- Next.js Server Components: https://nextjs.org/docs/app/getting-started/server-and-client-components — HIGH confidence
- Prisma Query Optimization: https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance — HIGH confidence
- Prisma Database Connections: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections — HIGH confidence
- Supabase Connection Management: https://supabase.com/docs/guides/database/connection-management — HIGH confidence
- Supabase Connecting to Postgres: https://supabase.com/docs/guides/database/connecting-to-postgres — HIGH confidence
- Prisma + PgBouncer: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer — HIGH confidence
- React `cache` API: https://react.dev/reference/react/cache — HIGH confidence
- Context7: `/vercel/next.js`, `/llmstxt/prisma_io_llms-full_txt`, `/websites/supabase` — HIGH confidence
