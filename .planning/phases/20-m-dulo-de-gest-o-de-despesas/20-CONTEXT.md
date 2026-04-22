# Phase 20: Módulo de Gestão de Despesas - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

CRUD de despesas operacionais do consultório (data, valor, descrição, categoria, comprovante anexado), com suporte a recorrência (mensal/quinzenal) e gestão de categorias. Esta fase entrega o pilar de "saídas" do fluxo de caixa — relatórios consolidados (DRE, gráficos, exportação IRPF) ficam em Phase 22; emissão de recibos PDF fica em Phase 21.

</domain>

<decisions>
## Implementation Decisions

### Modelo de Dados
- **D-01:** Criar tabela `ExpenseCategory` workspace-scoped (id, workspaceId, name, isActive, createdAt, updatedAt) com seed inicial sugerido: Aluguel, Supervisão, Materiais, Impostos, Marketing, Outros. Psicólogo pode renomear, adicionar e desativar (soft via `isActive`); categorias desativadas não aparecem em novos lançamentos mas continuam visíveis em despesas históricas.
- **D-02:** Criar tabela `Expense` workspace-scoped com: id, workspaceId, date, amountInCents, description, categoryId (FK), seriesId (nullable), seriesIndex (nullable), seriesPattern (nullable: "MENSAL" | "QUINZENAL"), receiptStorageKey (nullable), receiptFileName (nullable), receiptMimeType (nullable), receiptFileSize (nullable), createdAt, updatedAt, deletedAt, deletedByAccountId.
- **D-03:** IDs com prefixo do projeto: `exp_` para Expense, `excat_` para ExpenseCategory.
- **D-04:** Repository pattern obrigatório: `src/lib/expenses/repository.ts` (interface), `repository.prisma.ts` (impl), `store.ts` (singleton via globalThis). Idem para categorias.

### Recorrência
- **D-05:** Suportar dois padrões nesta fase: **Mensal** e **Quinzenal**. Anual fica deferido para fase futura.
- **D-06:** Materializar instâncias futuras na criação — gravar **12 ocorrências adiante** com mesmo `seriesId` e `seriesIndex` incremental. Cada instância é um registro físico em `Expense`, editável/excluível individualmente. Mesmo padrão arquitetural usado em `Appointment` (`series_id` + `series_index` + `series_pattern`).
- **D-07:** Comprovante (`receiptStorageKey`) vive no nível da **instância**, não da série. Cada mês tem seu próprio boleto/recibo.
- **D-08:** Edição/exclusão de instância recorrente DEVE perguntar escopo ao usuário: **"Apenas esta"** / **"Esta e futuras"** / **"Toda a série"** (padrão Google Calendar). UI deste prompt deve ser um confirm modal antes de aplicar a mutation.

### Localização e Navegação
- **D-09:** Despesas vivem como **nova aba dentro de `/financeiro`**, ao lado de Receitas/Cobranças e Inadimplência (Phase 19). Reaproveita `<Tabs>`, `PageHeader`, seletor de mês/ano e layout existente. Não cria item separado na sidebar.
- **D-10:** CRUD de Categorias acionado por botão **"Gerenciar categorias"** no topo da aba Despesas, abrindo um **modal** (não drawer — categoria é configuração, não fluxo principal). Modal lista categorias com inline edit, toggle ativo/inativo e botão "+ Nova categoria".

### Listagem e Filtros
- **D-11:** Visualização padrão: **lista cronológica densa** (estilo extrato bancário, mesmo padrão da Phase 19) com colunas: data, descrição, categoria (badge), valor, indicadores (ícone de comprovante anexado, ícone de recorrência). Cada linha clicável abre drawer de edição.
- **D-12:** **Toggle no topo** permite alternar para **agrupamento por categoria** com subtotais por grupo. Estado do toggle persistido em URL (`?view=cronological|by-category`).
- **D-13:** Filtros disponíveis: mês/ano (mesmo seletor já existente em `/financeiro`), categoria (dropdown), range de valor (min/max), busca textual em descrição. Filtros refletidos em URL searchParams para deep-linking.
- **D-14:** **StatCards no topo** da aba: (1) Total do mês, (2) Quantidade de despesas, (3) Maior categoria do mês (nome + valor). Reutiliza componente `StatCard` existente. Sem gráficos/comparações nesta fase — isso vai para Phase 22.

