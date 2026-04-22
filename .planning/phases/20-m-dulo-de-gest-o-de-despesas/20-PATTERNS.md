---
phase: 20-m-dulo-de-gest-o-de-despesas
phase_number: "20"
type: patterns
date: 2026-04-22
mapper: gsd-pattern-mapper (inline)
---

# Phase 20 — Pattern Map

> Para cada arquivo que **será criado ou modificado** no Phase 20, este documento
> aponta o **analog mais próximo** já no codebase. O planner e o executor não
> deveriam ter que explorar o codebase — basta ler os analogs listados aqui.

---

## Files to Create

### Domain layer — Categorias

| Novo arquivo | Analog (arquivo + linhas) | O que copiar |
|---|---|---|
| `src/lib/expense-categories/model.ts` | `src/lib/finance/model.ts:42-70` (`createSessionCharge` factory) | Estrutura `CreateXInput` + `CreateXDeps { now, createId }` + factory pura. Trocar campos para `name`, `slug`, `archived`, `workspaceId`, `createdAt`. |
| `src/lib/expense-categories/repository.ts` | `src/lib/finance/repository.ts` (interface inteira) | Mesmo shape: interface com `findById`, `findByWorkspace`, `create`, `update`, `softDelete`. Adicionar `findActiveByWorkspace` (filtra `archived: false, deletedAt: null`). |
| `src/lib/expense-categories/repository.prisma.ts` | `src/lib/finance/repository.prisma.ts` (arquivo inteiro) | `PrismaXRepository implements XRepository`, recebe `prisma` no construtor, mapeia row → domain via helper. Workspace scoping em **toda** query. |
| `src/lib/expense-categories/store.ts` | `src/lib/finance/store.ts` (arquivo inteiro) | Singleton via `globalThis` + getter + setter para tests. |
| `src/lib/expense-categories/audit.ts` | `src/lib/finance/audit.ts` (arquivo inteiro, **especialmente comentário SECU-05 linhas 7-9**) | Wrappers `expense_category.created` / `.renamed` / `.archived`. Metadata só ID e nome (não há valor monetário aqui — sem risco SECU-05, mas manter o padrão de minimalismo). |

### Domain layer — Despesas

| Novo arquivo | Analog (arquivo + linhas) | O que copiar |
|---|---|---|
| `src/lib/expenses/model.ts` | `src/lib/finance/model.ts` inteiro + campos de série de `src/lib/appointments/model.ts:96-115` | Factory `createExpense` com `seriesId/seriesIndex/recurrencePattern` opcionais. Soft delete fields nulos por default. |
| `src/lib/expenses/series.ts` | `src/lib/appointments/recurrence.ts:39-120` (função `materialize…`) | `materializeSeries(input, deps)` retorna 12 ocorrências. **Diferença crítica:** appointments usa `WEEKLY/BIWEEKLY/TWICE_WEEKLY` com `addDays`. Despesas usa `MENSAL` (`addMonths(d, i)`) e `QUINZENAL` (`addDays(d, 14*i)`). `seriesId` gerado **uma vez** antes do loop. |
| `src/lib/expenses/series.ts` | `src/lib/appointments/recurrence.ts:198-225` (`applySeriesEdit`) | Função `applySeriesEdit(scope: "this" \| "this_and_future" \| "all", series, edit)`. Lógica idêntica de filtragem por `seriesIndex`. |
| `src/lib/expenses/repository.ts` | `src/lib/finance/repository.ts` | + métodos `findBySeries(workspaceId, seriesId)`, `bulkUpdate(workspaceId, ids, patch)`, `softDeleteWithScope(workspaceId, expenseId, scope, actorId)`. |
| `src/lib/expenses/repository.prisma.ts` | `src/lib/finance/repository.prisma.ts` + `src/lib/appointments/repository.prisma.ts` (operações de série) | Workspace scoping em toda query. `bulkUpdate` via `prisma.$transaction`. |
| `src/lib/expenses/store.ts` | `src/lib/finance/store.ts` | Idêntico, trocar tipos. |
| `src/lib/expenses/audit.ts` | `src/lib/finance/audit.ts` (**TODO o arquivo, especialmente o comentário SECU-05 e linhas 40-44 que excluem `amountInCents`**) | Wrappers `expense.created` / `.updated` / `.deleted` / `.receipt_attached` / `.receipt_replaced` / `.receipt_removed` / `.series_updated` / `.scope_changed`. Metadata: só `expenseId`, `categoryId`, `recurrencePattern`, `seriesScope`. **NUNCA** `amountInCents` ou `description` (description pode ter valores em texto livre). |
| `src/lib/expenses/format.ts` | `src/app/(vault)/financeiro/page-client.tsx:26` (linha única `Intl.NumberFormat`) | Exportar `formatBRL(cents: number)` e `parseBRLToCents(text: string)`. Não refatorar os 3 call sites existentes (fora de escopo). |
| `src/lib/expenses/upload-validation.ts` | `src/app/(vault)/setup/actions.ts:1-15, 56-66` (constantes + checagens MIME/size) | Exportar `ALLOWED_RECEIPT_MIME = ["application/pdf", "image/jpeg", "image/png"]`, `MAX_RECEIPT_SIZE = 10 * 1024 * 1024`, e função pura `validateReceiptFile(file): { ok: true } \| { ok: false, error: string }`. |
| `src/lib/expenses/storage.ts` | `src/app/(vault)/setup/actions.ts:68-78` (upload pattern) + `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts:82-97` (signed URL pattern) | Helper `buildExpenseStorageKey({ workspaceId, expenseId, fileName })` retorna `${workspaceId}/${expenseId}/${crypto.randomUUID()}-${fileName}`. Helper `getReceiptSignedUrl(supabase, storageKey)` chama `.createSignedUrl(storageKey, 120)`. |

