# Research Summary: v1.1 Supabase Backend

## Stack Additions
- `@supabase/supabase-js` and `@supabase/ssr` for authentication and session management in Next.js App Router.
- `prisma` and `@prisma/client` for the ORM layer to interact with Supabase Postgres.

## Feature Table Stakes
- **Persistence:** Real PostgreSQL database replacing in-memory stores.
- **Authentication:** Supabase Auth for real login/signup flows, replacing the current stubs.
- **Connection Pooling:** Utilizing Supavisor (built into Supabase) to manage connections from Next.js serverless environment.

## Architectural Impact
- The existing Repository interfaces allow for a clean substitution. We will build `PrismaXRepository` classes to replace `InMemoryXRepository` instances.
- The `workspaceId` will map to the authenticated Supabase user's workspace.
- The application layer (Server Actions and React Server Components) remains largely untouched, proving the value of the v1.0 architecture.

## Watch Out For (Pitfalls)
- **Connection Exhaustion:** Must configure Prisma to use the connection pool URL (`DATABASE_URL`) and the direct URL for migrations (`DIRECT_URL`).
- **Auth Cookie Handling:** Next.js App Router has strict rules about where cookies can be set. Middleware must handle session refreshes using `@supabase/ssr`.
- **Tenancy Enforcement:** Since Prisma connects via a service role or direct connection, Row Level Security (RLS) is hard to use directly. We must strictly enforce `workspaceId` checks in every Prisma query at the application level.