### Fluxo de Criação (Drawer)
- **D-15:** Criação via **drawer lateral controlado por URL**: `?drawer=despesa-nova` (padrão consolidado em Phase 19, D-04). Reutilizar abordagem do `ChargeSidePanel` existente (focus trap, Escape fecha, `<dialog>` semântico, `--z-modal`).
- **D-16:** Campos do drawer (na ordem): data (default = hoje), valor (input com máscara de moeda BRL), descrição (textarea curto), categoria (select de categorias ativas + link "Gerenciar"), recorrência (toggle: "Única" | "Mensal" | "Quinzenal"; se recorrente, mostrar campo "Repetir por X meses" com default 12).
- **D-17:** Upload do comprovante acontece **após o salvamento inicial** dos campos. Fluxo: usuário preenche → "Salvar" → drawer revela área de upload (drag & drop + file input) → upload é etapa opcional (botão "Concluir" sempre disponível). Despesa pode ser criada sem comprovante e ter comprovante anexado depois (via edição).
- **D-18:** Edição usa o mesmo drawer com `?drawer=despesa-{id}`. Todos os campos editáveis. Sem restrição temporal — psicólogo pode corrigir lançamentos antigos.

### Anexo de Comprovante
- **D-19:** Storage via **Supabase Storage** em novo bucket `expense-receipts` (paralelo ao bucket `signatures` já em uso). Decisões finas (RLS policies, tipos MIME aceitos, tamanho máximo, geração de signed URLs para visualização) ficam à discreção do agente seguindo o padrão estabelecido em `src/app/(vault)/setup/actions.ts` (upload de assinatura) e `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` (signed URL para download).
- **D-20:** Um anexo por despesa (1:1). Substituir comprovante substitui o arquivo (gera evento de auditoria). Remover comprovante mantém a despesa (gera evento de auditoria).

### Edição, Exclusão e Auditoria
- **D-21:** Edição livre via drawer (sem restrição de janela temporal).
- **D-22:** Exclusão usa **soft delete** (`deletedAt` + `deletedByAccountId`), padrão estabelecido no projeto. Despesas excluídas ficam fora de listagens e totais mas permanecem no banco para auditoria.
- **D-23:** Eventos de auditoria a registrar (via `AuditEvent`):
  - `expense.created`
  - `expense.updated`
  - `expense.deleted`
  - `expense.receipt_attached`
  - `expense.receipt_replaced`
  - `expense.receipt_removed`
  - `expense.series_modified` (com escopo: "single" | "this_and_future" | "all_series")
  - `expense_category.created`
  - `expense_category.updated`
  - `expense_category.deactivated`
- **D-24:** **Política de segurança herdada do SECU-05 (SessionCharge):** `amountInCents` NUNCA pode aparecer em metadata de auditoria. Apenas `expenseId`, `categoryId`, `seriesId`, `subjectLabel` (descrição truncada) e tipo de operação são seguros. Mesma regra aplica a comprovantes — não logar `storageKey` em metadata pública.

### the agent's Discretion
- **Anexo de comprovante (área não selecionada para discussão):** decisões finais sobre RLS policies do bucket `expense-receipts`, tipos MIME aceitos (sugestão: PDF, JPG, PNG), tamanho máximo (sugestão: 10MB), preview de PDF inline vs apenas download, e estratégia de cleanup de arquivos órfãos.
- Estilo visual exato dos badges de categoria (cor por categoria? cor neutra única?).
- Componentes/estrutura interna do drawer e do modal de gerenciar categorias.
- Estratégia de invalidação de cache do Next.js após mutations (revalidatePath vs revalidateTag).
- Mensagem exata do modal de confirmação de escopo em série recorrente.
- Implementação técnica do toggle "cronológico vs por categoria" (componente novo ou reaproveitar Tabs).
- Comportamento exato quando série recorrente cruza limites de mês/ano no seletor (ex: criar em Jan/26 com 12 meses materializa até Dez/26).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements e escopo
- `.planning/REQUIREMENTS.md` § Despesas — DESP-01, DESP-02, DESP-03 (lançar, categorizar, anexar).
- `.planning/PROJECT.md` § Current Milestone v1.2 — escopo geral do milestone.
- `.planning/ROADMAP.md` § Phase 20 — Goal e Success Criteria; declara Phase 19 como dependência.

