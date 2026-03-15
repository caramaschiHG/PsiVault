# Phase 8: Authentication & Workspaces - Research

## Standard Stack
*   **Authentication Provider:** Supabase Auth
*   **Next.js Integration:** `@supabase/ssr` for cookie-based session management across App Router (Middleware, Server Components, Route Handlers, Server Actions).
*   **Persistence:** `@prisma/client` for the business data (`Account`, `Workspace`).

## Architecture Patterns

*   **Auth mapping:**
    Supabase manages `auth.users`. When a user signs up, Supabase handles the password hashing and session tokens. Our app only needs to maintain the application-level profile (`Account`) and the tenant boundary (`Workspace`). The `id` from `auth.users` serves as the primary key for the `Account` table.

*   **Middleware Session Refresh:**
    In Next.js App Router, the middleware must create a Supabase client using `@supabase/ssr`'s `createServerClient`, which allows intercepting and refreshing the auth cookie. The refreshed cookie is then passed along in the `NextResponse`.

*   **Server Actions for Auth:**
    Forms for Sign In and Sign Up will submit `FormData` to Server Actions. These Server Actions will instantiate the Supabase server client and call `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()`. 
    
    *Important constraint:* Next.js Server Actions cannot set cookies directly via `@supabase/ssr` *unless* configured properly with the `cookies()` API.

*   **Database Schema Pruning:**
    With Supabase Auth, we no longer need application-level `Session`, `VerificationToken`, or `PasswordResetToken` tables, nor do we need `passwordHash` in the `Account` table. These should be removed from `prisma/schema.prisma`.

## Don't Hand-Roll
*   **Session Management:** Do not manually parse JWTs or build custom session cookies. Rely entirely on `@supabase/ssr`.
*   **Password Hashing:** Remove `passwordHash` from `Account`. Do not hash passwords manually.
*   **Verification Flows:** Supabase sends the verification emails and handles the token exchange. Do not roll custom `VerificationToken` tables.

## Common Pitfalls
1.  **Middleware Cookie Refresh Issue:** Failing to correctly pass the updated cookie from the Supabase client back to the `NextResponse` in `middleware.ts`. This causes sessions to randomly expire or become out-of-sync.
2.  **Server Components Cookie Access:** Trying to set cookies in a Server Component. Only Server Actions, Route Handlers, and Middleware can set cookies.
3.  **Dangling Accounts:** A user signs up in Supabase Auth but the Prisma `Account` or `Workspace` creation fails. Mitigation: create the `Account` and `Workspace` inside the signup Server Action immediately after a successful Supabase signup, or use a Supabase Database Webhook (Trigger) (though for v1.1, a Server Action approach is simpler and avoids relying on direct DB trigger management since we don't use Supabase's SQL editor for migrations).

## Code Examples

### 1. Supabase Server Client (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
```

### 2. Sign In Server Action

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/setup')
}
```
