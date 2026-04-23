# Architecture Patterns: Performance Optimization Integration

**Project:** PsiVault (PsiLock)
**Domain:** Next.js 15 App Router + React 19 + Prisma 6 + PostgreSQL (Supabase)
**Researched:** 2026-04-23
**Confidence:** HIGH

## Executive Summary

This document defines how v1.4 "Performance Profunda" optimizations integrate with PsiVault's existing architecture. The app already has a solid foundation: Next.js 15 App Router with Server Components by default, a strict repository pattern, workspace-scoped queries, and 407 passing tests. The v1.3 milestone resolved systemic slowness (N+1 queries eliminated, caching enabled, force-dynamic removed). v1.4 goes deeper: streaming UI with Suspense, strategic bundle splitting, database indexing, connection pooling tuning, and asset optimization — all while preserving the existing repository pattern, domain model separation, and zero breaking changes to tests.

The core architectural principle for v1.4 is **progressive enhancement**: every optimization is an additive layer. Repository interfaces don't change. Server Actions keep working. Workspace scoping remains invariant. We add Suspense boundaries around existing repository calls, split heavy client bundles dynamically, and tune the database layer underneath.

## Recommended Architecture

### Layered Integration Model

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION (Pages / Components)                          │
│  • Server Components (default) → async data fetch           │
│  • Suspense boundaries → streaming                          │
│  • Dynamic imports → bundle splitting                       │
│  • React 19 `use` → promise resolution in Client Components │
├─────────────────────────────────────────────────────────────┤
│  DATA ACCESS (Repository Pattern — UNCHANGED INTERFACES)    │
│  • Repository interfaces: src/lib/[domain]/repository.ts    │
│  • Prisma implementations: repository.prisma.ts             │
│  • Singleton stores: store.ts (globalThis)                  │
├─────────────────────────────────────────────────────────────┤
│  CACHE & DEDUPLICATION                                      │
│  • React.cache() → resolveSession (already implemented)     │
│  • unstable_cache → expensive read-only queries             │
│  • revalidatePath / revalidateTag → cache invalidation      │
├─────────────────────────────────────────────────────────────┤
│  DATABASE (Prisma 6 + PostgreSQL via Supabase)              │
│  • Connection pooling: Prisma pool + Supavisor              │
│  • Query optimization: indexes, select pruning, EXPLAIN     │
│  • Multi-tenant scoping: workspaceId on every query         │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `Page` (Server Component) | Orchestrate data fetching, define Suspense boundaries | Repositories, Client Components |
| `AsyncSection` (Server Component) | Fetch data for one section, suspend until ready | Repository singletons |
| `Skeleton` (Server/Client Component) | Render fallback UI while streaming | Suspense boundary |
| `PageClient` (Client Component) | Interactivity: modals, forms, charts | Receives props from Page |
| `DynamicChart` (dynamically imported) | Heavy chart library, loaded on demand | PageClient via `next/dynamic` |
| Repository (Prisma impl) | Database access, workspace-scoped | PrismaClient |
| Store (singleton) | Cache repository instance per request | globalThis |

### Data Flow

**Before v1.4 (blocking):**
```
Page.tsx → await resolveSession()
         → await Promise.all([repo1(), repo2(), repo3()])
         → render full page → send HTML
```

**After v1.4 (streaming):**
```
Page.tsx → await resolveSession() (blocking, required for auth)
         → render shell + Suspense boundaries immediately
         → stream fallback HTML
         ├── Suspense boundary 1 → await repo1() → stream chunk 1
         ├── Suspense boundary 2 → await repo2() → stream chunk 2
         └── Suspense boundary 3 → await repo3() → stream chunk 3
```

**Promise streaming (React 19 `use`):**
```
Page.tsx → const dataPromise = repo.findByWorkspace(...) // don't await
         → <Suspense fallback={<Skeleton />}>
             <ClientComponent dataPromise={dataPromise} />
           </Suspense>

ClientComponent.tsx → const data = use(dataPromise) // suspends here
```

## Patterns to Follow

### Pattern 1: Granular Suspense for Dashboard Pages
**What:** Decompose heavy pages (e.g., `/financeiro`, `/inicio`) into independent async sections, each wrapped in its own `<Suspense>` boundary.

**When:** A page loads data from multiple independent repositories and some sections are slower than others.

