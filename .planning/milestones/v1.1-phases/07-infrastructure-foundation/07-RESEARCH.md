# Phase 7: Infrastructure Foundation - Research

## Standard Stack

*   **Database:** Supabase (managed PostgreSQL 15+).
*   **Connection Pooler:** Supavisor (Supabase's built-in, scalable pooler designed for serverless environments).
*   **ORM CLI:** `prisma` (handles migrations and schema definition).
*   **ORM Runtime:** `@prisma/client` (provides the typed query builder).

## Architecture Patterns

*   **Dual Connection Strategy:**
    *   `DATABASE_URL`: Points to the Supavisor pooler on port `6543` using transaction mode. Appended with `?pgbouncer=true` so Prisma knows it's communicating through a pooler. Used for app runtime.
    *   `DIRECT_URL`: Points to the direct session connection on port `5432`. Used exclusively by Prisma's CLI (`migrate`, `db push`, `studio`) because migrations cannot run over a transaction pooler.
*   **Prisma Client Singleton:**
    *   In a Next.js serverless and development environment, Hot Module Replacement (HMR) constantly reloads files. A singleton pattern using `globalThis` prevents Next.js from creating a new Prisma Client instance on every reload, which would quickly exhaust database connections.
*   **Schema Mapping (Snake Case):**
    *   TypeScript models use idiomatic `camelCase` (e.g., `createdAt`), but the underlying PostgreSQL schema uses idiomatic `snake_case` (e.g., `created_at`). This is enforced via Prisma's `@map` (for columns) and `@@map` (for tables) attributes.
*   **Primary Keys:**
    *   Native PostgreSQL UUIDs (`@default(uuid())`) are used instead of CUIDs or auto-incrementing integers for distributed system compatibility and unguessable keys.
*   **Soft Deletes:**
    *   Logical deletion is handled at the application layer via an optional `deleted_at` timestamp.

## Don't Hand-Roll

*   **Connection Pooling:** Do not attempt to manage connection lifecycles manually or set up PgBouncer yourself. Rely on Supabase's managed Supavisor pooler.
*   **Migration Scripts:** Do not write manual SQL `ALTER TABLE` statements. Always define the state in `schema.prisma` and use `npx prisma migrate dev` to generate and apply migrations safely.
*   **TypeScript Types for DB Entities:** Do not write manual interfaces for your database models. Rely entirely on the auto-generated types from `@prisma/client`.

## Common Pitfalls

1.  **Migrating via the Pooler:** Attempting to run `npx prisma migrate dev` using the transaction pool URL will fail with prepared statement or transaction state errors. 
    *   *Verification:* Ensure `directUrl = env("DIRECT_URL")` is defined in the `datasource` block of `schema.prisma`.
2.  **Missing `?pgbouncer=true`:** Forgetting to append `?pgbouncer=true` to the `DATABASE_URL` when connecting through Supavisor. Prisma requires this flag to disable prepared statements and operate correctly over transaction-mode poolers.
3.  **Dev Server Connection Exhaustion:** Forgetting the `globalThis` singleton pattern in `src/lib/db.ts`. The Next.js dev server will rapidly exhaust the database connection limit upon saving files.
4.  **Inconsistent Naming:** Forgetting to use `@@map` for table names or `@map` for column names, leading to a mix of camelCase and snake_case in the Postgres database, which breaks conventions.

## Code Examples

### 1. Environment Configuration (`.env`)

```env
# Connect to Supabase via connection pooling (Supavisor) with transaction mode (port 6543)
# Note: ?pgbouncer=true is strictly required for Prisma with Supavisor.
DATABASE_URL="postgres://[db-user].[project-ref]:[db-password]@aws-0-sa-east-1.pooler.supabase.com:6543/[db-name]?pgbouncer=true"

# Direct connection to the database for migrations (port 5432)
DIRECT_URL="postgres://[db-user].[project-ref]:[db-password]@aws-0-sa-east-1.pooler.supabase.com:5432/[db-name]"
```

### 2. Prisma Client Singleton (`src/lib/db.ts`)

```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // Prevent multiple instances of Prisma Client in development
  var __psivaultPrisma__: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.__psivaultPrisma__ ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.__psivaultPrisma__ = prisma
}
```

### 3. Schema Definition & Mapping (`prisma/schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Patient {
  id        String    @id @default(uuid())
  name      String
  
  // Maps camelCase in TS to snake_case in Postgres
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Maps the model name to a plural, snake_case table name
  @@map("patients")
}
```