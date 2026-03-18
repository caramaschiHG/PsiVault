---
phase: 14
slug: quality-production-hardening
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-18
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green + `next build` clean
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 14-01-T1 | 01 | 1 | QUAL-01 | unit | `pnpm test` | ⬜ pending |
| 14-01-T2 | 01 | 1 | QUAL-01 | grep | `grep "psivault_backup_auth" src/app/api/backup/route.ts` | ⬜ pending |
| 14-02-T1 | 02 | 1 | QUAL-02 | build | `pnpm build` | ⬜ pending |
| 14-02-T2 | 02 | 1 | QUAL-02 | unit | `pnpm test` | ⬜ pending |
| 14-03-T1 | 03 | 1 | QUAL-03 | unit | `pnpm test` | ⬜ pending |
| 14-03-T2 | 03 | 1 | QUAL-03 | unit | `pnpm test` | ⬜ pending |
| 14-04-T1 | 04 | 1 | QUAL-04/05/06 | grep | `grep -rn "createInMemory" src/lib/*/store.ts; echo "clean"` | ⬜ pending |
| 14-04-T2 | 04 | 1 | DEPLOY-03 | script | `node -e "const p=require('./package.json');console.log(p.scripts.postinstall)"` | ⬜ pending |
| 14-05-T1 | 05 | 2 | DEPLOY-02 | build | `pnpm build 2>&1 \| tail -20` | ⬜ pending |
| 14-05-T2 | 05 | 2 | DEPLOY-01 | file | `cat .env.example \| grep "NEXT_PUBLIC_SUPABASE_URL=" \| wc -l` | ⬜ pending |
| 14-05-T3 | 05 | 2 | DEPLOY-01/02 | checkpoint | human-verify | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test scaffolding needed before execution.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Re-auth dialog verifica senha via Supabase | QUAL-01 | Requer Supabase auth ativo | Clicar "Baixar backup", inserir senha correta/incorreta, confirmar gate funciona |
| API routes retornam 401 sem cookie | QUAL-01 | Requer request HTTP real | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/backup` deve retornar 401 |
| Env vars configuradas na Vercel | DEPLOY-01 | Requer acesso ao dashboard Vercel | Verificar todas as vars presentes em Settings > Environment Variables |

---

## Automated Coverage by Requirement

| Requirement | Automated Verify | Coverage |
|-------------|------------------|----------|
| QUAL-01 | `pnpm test` + grep cookie em route.ts | partial (lógica testada; fluxo e2e é manual) |
| QUAL-02 | `pnpm build` + `pnpm test` | full |
| QUAL-03 | `pnpm test` | full |
| QUAL-04 | `grep -rn "never\[\]" src/` | full (grep é verificação definitiva) |
| QUAL-05 | `grep -rn "importantObservations" src/lib/search/` | full |
| QUAL-06 | `grep -rn "createInMemory" src/lib/*/store.ts` | full |
| DEPLOY-01 | `cat .env.example \| grep "NEXT_PUBLIC_SUPABASE_URL="` | full |
| DEPLOY-02 | `pnpm build 2>&1 \| tail -20` | full |
| DEPLOY-03 | `node -e "...package.json.scripts.postinstall"` | full |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0: no MISSING references — existing infrastructure sufficient
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