**Example:**
```tsx
// app/(vault)/inicio/page.tsx
import { Suspense } from 'react'
import { TodaySection } from './sections/today-section'
import { RemindersSection } from './sections/reminders-section'
import { MonthlySummarySection } from './sections/monthly-summary-section'
import { PendingChargesSection } from './sections/pending-charges-section'
import { TodaySkeleton, RemindersSkeleton, SummarySkeleton } from './skeletons'

export default async function InicioPage() {
  const { workspaceId } = await resolveSession() // blocking: auth required

  return (
    <main>
      <Suspense fallback={<TodaySkeleton />}>
        <TodaySection workspaceId={workspaceId} />
      </Suspense>

      <Suspense fallback={<RemindersSkeleton />}>
        <RemindersSection workspaceId={workspaceId} />
      </Suspense>

      <Suspense fallback={<SummarySkeleton />}>
        <MonthlySummarySection workspaceId={workspaceId} />
      </Suspense>

      <Suspense fallback={<SummarySkeleton />}>
        <PendingChargesSection workspaceId={workspaceId} />
      </Suspense>
    </main>
  )
}
```

**Key rule:** Each `*-section.tsx` is a **Server Component** that performs its own data fetch. The parent page does not await the data — it passes `workspaceId` and lets the child suspend.

### Pattern 2: Promise Passing to Client Components (React 19 `use`)
**What:** Initiate a fetch in a Server Component without awaiting, pass the promise to a Client Component, and consume it with React 19's `use` API inside a Suspense boundary.

**When:** A Client Component needs server-fetched data but the Server Component shell should render immediately.

**Example:**
```tsx
// Server Component
import { Suspense } from 'react'
import { getFinanceRepository } from '@/lib/finance/store'
import { RevenueChartClient } from './revenue-chart-client'

export default function RevenueSection({ workspaceId }: { workspaceId: string }) {
  const financeRepo = getFinanceRepository()
  // Start fetch but don't await
  const statsPromise = financeRepo.listByWorkspaceAndDateRange(workspaceId, start, end)

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <RevenueChartClient dataPromise={statsPromise} />
    </Suspense>
  )
}

// Client Component
'use client'
import { use } from 'react'

export function RevenueChartClient({ dataPromise }: { dataPromise: Promise<Charge[]> }) {
  const data = use(dataPromise) // Suspends until promise resolves
  return <Chart data={data} />
}
```

**Confidence:** HIGH — This is the idiomatic React 19 pattern for streaming data into Client Components. Source: React 19 stable docs, Next.js streaming guide.

### Pattern 3: Dynamic Import for Heavy Client Components
**What:** Use `next/dynamic` to lazy-load heavy Client Components (chart libraries, rich text editors, PDF viewers) so they don't bloat the initial JavaScript bundle.

**When:** A component depends on a large third-party library that isn't needed for initial render.

**Example:**
```tsx
'use client'
import dynamic from 'next/dynamic'

// Heavy chart library only loaded when the tab is active
const RevenueChart = dynamic(() => import('@/components/charts/revenue-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Only needed on client
})

export default function FinanceiroPageClient({ ...props }) {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Ver gráfico</button>
      {showChart && <RevenueChart data={props.trends} />}
    </div>
  )
}
```

**Note:** When a Server Component dynamically imports a Client Component, automatic code splitting is supported. `ssr: false` is not supported in Server Components — move it to the Client Component. Source: Next.js lazy-loading docs.

### Pattern 4: Repository-Level `unstable_cache` for Read-Heavy Data
**What:** Wrap expensive, read-only repository queries with `unstable_cache` from `next/cache` to cache results across requests.

**When:** Data changes infrequently (e.g., workspace profile, expense categories) but is queried on every page load.

**Example:**
```tsx
// src/lib/expense-categories/repository.prisma.ts
import { unstable_cache } from 'next/cache'

export function createPrismaExpenseCategoryRepository(): ExpenseCategoryRepository {
  return {
    findActiveByWorkspace: unstable_cache(
      async (workspaceId: string) => {
        return db.expenseCategory.findMany({
          where: { workspaceId, archived: false, deletedAt: null },
          orderBy: { name: 'asc' },
        })
      },
      ['expense-categories', 'active'],
      { revalidate: 60, tags: ['expense-categories'] }
    ),
    // ... other methods
  }
}
```

**Caution:** Cached functions must NOT depend on request-specific state (cookies, headers). Workspace-scoped queries are safe because `workspaceId` is part of the cache key. Source: Next.js caching docs.