### Padrões herdados de fase anterior
- `.planning/phases/19-refatora-o-ux-ui-finan-as/19-CONTEXT.md` — Decisões D-01 (lista densa estilo extrato), D-02 (drawer lateral), D-04 (URL state) que esta fase replica.

### Stack e convenções do projeto
- `CLAUDE.md` — Stack, repository pattern, domain models, server actions, vocabulário pt-BR (paciente, atendimento, prontuário), regras de UI (sem inline styles novos, CSS tokens, sem gradientes/glassmorphism).
- `prisma/schema.prisma` § `SessionCharge` (linhas 274-295) — modelo de referência para campos workspace-scoped, índices `[workspaceId, ...]`, soft delete, naming snake_case.
- `prisma/schema.prisma` § `Appointment` (linhas 126-177) — referência canônica para padrão de série recorrente (`seriesId`, `seriesIndex`, `seriesPattern`, `seriesDaysOfWeek`).
- `prisma/schema.prisma` § `SignatureAsset` (linhas 91-104) — referência canônica para modelar campos de arquivo (storageKey, fileName, mimeType, fileSize, uploadedAt).

### Componentes e padrões de implementação
- `src/lib/finance/model.ts` — referência de domain model (factories puras com injeção de `now` + `createId`, sem dependência de Prisma).
- `src/lib/finance/repository.ts` e `repository.prisma.ts` — referência do repository pattern aplicado a domínio financeiro.
- `src/lib/finance/audit.ts` — referência canônica de auditoria financeira respeitando SECU-05 (jamais logar `amountInCents`).
- `src/app/(vault)/financeiro/page.tsx` — server component com `resolveSession()`, padrão de carregamento via repository + Promise.all, parsing de searchParams.
- `src/app/(vault)/financeiro/page-client.tsx` — client component com tabs, layout e gestão de URL params.
- `src/app/(vault)/financeiro/components/charge-side-panel.tsx` — referência do padrão de drawer lateral via `<dialog>`, focus trap, Escape close.
- `src/app/(vault)/setup/actions.ts` § linha 75 (`supabase.storage.upload`) — padrão de upload para Supabase Storage.
- `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` § linha 84 (`createSignedUrl`) — padrão de signed URL para download de arquivo privado.
- `src/components/ui/tabs.tsx`, `card.tsx`, `list.tsx`, `stat-card.tsx`, `badge.tsx`, `masked-input.tsx`, `submit-button.tsx`, `page-header.tsx`, `section.tsx` — biblioteca UI a reutilizar.

