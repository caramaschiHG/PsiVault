# Phase 7: Infrastructure Foundation - Context & Decisions

## Execution Goal
Establish the production database and ORM layer connected to Supabase for v1.1. This phase sets up the database, Prisma schema, and connection infrastructure necessary for all subsequent phases to migrate from in-memory repositories to persistent storage.

## Implementation Decisions

### 1. Connection Pooling & Environment (Supavisor)
- **Supavisor Mode**: The `DATABASE_URL` will point to the Supavisor Transaction Pool (port 6543) and must include the `?pgbouncer=true` flag. This is required to prevent connection exhaustion from Next.js serverless functions.
- **Migration URL**: A `DIRECT_URL` environment variable (pointing directly to port 5432) will be required. Prisma's migration tools (`npx prisma migrate dev`, `npx prisma db push`) must use this direct connection since migrations cannot run over a transaction pool.
- **Client Singleton**: Development environments will continue using the global singleton pattern (`globalThis.__psivaultPrisma__` in `src/lib/db.ts`) to instantiate the Prisma client, preventing hot-reloading connection leaks.

### 2. Prisma Schema Conventions (IDs & Mapping)
- **ID Generation**: The schema will use native Postgres UUIDs (`@default(uuid())`) for Primary Keys across all models, transitioning away from the current CUID pattern.
- **Column Naming (Snake Case Mapping)**: TypeScript code will continue to use `camelCase` for model properties, but the database schema will use Postgres-idiomatic `snake_case`. This requires using Prisma's `@map("snake_case")` on all fields.
- **Table Naming**: Models will be mapped to `snake_case` plural table names in the database using the `@@map("table_names")` block attribute (e.g., model `Patient` becomes `@@map("patients")`).
- **Soft Deletes**: Standardize on Application Layer soft deletes. Models that require logical deletion (which affects auditing/history) will implement an optional `deleted_at` DateTime column (mapped from `deletedAt` in Prisma), generalizing the `archivedAt` pattern currently seen in the `Patient` model.

## Code Context

- **Prisma Schema**: `prisma/schema.prisma` is currently partially defined (with models like Account, Workspace, Session, PracticeProfile, Patient, Appointment) using camelCase and CUIDs. These will need to be refactored to match the UUID and snake_case mapping decisions.
- **DB Client**: `src/lib/db.ts` already correctly implements the `globalThis` singleton pattern. It will need to be verified against the new `DIRECT_URL` configuration in `schema.prisma`.
- **Environment**: `.env` and `.env.example` will need to be updated to require `DATABASE_URL` and `DIRECT_URL`.