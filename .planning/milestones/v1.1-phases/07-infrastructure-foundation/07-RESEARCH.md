# Phase 7: Infrastructure Foundation - Research

**Researched:** 2026-03-18
**Domain:** Prisma 6 + Supabase PostgreSQL + Supavisor connection pooling
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Connection Pooling & Environment (Supavisor)**
- `DATABASE_URL` points to the Supavisor Transaction Pool (port 6543) with `?pgbouncer=true` flag. Required to prevent connection exhaustion from Next.js serverless functions.
- `DIRECT_URL` environment variable pointing directly to port 5432. Prisma migration CLI (`migrate dev`, `db push`) must use this direct connection since migrations cannot run over a transaction pool.
- Development uses globalThis singleton (`globalThis.__psivaultPrisma__` in `src/lib/db.ts`) to prevent hot-reloading connection leaks.

**Prisma Schema Conventions (IDs & Mapping)**
- IDs: native Postgres UUIDs (`@default(uuid())`) across all models, not CUIDs.
- TypeScript uses `camelCase` properties; database uses `snake_case`. Enforced with Prisma `@map("snake_case")` on all fields.
- Table names mapped to `snake_case` plural via `@@map("table_names")`.
- Soft deletes: optional `deletedAt DateTime?` column mapped to `deleted_at` (generalizing the old `archivedAt` pattern).

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
- Row Level Security (RLS) — V1 enforces tenancy via server actions and `workspaceId` queries; Prisma service-role is sufficient.
- Existing data migration — v1.0 MVP used in-memory stores, no production data to migrate.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Setup Supabase project and environment variables | `.env.example` template with `DATABASE_URL`, `DIRECT_URL`, Supabase Auth keys; Supabase dashboard provisioning steps |
| INFRA-02 | Define Prisma schema mirroring all existing domain models | Schema already fully defined in `prisma/schema.prisma` with all models, UUID PKs, snake_case mapping, and soft-delete fields |
| INFRA-03 | Configure Prisma connection pooling (Supavisor) for Next.js serverless | `datasource db` block with `url`/`directUrl`, `?pgbouncer=true` flag, globalThis singleton in `src/lib/db.ts` |
</phase_requirements>

## Summary

Phase 7 establishes the production database foundation for the v1.1 Supabase backend migration. The work is entirely infrastructure: provisioning a Supabase project, configuring dual database connection strings (pooled for runtime, direct for migrations), aligning the Prisma schema to PostgreSQL idioms (UUID PKs, snake_case mapping), and verifying the Prisma client singleton prevents connection exhaustion during Next.js development.

The schema in `prisma/schema.prisma` is already fully defined with all domain models (Account, Workspace, MfaEnrollment, PracticeProfile, SignatureAsset, Patient, Appointment, ClinicalNote, PracticeDocument, SessionCharge, AuditEvent, Reminder). The `src/lib/db.ts` client singleton already implements the correct globalThis pattern. The `.env.example` file already documents the required variables. The primary work of Phase 7 is therefore: provisioning the live Supabase project, setting real credential values in `.env`, and running the first migration to apply the schema.

**Primary recommendation:** Provision Supabase project via dashboard, copy connection strings into `.env`, run `npx prisma migrate dev --name init` using `DIRECT_URL`, and verify with a connection smoke test.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `prisma` | 6.x | Schema definition, migration CLI, code generation | Industry standard ORM for TypeScript/PostgreSQL with full type safety |
| `@prisma/client` | 6.x (generated) | Runtime query builder | Auto-generated from schema — zero manual type maintenance |
| Supabase | managed | PostgreSQL 15 host + Supavisor connection pooler | Provides managed DB, Auth, and serverless-safe pooling in one service |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `prisma format` | CLI | Normalize schema formatting | Before every commit of `schema.prisma` |
| `prisma validate` | CLI | Verify schema correctness without DB | CI check before migrations |
| `prisma migrate dev` | CLI (via DIRECT_URL) | Generate and apply migration SQL | Local development schema changes |
| `prisma migrate deploy` | CLI (via DIRECT_URL) | Apply pending migrations in production | `postinstall` script in `package.json` |

**Installation:** Already installed. `package.json` confirms `prisma generate` runs on `postinstall` and `migrate deploy` runs automatically.

## Architecture Patterns

### Recommended Project Structure
```
prisma/
├── schema.prisma          # Single source of truth for all models
├── migrations/            # Auto-generated migration SQL history
│   └── YYYYMMDDHHMMSS_init/
│       └── migration.sql
src/lib/
└── db.ts                  # Prisma client singleton (globalThis pattern)
.env                       # Real credentials (gitignored)
.env.example               # Template committed to repo
```