### Arquitetura
- `.planning/STATE.md` § Accumulated Context — decisões herdadas (separação UX/features, modais via URL).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/components/ui/tabs.tsx`**: Para adicionar a aba "Despesas" ao lado de Receitas/Inadimplência em `/financeiro/page-client.tsx`.
- **`src/components/ui/stat-card.tsx`**: Para os 3 StatCards do topo (total, qtd, maior categoria).
- **`src/components/ui/list.tsx`** + **`badge.tsx`**: Para a lista densa cronológica e badges de categoria.
- **`src/components/ui/masked-input.tsx`**: Já existe — usar para o input de valor BRL e data no drawer.
- **`src/app/(vault)/financeiro/components/charge-side-panel.tsx`**: Modelo direto para o `ExpenseSidePanel` (focus trap, Escape, `<dialog>` semântico, URL-controlled).
- **`src/lib/finance/*`**: Toda a estrutura de finance é o template arquitetural a clonar para `src/lib/expenses/*` e `src/lib/expense-categories/*`.
- **`src/lib/audit/events.ts`** + **`src/lib/finance/audit.ts`**: Padrão de eventos de auditoria respeitando SECU-05.
- **Bucket Supabase `signatures`** (em uso por `SignatureAsset`): modelo de bucket privado com signed URLs para download.

### Established Patterns
- **Repository pattern obrigatório**: nunca chamar Prisma direto em components/actions — sempre via interface em `lib/[domain]/repository.ts`. Singleton via `globalThis` em `store.ts`.
- **Domain models puros**: factories em `model.ts` com injeção de `now` e `createId` para testabilidade. Tipos canônicos separados de tipos Prisma.
- **Workspace scoping em toda query**: índices compostos `[workspaceId, ...]`, `resolveSession()` em todo server entry point.
- **URL como source of truth para UI state**: drawer, filtros, tabs, mês/ano — todos refletidos em searchParams.
- **Soft delete padrão**: `deletedAt` + `deletedByAccountId` em vez de `DELETE FROM`.
- **Estilo inline com CSS vars**: `style={{ ... } satisfies React.CSSProperties}` usando `var(--radius-md)`, `var(--shadow-sm)`, etc. Sem Tailwind.
- **Recorrência como série materializada**: `Appointment` já estabeleceu o pattern (`series_id` + `series_index` + `series_pattern`).
- **Vocabulário pt-BR obrigatório**: paciente (não cliente/usuário), atendimento (não sessão genérica), prontuário (não ficha).
- **Auditoria privada de valores**: SECU-05 — `amountInCents` jamais em metadata de evento.

### Integration Points
- **`src/app/(vault)/financeiro/page-client.tsx`**: precisa receber a nova aba "Despesas" no `<Tabs>`. Adicionar prop `expenses`/`categories`/`expenseSummary` e branch de render.
- **`src/app/(vault)/financeiro/page.tsx`**: server component carrega despesas em paralelo com cobranças via `Promise.all`. Adicionar `getExpenseRepository()` e `getExpenseCategoryRepository()` calls.
- **`src/middleware.ts`**: já protege `(vault)` — nenhum ajuste necessário.
- **`prisma/schema.prisma`**: adicionar `model Expense`, `model ExpenseCategory`, com relações para `Workspace`. Migration nova.
- **Supabase Storage**: criar bucket `expense-receipts` (privado) com RLS policies análogas ao bucket `signatures`.
- **Sidebar**: nenhum ajuste — Despesas vive dentro de `/financeiro`.

</code_context>

<specifics>
## Specific Ideas

- "Aba Despesas dentro de Financeiro, igual extrato bancário, mesmo padrão visual da Phase 19."
- "Recorrência como o Google Calendar: ao editar/excluir uma ocorrência, perguntar 'esta / esta e futuras / toda a série'."
- "ExpenseCategory editável pelo psicólogo, com seed inicial — alguns vão querer renomear 'Marketing' para 'Divulgação' ou similar."
- "Comprovante é por instância — cada mês tem seu boleto."
- "Upload em duas etapas no drawer: salva os campos básicos primeiro, depois revela área de upload (anexar é opcional)."
- "Auditoria respeita SECU-05 do SessionCharge — nunca logar valor monetário em AuditEvent."

</specifics>

<deferred>
## Deferred Ideas

- **Recorrência anual** (anuidade CRP, seguros) — adicionar quando houver demanda real.
- **Status de pagamento da despesa** (paga/a pagar + data de pagamento) — útil para fluxo de caixa projetado, mas adiciona complexidade. Reavaliar em Phase 22 quando o DRE expor a necessidade.
- **Vincular despesa a paciente específico** (caso raro: deslocamento para atendimento domiciliar) — fora do escopo desta fase.
- **Centro de custos / rateio entre múltiplos consultórios** — explicitamente Out of Scope em REQUIREMENTS.md.
- **Exportação de despesas para CSV/IRPF** — Phase 22 (RELA-02).
- **Gráficos de evolução e comparação inter-mensal de despesas** — Phase 22 (RELA-03).
- **Decimal ano nos lançamentos congelados (edição restrita ao mês corrente)** — não adotado nesta fase, mas vale revisitar se contadores reclamarem.

</deferred>

---

*Phase: 20-m-dulo-de-gest-o-de-despesas*
*Context gathered: 2026-04-22*
