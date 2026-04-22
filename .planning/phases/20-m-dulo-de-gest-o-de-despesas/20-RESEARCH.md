---
phase: 20-m-dulo-de-gest-o-de-despesas
phase_number: "20"
type: research
date: 2026-04-22
researcher: gsd-phase-researcher (inline)
requirements: [DESP-01, DESP-02, DESP-03]
depends_on_phases: [19]
---

<objective>
Pesquisa de implementação para o **Módulo de Gestão de Despesas** (Phase 20). O escopo
está congelado em `20-CONTEXT.md` (24 decisões D-01..D-24) e o contrato visual em
`20-UI-SPEC.md`. Este documento responde apenas: **como** construir, **com o quê** já
existente no PsiLock, e **quais armadilhas** evitar — sem reabrir decisões.
</objective>

## Standard Stack

Tudo que o módulo precisa **já está em `package.json`**. Nenhuma nova dependência será
introduzida (regra de CLAUDE.md: "não adicionar features além do pedido").

| Necessidade | Lib/API | Versão | Justificativa |
|---|---|---|---|
| ORM + schema | `prisma` / `@prisma/client` | 6.x | Padrão do projeto. `Expense` e `ExpenseCategory` entram em `prisma/schema.prisma`. |
| Storage de comprovantes | `@supabase/supabase-js` (client server-side via `@/lib/supabase/server`) | 2.99 | Mesmo cliente usado em `src/app/(vault)/setup/actions.ts` (signatures) e `.../documents/[documentId]/pdf/route.ts` (signed URLs). Bucket privado novo: `expense-receipts`. |
| Datas / recorrência | `date-fns` | ^4.1 | Já listado em `package.json` mas **sem uso atual no `src/`**. Vamos introduzir `addMonths` e `addDays` para materialização de séries. Não introduzir `dayjs` nem alternativas. |
| Validação de form | nativo (FormData + checagem manual no server action) | — | Mesmo padrão de `saveSignatureAssetAction` (linhas 56–66 de `src/app/(vault)/setup/actions.ts`). Não introduzir Zod ainda — fora do pedido. |
| Cache invalidation | `revalidatePath` de `next/cache` | Next 15 | Padrão estabelecido em Phase 5 e reutilizado em todo `src/app/(vault)/financeiro/actions.ts`. |
| Formatação BRL | `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` | nativo | Já é o padrão de Phase 19 (ver `formatBRL` em `src/lib/finance/format.ts` se existir, ou helpers em `charge-side-panel.tsx`). |
| Testes | `vitest` (node env, globals) | — | Todos os testes em `tests/**/*.test.ts`, repositórios in-memory (regra CLAUDE.md). |

**Don't introduce:** Zod, react-hook-form, dropzone libraries (use HTML5 nativo + drag-and-drop API), `dayjs`, `moment`, qualquer lib de currency/money — `Intl` resolve.

## Architecture Patterns

### 1. Repository pattern (clone literal de `src/lib/finance/`)

`src/lib/finance/` é o **template canônico**. Cada novo domínio espelha exatamente:

```
src/lib/expense-categories/
  model.ts            ← tipo ExpenseCategory + factory createExpenseCategory(input, deps)
  repository.ts       ← interface ExpenseCategoryRepository (in-memory + assinaturas)
  repository.prisma.ts ← PrismaExpenseCategoryRepository implements ExpenseCategoryRepository
  store.ts            ← singleton via globalThis (mesmo shape de finance/store.ts)
  audit.ts            ← wrappers para emitir expense_category.* events

src/lib/expenses/
  model.ts            ← tipo Expense + factory createExpense(input, deps) com seriesId/seriesIndex
  series.ts           ← materializeSeries(input, deps) e applySeriesEdit(scope, ...) puros
  repository.ts       ← interface ExpenseRepository
  repository.prisma.ts
  store.ts
  audit.ts            ← expense.created/updated/deleted/receipt_attached/receipt_replaced/receipt_removed/series_updated/scope_changed
```

