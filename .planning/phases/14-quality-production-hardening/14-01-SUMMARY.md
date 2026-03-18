---
phase: 14-quality-production-hardening
plan: "01"
subsystem: security
tags: [re-auth, supabase-auth, cookies, backup, export]
dependency_graph:
  requires: []
  provides: [real-reauth-gate-backup, real-reauth-gate-export]
  affects: [src/app/(vault)/settings/dados-e-privacidade/actions.ts, src/app/api/backup/route.ts, src/app/api/export/patient/[patientId]/route.ts]
tech_stack:
  added: []
  patterns: [supabase.auth.signInWithPassword, httpOnly cookie Max-Age expiration]
key_files:
  created: []
  modified:
    - src/app/(vault)/settings/dados-e-privacidade/actions.ts
    - src/app/api/backup/route.ts
    - src/app/api/export/patient/[patientId]/route.ts
decisions:
  - "[14-01-01]: Email de verificação vem exclusivamente de supabase.auth.getUser() (sessão ativa) — nunca de input do usuário"
  - "[14-01-02]: Verificação de timestamp manual removida das routes — cookie Max-Age=600s garante expiração via browser sem lógica adicional"
  - "[14-01-03]: Resposta 401 padronizada para 'Não autorizado.' nas API routes (vs 'Re-autenticação necessária' do stub)"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_modified: 3
---

# Phase 14 Plan 01: Re-auth Gate Security Fix Summary

**One-liner:** Re-auth gate substituído de stub aceita-tudo para verificação real via `supabase.auth.signInWithPassword` com email da sessão ativa, e routes simplificadas para verificação de presença de cookie httpOnly com Max-Age.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Substituir stub por signInWithPassword em re-auth actions | 793057a | actions.ts |
| 2 | Substituir stub de cookie nas API routes de backup e export | 6a5e971 | route.ts (backup), route.ts (export) |

## Changes Summary

### Task 1 — actions.ts

- `confirmBackupAuthAction` e `exportPatientAuthAction` agora chamam `supabase.auth.getUser()` para obter o email da sessão ativa
- Chamam `supabase.auth.signInWithPassword({ email: user.email, password: input.password })` para verificar a senha
- Senha incorreta retorna `{ ok: false, error: "Senha incorreta." }`
- Sessão inválida (sem user ou email) retorna `{ ok: false, error: "Sessão inválida. Faça login novamente." }`
- Cookie `psivault_backup_auth` / `psivault_export_auth` só é setado após verificação aprovada
- Todos os comentários stub removidos

### Task 2 — API routes

- `/api/backup`: verifica presença de `psivault_backup_auth`; retorna 401 com `"Não autorizado."` se ausente
- `/api/export/patient/[id]`: verifica presença de `psivault_export_auth`; retorna 401 com `"Não autorizado."` se ausente
- Verificação manual de timestamp (`REAUTH_WINDOW_MS`) removida — cookie `Max-Age` garante expiração nativamente
- Constante `REAUTH_WINDOW_MS` removida de ambas as routes

## Deviations from Plan

### Auto-simplified Issues

**1. [Rule 1 - Simplification] Verificação de timestamp manual redundante removida**
- **Found during:** Task 2
- **Issue:** As routes verificavam `Date.now() - issuedAt > REAUTH_WINDOW_MS` além de verificar presença do cookie. Essa verificação é redundante porque o cookie já tem `Max-Age=600` — o browser não envia cookies expirados.
- **Fix:** Removida a verificação de timestamp e a constante `REAUTH_WINDOW_MS` de ambas as routes.
- **Files modified:** `route.ts` (backup), `route.ts` (export)
- **Commit:** 6a5e971

## Verification Results

- `grep -r "v1 stub" actions.ts` → vazio (PASS)
- `grep "signInWithPassword" actions.ts` → 2 ocorrências (PASS)
- `grep "getUser" actions.ts` → 2 ocorrências (PASS)
- `grep "psivault_backup_auth" backup/route.ts` → 2 ocorrências (PASS)
- `grep "psivault_export_auth" export/patient/[id]/route.ts` → 2 ocorrências (PASS)
- `pnpm test` → 292/294 tests passando (2 falhas pré-existentes não relacionadas a esta task)

## Pre-existing Test Failures (out of scope)

Os seguintes testes falharam antes e depois desta task — são pré-existentes e fora do escopo:
1. `auth-session.test.ts` — `model Session` encontrado no schema Prisma
2. `patient-summary.test.ts` — `nextSession` retorna data incorreta em `derivePatientSummaryFromAppointments`
