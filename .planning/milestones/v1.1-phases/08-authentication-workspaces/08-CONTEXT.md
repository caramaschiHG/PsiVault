# Phase 8: Authentication & Workspaces - Context & Decisions

## Execution Goal
Replace the v1.0 in-memory/stub authentication with real Supabase Auth (via `@supabase/ssr`), and ensure users map correctly to their persistent `Workspace` and `Account` records in PostgreSQL using Prisma.

## Implementation Decisions

### 1. Supabase SSR Integration
- **Library**: Use `@supabase/ssr` to manage session cookies in Next.js Server Components, Server Actions, and Middleware.
- **Middleware**: The Next.js middleware (`src/middleware.ts`) will be updated to validate the Supabase session token. If the user is unauthenticated, they will be redirected to the sign-in page. The middleware must correctly refresh the session cookie if necessary.
- **Environment**: Require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Client utilities**: Create `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts` following official `@supabase/ssr` patterns.

### 2. Account & Workspace Provisioning
- **On Sign-up**: When a professional signs up via Supabase Auth, their `id` (UUID) from Supabase `auth.users` will be mapped to the `Account` model's `id`.
- **Workspace Creation**: Following sign-up, a corresponding `Account` row and a `Workspace` row must be created in the Prisma database. The user's `auth.users.id` becomes the `Account.id` and `Workspace.ownerAccountId`.
- **Transaction**: The provisioning of `Account` and `Workspace` should be done transactionally or safely handled post-signup (e.g. within a server action immediately after `supabase.auth.signUp()`).
- **MFA and Verification**: Keep the existing logical flows (email verification gate, MFA setup gate), but adapt them to read from the actual `Account` database record rather than the v1.0 stub session object. Supabase Auth handles email verification out-of-the-box (we can check `data.user?.email_confirmed_at`).

### 3. V1.0 Stub Replacement
- **src/lib/auth/session.ts**: The previous in-memory `createSession` and opaque token logic will be completely removed. It will be replaced by functions that read the Supabase session and fetch the associated Prisma `Account`/`Workspace`.
- **Sign-in / Sign-up Forms**: The UI forms in `src/app/(auth)` will be wired to Server Actions that invoke Supabase Auth.
- **Tests**: `tests/auth-session.test.ts` will need to be updated or mocked to test the new Prisma/Supabase integration.

## Code Context
- **Middleware**: Currently located at `src/middleware.ts` and uses a stub `enforceVaultAccess`.
- **Prisma Schema**: `prisma/schema.prisma` already defines `Account` and `Workspace`. The `Account` model has fields like `passwordHash`, `verificationTokens`, and `sessions` which may become obsolete now that Supabase Auth handles identities, passwords, and sessions natively. We need to refactor the `Account` schema slightly to rely on Supabase.