**Regra inviolável (CLAUDE.md):** nenhum `import { prisma }` fora de `repository.prisma.ts`.
Server actions chamam o store, store retorna repositório, repositório fala com Prisma.

### 2. IDs com prefixo (CLAUDE.md + CONTEXT D-01)

**Não existe `src/lib/ids.ts` no projeto.** O padrão real (verificado em
`src/app/(vault)/financeiro/actions.ts:9`, `patients/actions.ts:21`,
`appointments/actions.ts:36`) é: factories aceitam `createId: () => string` como
dep e **o call site monta o prefixo**:

```ts
// src/app/(vault)/financeiro/actions.ts (já existe, linha 9)
const createId = () => `chg_${crypto.randomUUID().slice(0, 12)}`;
```

Para Despesas, o mesmo arquivo de actions ganha (no topo):

```ts
const createExpenseId = () => `exp_${crypto.randomUUID().slice(0, 12)}`;
const createExpenseCategoryId = () => `excat_${crypto.randomUUID().slice(0, 12)}`;
const createExpenseSeriesId = () => `expser_${crypto.randomUUID().slice(0, 12)}`;
```

Os tests in-memory injetam um `createId` determinístico (counter) — mesmo padrão de
`tests/finance/*.test.ts`. Não criar `src/lib/ids.ts` — não é o estilo do projeto e
fugiria de "não criar arquivos desnecessários" (CLAUDE.md).

### 3. Workspace scoping (CLAUDE.md: "todo query deve ter escopo de workspaceId")

Toda query do `PrismaExpenseRepository` e `PrismaExpenseCategoryRepository` recebe
`workspaceId` como **primeiro argumento obrigatório**. Índice composto
`@@index([workspaceId, deletedAt])` em ambas as tabelas (mesmo padrão de `SessionCharge`
em `prisma/schema.prisma`).

### 4. Soft delete (CLAUDE.md + CONTEXT D-15)

Campos `deletedAt DateTime?` e `deletedByAccountId String?` em ambas as tabelas. Toda
query de leitura filtra `deletedAt: null` por default; método explícito
`findIncludingDeleted` quando o caso de uso pedir (auditoria). Não há hard delete.

### 5. Server actions por colocação (CLAUDE.md)

Despesas estendem o arquivo existente `src/app/(vault)/financeiro/actions.ts` em vez de
criar `expenses-actions.ts` separado — Phase 19 manteve um único arquivo de actions e
isso facilita o wiring no `page-client.tsx`. Cada action:

1. `"use server"` no topo (já está)
2. `await resolveSession()` → obtém `accountId`, `workspaceId`, `role`
3. Validação de role (qualquer membro do workspace pode lançar despesa — CONTEXT não
   restringe a admin; manter consistente com Phase 19 charges)
4. Chama o store (`getExpenseStore().repository`)
5. Emite audit event via `createAuditEvent` de `src/lib/audit/events.ts`
6. `revalidatePath("/financeiro")` no fim

### 6. Materialização de série (CONTEXT D-02, D-03)

Função pura em `src/lib/expenses/series.ts`:

```ts
export function materializeSeries(
  input: { firstOccurrenceDate: Date; pattern: "MENSAL" | "QUINZENAL"; ... },
  deps: { now: () => Date; createId: (prefix: string) => string },
): Expense[] {
  const seriesId = deps.createId("expser");
  const occurrences: Expense[] = [];
  for (let i = 0; i < 12; i++) {
    const dueDate =
      input.pattern === "MENSAL"
        ? addMonths(input.firstOccurrenceDate, i)
        : addDays(input.firstOccurrenceDate, 14 * i);
    occurrences.push(
      createExpense({ ...input, seriesId, seriesIndex: i, dueDate }, deps),
    );
  }
  return occurrences;
}
```