### Pattern 5: Database Indexing for Multi-Tenant Queries
**What:** Ensure every frequent query pattern has a composite index with `workspaceId` as the leading column.

**When:** Any table with `workspaceId` that is queried by additional filters (date ranges, status, patientId).

**Current schema analysis:**

| Table | Existing Indexes | Gap | Recommended Index |
|-------|-----------------|-----|-------------------|
| `Appointment` | `[workspaceId, startsAt]`, `[workspaceId, patientId]`, `[seriesId]` | Missing status+date filter | `[workspaceId, status, startsAt]` |
| `Patient` | `[workspaceId, deletedAt]` | — | Adequate for list queries |
| `SessionCharge` | `[workspaceId, createdAt]`, `[workspaceId, patientId]` | Missing status filter for pending/overdue | `[workspaceId, status, createdAt]` |
| `ClinicalNote` | `[workspaceId, patientId]` | — | Adequate |
| `PracticeDocument` | `[workspaceId, patientId]` | — | Adequate |
| `AuditEvent` | `[workspaceId, occurredAt]` | — | Adequate |
| `Reminder` | `[workspaceId, completedAt]`, `[workspaceId, linkType, linkId]` | — | Adequate |
| `NotificationJob` | `[workspaceId, status, scheduledFor]`, `[appointmentId, type]` | — | Adequate |
| `Expense` | `[workspaceId, deletedAt]`, `[workspaceId, dueDate]`, `[seriesId]` | — | Adequate |
| `ExpenseCategory` | `[workspaceId, deletedAt]`, `[workspaceId, archived]` | — | Adequate |

**Migration example:**
```prisma
// Add to schema.prisma
model Appointment {
  // ... existing fields
  @@index([workspaceId, status, startsAt])
}

model SessionCharge {
  // ... existing fields
  @@index([workspaceId, status, createdAt])
}
```

**Verification:** After adding indexes, verify with `EXPLAIN ANALYZE` on production-like data volumes:
```sql
EXPLAIN ANALYZE
SELECT * FROM "appointments"
WHERE "workspace_id" = 'ws_...'
  AND "status" IN ('SCHEDULED', 'CONFIRMED')
  AND "starts_at" >= '2026-04-01'
  AND "starts_at" < '2026-05-01';
```

Expected: `Index Scan` using the new composite index, not `Seq Scan` or `Bitmap Heap Scan` with high cost.

### Pattern 6: Connection Pooling with Supabase Supavisor
**What:** Configure Prisma 6 to use Supabase's connection pooler (Supavisor) in transaction mode for serverless deployments, while keeping a direct connection for migrations.

**When:** Deploying to Vercel or any serverless platform where function instances are ephemeral.

**Current state:** The schema already defines `directUrl` and `url`. The `db.ts` singleton uses `new PrismaClient()` without a driver adapter.

**Recommended configuration:**

```env
# .env
# Direct connection for Prisma CLI (migrations, db push)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Pooled connection for application runtime (Supavisor transaction mode)
# Port 6543 = transaction mode
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true"
```

```typescript
// src/lib/db.ts — keep singleton, no adapter needed for Prisma 6 + pooled URL
import { PrismaClient } from '@prisma/client'

declare global {
  var __psivaultPrisma__: PrismaClient | undefined
}

export const db =
  globalThis.__psivaultPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

globalThis.__psivaultPrisma__ = db
```

**Important:** With `pgbouncer=true`, Prisma ORM disables prepared statements, which is required for transaction-mode poolers. Prisma Migrate requires the direct connection (no pooler) because it uses single long-running transactions. Source: Prisma PgBouncer docs, Supabase connection docs.

**Prisma 6 pool defaults:**
- Default connection limit: `num_cpus * 2 + 1` (e.g., 5 on a 2-core container)
- Default pool timeout: 10s
- For Supabase: the pool size is shared across all connections. Monitor `pg_stat_activity` to avoid exhaustion.

### Pattern 7: Asset Optimization (Fonts, Images, Scripts)
**What:** Leverage Next.js built-in optimizations and React 19 resource preloading APIs.

**Fonts:** Currently using CSS custom properties for typography. If loading external fonts (e.g., from Google Fonts), use `next/font/google` for automatic self-hosting, subsetting, and `font-display: swap`:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Images:** Use `next/image` for any user-uploaded avatars or document thumbnails:
```tsx
import Image from 'next/image'

<Image
  src={patient.avatarUrl}
  alt={patient.fullName}
  width={64}
  height={64}
  className="avatar"
/>
```

