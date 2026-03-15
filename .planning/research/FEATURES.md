# Features Research

## Question
How do the target features (Supabase migration) typically work and what is the expected behavior?

## Findings

**Table Stakes:**
- Relational Database: PostgreSQL via Supabase will store all domain data (patients, appointments, notes, etc.).
- Authentication: User login/signup, session management, and password recovery via Supabase Auth.
- Connection Pooling: Serverless environments (Next.js) require connection pooling (Supavisor) to prevent DB connection exhaustion.

**Differentiators:**
- Row Level Security (RLS): Supabase offers RLS, but since we are using Prisma from a secure server environment, we will likely bypass RLS using the service role or enforce tenancy manually via Prisma `workspaceId` filters.
- Storage: Supabase Storage can be used for documents later, but for this milestone, we just need the relational DB.

**Complexity:**
- Data Migration: If there is any existing data, but since it was in-memory, we start with a clean state. The complexity lies in mapping our domain models perfectly to Prisma schema without losing the current constraints.

## Conclusion
The feature is a foundational backend swap. The primary user-facing change should be real authentication and the fact that data survives a server restart.