E `applySeriesEdit(scope: "this" | "this_and_future" | "all", ...)` espelhando
o que appointments faz (ver `seriesPattern` em `prisma/schema.prisma:154`). **Não
unificar enums com Appointments** — appointments usa `"WEEKLY" | "BIWEEKLY" |
"TWICE_WEEKLY"`, expenses usa `"MENSAL" | "QUINZENAL"`. Domínios distintos, vocabulários
distintos (UI em pt-BR para despesas).

### 7. Storage de comprovantes (CONTEXT D-19)

Padrão extraído de `src/app/(vault)/setup/actions.ts:68-90`:

```ts
const supabase = await createClient(); // de @/lib/supabase/server
const storageKey = `${workspaceId}/${expenseId}/${crypto.randomUUID()}-${file.name}`;
const { error } = await supabase.storage
  .from("expense-receipts")
  .upload(storageKey, await file.arrayBuffer(), { contentType: file.type });
```

Para download/preview: padrão de `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts:84`:

```ts
const { data } = await supabase.storage
  .from("expense-receipts")
  .createSignedUrl(storageKey, 120); // 2 minutos
```

Bucket `expense-receipts` é **privado**. Acesso só via signed URL gerada server-side
em rota API dedicada `src/app/api/expenses/[expenseId]/receipt/route.ts` (mesma forma
da rota de PDF). RLS no Supabase: deny-all por default; signed URLs ignoram RLS.

**Validações no server action** (espelhar `setup/actions.ts:60-66`):
- MIME ∈ `["application/pdf", "image/jpeg", "image/png"]` (CONTEXT D-19)
- size ≤ 10 MB (CONTEXT D-19) → `MAX_FILE_SIZE = 10 * 1024 * 1024`
- nome de arquivo: passar pelo mesmo `sanitizeFilename` se exposto em download

### 8. Integração com `/financeiro` (decisão arquitetural)

CONTEXT D-09 diz: "Despesas vive como nova aba dentro de `/financeiro`, ao lado de
Receitas/Cobranças e Inadimplência". Mas o `src/app/(vault)/financeiro/page-client.tsx`
**atual** não tem `<Tabs>` de top-level entre Receitas/Cobranças/Inadimplência — isso
é tudo uma única tela (Cobranças com filtros). O `<Tabs>` existente é só para
`Extrato`/`Atrasados` dentro da listagem.

**Recomendação (registrar no plano, não reabrir com o user):** adicionar Despesas como
uma **section toggleável via `?tab=despesas`** no mesmo `page-client.tsx`, usando o
mesmo padrão de `searchParamKey="tab"` já presente no Tabs interno. Quando
`?tab=despesas`, esconde a section de Cobranças e mostra a de Despesas. Isso:

1. Honra a URL contract de UI-SPEC (`?tab=despesas`)
2. Não força refactor de Receitas/Cobranças/Inadimplência (fora do escopo)
3. Mantém um único arquivo `page.tsx` carregando tudo em paralelo (`Promise.all`)

Se o user objetar depois, o refactor para top-level Tabs é trivial — toda a lógica de
Despesas vive em componentes próprios, isolada.

## Don't Hand-Roll