**Resource preloading (React 19):**
For anticipated navigations (e.g., hovering over "Financeiro" link), preload critical data or assets:
```tsx
'use client'
import { preload } from 'react-dom'

function NavLink({ href, children }) {
  const handleMouseEnter = () => {
    preload(href, { as: 'document' })
  }

  return (
    <a href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  )
}
```

**Note:** PsiVault's design system uses CSS variables and inline `React.CSSProperties`, not Tailwind. Asset optimization should respect this — avoid importing Tailwind just for image classes.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Suspense Boundaries Around Synchronous Work
**What:** Wrapping non-async components in `<Suspense>` that don't suspend.

**Why bad:** Adds unnecessary React overhead, no streaming benefit.

**Instead:** Only wrap components that perform async work (data fetching, lazy loading). Keep static shell (headers, layout, navigation) outside Suspense.

### Anti-Pattern 2: Awaiting Everything in the Page Component
**What:** Keeping the v1.3 pattern of `await Promise.all([...])` for all data in the top-level page.

**Why bad:** Blocks HTML streaming until the slowest query finishes. Users see a blank screen.

**Instead:** Identify the critical path (usually just `resolveSession()`) and stream everything else. Move independent data fetches into child Server Components wrapped in Suspense.

### Anti-Pattern 3: Dynamic Imports in Server Components for Client Components with `ssr: false`
**What:** Trying to use `next/dynamic(() => import('...'), { ssr: false })` directly in a Server Component.

**Why bad:** Next.js throws an error. `ssr: false` is only valid in Client Components.

**Instead:** Move the dynamic import into the Client Component file, or use a Client Component wrapper.

### Anti-Pattern 4: Caching Workspace-Scoped Queries Without Workspace in Key
**What:** Using `unstable_cache` with a cache key that doesn't include `workspaceId`.

**Why bad:** Cross-tenant data leakage. One workspace sees another's cached data.

**Instead:** Always include `workspaceId` in the cache key array:
```tsx
unstable_cache(
  async (workspaceId) => { ... },
  ['finance', 'charges'], // BAD — missing workspaceId
  { tags: ['finance'] }
)

unstable_cache(
  async (workspaceId) => { ... },
  ['finance', workspaceId, 'charges'], // GOOD
  { tags: ['finance'] }
)
```

### Anti-Pattern 5: Adding DB Queries to Middleware
**What:** Attempting to add Prisma queries in `src/middleware.ts` for "optimization."

**Why bad:** Middleware runs on the Edge in many Next.js deployments. Prisma Client is not Edge-compatible without a driver adapter. Also adds latency to every request.

**Instead:** Keep middleware auth-only (as it is now with JWT fast-path). Do workspace resolution in Server Components or Server Actions.

### Anti-Pattern 6: Over-Indexing
**What:** Adding indexes on every column combination.

**Why bad:** Each index slows down writes (INSERT, UPDATE, DELETE) and consumes disk space.

**Instead:** Index only query patterns proven by `EXPLAIN ANALYZE` to be slow. Prioritize reads over writes for PsiVault's workload (clinical reads are 10x+ more frequent than writes).

## Scalability Considerations

| Concern | At 1 workspace | At 100 workspaces | At 10K workspaces |
|---------|---------------|-------------------|-------------------|
| **DB Connections** | Singleton PrismaClient handles all | Supavisor pools ~30 backend connections | Must monitor Supavisor pool size; consider dedicated pooler (paid tier) |
| **Query Performance** | Seq scans acceptable | Missing indexes cause visible latency | Composite indexes on `[workspaceId, ...]` essential |
| **Bundle Size** | Not a concern | Dynamic imports for charts/modals reduce initial JS | Code splitting by route automatic in App Router |
| **HTML Streaming** | Minimal benefit on fast queries | Significant perceived speedup on heavy pages | Required for good UX; use `loading.tsx` + Suspense |
| **Cache Invalidation** | `revalidatePath` sufficient | Tag-based `revalidateTag` preferred | Need cache invalidation strategy per workspace |

## Integration Points: New vs Modified

### New Files (Additive)

| File | Purpose | Location |
|------|---------|----------|
| `loading.tsx` | Route-level Suspense fallback | Adjacent to `page.tsx` in heavy routes |
| `*-skeleton.tsx` | Section-specific skeleton UI | `app/(vault)/[route]/components/` |
| `*-section.tsx` | Async Server Component for one data slice | `app/(vault)/[route]/sections/` |
| `dynamic-*-client.tsx` | Client Component wrapper with `next/dynamic` | `components/dynamic/` |
| `instrumentation.ts` | Web Vitals collection (Next.js 15) | `src/instrumentation.ts` |

