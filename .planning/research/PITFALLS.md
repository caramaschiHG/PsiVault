# Pitfalls Research

## Question
What are the common mistakes when adding Supabase and Prisma to an existing Next.js app in this domain?

## Findings

**Warning Signs & Pitfalls:**
1. **Connection Exhaustion:** Next.js serverless functions can spawn many DB connections. 
   - *Prevention:* Must use the Supabase connection pooling URL (Transaction mode, port 6543 usually) in Prisma's `DATABASE_URL`, and the direct URL for migrations (`DIRECT_URL`).
2. **RLS vs Prisma:** Prisma uses a single database connection and doesn't easily pass the user context to Postgres for RLS without advanced setup (client extensions). 
   - *Prevention:* Since the app uses server actions and a single-workspace model, we will rely on application-level multi-tenancy (filtering by `workspaceId` in Prisma queries) rather than Postgres RLS for now.
3. **Auth Cookie Desync:** In Next.js App Router, modifying cookies in Server Components is not allowed. 
   - *Prevention:* Use `@supabase/ssr` carefully in the `middleware.ts` to refresh sessions, and only read sessions in Server Components.

## Conclusion
The biggest risks are connection limits and auth cookie handling. Strict adherence to `@supabase/ssr` documentation and Prisma connection pooling guidelines will mitigate these.