| Não escreva | Use isso |
|---|---|
| Geração de UUID | `crypto.randomUUID()` (nativo, já usado em `setup/actions.ts:69`) |
| Geração de IDs com prefixo | call site monta inline: `` `exp_${crypto.randomUUID().slice(0, 12)}` `` (mesmo padrão de `chg_` em `financeiro/actions.ts:9`). **Não criar `src/lib/ids.ts`** — não existe e não é o estilo do projeto. |
| Date math (somar mês, somar 14 dias) | `addMonths`, `addDays` de `date-fns` |
| Formatação BRL | `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` — copiar helper de Phase 19 |
| `tabular-nums` em valores monetários | `fontVariantNumeric: "tabular-nums"` inline (CSS var não aplica aqui) — UI-SPEC seção Tipografia |
| Drag-and-drop file upload | HTML5 nativo: `onDragOver` + `onDrop` no container, `<input type="file" hidden />` para fallback. Sem `react-dropzone`. |
| Componente de drawer/side panel | Reusar `src/app/(vault)/financeiro/components/charge-side-panel.tsx` como base estrutural (largura 26rem, header sticky, footer sticky com CTAs) |
| Modal de confirmação | Reusar componente já existente em `src/components/ui/` (procurar `dialog`/`modal`/`confirm`); se não existir, ver como Phase 19 fez RecurrenceScopeDialog para appointments |
| Audit event creation | `createAuditEvent({ workspaceId, actor, eventType, entityId, metadata })` de `src/lib/audit/events.ts` |
| Supabase client server-side | `await createClient()` de `@/lib/supabase/server` (mesmo de `setup/actions.ts:73`) |
| Workspace + role resolution | `await resolveSession()` (já usado em todo `(vault)/`) |
| Cache invalidation | `revalidatePath("/financeiro")` |
| Componente de input com máscara | `src/components/ui/masked-input.tsx` (já existe — ver Phase 19) |

## Common Pitfalls

1. **SECU-05 (carry-over de Phase 5):** **JAMAIS** incluir `amountInCents` no
   `metadata` de qualquer audit event `expense.*`. Auditoria só registra
   `entityId`, `actorId`, `eventType` e metadata **não-financeiro** (ex.:
   `categoryId`, `recurrencePattern`, `seriesScope`). Plan-checker irá grep por
   `amountInCents` em `src/lib/expenses/audit.ts` e falhar se aparecer.

2. **`seriesId` precisa ser estável:** ao materializar 12 ocorrências, todas
   compartilham o mesmo `seriesId` gerado **uma vez** no início do loop. Bug
   clássico: gerar dentro do loop → cada ocorrência vira sua própria série.

3. **Date math em fim de mês:** `addMonths(new Date("2026-01-31"), 1)` retorna
   `2026-02-28` (date-fns clampa). Documentar isso no UI ou aceitar o
   comportamento — CONTEXT não trata. Recomendação: aceitar (date-fns default),
   adicionar teste vitest cobrindo 31/01 → 28/02 → 31/03 → 30/04.

4. **Quinzenal não é "metade do mês":** CONTEXT D-02 + UI-SPEC tratam quinzenal
   como **+14 dias fixos**, não dia 1 e dia 15. Usar `addDays(d, 14 * i)`,
   nunca `setDate(15)`.

5. **`?tab=despesas` precisa ser server-readable:** o `page.tsx` é Server
   Component, então o tab inicial vem de `searchParams.tab`. Não fazer toda
   troca de aba ser client-only — quebra deep-link e SSR.

6. **`Promise.all` no `page.tsx`:** carregar `expenses`, `categories`,
   `charges`, `payments` em **paralelo**. Padrão atual de `financeiro/page.tsx`
   já faz isso para Phase 19 — estender o array, não criar `await` sequencial.

7. **Drag-drop reveals após save (CONTEXT D-21):** o ReceiptDropZone só aparece
   **depois** que o usuário salva os campos da despesa (porque precisa de
   `expenseId` para a key do storage). Drawer é fluxo de 2 passos: (1) preencher
   + salvar → (2) zona de upload aparece, opcional. Não tentar fazer upload
   pré-save com chave temporária — complica e quebra o modelo.

8. **Bucket criação:** o bucket `expense-receipts` precisa ser criado no
   Supabase Dashboard ou via migration SQL (`storage.create_bucket('expense-receipts', false)`).
   Plano vai incluir uma task `[BLOCKING]` que documenta isso e roda
   `pnpm prisma db push` para o schema. Bucket creation é **manual no Supabase**,
   não há CLI no projeto — o plano deve ter um checkpoint humano para confirmar.

