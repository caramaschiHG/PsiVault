---
phase: 12-authentication-ux
plan: "04"
subsystem: auth
tags: [supabase, middleware, mfa, nextjs, ssr]

requires:
  - phase: 12-01
    provides: updateSession retornando { supabase, supabaseResponse, user } sem round-trip extra

provides:
  - middleware.ts funcional com Supabase SSR — updateSession em todas as rotas do matcher
  - Redirect de usuários autenticados em auth routes para /inicio (MFA completo) ou /mfa-setup (MFA pendente)
  - Matcher expandido cobrindo vault routes reais (/inicio, /patients, /agenda, /sessions, /financeiro, /settings)

affects:
  - 14-quality-production-hardening

tech-stack:
  added: []
  patterns:
    - "Middleware async com updateSession + condicional de MFA via listFactors"
    - "Redirect de auth routes baseado em estado MFA do usuário autenticado"

key-files:
  created: []
  modified:
    - src/middleware.ts

key-decisions:
  - "enforceVaultAccess removido — era um wrapper inútil com session=null hardcoded; substituído por updateSession real"
  - "Parâmetro f em listFactors tipado explicitamente como { status: string } para satisfazer strict mode do TypeScript"

patterns-established:
  - "Auth-route guard: isAuthRoute && user → listFactors → redirect por estado MFA"

requirements-completed: [AUTHUX-05]

duration: 5min
completed: 2026-03-18
---

# Phase 12 Plan 04: Middleware com updateSession e redirect de auth routes Summary

**Middleware reescrito para chamar updateSession do Supabase SSR e redirecionar autenticados em /sign-in, /sign-up, /verify-email, /reset-password para /inicio (MFA completo) ou /mfa-setup (MFA pendente)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T04:00:00Z
- **Completed:** 2026-03-18T04:05:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Substituiu enforceVaultAccess(null, null) stub por updateSession real do Supabase SSR
- Adicionou redirect condicional para autenticados em auth routes baseado em MFA status
- Expandiu matcher para cobrir todas as rotas do vault (/inicio, /patients, /agenda, /sessions, /financeiro, /settings)

## Task Commits

1. **Task 1: Reescrever middleware.ts com updateSession e redirect de auth routes** - `1deb8f6` (feat)

## Files Created/Modified
- `src/middleware.ts` - Reescrito: async, chama updateSession, redireciona autenticados de auth routes, matcher expandido

## Decisions Made
- enforceVaultAccess removido pois era apenas um wrapper de decideVaultAccess com dados null hardcoded, sem consumidores externos
- Parâmetro `f` em `.some()` tipado explicitamente como `{ status: string }` para satisfazer TypeScript strict mode (a API do Supabase tem tipo suficientemente amplo)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tipo implícito 'any' no parâmetro do callback listFactors**
- **Found during:** Task 1 (verificação TypeScript)
- **Issue:** `mfaData?.totp?.some((f) => ...)` — TypeScript strict inferiu `f` como `any` implícito
- **Fix:** Tipagem explícita `(f: { status: string })` no callback
- **Files modified:** src/middleware.ts
- **Verification:** `pnpm tsc --noEmit` sem erros em middleware.ts
- **Committed in:** 1deb8f6 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix necessário para TypeScript strict. Sem scope creep.

## Issues Encountered
- Os erros de TypeScript reportados pelo `pnpm tsc --noEmit` são todos pré-existentes em `tests/appointment-conflicts.test.ts` — não causados por este plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Middleware funcional com Supabase SSR — proteção de vault e redirect de auth routes operacionais
- Phase 14 (hardening) pode adicionar proteção explícita de vault routes (redirecionar não-autenticados) sobre esta base

---
*Phase: 12-authentication-ux*
*Completed: 2026-03-18*