### Server actions

| Novo arquivo / modificação | Analog | O que copiar |
|---|---|---|
| **MODIFICAR** `src/app/(vault)/financeiro/actions.ts` | linhas 1-30 do próprio arquivo (estrutura de imports + `createId` inline) | Adicionar no topo: `createExpenseId`, `createExpenseCategoryId`, `createExpenseSeriesId` (mesmo padrão de linha 9). Adicionar actions: `createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction`, `createExpenseCategoryAction`, `renameExpenseCategoryAction`, `archiveExpenseCategoryAction`, `attachReceiptAction`, `replaceReceiptAction`, `removeReceiptAction`. Cada uma: `"use server"` (já no topo do arquivo) → `resolveSession` → repo call → audit emit → `revalidatePath("/financeiro")`. |

### API routes

| Novo arquivo | Analog | O que copiar |
|---|---|---|
| `src/app/api/expenses/[expenseId]/receipt/route.ts` | `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` (arquivo inteiro) | `GET` handler: resolve session, valida que a despesa pertence ao workspace do user, gera signed URL via `supabase.storage.from("expense-receipts").createSignedUrl(storageKey, 120)`, retorna `Response.redirect(signedUrl, 302)` ou JSON com URL conforme o uso. |

### Page integration

| Modificação | Analog | O que copiar |
|---|---|---|
| **MODIFICAR** `src/app/(vault)/financeiro/page.tsx` | o próprio arquivo (atual) | Adicionar carga de `expenses` e `categories` no `Promise.all` que já carrega charges/payments. Passar como props para `<FinanceiroPageClient>`. |
| **MODIFICAR** `src/app/(vault)/financeiro/page-client.tsx` | o próprio arquivo + `Tabs` interno existente | Adicionar `activeTab` derivado de `searchParams.tab`. Quando `tab === "despesas"`: renderizar `<ExpensesSection />`, esconder a section de Cobranças. Default (sem `?tab` ou `tab !== "despesas"`): comportamento atual (Phase 19). |

### UI components (todos novos, em `src/app/(vault)/financeiro/components/`)

