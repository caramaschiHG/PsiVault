---
phase: 20
slug: m-dulo-de-gest-o-de-despesas
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 20 — Validation Strategy

> Per-phase validation contract para feedback sampling durante a execução do
> Módulo de Gestão de Despesas.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (node env, globals) — já instalado |
| **Config file** | `vitest.config.ts` (raiz) |
| **Quick run command** | `pnpm vitest run tests/expenses tests/expense-categories` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~8 segundos para o subset, ~25 segundos full |

---

## Sampling Rate

- **After every task commit:** `pnpm vitest run tests/expenses tests/expense-categories --reporter=dot`
- **After every plan wave:** `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green + `pnpm tsc --noEmit` limpo
- **Max feedback latency:** ~10 segundos para o subset

---

## Per-Task Verification Map

> IDs `20-{plan}-{task}` correspondem aos plans `20-01-PLAN.md` … `20-06-PLAN.md`
> que serão criados na próxima etapa. Esta matriz será atualizada quando os plans
> existirem (a coluna **File Exists** vira ✅).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 0 | DESP-01 | — | Schema com `workspaceId` scoping + soft delete | unit (schema introspection) | `pnpm prisma validate` | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 0 | DESP-01 | — | `pnpm prisma db push` aplica sem drift | manual (one-shot) | `pnpm prisma db push` | ❌ W0 | ⬜ pending (BLOCKING) |
| 20-01-03 | 01 | 1 | DESP-01 | — | `createExpenseCategory` factory determinística | unit | `pnpm vitest run tests/expense-categories/model.test.ts` | ❌ W0 | ⬜ pending |
| 20-01-04 | 01 | 1 | DESP-01 | — | InMemoryExpenseCategoryRepository CRUD + workspace isolation | unit | `pnpm vitest run tests/expense-categories/repository.test.ts` | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 1 | DESP-02 | — | `createExpense` factory + soft delete fields nulos | unit | `pnpm vitest run tests/expenses/model.test.ts` | ❌ W0 | ⬜ pending |
| 20-02-02 | 02 | 1 | DESP-02 | — | `materializeSeries` MENSAL gera 12 ocorrências, fim de mês clampa | unit | `pnpm vitest run tests/expenses/series.test.ts -t "MENSAL"` | ❌ W0 | ⬜ pending |
| 20-02-03 | 02 | 1 | DESP-02 | — | `materializeSeries` QUINZENAL gera +14 dias fixos, `seriesId` único | unit | `pnpm vitest run tests/expenses/series.test.ts -t "QUINZENAL"` | ❌ W0 | ⬜ pending |
| 20-02-04 | 02 | 1 | DESP-02 | — | `applySeriesEdit` honra scope this/this_and_future/all | unit | `pnpm vitest run tests/expenses/series.test.ts -t "applySeriesEdit"` | ❌ W0 | ⬜ pending |
| 20-02-05 | 02 | 1 | DESP-02 | — | InMemoryExpenseRepository + workspace isolation + soft delete | unit | `pnpm vitest run tests/expenses/repository.test.ts` | ❌ W0 | ⬜ pending |
| 20-02-06 | 02 | 1 | DESP-02 | T-20-01 | Audit events `expense.*` **não** contém `amountInCents` (SECU-05) | unit (negative) | `pnpm vitest run tests/expenses/audit.test.ts` | ❌ W0 | ⬜ pending |
| 20-03-01 | 03 | 1 | DESP-03 | T-20-02 | Validação de MIME (PDF/JPG/PNG) e size (≤10MB) antes de upload | unit | `pnpm vitest run tests/expenses/upload-validation.test.ts` | ❌ W0 | ⬜ pending |
| 20-03-02 | 03 | 1 | DESP-03 | T-20-03 | Storage key namespaced por `workspaceId/expenseId/uuid-filename` | unit | `pnpm vitest run tests/expenses/storage-key.test.ts` | ❌ W0 | ⬜ pending |
| 20-03-03 | 03 | 1 | DESP-03 | T-20-03 | Signed URL TTL = 120s, bucket `expense-receipts` privado | manual | Verificar via Supabase Dashboard | n/a | ⬜ pending |
| 20-04-01 | 04 | 2 | DESP-01,02 | T-20-04 | Server actions resolvem `workspaceId` via `resolveSession` antes de qualquer query | unit | `pnpm vitest run tests/expenses/actions.test.ts` | ❌ W0 | ⬜ pending |
| 20-04-02 | 04 | 2 | DESP-01,02 | — | `revalidatePath("/financeiro")` chamado em todas as mutations | grep | `rg "revalidatePath" src/app/\(vault\)/financeiro/actions.ts` | ✅ | ⬜ pending |
| 20-04-03 | 04 | 2 | DESP-01,02,03 | — | `?tab=despesas` server-readable em `page.tsx` | manual | `curl localhost:3000/financeiro?tab=despesas` | n/a | ⬜ pending |
| 20-05-01 | 05 | 2 | DESP-01,02,03 | — | TS strict + sem Tailwind/shadcn | grep | `pnpm tsc --noEmit && rg -l "className=\"" src/app/\(vault\)/financeiro/components/expense*` retorna vazio | ❌ W0 | ⬜ pending |
| 20-05-02 | 05 | 2 | DESP-02 | — | `RecurrenceScopeDialog` exibe 3 opções com copy literal de UI-SPEC | manual (UAT) | Abrir drawer, editar série, ver dialog | n/a | ⬜ pending |
| 20-05-03 | 05 | 2 | DESP-03 | — | `ReceiptDropZone` aparece **só após save** (CONTEXT D-21) | manual (UAT) | Criar despesa, observar fluxo de 2 passos | n/a | ⬜ pending |
| 20-06-01 | 06 | 3 | DESP-01,02,03 | — | Filtros (busca/categoria/valor/mês) atualizam URL e SSR | manual (UAT) | Aplicar filtros, recarregar página | n/a | ⬜ pending |
| 20-06-02 | 06 | 3 | DESP-01,02,03 | — | ARIA roles e keyboard nav per UI-SPEC | manual (a11y audit) | Tab keyboard nav, screen reader smoke | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/expenses/model.test.ts` — stubs para `createExpense` (DESP-02)
- [ ] `tests/expenses/series.test.ts` — stubs para `materializeSeries` + `applySeriesEdit` (DESP-02)
- [ ] `tests/expenses/repository.test.ts` — InMemory contract (DESP-02)
- [ ] `tests/expenses/audit.test.ts` — **negative test SECU-05** (DESP-02)
- [ ] `tests/expenses/actions.test.ts` — server action contract (DESP-01,02)
- [ ] `tests/expenses/upload-validation.test.ts` — MIME/size (DESP-03)
- [ ] `tests/expenses/storage-key.test.ts` — namespacing (DESP-03)
- [ ] `tests/expense-categories/model.test.ts` — factory (DESP-01)
- [ ] `tests/expense-categories/repository.test.ts` — CRUD + restrict (DESP-01)
- [ ] **BLOCKING:** `pnpm prisma db push` (após 20-01-01 modificar schema)

