---
phase: 43-arquitetura-multi-agent-foundation
plan: 01
subsystem: agents
tags: [prisma, domain-model, repository-pattern, database]
dependency_graph:
  requires: []
  provides: [43-02, 43-03]
  affects: [prisma/schema.prisma, src/lib/agents/*]
tech-stack:
  added: []
  patterns: [repository-pattern, singleton-store, factory-with-deps]
key-files:
  created:
    - src/lib/agents/model.ts
    - src/lib/agents/config-model.ts
    - src/lib/agents/repository.ts
    - src/lib/agents/repository.prisma.ts
    - src/lib/agents/store.ts
  modified:
    - prisma/schema.prisma
decisions:
  - "String fields for status/priority/intensity instead of enums to avoid migration friction"
  - "listPendingAcrossWorkspaces added to repository for cron endpoint cross-workspace scanning"
metrics:
  duration: "~15 min"
  completed_date: "2026-04-27"
---

# Phase 43 Plan 01: Database & Domain Foundation Summary

**One-liner:** Prisma schema extended with AgentTask and WorkspaceAgentConfig tables, domain models with factories, and full repository pattern with in-memory test variants.

## What Was Built

- **AgentTask model** in Prisma with workspace scoping, priority, status lifecycle, retry count, idempotency key, and composite indexes for pending-task queries.
- **WorkspaceAgentConfig model** with enabled/intensity/settings and a composite unique key on `[workspaceId, agentId]`.
- **Domain models** (`model.ts`, `config-model.ts`) with factories accepting injected `now` and `createId` for testability.
- **Repository interfaces and Prisma implementations** with proper domain mapping and singleton stores via `globalThis`.
- **In-memory repository variants** for unit testing.

## Deviations from Plan

### Blocker

**Database push failed (P1000: Authentication failed)**
- **Found during:** Task 4
- **Issue:** `npx prisma db push --accept-data-loss` failed because database credentials in `DATABASE_URL`/`DIRECT_URL` are invalid or missing.
- **Impact:** Tables `agent_tasks` and `workspace_agent_configs` do not exist in the live database.
- **Mitigation:** Prisma client was successfully regenerated (`npx prisma generate`), so TypeScript types and compile-time checks pass. Runtime queries will fail until valid DB credentials are provided and `prisma db push` is re-run.
- **Action required:** User must provide valid database credentials and run `npx prisma db push --accept-data-loss`.

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added `listPendingAcrossWorkspaces` to repository**
- **Found during:** Task 3 (while reviewing Plan 43-03 requirements)
- **Issue:** The cron endpoint in Plan 43-03 needs to fetch pending tasks across all workspaces, but the repository only had workspace-scoped `listPendingByPriority`.
- **Fix:** Added `listPendingAcrossWorkspaces(now, limit)` to both the interface and both implementations (Prisma + in-memory).
- **Files modified:** `src/lib/agents/repository.ts`, `src/lib/agents/repository.prisma.ts`

## Known Stubs

None — all factories and repositories are fully wired.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: information_disclosure | prisma/schema.prisma | AgentTask.payload is JSON — must not contain PII or clinical notes. Enforced by caller discipline (appointment actions only pass IDs and timestamps). |

## Self-Check: PASSED

- [x] prisma/schema.prisma contains both models with correct fields and indexes
- [x] Domain model files compile without TypeScript errors
- [x] Repository files compile without TypeScript errors
- [x] Singleton stores use correct globalThis variable names
- [x] All 10 commits in this plan verified in git log

## Commits

- `37f957b`: feat(43-01): extend Prisma schema with AgentTask and WorkspaceAgentConfig
- `4bda07e`: feat(43-01): create agent domain models with factories
- `459b53d`: feat(43-01): implement repository pattern for agents