### Modified Files (Non-Breaking)

| File | Change | Risk |
|------|--------|------|
| `page.tsx` (heavy routes) | Add Suspense boundaries, delegate to section components | LOW — same data, same repositories |
| `next.config.ts` | Add `bundleAnalyzer`, `compress`, experimental flags | LOW — config only |
| `schema.prisma` | Add composite indexes | LOW — additive, no data migration risk |
| `.env` / `.env.local` | Switch `DATABASE_URL` to Supavisor pooler URL | MED — test connection in staging |
| `db.ts` | Potentially add `$extends` for query logging/metrics | LOW — additive |
| `server actions` | Add `unstable_cache` wrappers for read actions | LOW — same interfaces |

### Unchanged (Invariant)

| File | Why Unchanged |
|------|---------------|
| `src/lib/[domain]/repository.ts` | Interfaces remain the contract |
| `src/lib/[domain]/model.ts` | Domain models unchanged |
| `src/lib/[domain]/store.ts` | Singleton pattern still valid |
| `src/middleware.ts` | No DB queries, auth-only |
| `src/app/(auth)/*` | Public routes, no optimization needed |
| All 407 tests | Additive changes don't break existing logic |

## Suggested Build Order (Phase Dependencies)

### Phase 1: Database Foundation (No Code Changes to App)
**Goal:** Eliminate query-level slowness.

1. Run `EXPLAIN ANALYZE` on top 10 slowest query patterns (identified by Prisma query logs or Supabase observability)
2. Add missing composite indexes to `schema.prisma`:
   - `Appointment`: `[workspaceId, status, startsAt]`
   - `SessionCharge`: `[workspaceId, status, createdAt]`
3. Run `prisma migrate dev` to apply indexes
4. Configure `DATABASE_URL` to use Supavisor transaction mode (`:6543?pgbouncer=true`)
5. Verify connection pooling in Supabase dashboard

**Depends on:** Nothing. Can start immediately.
**Blocks:** Nothing directly, but improves all subsequent phases.

### Phase 2: Streaming Shell for Heavy Pages
**Goal:** Improve perceived performance on `/financeiro` and `/inicio`.

1. Create skeleton components matching the existing UI layout (use design tokens)
2. Extract independent sections from `financeiro/page.tsx`:
   - `TrendChartSection`
   - `YearSummarySection`
   - `TopPatientsSection`
   - `PendingChargesSection`
3. Wrap each section in `<Suspense>` with skeleton fallback
4. Repeat for `/inicio`:
   - `TodaySection`
   - `RemindersSection`
   - `MonthlySummarySection`
   - `PendingChargesSection`

**Depends on:** Phase 1 (queries should be fast before streaming them)
**Blocks:** Phase 3

### Phase 3: Bundle Splitting for Client Components
**Goal:** Reduce initial JavaScript bundle.

1. Identify heavy client dependencies:
   - Chart library (if any)
   - PDF generation library (for recibos — v1.4 feature)
   - Date picker / calendar components
   - Rich text editor (if used in clinical notes)
2. Wrap each in `next/dynamic()` with `loading` prop
3. Add `optimizePackageImports` to `next.config.ts` for any remaining large packages

**Depends on:** Nothing technically, but best done after Phase 2 to measure impact.
**Blocks:** Nothing.

### Phase 4: Selective Caching
**Goal:** Reduce redundant database queries.

1. Identify read-heavy, rarely-changing data:
   - `PracticeProfile`
   - `ExpenseCategory` list
   - `Workspace` metadata
2. Wrap repository methods with `unstable_cache`
3. Add `revalidateTag` calls in mutation Server Actions
4. Consider `React.cache()` for request-scoped deduplication (already done for `resolveSession`)

**Depends on:** Phase 1 (indexes must be in place so cached queries are fast)
**Blocks:** Nothing.

### Phase 5: Asset & Font Optimization
**Goal:** Improve Core Web Vitals (LCP, CLS).

1. Audit font loading strategy — switch to `next/font` if using external fonts
2. Audit image usage — replace `<img>` with `next/image` where applicable
3. Add `preload` / `preconnect` hints for critical third-party resources (e.g., Supabase auth endpoints)
4. Implement `instrumentation.ts` for Web Vitals reporting

