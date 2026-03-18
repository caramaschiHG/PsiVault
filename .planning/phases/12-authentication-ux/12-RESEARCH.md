# Phase 12: Authentication UX - Research

**Researched:** 2026-03-18
**Domain:** Supabase Auth + Next.js 15 Server Actions + React `useFormStatus`
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Exibição de Erros**
- Erros aparecem inline no form: bloco de alerta abaixo do botão de submit, dentro do card
- Mapa de tradução fixo (`AUTH_ERRORS: Record<string, string>`) mapeia mensagens Supabase para pt-BR; erros não mapeados recebem mensagem genérica
- Erro persiste até novo envio — não some ao editar campos (sem estado cliente extra)
- Erros por campo também: server action pode retornar `{ field: 'email' | 'password', message: string }` via searchParams (`?field=password&error=...`); campos exibem mensagem abaixo do input quando `field` está presente
- Padrão de query param (`?error=` e `?field=`) já estabelecido na fase 8 — manter consistência

**Fluxo de Reset de Senha**
- Uma única rota `/reset-password` para os dois estados:
  - Sem token na URL → estado "solicitar e-mail"
  - Com token na URL (Supabase callback) → estado "nova senha" (dois campos: nova senha + confirmar senha)
- Link "Esqueceu a senha?" no sign-in aponta para `/reset-password`
- Após atualizar senha com sucesso → redirecionar para `/sign-in` com `?success=Senha atualizada. Faça login com a nova senha.`
- Nova senha: dois campos (nova senha + confirmar senha)
- Se token expirado ou já utilizado → mensagem "Este link expirou ou já foi utilizado." com link para `/reset-password`

**Loading / Estados de Envio**
- Botão de submit: spinner SVG animado durante pending (substituir texto)
- Botão extraído como `<SubmitButton>` com `"use client"` + `useFormStatus` — restante da página fica server component
- Todos os campos desabilitados durante pending (inputs + botão) para evitar duplo envio
- Spinner: SVG animado (circle com animateTransform), inline, sem dependências externas

**Redirect de Autenticado (AUTHUX-05)**
- Implementado no middleware (`src/middleware.ts`) — já usa `@supabase/ssr`, sem impacto nos componentes de página
- Regra: se sessão existe E rota é (auth) → redirecionar para `/mfa-setup` (MFA obrigatório) ou `/inicio` se MFA já completo
- Cobre: `/sign-in`, `/sign-up`, `/verify-email`, `/reset-password`
- Usuário autenticado sem MFA → `/mfa-setup`; com MFA completo → `/inicio`

### Claude's Discretion
- Exato design visual do bloco de erro (cor, ícone, border)
- Implementação interna da detecção de token Supabase no `/reset-password` (searchParams vs cookie)
- Texto exato das mensagens de sucesso/confirmação
- CSS keyframe do spinner SVG

### Deferred Ideas (OUT OF SCOPE)
- Nenhuma ideia fora do escopo surgiu — discussão ficou dentro dos limites da Phase 12
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTHUX-01 | Implement a professional sign-in page (email/password) with proper form validation and error messages | `signIn` action already exists; needs `?error=`/`?field=` display, "Esqueceu a senha?" link, and `<SubmitButton>` |
| AUTHUX-02 | Implement a sign-up page with user-friendly onboarding flow using Supabase Auth | `signUp` action already exists; needs `?error=`/`?field=` display and `<SubmitButton>` |
| AUTHUX-03 | Implement a password reset flow (request reset email + update password page) | Requires two new server actions (`requestPasswordReset`, `updatePassword`); single `/reset-password` page with dual state |
| AUTHUX-04 | Handle Supabase Auth errors gracefully with user-facing Portuguese messages | Centralized `AUTH_ERRORS` map in `src/app/(auth)/auth-errors.ts`; pattern already used in actions.ts |
| AUTHUX-05 | Protect auth pages from authenticated users (redirect logged-in users away from login/signup) | Middleware already imports `updateSession` from `src/lib/supabase/middleware.ts`; needs session check + redirect for (auth) routes |
</phase_requirements>

---

## Summary

Phase 12 is a UX hardening pass on top of working (but bare-bones) Supabase Auth pages. The core auth logic — `signIn`, `signUp`, and the session refresh middleware — is already implemented. What is missing is: (1) error surfacing from query params to the UI, (2) the `requestPasswordReset` / `updatePassword` server actions and their dual-state page, (3) a `<SubmitButton>` client component with pending state, and (4) middleware logic to redirect already-authenticated users away from auth routes.

