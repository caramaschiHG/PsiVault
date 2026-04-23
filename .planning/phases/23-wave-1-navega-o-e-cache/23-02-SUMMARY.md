---
phase: 23-wave-1-navega-o-e-cache
plan: "02"
subsystem: supabase/cache
tags: [perf, caching, react-cache, force-dynamic]
dependency_graph:
  requires: []
  provides: [deduplicated-resolveSession, deduplicated-createClient, vault-caching-enabled]
  affects: [src/lib/supabase/session.ts, src/lib/supabase/server.ts, src/app/(vault)/layout.tsx]
tech_stack:
  added: [React.cache()]
  patterns: [request-scoped memoization via React.cache()]
key_files:
  created: []
  modified:
    - src/app/(vault)/layout.tsx
    - src/app/(vault)/patients/archive/page.tsx
    - src/lib/supabase/server.ts
    - src/lib/supabase/session.ts
decisions:
  - "React.cache() from 'react' (not 'react/cache') — request-scoped, safe for auth data"
  - "force-dynamic removed from layout root — cookies() in resolveSession guarantees dynamic rendering per page"
metrics:
  duration: ~5min
  completed: 2026-04-22
  tasks_completed: 4
  files_modified: 4
---

# Phase 23 Plan 02: Remove force-dynamic + React.cache() for resolveSession/createClient

**One-liner:** Removed `force-dynamic` from vault root layout and wrapped `resolveSession`/`createClient` with `React.cache()` to deduplicate Supabase/DB calls per render tree.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Remove force-dynamic from vault layout + patients/archive | ee7247e | layout.tsx, archive/page.tsx |
| 2 | Wrap createClient with React.cache() | ee7247e | server.ts |
| 3 | Wrap resolveSession with React.cache() | ee7247e | session.ts |
| 4 | Verify test suite (407 passing) | — | — |

## Changes Made

### src/app/(vault)/layout.tsx
- Removed `export const dynamic = "force-dynamic"` (line 9)

### src/app/(vault)/patients/archive/page.tsx  
- Removed `export const dynamic = "force-dynamic"` (line 8)

### src/lib/supabase/server.ts
- Added `import { cache } from 'react'`
- Converted `export async function createClient()` → `export const createClient = cache(async () => {...})`

### src/lib/supabase/session.ts
- Added `import { cache } from 'react'`
- Converted `export async function resolveSession()` → `export const resolveSession = cache(async (): Promise<ResolvedSession> => {...})`
- Closed the `cache()` wrapper at end of function body

## Verification

- ✅ `grep "force-dynamic" src/app/(vault)/layout.tsx` → empty
- ✅ `grep "force-dynamic" src/app/(vault)/patients/archive/page.tsx` → empty
- ✅ `grep "import.*cache.*from 'react'" src/lib/supabase/server.ts` → present
- ✅ `grep "export const createClient = cache(" src/lib/supabase/server.ts` → present
- ✅ `grep "import.*cache.*from 'react'" src/lib/supabase/session.ts` → present
- ✅ `grep "export const resolveSession = cache(" src/lib/supabase/session.ts` → present
- ✅ `pnpm test` → 407 passed, 0 failed

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All 4 modified files verified. Commit ee7247e exists with all changes. 407 tests passing.