Framework já instalado (vitest). Sem instalação extra necessária.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bucket `expense-receipts` criado e privado no Supabase | DESP-03 | Supabase Dashboard não tem CLI no projeto | Login Supabase → Storage → Create bucket `expense-receipts` → Public = OFF |
| Drawer revela ReceiptDropZone só após save | DESP-03 | UX flow de 2 passos (CONTEXT D-21) — visual | Abrir drawer "Nova despesa" → preencher → salvar → confirmar zona aparece |
| `RecurrenceScopeDialog` exibe copy literal de UI-SPEC | DESP-02 | Verificação visual de copy pt-BR | Editar despesa de série → confirmar 3 opções com texto exato |
| `?tab=despesas` deep-link funciona em SSR | DESP-01 | URL contract | `curl -i localhost:3000/financeiro?tab=despesas` deve retornar HTML com section Despesas visível |
| Signed URL para comprovante expira em 120s | DESP-03 | TTL real só observável em produção | Gerar URL → esperar 121s → confirmar 403 |
| Empty states com copy literal de UI-SPEC | DESP-01,02,03 | Visual | Workspace vazio → ver "Nenhuma despesa cadastrada ainda" exato |
| StatCards mostram valores tabular-nums alinhados | DESP-01,02 | Visual / typography | Inspecionar elemento → `font-variant-numeric: tabular-nums` |
| Sem gradientes / shadows excessivos / glassmorphism | — (CLAUDE.md) | Visual / brand compliance | Audit visual de toda a section Despesas |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies (preencher quando plans existirem)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (validar pós-planning)
- [ ] Wave 0 covers all MISSING references (lista acima cobre todos os ❌ W0)
- [ ] No watch-mode flags (todos os comandos usam `vitest run`, não `vitest`)
- [ ] Feedback latency < ~10s (subset roda em ~8s)
- [ ] `nyquist_compliant: true` set in frontmatter (após plan-checker aprovar)

**Approval:** pending — aguardando criação dos plans 20-01..20-06 e aprovação do plan-checker.