The existing middleware (`src/middleware.ts`) currently passes `session: null` and `account: null` to `decideVaultAccess`, meaning it cannot redirect authenticated users yet. The `updateSession` helper in `src/lib/supabase/middleware.ts` already calls `supabase.auth.getUser()` and returns a Supabase client — the middleware just needs to be wired to call it and use the result for auth-route protection.

The `reset-password` page is today a non-functional stub. Supabase's password reset flow delivers the token as a URL fragment (`#access_token=...&type=recovery`) that Next.js server components cannot read directly — detection must happen client-side (via `supabase.auth.onAuthStateChange` or reading `window.location.hash`) OR via the `PKCE` flow where Supabase converts the fragment to a `code` query param. The PKCE flow (`flowType: 'pkce'` in the Supabase client config) is the server-friendly approach and should be verified against the existing client config.

**Primary recommendation:** Wire the middleware to call `updateSession`, detect authenticated users on auth routes and redirect them; add `AUTH_ERRORS` map; add `<SubmitButton>`; implement reset-password dual-state page with PKCE code detection.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | already installed | Server-side auth, cookie session management | Already used in `src/lib/supabase/middleware.ts` and `server.ts` |
| `react` (useFormStatus) | React 19 | Form pending state | Built-in, no extra dep; pattern locked in CONTEXT.md |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/navigation` (redirect) | Next.js 15 | Server action redirects | Already used in `actions.ts` |
| `next/headers` (cookies) | Next.js 15 | Reading cookies in server components | Needed if verifying reset token server-side |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG `animateTransform` spinner | CSS border-trick spinner | CONTEXT.md explicitly requires SVG |
| PKCE code param detection | Fragment hash detection | Fragment not readable server-side; PKCE is the correct server-compatible approach |

**Installation:** No new packages needed — all dependencies already present.

---

## Architecture Patterns

### Recommended File Structure
```
src/app/(auth)/
├── actions.ts                        # Add requestPasswordReset, updatePassword
├── auth-errors.ts                    # NEW: AUTH_ERRORS map (pt-BR translations)
├── components/
│   └── submit-button.tsx             # NEW: "use client" + useFormStatus + SVG spinner
├── sign-in/page.tsx                  # Edit: add error display, field errors, "Esqueceu?" link
├── sign-up/page.tsx                  # Edit: add error display, field errors
└── reset-password/page.tsx           # Edit: dual-state (request vs update)
src/middleware.ts                     # Edit: wire updateSession + auth-route redirect
```

### Pattern 1: Error Display from Query Params (Server Component)

Pages are server components. They read `searchParams` and render errors without client state.

```typescript
// In page.tsx (server component)
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; field?: string; success?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : null;
  const errorField = params.field ?? null;
  // ...
}
```

**Note:** In Next.js 15, `searchParams` is a Promise — must be awaited. This is a breaking change from Next.js 14.

### Pattern 2: SubmitButton with useFormStatus

```typescript
// src/app/(auth)/components/submit-button.tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={buttonStyle}>
      {pending ? <SpinnerSVG /> : label}
    </button>
  );
}
```

Sibling inputs must also be disabled during pending. Since `useFormStatus` only works inside the `<form>`, inputs need a separate client wrapper OR use the `disabled` attribute with `aria-busy` pattern. The cleanest approach consistent with "rest of page stays server component" is to wrap the entire form body in a single `"use client"` form wrapper component.

**Alternative cleaner approach:** Extract a `<AuthForm>` client component that contains all form fields and the submit button — this keeps the outer page as a server component (for searchParams reading) while the form itself is fully interactive.

### Pattern 3: Dual-State Reset Password Page

```typescript
// Server component reads searchParams for `code` param (PKCE flow)
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const hasToken = Boolean(params.code);
  // Render request form or update form based on hasToken
}
```

For the update-password action, the `code` from searchParams must be exchanged for a session using `supabase.auth.exchangeCodeForSession(code)` before calling `supabase.auth.updateUser({ password })`.

### Pattern 4: Middleware Redirect for Auth Routes

```typescript
// src/middleware.ts
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = await updateSession(request);

  const AUTH_ROUTES = ["/sign-in", "/sign-up", "/verify-email", "/reset-password"];
  const isAuthRoute = AUTH_ROUTES.some(r => request.nextUrl.pathname.startsWith(r));

  if (isAuthRoute) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check MFA enrollment to decide redirect target
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      const hasMfa = mfaData?.totp?.some(f => f.status === "verified") ?? false;
      const redirectTo = hasMfa ? "/inicio" : "/mfa-setup";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/vault/:path*", "/setup/:path*", "/sign-in", "/sign-up", "/verify-email", "/reset-password"],
};
```

**Important:** `supabase.auth.getUser()` is already called inside `updateSession` — calling it again is a second round-trip. To avoid this, `updateSession` should return the user, OR the middleware reads the session result. Check if the existing `updateSession` implementation can be extended to return `user`.

### Anti-Patterns to Avoid

- **Reading `window.location.hash` for reset token:** Not accessible server-side. Use PKCE `code` param instead.
- **`"use client"` on entire page:** Loses server component benefits. Extract only the form as client.
- **`useFormStatus` outside `<form>`:** Hook only works in components rendered inside a `<form>` element.
- **Not awaiting `searchParams`:** Next.js 15 made searchParams a Promise — synchronous access is deprecated.
- **Calling `supabase.auth.getUser()` twice in middleware:** `updateSession` already calls it; check if user can be returned from that call.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session refresh on every request | Custom token refresh logic | `updateSession` from `@supabase/ssr` | Already implemented; handles cookie rotation |
| Password reset token validation | Custom JWT parsing | `supabase.auth.exchangeCodeForSession(code)` | Supabase handles PKCE verification and expiry |
| Form pending state | `useState` + `onSubmit` | `useFormStatus` from `react-dom` | Built-in, works with Server Actions without extra state |

---

## Common Pitfalls

### Pitfall 1: `searchParams` is a Promise in Next.js 15

**What goes wrong:** Accessing `searchParams.error` directly (without `await`) causes a runtime error or returns `undefined` silently.
**Why it happens:** Next.js 15 made dynamic APIs (`searchParams`, `cookies`, `headers`) async.
**How to avoid:** Always `await searchParams` in async server components.
**Warning signs:** `undefined` error/field params even when URL contains them.

### Pitfall 2: Supabase Password Reset Token as URL Fragment

**What goes wrong:** Token arrives as `#access_token=...&type=recovery` (URL fragment) which is not sent to the server and not in `searchParams`.
**Why it happens:** Default Supabase auth flow uses implicit flow; fragments are browser-only.
**How to avoid:** Verify Supabase project uses PKCE flow (Auth > Settings in Supabase dashboard) — with PKCE, Supabase delivers a `?code=` query param instead, which is server-readable.
**Warning signs:** `searchParams.code` is always undefined despite valid reset email.

