---
phase: 12-authentication-ux
plan: "01"
subsystem: auth
tags: [supabase, react, next.js, useFormStatus, typescript]

# Dependency graph
requires:
  - phase: 08-authentication-workspaces
    provides: Supabase Auth setup e middleware base
provides:
  - AUTH_ERRORS map com 7 traduções pt-BR de erros Supabase
  - translateAuthError() com fallback genérico
  - SubmitButton client component com useFormStatus e SpinnerSVG
  - AuthForm wrapper client com fieldset disabled durante pending
  - updateSession retorna user sem double getUser()
affects: [12-02, 12-03, 12-04, sign-in, sign-up, reset-password, verify-email, mfa-setup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useFormStatus para feedback de loading em Server Actions sem estado extra"
    - "fieldset disabled para desabilitar múltiplos inputs nativamente"
    - "vitest resolve.alias para testar módulos com path alias @/"

key-files:
  created:
    - src/app/(auth)/auth-errors.ts
    - src/app/(auth)/components/submit-button.tsx
    - src/app/(auth)/components/auth-form.tsx
    - tests/auth-errors.test.ts
  modified:
    - src/lib/supabase/middleware.ts
    - vitest.config.ts

key-decisions:
  - "vitest.config.ts necessitou resolve.alias para @/ funcionar em testes — corrigido como blocker (Rule 3)"
  - "AuthForm usa fieldset disabled ao invés de controlar cada input individualmente — padrão HTML nativo mais simples"
  - "updateSession retorna user do getUser() já executado — evita segundo round-trip no middleware"

patterns-established:
  - "SubmitButton: componente isolado 'use client' com useFormStatus para reutilizar em todas as páginas de auth"
  - "AuthForm: wrapper fieldset disabled como padrão de desabilitação de formulário durante pending"

requirements-completed: [AUTHUX-04]

# Metrics
duration: 8min
completed: 2026-03-18
---

# Phase 12 Plan 01: Authentication UX Foundations Summary

**AUTH_ERRORS map pt-BR + SubmitButton com spinner SVG + AuthForm fieldset wrapper + updateSession com user retornado, criando fundamentos reutilizáveis para as páginas de auth**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-18T00:45:02Z
- **Completed:** 2026-03-18T00:47:45Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- `translateAuthError()` com 7 traduções pt-BR e fallback genérico, 9 casos de teste passando
- `SubmitButton` client component com `useFormStatus`, spinner SVG animado e acessibilidade (`aria-busy`)
- `AuthForm` wrapper com `fieldset disabled` para desabilitar todos os inputs nativamente durante pending
- `updateSession` atualizado para retornar `user` sem segunda chamada a `getUser()`

## Task Commits

1. **Task 1: auth-errors.ts + tests** - `78462b0` (feat + [Rule 3 vitest config])
2. **Task 2: SubmitButton, AuthForm, updateSession** - `629bc15` (feat)

## Files Created/Modified

- `src/app/(auth)/auth-errors.ts` - AUTH_ERRORS map e translateAuthError()
- `src/app/(auth)/components/submit-button.tsx` - Botão com useFormStatus e SpinnerSVG
- `src/app/(auth)/components/auth-form.tsx` - Wrapper fieldset disabled durante pending
- `src/lib/supabase/middleware.ts` - updateSession agora retorna { supabase, supabaseResponse, user }
- `tests/auth-errors.test.ts` - 9 testes para translateAuthError
- `vitest.config.ts` - Adicionado resolve.alias para @/ -> src/

## Decisions Made

- `AuthForm` usa `<fieldset disabled>` ao invés de controlar estado de cada input individualmente — padrão HTML nativo sem overhead de estado React
- `updateSession` retorna `user` do `getUser()` já executado — evita dupla round-trip de auth no middleware

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest.config.ts sem path alias para @/**
- **Found during:** Task 1 (RED phase — teste falhando por razão errada)
- **Issue:** vitest não resolvia `@/app/(auth)/auth-errors` — sem resolve.alias configurado
- **Fix:** Adicionado `resolve.alias: { "@": path.resolve(__dirname, "src") }` no vitest.config.ts
- **Files modified:** vitest.config.ts
- **Verification:** Testes passaram após o fix
- **Committed in:** 78462b0 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix necessário para executar testes. Sem scope creep.

## Issues Encountered

- `pnpm test --run` retornava erro de opção desconhecida — usado `pnpm exec vitest run` diretamente

## Next Phase Readiness

- Contratos prontos: `translateAuthError`, `SubmitButton`, `AuthForm`, `updateSession` com `user`
- Plans 02, 03, 04 podem implementar as páginas de auth sem ambiguidade
- Sem blockers

---
*Phase: 12-authentication-ux*
*Completed: 2026-03-18*
