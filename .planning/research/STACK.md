# Stack Research

## Question
What stack additions/changes are needed for integrating Supabase into the existing Next.js application?

## Findings

**Libraries / Dependencies:**
- `@supabase/supabase-js`: Required for authentication, potentially storage, and edge cases. 
- `@supabase/ssr`: Essential for handling Supabase Auth in Next.js 15 App Router (cookies, middleware).
- `prisma` and `@prisma/client`: Will be used as the ORM to interact with the Supabase PostgreSQL database. This allows us to keep the application code strongly typed.

**Removals:**
- The in-memory data structures and repository stubs will be phased out.

**Integration points:**
- Middleware: Swap the current v1.0 auth stub for `@supabase/ssr` session checking.
- Repositories: Existing `*Repository` interfaces will be implemented by new `Prisma*Repository` classes.

## Conclusion
The stack changes are straightforward. The combination of Prisma + Supabase Postgres + Next.js App Router is a well-paved road. We must use `@supabase/ssr` to handle the cookie-based auth flow correctly.