9. **`revalidatePath` não invalida client-side cache:** após criar/editar
   despesa via server action, o `useState` no `page-client.tsx` continua com
   dados antigos até o server re-render. Padrão de Phase 19: a action retorna
   o registro novo/atualizado e o componente cliente faz `setExpenses(prev =>
   ...)` + `revalidatePath` em paralelo.

10. **Vocabulário pt-BR (CLAUDE.md):** todos os labels, helpers, error toasts e
    nomes de eventos de auditoria (na UI; o `eventType` no banco fica em snake_case
    en) em **português**. Ex.: `"Categoria criada"`, não `"Category created"`.
    Nomes de **código** (variáveis, types, funções) ficam em inglês — **só a UI**
    é pt-BR. CONTEXT.md e UI-SPEC.md já trazem todos os textos exatos; copiar
    literalmente, não traduzir de novo.

11. **`tabular-nums` é por elemento, não global:** aplicar
    `style={{ fontVariantNumeric: "tabular-nums" }}` em **cada** `<span>` que
    renderiza valor monetário. Não tentar setar no `<body>` — afetaria
    tipografia geral indevidamente.

12. **Sem Tailwind, sem shadcn (CLAUDE.md):** todos os estilos via inline
    `satisfies React.CSSProperties` + CSS vars de `src/app/globals.css`.
    Sombras só `var(--shadow-sm)` ou `var(--shadow-md)`. Sem gradientes
    decorativos, sem glassmorphism, sem badges "novo".

## Code Examples

### Exemplo 1 — `Expense` model factory (espelhando `finance/model.ts`)

```ts
// src/lib/expenses/model.ts
import type { Expense, ExpenseRecurrencePattern, SeriesScope } from "./types";

export interface CreateExpenseInput {
  workspaceId: string;
  categoryId: string;
  description: string;
  amountInCents: number;
  dueDate: Date;
  recurrencePattern?: ExpenseRecurrencePattern; // "MENSAL" | "QUINZENAL"
  seriesId?: string;
  seriesIndex?: number;
  receiptStorageKey?: string;
  createdByAccountId: string;
}

export interface CreateExpenseDeps {
  now: () => Date;
  createId: (prefix: "exp") => string;
}

export function createExpense(
  input: CreateExpenseInput,
  deps: CreateExpenseDeps,
): Expense {
  return {
    id: deps.createId("exp"),
    workspaceId: input.workspaceId,
    categoryId: input.categoryId,
    description: input.description,
    amountInCents: input.amountInCents,
    dueDate: input.dueDate,
    recurrencePattern: input.recurrencePattern ?? null,
    seriesId: input.seriesId ?? null,
    seriesIndex: input.seriesIndex ?? null,
    receiptStorageKey: input.receiptStorageKey ?? null,
    createdAt: deps.now(),
    updatedAt: deps.now(),
    createdByAccountId: input.createdByAccountId,
    deletedAt: null,
    deletedByAccountId: null,
  };
}
```

### Exemplo 2 — Audit event sem `amountInCents` (SECU-05)

```ts
// src/lib/expenses/audit.ts
import { createAuditEvent } from "@/lib/audit/events";

export async function recordExpenseCreated(args: {
  workspaceId: string;
  actorId: string;
  expenseId: string;
  categoryId: string;
  recurrencePattern: "MENSAL" | "QUINZENAL" | null;
}) {
  await createAuditEvent({
    workspaceId: args.workspaceId,
    actor: { type: "account", id: args.actorId },
    eventType: "expense.created",
    entityId: args.expenseId,
    metadata: {
      categoryId: args.categoryId,
      recurrencePattern: args.recurrencePattern,
      // NUNCA: amountInCents, description com valor, etc. — SECU-05
    },
  });
}
```

### Exemplo 3 — Server action com soft delete + scope