### Pattern 1: Dual URL Strategy
**What:** Two separate connection strings — one for runtime (pooled), one for migrations (direct).
**When to use:** Always. This is non-negotiable for Supabase + Prisma.

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Supavisor port 6543, ?pgbouncer=true
  directUrl = env("DIRECT_URL")     // Direct port 5432, no pooler
}
```

```env
# Runtime (app queries) — Supavisor transaction pool
DATABASE_URL="postgres://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migrations only — direct connection
DIRECT_URL="postgres://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### Pattern 2: Prisma Client Singleton (globalThis)
**What:** Single PrismaClient instance shared across hot reloads in Next.js dev.
**When to use:** Always in Next.js projects.

```typescript
// src/lib/db.ts — current implementation (already correct)
import { PrismaClient } from "@prisma/client";

declare global {
  var __psivaultPrisma__: PrismaClient | undefined;
}

export const db =
  globalThis.__psivaultPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__psivaultPrisma__ = db;
}
```

### Pattern 3: Snake Case Mapping
**What:** TypeScript property names remain camelCase; Prisma maps them to snake_case in Postgres.
**When to use:** On every field and every model table name.

```prisma
model Patient {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  fullName    String    @map("full_name")
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([workspaceId, deletedAt])
  @@map("patients")
}
```

### Anti-Patterns to Avoid
- **Running migrations via pooler:** `npx prisma migrate dev` must use `DIRECT_URL` (configured in schema via `directUrl`). Never point `DATABASE_URL` at port 5432 for migrations.
- **New PrismaClient() on every request:** Without the globalThis singleton, each Next.js HMR reload creates a new client, exhausting connection limits within minutes.
- **Hardcoded `@default(cuid())`:** Schema uses `@default(uuid())` throughout — don't mix ID generation strategies.
- **camelCase table/column names in DB:** Always use `@map` and `@@map`. PostgreSQL convention is snake_case.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Connection pooling | Custom PgBouncer setup, connection manager | Supavisor (built into Supabase) | Supavisor handles transaction mode, session mode, prepared statements correctly for serverless |
| Migration SQL | Manual `ALTER TABLE` statements | `npx prisma migrate dev` | Prisma tracks migration history, generates reversible SQL, handles conflicts |
| TypeScript types for DB rows | Manual `interface Patient { ... }` | `@prisma/client` generated types | Auto-generated from schema — always in sync, zero maintenance |
| UUID generation | `crypto.randomUUID()` in app code for IDs | `@default(uuid())` in schema | DB-generated IDs are atomic and consistent across concurrent inserts |

**Key insight:** Supabase + Prisma's managed tooling eliminates the entire class of connection lifecycle and schema drift bugs. The only custom code needed is the singleton pattern and the dual-URL configuration.

## Common Pitfalls

### Pitfall 1: Missing `?pgbouncer=true`
**What goes wrong:** Prisma uses named prepared statements by default. Supavisor in transaction mode cannot route prepared statements to the same backend connection, causing errors like `prepared statement "s0" already exists`.
**Why it happens:** Prisma's default configuration assumes persistent session-level connections.
**How to avoid:** Append `?pgbouncer=true` to `DATABASE_URL`. The schema already has `directUrl` for migrations.
**Warning signs:** Intermittent errors on concurrent requests; errors disappear on serial requests.

### Pitfall 2: Migrating Over the Pooler
**What goes wrong:** `npx prisma migrate dev` fails with transaction state errors or connection reset errors.
**Why it happens:** DDL migration transactions require a persistent direct connection, not a pooled one.
**How to avoid:** Prisma automatically uses `directUrl` for all CLI migration commands when it's defined in the datasource block.
**Warning signs:** `migrate dev` fails immediately; `prisma validate` passes but `migrate deploy` errors.

### Pitfall 3: HMR Connection Exhaustion
**What goes wrong:** Supabase free tier exhausts its 10–20 concurrent connection limit within seconds of running `pnpm dev`.
**Why it happens:** Each file save triggers HMR, creating a new module scope and a new `new PrismaClient()`.
**How to avoid:** The `globalThis.__psivaultPrisma__` singleton in `src/lib/db.ts` is already correctly implemented.
**Warning signs:** `too many connections` errors appearing in dev; works fine on first start, fails after several saves.

### Pitfall 4: Inconsistent Column Naming
**What goes wrong:** Some columns in Postgres end up as `camelCase` (e.g., `workspaceId`) while others are `snake_case`.
**Why it happens:** Forgetting `@map` on new fields.
**How to avoid:** Run `npx prisma format` after every schema change. The formatter does not add missing `@map` but at minimum keeps formatting consistent for review.
**Warning signs:** `prisma studio` shows mixed naming; `psql \d table_name` reveals camelCase columns.

## Code Examples