### Pitfall 3: `useFormStatus` Scope

**What goes wrong:** `useFormStatus` returns `{ pending: false }` always.
**Why it happens:** Component using `useFormStatus` must be a child (direct or nested) of the `<form>` element, not a sibling or parent.
**How to avoid:** Place `<SubmitButton>` and disabled inputs inside the `<form>`, not alongside it.

### Pitfall 4: Double `supabase.auth.getUser()` in Middleware

**What goes wrong:** Latency increase; potentially inconsistent results if session expires between calls.
**Why it happens:** `updateSession` calls `getUser()` internally, and then middleware calls it again to check for redirect.
**How to avoid:** Extend `updateSession` to return `user` in its return value, or check if session exists via `supabase.auth.getSession()` (faster, uses cached cookie).

### Pitfall 5: Middleware Matcher Missing Auth Routes

**What goes wrong:** Auth route redirect (AUTHUX-05) never fires because middleware doesn't run on `/sign-in`.
**Why it happens:** Current matcher only covers `/vault/:path*` and `/setup/:path*`.
**How to avoid:** Add auth route patterns to the `config.matcher` array.

---

## Code Examples

### AUTH_ERRORS Translation Map

```typescript
// src/app/(auth)/auth-errors.ts
export const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Este e-mail já possui uma conta.",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
  "Token has expired or is invalid": "Este link expirou ou já foi utilizado.",
  "New password should be different from the old password": "A nova senha deve ser diferente da atual.",
};

export function translateAuthError(message: string): string {
  return AUTH_ERRORS[message] ?? "Ocorreu um erro inesperado. Tente novamente.";
}
```

### SVG Spinner (inline, no deps)

```typescript
// Inside SubmitButton component
function SpinnerSVG() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2 a10 10 0 0 1 10 10">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
```

### requestPasswordReset Server Action

```typescript
// In src/app/(auth)/actions.ts
export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    redirect(`${AUTH_ROUTE_PATHS.resetPassword}?error=${encodeURIComponent(error.message)}`);
  }

  // Always show success to prevent email enumeration
  redirect(`${AUTH_ROUTE_PATHS.resetPassword}?success=${encodeURIComponent("Link de recuperação enviado. Verifique seu e-mail.")}`);
}
```

### updatePassword Server Action