```ts
// src/app/(vault)/financeiro/actions.ts (extensão)
"use server";

export async function deleteExpenseAction(
  expenseId: string,
  scope: "this" | "this_and_future" | "all",
) {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getExpenseStore().repository;

  const target = await repo.findById(workspaceId, expenseId);
  if (!target) throw new Error("Despesa não encontrada.");

  await repo.softDeleteWithScope(workspaceId, expenseId, scope, accountId);
  await recordExpenseDeleted({ workspaceId, actorId: accountId, expenseId, scope });

  revalidatePath("/financeiro");
}
```

### Exemplo 4 — Drag-drop nativo (sem lib externa)

```tsx
// trecho de ReceiptDropZone.tsx
const [isDragging, setIsDragging] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);

return (
  <div
    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
    onDragLeave={() => setIsDragging(false)}
    onDrop={(e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    }}
    onClick={() => inputRef.current?.click()}
    style={{
      border: `2px dashed var(--color-border)`,
      borderColor: isDragging ? "var(--color-accent)" : "var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-6)",
      textAlign: "center",
      cursor: "pointer",
    } satisfies React.CSSProperties}
  >
    <input ref={inputRef} type="file" hidden accept="application/pdf,image/jpeg,image/png" onChange={...} />
    {/* copy de UI-SPEC */}
  </div>
);
```

## Validation Architecture

(Mandatório para Nyquist Dimension 8 — `20-VALIDATION.md` é gerado a partir disto.)

### Camadas de validação

1. **Compile-time (TypeScript strict):** todos os types em `src/lib/expenses/types.ts`
   e `src/lib/expense-categories/types.ts` exportados, sem `any`. Plan-checker
   verifica via `pnpm tsc --noEmit`.

2. **Schema-level (Prisma):** constraints em `prisma/schema.prisma`:
   - `amountInCents Int` (não Float — evita drift de ponto flutuante)
   - `@@index([workspaceId, deletedAt])` em `Expense` e `ExpenseCategory`
   - `@@index([workspaceId, dueDate])` em `Expense` (queries de "atrasados", "este mês")
   - `@@index([seriesId])` em `Expense` (operações de scope)
   - FK `categoryId → ExpenseCategory.id` com `onDelete: Restrict` (não dá pra apagar
     categoria com despesas; apenas desativar — CONTEXT D-12)

3. **Server action (runtime):** validações manuais antes de chamar repo:
   - `description.trim().length >= 1 && <= 200` (UI-SPEC limites)
   - `amountInCents > 0` (não permitir negativos nem zero)
   - `categoryId` existe e pertence ao workspace
   - file: MIME + size + presença
   - `recurrencePattern ∈ ["MENSAL", "QUINZENAL"]` ou null
   - `scope ∈ ["this", "this_and_future", "all"]` quando aplicável

4. **Repository (in-memory + Prisma):** assinaturas idênticas via interface,
   garantia de paridade comportamental — testes vitest rodam contra
   in-memory e validam o contrato.

### Estratégia de testes (vitest, `tests/**/*.test.ts`)

| Arquivo de teste | O que cobre |
|---|---|
| `tests/expenses/model.test.ts` | `createExpense` factory: defaults, overrides, soft-delete fields nulos |
| `tests/expenses/series.test.ts` | `materializeSeries` MENSAL: 12 ocorrências, datas corretas, fim de mês (31/01 → 28/02). QUINZENAL: +14 dias fixos. `seriesId` único e compartilhado. |
| `tests/expenses/series.test.ts` | `applySeriesEdit` scope: "this" só altera 1, "this_and_future" altera N a partir do índice, "all" altera os 12 |
| `tests/expenses/repository.test.ts` | InMemory: CRUD básico, workspace isolation, soft delete, listagem filtrando deletedAt |
| `tests/expenses/audit.test.ts` | **Negative test:** `recordExpenseCreated` nunca inclui `amountInCents` no metadata (SECU-05) |
| `tests/expense-categories/model.test.ts` | factory básica |
| `tests/expense-categories/repository.test.ts` | CRUD + desativação + restrict-on-delete-with-references |