### Connection String Format (Supabase Supavisor)
```env
# Source: Supabase Dashboard > Settings > Database > Connection string
# Transaction pooler (port 6543) — for runtime queries
DATABASE_URL="postgres://postgres.[project-ref]:[db-password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (port 5432) — for prisma migrate
DIRECT_URL="postgres://postgres.[project-ref]:[db-password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### First Migration Command Sequence
```bash
# 1. Validate schema before touching DB
npx prisma validate

# 2. Generate initial migration SQL (uses DIRECT_URL automatically)
npx prisma migrate dev --name init

# 3. Verify Prisma client is regenerated
npx prisma generate

# 4. Smoke test connection (optional Node script)
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => { console.log('OK'); p.\$disconnect(); }).catch(console.error);"
```

### Workspace-Scoped Query Pattern (already in codebase)
```typescript
// src/lib/db.ts — buildOwnedWorkspaceSelector
export function buildOwnedWorkspaceSelector(accountId: string, workspaceId: string) {
  return {
    id_ownerAccountId: {
      id: workspaceId,
      ownerAccountId: accountId,
    },
  } as const;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PgBouncer self-hosted | Supavisor (managed, built into Supabase) | Supabase 2023 | Zero-config pooling; no separate infrastructure |
| `@default(cuid())` | `@default(uuid())` | Project decision | Native Postgres UUIDs; no cuid2 dependency |
| `archivedAt` field on Patient | `deletedAt` on all models | Phase 7 scope | Consistent soft-delete contract across all domains |
| Separate `DATABASE_URL` only | Dual `DATABASE_URL` + `DIRECT_URL` | Prisma 3+ best practice | Required for pooled deployments; eliminates migration failures |

**Deprecated/outdated in this project:**
- `@default(cuid())`: replaced by `@default(uuid())` per CONTEXT.md decision.
- `archivedAt`/`archivedByAccountId` on Patient: replaced by `deletedAt`/`deletedByAccountId` (migration done in Phase 7 execution per SUMMARY.md).

## Open Questions

1. **Supabase project not yet provisioned**
   - What we know: `.env.example` has placeholder values; SUMMARY confirms the migration SQL was "created manually" because `DIRECT_URL` was a placeholder at execution time.
   - What's unclear: Whether a live Supabase project has been provisioned and `DIRECT_URL` has been filled in.
   - Recommendation: The plan must include a task to provision the project and populate `.env` before any migration commands.

2. **Migration history state**
   - What we know: SUMMARY says "Migration SQL created manually" due to placeholder DIRECT_URL.
   - What's unclear: Whether `prisma/migrations/` folder exists with a committed initial migration, or if the migration needs to be generated fresh.
   - Recommendation: The plan should check for `prisma/migrations/` existence and conditionally run `prisma migrate dev --name init` or `prisma migrate deploy`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Supabase project provisioned, `.env` variables set | manual | N/A — environment setup, not testable in unit tests | N/A |
| INFRA-02 | Prisma schema valid and migrated | smoke | `npx prisma validate && npx prisma migrate dev --name init` | ✅ schema.prisma exists |
| INFRA-03 | Prisma client connects via Supavisor without connection exhaustion | smoke | `node -e "..."` connection test script | ❌ Wave 0 — no automated test file |

### Sampling Rate
- **Per task commit:** `npx prisma validate`
- **Per wave merge:** `pnpm test` (full suite — verifies domain models still pass in-memory tests)
- **Phase gate:** `npx prisma validate` + successful `prisma migrate deploy` + connection smoke test

### Wave 0 Gaps
- [ ] `tests/infra-connection.test.ts` — smoke test that `db.$connect()` succeeds (INFRA-03); only runnable with real `.env` credentials, mark as `it.skip` until credentials available

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` — full schema already defined with UUID PKs, snake_case mapping, all domain models
- `src/lib/db.ts` — singleton implementation confirmed correct
- `.env.example` — dual-URL template confirmed present and correct
- `.planning/milestones/v1.1-phases/07-infrastructure-foundation/07-CONTEXT.md` — locked architectural decisions
- `.planning/milestones/v1.1-phases/07-infrastructure-foundation/07-01-SUMMARY.md` — confirmed execution results

### Secondary (MEDIUM confidence)
- Supabase docs (via previous research): Supavisor transaction mode port 6543, `?pgbouncer=true` requirement, direct connection port 5432 for migrations
- Prisma docs: `directUrl` in datasource block is the canonical solution for pooled deployments

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — schema.prisma, db.ts, and .env.example are all present and correct; decisions confirmed in CONTEXT.md and SUMMARY.md
- Architecture: HIGH — dual-URL pattern and singleton are already implemented; verified against SUMMARY execution
- Pitfalls: HIGH — all pitfalls are well-documented standard Prisma+Supabase known issues, confirmed by existing implementation choices

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable infrastructure pattern; Prisma 6 and Supavisor APIs are stable)
