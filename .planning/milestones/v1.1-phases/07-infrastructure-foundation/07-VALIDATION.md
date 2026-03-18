---
phase: 7
slug: infrastructure-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (node env, globals) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx prisma validate` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx prisma validate`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green + connection smoke test passed
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | INFRA-01 | manual | N/A — environment setup | N/A | ⬜ pending |
| 7-01-02 | 01 | 1 | INFRA-02 | smoke | `npx prisma validate && npx prisma migrate dev --name init` | ✅ schema.prisma | ⬜ pending |
| 7-01-03 | 01 | 2 | INFRA-03 | smoke | `pnpm test tests/infra-connection.test.ts` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/infra-connection.test.ts` — smoke test que verifica `db.$connect()` sem connection exhaustion (INFRA-03); usa `it.skip` até credenciais reais disponíveis

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase project provisionado, `.env` preenchido | INFRA-01 | Setup de ambiente externo, não testável via unit tests | Verificar variáveis no dashboard Supabase e no arquivo `.env` local |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