```typescript
export async function updatePassword(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const code = formData.get("code") as string;

  if (password !== confirmPassword) {
    redirect(`${AUTH_ROUTE_PATHS.resetPassword}?code=${code}&field=confirmPassword&error=${encodeURIComponent("As senhas não coincidem.")}`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    redirect(`${AUTH_ROUTE_PATHS.resetPassword}?error=${encodeURIComponent(exchangeError.message)}`);
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`${AUTH_ROUTE_PATHS.resetPassword}?code=${code}&error=${encodeURIComponent(error.message)}`);
  }

  redirect(`${AUTH_ROUTE_PATHS.signIn}?success=${encodeURIComponent("Senha atualizada. Faça login com a nova senha.")}`);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `searchParams` as sync object | `searchParams` as `Promise<{}>` | Next.js 15 | Must `await` in page components |
| Implicit flow (fragment token) | PKCE flow (code param) | Supabase default recommendation 2024 | Reset token readable server-side |
| `useState` + form `onSubmit` | Server Actions + `useFormStatus` | React 19 / Next.js 14+ | No manual pending state needed |

---

## Open Questions

1. **PKCE flow enabled in Supabase project?**
   - What we know: PKCE is the recommended flow; `exchangeCodeForSession` is the API
   - What's unclear: Whether the existing Supabase project is configured with PKCE (`flowType: 'pkce'`) — this is set in `createBrowserClient` / `createServerClient` config, not just the dashboard
   - Recommendation: Planner should add a task to verify/configure `flowType: 'pkce'` in `src/lib/supabase/server.ts` and `client.ts`

2. **`NEXT_PUBLIC_SITE_URL` env var for reset email redirect**
   - What we know: `resetPasswordForEmail` requires a `redirectTo` URL for the PKCE callback
   - What's unclear: Whether `NEXT_PUBLIC_SITE_URL` is already defined in `.env.example`
   - Recommendation: Planner should add task to ensure this env var is set; for local dev it's `http://localhost:3000`

3. **MFA status check in middleware for AUTHUX-05**
   - What we know: Decision is to redirect to `/mfa-setup` if no MFA, `/inicio` if MFA complete
   - What's unclear: `supabase.auth.mfa.listFactors()` may add latency on every auth-route request; alternatively, MFA completion could be tracked via a custom claim in the JWT
   - Recommendation: Use `mfa.listFactors()` for correctness in v1; optimize later if latency is a concern

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals: true) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- --reporter=verbose` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTHUX-01 | Sign-in page reads `?error=` and `?field=` from searchParams | unit | `pnpm test -- tests/auth-errors.test.ts` | ❌ Wave 0 |
| AUTHUX-02 | Sign-up page reads `?error=` and `?field=` from searchParams | unit | `pnpm test -- tests/auth-errors.test.ts` | ❌ Wave 0 |
| AUTHUX-03 | `requestPasswordReset` redirects to success on no error; `updatePassword` validates matching passwords | unit | `pnpm test -- tests/auth-errors.test.ts` | ❌ Wave 0 |
| AUTHUX-04 | `translateAuthError` maps known Supabase messages to pt-BR; unknown messages return generic string | unit | `pnpm test -- tests/auth-errors.test.ts` | ❌ Wave 0 |
| AUTHUX-05 | Middleware redirects authenticated user from auth routes to correct destination | manual-only | — | N/A — middleware uses Next.js request context, not unit-testable without integration harness |

**Note on AUTHUX-05:** The middleware redirect logic involves `@supabase/ssr` and `NextRequest` — unit testing requires mocking the full SSR cookie client. Given project patterns (no integration test infrastructure), this is best validated manually or via a future e2e test (out of scope for Phase 12).

### Sampling Rate
- **Per task commit:** `pnpm test -- tests/auth-errors.test.ts`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth-errors.test.ts` — covers AUTHUX-01, AUTHUX-02, AUTHUX-03, AUTHUX-04
  - Tests for `translateAuthError` with known and unknown messages
  - Tests for password match validation logic (pure function, no Supabase dep)

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/app/(auth)/actions.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`, all auth pages — direct inspection
- Existing codebase: `src/lib/auth/session.ts` — `decideVaultAccess` logic and `VaultAccountState`

### Secondary (MEDIUM confidence)
- Next.js 15 async `searchParams` — confirmed by project usage in other pages and Next.js 15 migration guide
- Supabase PKCE flow and `exchangeCodeForSession` — standard Supabase SSR pattern; consistent with existing `@supabase/ssr` installation
- `useFormStatus` from `react-dom` — React 19 / Next.js 15 standard pattern; no external dep

### Tertiary (LOW confidence)
- `supabase.auth.mfa.listFactors()` API shape for middleware MFA check — not verified against current `@supabase/ssr` version in this codebase; planner should verify method signature

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture: HIGH — patterns derived directly from existing codebase code
- Pitfalls: HIGH — Next.js 15 async searchParams and Supabase PKCE are well-documented

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable stack)