**Depends on:** Nothing.
**Blocks:** Nothing.

### Phase 6: Measurement & Iteration
**Goal:** Validate optimizations with objective metrics.

1. Add `web-vitals` library or Next.js `instrumentation` to log LCP, INP, CLS, TTFB
2. Run Lighthouse CI or PageSpeed Insights on key routes
3. Compare before/after metrics
4. Iterate on remaining bottlenecks

**Depends on:** Phases 1–5.
**Blocks:** Nothing.

## Data Flow Changes

### Before v1.4
```
Request → Middleware (auth) → Page (await all data) → HTML
```

### After v1.4
```
Request → Middleware (auth) → Page (await session only)
                                  ↓
                        Shell HTML streamed immediately
                                  ↓
                        Suspense boundary 1 → fetch → stream chunk
                        Suspense boundary 2 → fetch → stream chunk
                        Suspense boundary 3 → fetch → stream chunk
```

### Cache Invalidation Flow
```
Client Action → Server Action → Prisma mutation → revalidateTag('finance')
                                                           ↓
                                              Next.js cache invalidated
                                                           ↓
                                              Next request → fresh data
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supavisor connection string breaks local dev | MED | HIGH | Keep separate `.env.local` with direct connection for local dev |
| Suspense boundaries cause hydration mismatches | LOW | MED | Ensure skeletons match initial layout exactly; avoid `Date.now()` in skeletons |
| `unstable_cache` cross-tenant leak | LOW | HIGH | Strict cache key discipline: always include `workspaceId` |
| New indexes slow down writes | MED | LOW | Monitor write latency; remove unused indexes after 30 days |
| Dynamic imports break SSR for critical components | LOW | HIGH | Test each dynamic import in production build; avoid `ssr: false` for above-fold content |

## Sources

- **Next.js 15 Streaming & Suspense:** https://nextjs.org/docs/app/guides/streaming (Context7 `/vercel/next.js`)
- **Next.js Lazy Loading:** https://nextjs.org/docs/app/guides/lazy-loading (Context7 `/vercel/next.js`)
- **Next.js Loading UI:** https://nextjs.org/docs/app/api-reference/file-conventions/loading (WebFetch)
- **React 19 `use` API & Suspense:** https://react.dev/blog/2024/12/05/react-19 (WebFetch)
- **Prisma 6 Connection Pooling:** https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool (WebFetch)
- **Prisma + PgBouncer/Supavisor:** https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer (WebFetch)
- **Supabase Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers (WebFetch)
- **Next.js Caching:** https://nextjs.org/docs/app/guides/caching-without-cache-components (WebFetch)
- **PsiVault PROJECT.md:** `.planning/PROJECT.md` (Internal — v1.3 state, v1.4 targets)
- **PsiVault Schema & Codebase:** `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/*/repository.prisma.ts`, `src/app/(vault)/*/page.tsx` (Internal)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Suspense Streaming | HIGH | Official Next.js 15 + React 19 patterns, well-documented |
| Bundle Splitting | HIGH | `next/dynamic` is stable; main risk is component placement |
| DB Indexing | HIGH | PostgreSQL composite indexes are standard; schema already follows pattern |
| Connection Pooling | HIGH | Supabase + Prisma docs are explicit; `pgbouncer=true` is required for transaction mode |
| Asset Optimization | MEDIUM | Depends on whether external fonts/images are actually in use (not visible in current codebase) |
| React 19 `use` API | HIGH | Stable in React 19, but team's familiarity with "pass promise to client" pattern is assumed |
| Integration with Repository Pattern | HIGH | Repositories already return Promises; no interface changes needed |

## Gaps to Address

1. **Actual query performance data:** We need `EXPLAIN ANALYZE` output from production-like data to confirm which indexes are needed. The recommendations above are based on schema analysis.
2. **Bundle size baseline:** Need `@next/bundle-analyzer` run to identify the largest JS chunks before deciding what to split.
3. **Font loading audit:** Current codebase uses CSS variables for typography. Need to verify if any external font requests are happening.
4. **Edge runtime compatibility:** If PsiVault ever moves middleware or certain routes to Edge Runtime, Prisma Client will need a driver adapter (`@prisma/adapter-neon` or `@prisma/adapter-pg`). Current Node.js runtime is unaffected.
5. **Cache invalidation granularity:** `revalidateTag` vs `revalidatePath` strategy needs definition per domain (finance, patients, appointments).