### Nyquist 8 dimensões (preview — completas em `20-VALIDATION.md`)

1. **Functional:** server actions retornam `{ ok: true, data }` ou `{ ok: false, error }`. Testes E2E manual via UAT no UI-SPEC.
2. **Data integrity:** workspace scoping em toda query; soft delete; FK Restrict.
3. **Security:** SECU-05 (sem `amountInCents` em audit); RLS no bucket; signed URLs com TTL 120s.
4. **Performance:** índices compostos cobrindo queries por dueDate, seriesId.
5. **Concurrency:** sem locks otimistas; Prisma transactions em operações de série (12 inserts atômicos).
6. **Observability:** todo write emite audit event tipado.
7. **Recoverability:** soft delete permite restore (não há UI ainda — out of scope).
8. **Conformance:** schema + types + UI-SPEC alinhados; checker grep verifica.

## Architectural Decision Log

| ID | Decisão | Rationale |
|---|---|---|
| AD-01 | `expense-receipts` bucket é privado, acesso via signed URL com TTL 120s | Espelha pattern de `signatures` bucket; previne hotlinking |
| AD-02 | Materializar 12 ocorrências eagerly, não lazy | CONTEXT D-02 explícito; permite query simples por mês sem expansão runtime |
| AD-03 | Despesas como section toggleável via `?tab=despesas` no `page-client.tsx`, não top-level Tabs | Phase 19 não criou top-level Tabs — não vamos refatorar fora de escopo. URL contract honrada. |
| AD-04 | `recurrencePattern` enum local (`"MENSAL" \| "QUINZENAL"`), não unificado com `seriesPattern` de Appointments | Domínios distintos, vocabulários distintos |
| AD-05 | Estender `src/app/(vault)/financeiro/actions.ts` em vez de criar `expenses-actions.ts` | Phase 19 manteve arquivo único; consistência |
| AD-06 | Bucket creation é checkpoint manual no Supabase Dashboard | Sem CLI Supabase no projeto; um checkpoint humano antes do deploy resolve |
| AD-07 | Drag-drop nativo HTML5, sem `react-dropzone` | "Não adicionar features além do pedido" (CLAUDE.md) |

## Resolved Questions (verificadas durante pesquisa, não reabrir)

1. ✅ **Geração de ID:** `src/lib/ids.ts` **não existe**. Padrão é inline no call site:
   `` `<prefix>_${crypto.randomUUID().slice(0, 12)}` ``. Adicionar
   `createExpenseId`, `createExpenseCategoryId`, `createExpenseSeriesId` no topo de
   `src/app/(vault)/financeiro/actions.ts`.

2. ✅ **`formatBRL` helper:** **não existe centralizado**. Cada call site instancia
   `new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` (3
   ocorrências em `page-client.tsx:26`, `actions.ts:134`, `agenda/page.tsx:256`).
   Para Despesas: criar `src/lib/expenses/format.ts` exportando `formatBRL` e
   `parseBRLToCents`. **Não** refatorar os 3 call sites existentes (fora de escopo).

3. ✅ **Modal compartilhado:** **não existe** componente `dialog`/`modal`/`confirm` em
   `src/components/ui/`. `RecurrenceScopeDialog` e `ExpenseCategoryModal` precisam
   ser criados. Recomendação: criar `src/components/ui/dialog.tsx` (primitivo
   reusável: overlay + container + close button) e construir os 2 dialogs específicos
   sobre ele em `src/app/(vault)/financeiro/components/`. Isso prepara o terreno
   para futuras consolidações sem refatorar Phase 19.

4. ✅ **`addMonths`/`addDays` de `date-fns`:** lib em `package.json` (^4.1.0) mas
   **sem uso atual no `src/`**. Plans podem importar livremente — não há padrão
   conflitante para honrar.
