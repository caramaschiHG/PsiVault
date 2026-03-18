---
phase: 12-authentication-ux
plan: "03"
subsystem: auth
tags: [supabase, pkce, password-reset, server-actions, next15]

requires:
  - phase: 12-01
    provides: SubmitButton, AuthForm, translateAuthError, auth-errors.ts

provides:
  - requestPasswordReset server action (prevenção de enumeração, always-success redirect)
  - updatePassword server action (validação client-side, PKCE exchangeCodeForSession, redirect /sign-in?success)
  - reset-password/page.tsx dual-state (request form sem code, update form com code)
  - NEXT_PUBLIC_SITE_URL documentado em .env.example

affects: [12-04, 14-quality-production-hardening]

tech-stack:
  added: []
  patterns:
    - "Fluxo PKCE de reset: exchangeCodeForSession antes de updateUser"
    - "Prevenção de enumeração: always-success redirect em requestPasswordReset"
    - "Dual-state page por searchParams.code (server component bifurcado)"

key-files:
  created: []
  modified:
    - src/app/(auth)/actions.ts
    - src/app/(auth)/reset-password/page.tsx
    - .env.example

key-decisions:
  - "requestPasswordReset sempre redireciona para success — não revela se e-mail existe (prevenção de enumeração)"
  - "updatePassword valida senhas antes de chamar Supabase — erro de campo retorna field=confirmPassword na URL"
  - "Token expirado detectado via rawError === 'Token has expired or is invalid' — exibe bloco especial com link para solicitar novo"
  - "code passado via hidden input no update form — server action recebe como FormData.get('code')"

requirements-completed: [AUTHUX-03, AUTHUX-04]

duration: 12min
completed: 2026-03-18
---

# Phase 12 Plan 03: Reset de Senha Summary

**Fluxo completo de reset via PKCE Supabase: server actions requestPasswordReset/updatePassword e página dual-state /reset-password bifurcada por ?code=**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-18T04:00:00Z
- **Completed:** 2026-03-18T04:12:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- requestPasswordReset: envia e-mail de recuperação via Supabase e sempre redireciona para success (sem revelar enumeração)
- updatePassword: valida senhas iguais, usa PKCE exchangeCodeForSession, redireciona para /sign-in?success= em sucesso
- reset-password/page.tsx: async server component com bifurcação clara por params.code, bloco especial para token expirado com link para re-solicitar

## Task Commits

1. **Task 1: requestPasswordReset e updatePassword em actions.ts** - `ec03096` (feat)
2. **Task 2: reset-password/page.tsx dual-state** - `0da51c2` (feat)

## Files Created/Modified

- `src/app/(auth)/actions.ts` - Adicionadas requestPasswordReset e updatePassword ao final do arquivo
- `src/app/(auth)/reset-password/page.tsx` - Reescrito como async server component dual-state
- `.env.example` - Adicionado NEXT_PUBLIC_SITE_URL documentado

## Decisions Made

- requestPasswordReset sempre redireciona para success — não revela se e-mail existe (prevenção de enumeração de e-mails)
- updatePassword valida senhas antes de chamar Supabase — erro de campo retorna `field=confirmPassword` na URL para exibir erro inline no campo correto
- Token expirado detectado via `rawError === "Token has expired or is invalid"` — exibe bloco especial com link para solicitar novo link
- `code` passado via hidden input no update form — server action recebe via `FormData.get("code")`

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

## Issues Encountered

Erros de TS pré-existentes em `tests/appointment-conflicts.test.ts` (AppointmentStatus type) e `tests/patient-summary.test.ts` (datas) — não relacionados a esta task, fora de escopo.

## Next Phase Readiness

- Fluxo completo de reset de senha funcional
- Pronto para Phase 12-04 (sign-up UX polish) ou quaisquer fases restantes de auth UX

---
*Phase: 12-authentication-ux*
*Completed: 2026-03-18*