| Novo arquivo | Analog (arquivo + linhas) | O que copiar |
|---|---|---|
| `expense-side-panel.tsx` | `src/app/(vault)/financeiro/components/charge-side-panel.tsx` (arquivo inteiro) | Estrutura drawer 26rem (UI-SPEC), header sticky, body scroll, footer sticky com CTAs. Form fields conforme UI-SPEC § ExpenseSidePanel. **Após save:** revelar `<ReceiptDropZone>` (CONTEXT D-21). |
| `expense-category-modal.tsx` | `src/components/ui/keyboard-shortcuts-modal.tsx` (overlay + focus trap + Escape, linhas 20-50) | Modal centralizado, lista de categorias com inline edit/archive, CTA "Nova categoria". Copy literal de UI-SPEC. |
| `recurrence-scope-dialog.tsx` | `src/components/ui/keyboard-shortcuts-modal.tsx` (mesmo padrão de overlay) + UI-SPEC § RecurrenceScopeDialog (copy exato) | 3 radio options: "Apenas esta", "Esta e as futuras", "Todas as ocorrências" (texto exato de UI-SPEC). Disparado quando user edita/deleta despesa com `seriesId`. |
| `receipt-drop-zone.tsx` | RESEARCH.md § "Code Examples" Exemplo 4 (drag-drop nativo HTML5) | Container com `onDragOver/onDrop`, fallback `<input type="file" hidden />`. Após receber file: chama `attachReceiptAction` ou `replaceReceiptAction`. Mostra preview (nome do arquivo + ícone PDF/imagem) e botão "Remover" → `removeReceiptAction`. |
| `expense-list.tsx` | `charge-side-panel.tsx` (estrutura de list rows) + `src/components/ui/list.tsx` (primitivo) | Lista plana ordenada por `dueDate desc`. Cada row: descrição, categoria badge, valor (BRL tabular-nums), due date, ícone de comprovante (se houver). Click → abre side panel. |
| `expense-grouped-list.tsx` | `expense-list.tsx` (uma vez existir) + UI-SPEC § ExpenseGroupedList | Mesmo layout, mas agrupado por mês (`startOfMonth(dueDate)` como header). Header sticky por grupo. |
| `expense-view-toggle.tsx` | `src/components/ui/tabs.tsx` (toggle visual) | Switch entre "Plana" e "Agrupada" — controla qual lista renderiza. State via `useState` no parent (`<ExpensesSection>`). |
| `expense-stat-cards.tsx` | `src/components/ui/stat-card.tsx` (primitivo existente) | 3 cards conforme UI-SPEC: "Despesas no mês", "A vencer", "Vencidas". Valores em `formatBRL` com `tabular-nums`. |
| `expenses-section.tsx` | `src/app/(vault)/financeiro/page-client.tsx` (estrutura geral do client) | Container que orquestra: ExpenseStatCards + ExpenseViewToggle + (ExpenseList \| ExpenseGroupedList) + ExpenseSidePanel state + filtros. Recebe `expenses` e `categories` como props. |
| `expense-filters.tsx` | (Phase 19) filtros existentes em `page-client.tsx` (busca + chips) | Busca text, dropdown de categoria, range de valor, picker de mês. URL state via `useSearchParams` + `router.replace`. Mesmo padrão de Phase 19. |

### Shared UI primitive (opcional mas recomendado)

| Novo arquivo | Analog | Justificativa |
|---|---|---|
| `src/components/ui/dialog.tsx` | `src/components/ui/keyboard-shortcuts-modal.tsx:20-50` (overlay + focus trap + Escape) | Extrair o padrão genérico de modal. `<Dialog open onOpenChange><DialogOverlay /><DialogContent>...</DialogContent></Dialog>`. Usado por `ExpenseCategoryModal` e `RecurrenceScopeDialog`. **Decisão do planner:** se extração for >30% context, criar inline em cada modal específico em vez de extrair primitivo agora. |

### Schema (Prisma)

| Modificação | Analog | O que copiar |
|---|---|---|
| **MODIFICAR** `prisma/schema.prisma` | `model SessionCharge` (workspace scoping + soft delete) + `model Appointment:139-175` (campos de série) | Adicionar `model ExpenseCategory` e `model Expense` conforme CONTEXT D-01. Índices compostos `[workspaceId, deletedAt]`, `[workspaceId, dueDate]`, `[seriesId]`. FK `categoryId → ExpenseCategory.id` com `onDelete: Restrict`. |

### Tests

| Novo arquivo | Analog | O que cobrir |
|---|---|---|
| `tests/expense-categories/model.test.ts` | `tests/finance/model.test.ts` se existir, senão `tests/patients/model.test.ts` | Factory determinística com `createId` mockado. |
| `tests/expense-categories/repository.test.ts` | `tests/finance/repository.test.ts` se existir | InMemory CRUD + workspace isolation + restrict-on-delete-with-references. |
| `tests/expenses/model.test.ts` | mesmo padrão | Factory + soft-delete fields nulos por default. |
| `tests/expenses/series.test.ts` | `tests/appointments/recurrence.test.ts` | MENSAL: 12 ocorrências, datas corretas, fim de mês (31/01 → 28/02 → 31/03 → 30/04). QUINZENAL: +14 dias fixos. `seriesId` único e compartilhado. `applySeriesEdit` 3 scopes. |
| `tests/expenses/repository.test.ts` | `tests/finance/repository.test.ts` | InMemory CRUD + workspace isolation + soft delete + `findBySeries` + `bulkUpdate` + `softDeleteWithScope`. |
| `tests/expenses/audit.test.ts` | `tests/finance/audit.test.ts` se existir | **Negative test SECU-05:** itera todos os tipos `expense.*` e asserta que `metadata` **não** contém keys `amountInCents`, `amount`, `description`, `value`. |
| `tests/expenses/upload-validation.test.ts` | `tests/setup/*.test.ts` se existir | MIME aceitos, MIME rejeitados, size 10MB exato (passa) vs 10MB+1byte (rejeita). |
| `tests/expenses/storage-key.test.ts` | — | `buildExpenseStorageKey` produz path namespaced por workspace+expense. |
| `tests/expenses/actions.test.ts` | `tests/financeiro/actions.test.ts` se existir | Cada action chama `resolveSession` antes de query (mockar e asserir ordem). |

---

## Files to Modify

| Arquivo | Mudança | Risco |
|---|---|---|
| `prisma/schema.prisma` | +2 models, +enums se necessário | **Schema-push gate:** plan deve ter task `[BLOCKING]` `pnpm prisma db push` antes de qualquer task que use `@prisma/client` para os novos models |
| `src/app/(vault)/financeiro/page.tsx` | +carga de expenses/categories no `Promise.all`, +props | Baixo — extensão aditiva |
| `src/app/(vault)/financeiro/page-client.tsx` | +section condicional para `?tab=despesas` | Médio — touchpoint com Phase 19; **não alterar** a section de Cobranças |
| `src/app/(vault)/financeiro/actions.ts` | +9 actions (3 categorias + 3 despesas + 3 receipts) | Médio — arquivo cresce; manter ordenação alfabética ou agrupada por domínio |

---

## Files NOT to Touch (out of scope)

- `src/app/(vault)/financeiro/components/charge-side-panel.tsx` — Phase 19, congelado
- Os 3 call sites existentes que instanciam `Intl.NumberFormat` localmente (`page-client.tsx:26`, `actions.ts:134`, `agenda/page.tsx:256`) — refactor de `formatBRL` para Phase 19 fica para outra phase
- `src/middleware.ts` — `(vault)` já protegido, sem mudança
- `src/app/globals.css` — UI-SPEC § Pre-Population Sources confirma 100% reuso de tokens existentes; sem novo token
- Qualquer coisa em `src/lib/finance/`, `src/lib/appointments/`, `src/lib/patients/` — apenas referência, nunca edição

---

## Risk Heatmap

| Componente | Risco | Mitigação |
|---|---|---|
| Materialização de série em fim de mês | Médio (date math edge case) | Test `series.test.ts` cobre 31/01 → 28/02 → 31/03 explicitamente |
| Bucket `expense-receipts` não criado em produção | Alto (deploy quebra) | Manual checkpoint no plan 03 com instrução literal de Supabase Dashboard |
| `?tab=despesas` quebrar SSR | Médio (deep-link UX) | Tab inicial vem de `searchParams` no server component, não `useState` client |
| SECU-05 violação (vazamento de `amountInCents` em audit) | **Crítico** (compliance) | Test `audit.test.ts` é negative test obrigatório; checker faz grep adicional |
| Concorrência em update de série (12 inserts) | Baixo (read-modify-write) | `prisma.$transaction` em `bulkUpdate` |
| Drag-drop quebrar em browsers antigos | Baixo (target = navegadores modernos) | Fallback `<input type="file">` sempre presente |

---

## Wave Recommendation (planner usa como guia)

- **Wave 0** (BLOCKING): schema Prisma + `db push`. Tudo depende disto.
- **Wave 1** (paralelizável):
  - Plan 01 — Categorias (model/repo/store/audit/tests)
  - Plan 02 — Despesas domain (model/series/repo/store/audit/tests)
  - Plan 03 — Storage helpers + upload validation + tests
- **Wave 2** (depende de Wave 1):
  - Plan 04 — Server actions (depende de 01, 02, 03)
  - Plan 05 — UI components (depende de 04 para chamar actions)
- **Wave 3** (depende de Wave 2):
  - Plan 06 — Filtros, URL state, a11y audit (depende de 05)

Plan 04 e Plan 05 podem rodar parcialmente em paralelo se os contratos das actions forem
escritos primeiro (interface-first), mas a recomendação default é sequencial para evitar
bloqueio mútuo.
