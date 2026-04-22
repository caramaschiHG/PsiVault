---
phase: 20
slug: m-dulo-de-gest-o-de-despesas
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-22
---

# Phase 20 — UI Design Contract

> Visual and interaction contract para o módulo de Gestão de Despesas (aba dentro de `/financeiro`). Gerado por gsd-ui-researcher seguindo as decisões fechadas em `20-CONTEXT.md` e os padrões consolidados na Phase 19. Toda decisão visual abaixo é prescritiva — executor implementa exatamente, sem reabrir.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — sistema próprio (CSS vars + inline styles via `React.CSSProperties`) |
| Preset | not applicable — não usa shadcn/Tailwind por decisão de projeto (`CLAUDE.md` § Stack) |
| Component library | nenhuma externa — biblioteca interna em `src/components/ui/*` |
| Icon library | SVG inline (mesmo padrão do `ChargeSidePanel`, `notification-bell`, etc.); stroke `currentColor`, `stroke-width="2"`, `stroke-linecap="round"` |
| Font | `IBM Plex Sans` (UI), `IBM Plex Serif` (títulos editoriais e marca) — já carregadas em `globals.css:1` |

**Componentes a reutilizar (não recriar):**
`<Tabs>`, `<PageHeader>`, `<Section>`, `<Card>`, `<List>`, `<StatCard>`, `<Badge>`, `<StatusBadge>`, `<MaskedInput>`, `<SubmitButton>`, `<Skeleton>`, `<Separator>`, classes utilitárias `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.input-field`, `.row-interactive`, `.tabs-list/.tab`, `.side-panel-overlay/.side-panel-drawer/.side-panel-close`.

**Componentes novos a criar (escopo desta fase):**
- `ExpenseSidePanel` — clone direto de `charge-side-panel.tsx` (mesma largura, mesmas classes CSS, mesmo focus-trap; trocar `aria-label`).
- `ExpenseCategoryModal` — modal centralizado para CRUD de categorias.
- `ReceiptDropZone` — área de upload (drag & drop + `<input type="file">`) renderizada dentro do drawer após salvar.
- `RecurrenceScopeDialog` — confirm modal "esta / esta e futuras / toda a série".
- `ExpenseList` (cronológico) e `ExpenseGroupedList` (por categoria) — wrappers em torno de `<List>` existente.
- `ExpenseViewToggle` — toggle binário cronológico/por categoria sincronizado com `?view=`.

---

## Spacing Scale

Tokens existentes em `globals.css:95-107`. **NÃO declarar valores em px novos.** Usar SEMPRE as CSS vars `--space-*`. Todos os valores já são múltiplos de 4 (com exceção justificada de `--space-0.5` = 2px e `--space-1.5` = 6px para micro-ajustes específicos — não usar nesta fase salvo replicação literal de componente existente).

| Token | Valor | Uso nesta fase |
|-------|-------|----------------|
| `--space-1` | 4px | Gap entre ícone e texto em badges, indicadores inline |
| `--space-2` | 8px | Gap entre StatCards numa linha compacta, gap interno de campos |
| `--space-3` | 12px | Gap padrão entre linhas da lista, padding interno de inputs |
| `--space-4` | 16px | Padding interno de cards, gap entre campos do drawer |
| `--space-5` | 20px | Padding lateral do drawer body |
| `--space-6` | 24px | Padding de Section, gap entre StatCards-row e lista |
| `--space-8` | 32px | Padding vertical de página, gap entre header e conteúdo |
| `--space-10` | 40px | Espaço acima do Empty State |

**Específicos prescritos:**
- Drawer width: `26rem` (literal, igual ao ChargeSidePanel — `charge-side-panel.tsx:103`).
- Drawer body padding: `3rem 1.25rem 1.5rem` (literal, igual ao charge — top maior por causa do botão `side-panel-close` absoluto).
- Modal width (categorias): `min(560px, calc(100vw - 2rem))`. Padding interno: `var(--space-6)`.
- Confirm dialog (`RecurrenceScopeDialog`) width: `min(440px, calc(100vw - 2rem))`. Padding: `var(--space-6)`.
- StatCards row gap: `var(--space-3)` em desktop, stack vertical em `<768px`.
- Linha da lista (row-height mínima): respeitar `var(--space-row-height)` = 64px (já no token global).
- ReceiptDropZone altura mínima: `160px`. Padding interno: `var(--space-6)`. Border-radius: `var(--radius-md)`. Border: `1.5px dashed var(--color-border-med)` (sólida ao hover/drag-over).

**Exceções:** nenhuma. Qualquer valor em px direto no inline style é violação.

---

## Typography

Tokens existentes em `globals.css:62-89`. Usar SEMPRE as CSS vars. **Não declarar `font-size` em rem/px direto.** Pesos restritos a `400` (regular), `500` (medium para labels e nav), `600` (semibold para títulos e CTAs), `700` (bold APENAS em `--font-size-display` de StatCard, replicando padrão existente).

| Role | Token | Tamanho | Peso | Line-height | Uso nesta fase |
|------|-------|---------|------|-------------|----------------|
| Display (StatCard valor) | `--font-size-display` | 30px | 700 | `--line-height-tight` (1.1) | "R$ 4.230,00" no StatCard "Total do mês" |
| Page title (header da aba) | `--font-size-h1` | 24→30px clamp | 600 (sans) | 1.2 | "Despesas" no `<PageHeader>` se houver título dedicado — caso contrário, reusar título "Financeiro" existente |
| Section title | `--font-size-h2` | 18→20px clamp | 600 | 1.3 | "Gerenciar categorias" (header do modal), "Anexar comprovante" (header da etapa 2 do drawer) |
| Subsection | `--font-size-h3` | 17px | 600 | 1.35 | Nome da categoria como header de grupo no view "por categoria" |
| Body | `--font-size-body` | 16px | 400 | `--line-height-base` (1.5) | Descrição da despesa, mensagens, valor em modal de categoria |
| Body-sm | `--font-size-body-sm` | 15px | 400 | 1.5 | Labels grandes do drawer |
| Meta | `--font-size-meta` | 14px | 400 ou 500 | 1.4 | Datas, helper text, contador "12 ocorrências serão criadas" |
| Label | `--font-size-sm` | 13px | 500 | 1.4 | `<label>` de campos do form, badges de categoria (texto), totais por grupo |
| Caption | `--font-size-xs` | 12px | 500 | 1.3 | Tipo do arquivo + tamanho ("PDF · 1.2 MB"), labels do StatCard ("Total do mês") |
| Eyebrow | `--font-size-xs` | 12px | 700, `letter-spacing: var(--letter-spacing-widest)`, `text-transform: uppercase` | 1.2 | "TOTAL DO MÊS", "MAIOR CATEGORIA" — eyebrow dos StatCards (replicar padrão existente do `<StatCard>`) |

**Famílias:**
- UI inteira em `var(--font-sans)` (IBM Plex Sans).
- `var(--font-serif)` (IBM Plex Serif) **NÃO** é usado nesta fase. Reservado para landing/auth/marca.

**Letter-spacing:** apenas via tokens (`--letter-spacing-tight` para títulos display, `--letter-spacing-widest` para eyebrows). Não inventar valores.

---

## Color

Paleta off-white quente / charcoal / accent terracota já consolidada. **NÃO criar novas cores.** Toda cor declarada via `var(--color-*)` ou tokens de status existentes em `globals.css:13-228`.

| Role | Token | Valor | Uso |
|------|-------|-------|-----|
| Dominant (60%) | `--color-bg` | `#f7f3ed` | Background da página `/financeiro` (já aplicado pelo body) |
| Secondary (30%) | `--color-surface-1` | `#fffcf7` | Superfície dos StatCards, do drawer, do modal de categorias, do confirm dialog |
| Secondary alt | `--color-surface-0` | `#ffffff` | Fundo de inputs, áreas elevadas (dropdown de categoria no select, ReceiptDropZone) |
| Secondary alt | `--color-surface-3` | `#f5f0e8` | Fundo do header de grupo no view "por categoria" (sutil destacar agrupamento) |
| Accent (10%) | `--color-accent` | `#9a3412` | Reservado — ver lista abaixo |
| Accent hover | `--color-accent-hover` | `#7c2a0e` | Hover de `.btn-primary` e links de ação |
| Accent light | `--color-accent-light` | `rgba(154,52,18,0.08)` | Background de chip da categoria mais usada (StatCard "Maior categoria"), background do badge de recorrência ativo |
| Destructive | `--color-error-text` | `#dc2626` | APENAS para: botão "Excluir despesa" no drawer; texto da opção destrutiva no `RecurrenceScopeDialog`; texto de erro de upload |
| Destructive bg | `--color-error-bg` | `rgba(239,68,68,0.08)` | Background sutil do bloco de erro de upload, hover do `.btn-danger` |
| Border padrão | `--color-border` | `rgba(146,64,14,0.12)` | Bordas de cards, separadores de linhas da lista, borda do drawer |
| Border médio | `--color-border-med` | `rgba(146,64,14,0.2)` | Borda de inputs, borda do `ReceiptDropZone`, borda do badge de categoria |
| Texto primário | `--color-text-1` | `#1c1917` | Descrição da despesa, valor numérico, nome da categoria |
| Texto secundário | `--color-text-2` | `#57534e` | Data, helper text, label de campo |
| Texto terciário | `--color-text-3` | `#57534e` (AA verificado) | Categorias inativas no select, contagem secundária |
| Texto quaternário | `--color-text-4` | `#78716c` | Placeholder de input (uso restrito) |

### Accent reservado para (lista exaustiva nesta fase)

1. Botão `+ Nova despesa` (CTA primária do header da aba) — `.btn-primary` (background `--color-accent`).
2. Aba "Despesas" quando ativa em `<Tabs>` (já governado pela classe `.tab--active` existente).
3. Indicador de comprovante anexado nas linhas da lista (ícone clip preenchido em `--color-accent`).
4. Underline/border do campo de input em `:focus` (já governado por `.input-field:focus`).
5. Texto do link "Gerenciar categorias" no select do drawer e no header da aba.
6. Botão primário "Salvar" do drawer e "Adicionar categoria" do modal.
7. Cor do número grande do StatCard "Total do mês" — cor `--color-text-1` (NÃO accent), seguindo padrão de `<StatCard>` existente. *(Nota: accent não é usado para reforçar valores monetários, apenas para ações. Atenção do executor.)*

**O accent NÃO é usado para:**
- Cor de fundo de StatCards (todos em `--color-surface-1`).
- Borda decorativa de cards.
- Texto de valores monetários (mantém `--color-text-1`).
- Background do drawer ou modal.
- Indicador de recorrência (usa `--color-text-2` neutro com ícone, não cor).

### Cores semânticas adicionais

- **Badge de categoria:** estilo neutro único — `background: var(--color-surface-3)`, `border: 1px solid var(--color-border)`, `color: var(--color-text-2)`, `font-size: var(--font-size-sm)`, `font-weight: 500`, `padding: 2px 8px`, `border-radius: var(--radius-pill)`. **NÃO atribuir cor por categoria** (decisão de projeto: hierarquia via tipografia, não cor — `CLAUDE.md` § Anti-padrões visuais).
- **Categoria desativada (no modal de gestão):** mesmo badge porém `opacity: 0.55` + sufixo " · inativa" em `--color-text-3`.
- **Indicador de recorrência:** ícone SVG circular-arrow em `--color-text-3` ao lado da data, sem background. Tooltip: "Mensal" / "Quinzenal".
- **Drag-over no ReceiptDropZone:** border `1.5px solid var(--color-accent)`, background `var(--color-accent-light)`. Restaurar ao sair.

---

## Copywriting Contract

Todo copy em **pt-BR**. Vocabulário obrigatório de `CLAUDE.md` (paciente, atendimento, prontuário). Tom direto, operacional, sem jargão de coach/wellness/AI. Termos financeiros: "despesa" (não "gasto" nem "saída"), "categoria" (não "rubrica"), "comprovante" (não "anexo" nem "documento"), "recorrência" (não "repetição"), "série recorrente" (para falar do conjunto).

### CTAs e ações

| Element | Copy |
|---------|------|
| Primary CTA (header da aba) | `+ Nova despesa` |
| Secondary CTA (header da aba) | `Gerenciar categorias` |
| Botão "Salvar" do drawer (etapa 1, sem comprovante) | `Salvar despesa` |
| Botão "Concluir" do drawer (etapa 2, após upload opcional) | `Concluir` |
| Botão "Pular upload" (etapa 2) | `Concluir sem comprovante` |
| Botão dentro do ReceiptDropZone (estado vazio) | `Selecionar arquivo` |
| Botão substituir comprovante | `Substituir comprovante` |
| Botão remover comprovante | `Remover comprovante` |
| Botão excluir despesa (no drawer de edição) | `Excluir despesa` |
| Botão "+ Nova categoria" (no modal) | `+ Nova categoria` |
| Toggle de view (cronológico) | `Cronológico` |
| Toggle de view (por categoria) | `Por categoria` |
| Label do filtro de busca | `Buscar por descrição` |
| Placeholder do filtro de busca | `Ex: aluguel, supervisão...` |
| Label do filtro de categoria | `Categoria` |
| Opção "todas" do filtro de categoria | `Todas as categorias` |
| Label do filtro de valor | `Faixa de valor` |
| Placeholders dos campos de valor | `mín` e `máx` |

### Campos do drawer (labels e helpers)

| Field | Label | Helper |
|-------|-------|--------|
| Data | `Data` | (sem helper; default = hoje) |
| Valor | `Valor` | (sem helper; máscara BRL aplicada via `<MaskedInput>`) |
| Descrição | `Descrição` | `Curta e específica. Ex: "Aluguel sala 302 — abril/26"` |
| Categoria | `Categoria` | (sem helper; link `Gerenciar` à direita do label, em `var(--color-accent)`, `font-size: var(--font-size-xs)`, `font-weight: 500`) |
| Recorrência | `Recorrência` | (sem helper; três opções em segmented control: `Única` / `Mensal` / `Quinzenal`) |
| Repetir por (visível só se recorrente) | `Repetir por` | `12 ocorrências serão criadas a partir desta data` (texto dinâmico, atualiza com o número) |

### StatCards (eyebrow + valor)

| Card | Eyebrow | Valor principal | Subtexto |
|------|---------|-----------------|----------|
| Total do mês | `TOTAL DO MÊS` | `R$ {valor}` em formato BRL | `{n} despesas` |
| Quantidade | `LANÇAMENTOS` | `{n}` | `neste mês` |
| Maior categoria | `MAIOR CATEGORIA` | `{nome da categoria}` (truncar com ellipsis em 1 linha) | `R$ {valor}` |

### Empty states

| Contexto | Heading | Body |
|----------|---------|------|
| Nenhuma despesa no mês selecionado (lista cronológica) | `Sem despesas neste mês` | `Use "+ Nova despesa" para registrar o primeiro lançamento.` |
| Nenhuma despesa após filtro aplicado | `Nenhuma despesa encontrada` | `Ajuste os filtros ou limpe a busca para ver mais resultados.` (incluir botão `.btn-ghost` `Limpar filtros`) |
| Nenhuma categoria criada (estado impossível por causa do seed, mas defensivo) | `Sem categorias` | `Crie a primeira categoria para começar a registrar despesas.` |
| Drawer etapa 2, sem comprovante anexado | `Sem comprovante anexado` | `Você pode anexar agora ou voltar e adicionar depois pela edição.` |

### Estados de erro

| Contexto | Mensagem |
|----------|----------|
| Falha ao salvar despesa | `Não foi possível salvar a despesa. Verifique sua conexão e tente novamente.` |
| Comprovante acima do limite | `Arquivo acima do limite de 10 MB. Comprima o PDF ou envie uma imagem menor.` |
| Tipo de arquivo não aceito | `Formato não aceito. Envie PDF, JPG ou PNG.` |
| Falha de upload (rede/storage) | `O arquivo não foi enviado. Tente novamente — a despesa já está salva.` |
| Falha ao remover comprovante | `Não foi possível remover o comprovante. Tente novamente em instantes.` |
| Tentativa de excluir categoria com despesas históricas | `Esta categoria possui despesas registradas. Desative em vez de excluir para preservar o histórico.` |

### Confirmações destrutivas

| Ação | Título | Corpo | Botões |
|------|--------|-------|--------|
| Excluir despesa única (não recorrente) | `Excluir esta despesa?` | `A despesa "{descrição}" será removida da listagem. O registro permanece em auditoria.` | `Cancelar` (ghost) · `Excluir` (danger, `--color-error-text`) |
| Editar despesa de série recorrente | `Aplicar alteração a:` | `Esta despesa faz parte de uma série {mensal\|quinzenal}. Escolha o escopo:` | três opções em radio cards (ver abaixo) + `Cancelar` (ghost) · `Aplicar` (primary) |
| Excluir despesa de série recorrente | `Excluir despesas:` | `Esta despesa faz parte de uma série {mensal\|quinzenal}. Escolha o escopo:` | três opções em radio cards + `Cancelar` (ghost) · `Excluir` (danger) |
| Desativar categoria | `Desativar "{nome}"?` | `Despesas existentes nesta categoria continuam visíveis no histórico. Novas despesas não poderão usar esta categoria.` | `Cancelar` (ghost) · `Desativar` (secondary, não-destrutivo — é reversível) |
| Substituir comprovante | `Substituir comprovante?` | `O arquivo atual será removido permanentemente. Esta ação fica registrada em auditoria.` | `Cancelar` (ghost) · `Substituir` (primary) |
| Remover comprovante (sem substituir) | `Remover comprovante?` | `O arquivo será removido permanentemente. A despesa permanece registrada.` | `Cancelar` (ghost) · `Remover` (danger) |

### Opções do RecurrenceScopeDialog (texto exato)

Três radio cards empilhados, cada um com título + descrição:

1. **`Apenas esta`** — `A alteração afeta somente esta ocorrência.`
2. **`Esta e as próximas`** — `A alteração afeta esta ocorrência e todas as futuras desta série.`
3. **`Toda a série`** — `A alteração afeta todas as ocorrências, inclusive as anteriores.`

Default selecionado: `Apenas esta`. Padrão idêntico ao Google Calendar em pt-BR (`CONTEXT.md` § D-08).

### Toasts (feedback de sucesso)

| Ação | Toast |
|------|-------|
| Criar despesa única | `Despesa registrada.` |
| Criar despesa recorrente | `Despesa registrada · {n} ocorrências criadas.` |
| Editar despesa | `Despesa atualizada.` |
| Editar série (escopo "esta e futuras") | `{n} ocorrências atualizadas.` |
| Editar série (escopo "toda a série") | `Série completa atualizada.` |
| Excluir despesa | `Despesa removida.` |
| Anexar comprovante | `Comprovante anexado.` |
| Substituir comprovante | `Comprovante substituído.` |
| Remover comprovante | `Comprovante removido.` |
| Criar categoria | `Categoria "{nome}" criada.` |
| Renomear categoria | `Categoria atualizada.` |
| Desativar categoria | `Categoria "{nome}" desativada.` |

---

## Interaction Contract (especificações comportamentais)

### Aba Despesas dentro de `<Tabs>` em `/financeiro`

- Ordem das abas: `Receitas` · `Cobranças` · `Inadimplência` · `Despesas` (nova, sempre por último — não alterar índice das existentes).
- Estado da aba ativa em URL: `?tab=despesas` (mesmo padrão das demais).
- Header da aba (linha única, justify-between): à esquerda título "Despesas" + seletor de mês/ano herdado do layout pai; à direita `Gerenciar categorias` (`.btn-secondary`) + `+ Nova despesa` (`.btn-primary`).
- Em `<768px`: header empilha vertical, CTAs ocupam largura total.

### StatCards row

- Grid `repeat(3, 1fr)` desktop, gap `var(--space-3)`. Ordem: Total → Lançamentos → Maior categoria.
- Em `<768px`: stack vertical, gap `var(--space-2)`.
- Skeleton: usar `<Skeleton>` existente, mesma altura do StatCard real (~96px).

### Toggle Cronológico/Por categoria

- Segmented control acima da lista, alinhado à esquerda. Estado em URL: `?view=cronological` (default) | `?view=by-category`.
- Visual: dois botões pill agrupados, fundo `var(--color-surface-1)`, borda `var(--color-border)`, opção ativa com background `var(--color-surface-0)` + `box-shadow: var(--shadow-xs)` + texto `var(--color-text-1)` semibold; opção inativa texto `var(--color-text-2)`. **Não usar accent.**
- Altura: 36px. Padding interno do botão: `6px 14px`. `font-size: var(--font-size-sm)`. `font-weight: 500`.

### Filtros

- Linha única acima do toggle (em desktop): seletor de mês/ano (herdado) · select de categoria · dois inputs numéricos para faixa de valor · input de busca textual com ícone lupa.
- Mobile (`<768px`): collapsible "Filtros" (`<details>`) que expande os filtros em stack vertical.
- Todos os filtros refletidos em URL searchParams. Botão `Limpar filtros` (`.btn-ghost`) aparece à direita SE qualquer filtro estiver ativo.

### Lista cronológica (`ExpenseList`)

- Wrapper `<List>` existente. Cada linha = `<button class="row-interactive">` com `min-height: var(--space-row-height)` (64px), padding `var(--space-3) var(--space-4)`, separador inferior `1px solid var(--color-border)`.
- Layout da linha (grid):
  ```
  [data 80px] [descrição flex-1] [badge categoria] [ícones indicadores] [valor right-aligned]
  ```
- Data: `var(--font-size-meta)` (14px), `var(--color-text-2)`, formato `dd MMM` (ex: `15 abr`). Tooltip mostra data completa (`15 de abril de 2026`).
- Descrição: `var(--font-size-body)` (16px), `var(--color-text-1)`, `font-weight: 500`. Truncar com ellipsis em 1 linha.
- Badge categoria: estilo neutro definido na seção Color.
- Ícones indicadores (gap `var(--space-1)`):
  - Clip 14×14 em `var(--color-accent)` SE `receiptStorageKey != null` — tooltip: "Comprovante anexado".
  - Refresh-circular 14×14 em `var(--color-text-3)` SE `seriesId != null` — tooltip: "Mensal" ou "Quinzenal".
- Valor: `var(--font-size-body)` (16px), `var(--color-text-1)`, `font-weight: 600`, formato BRL (`R$ 1.250,00`), tabular-nums.
- Click na linha → abre drawer de edição via `?drawer=despesa-{id}` (sem reload, history push).
- Hover: governado por `.row-interactive:hover` existente.

### Lista agrupada por categoria (`ExpenseGroupedList`)

- Cada grupo precedido por header sticky (`position: sticky; top: 0; background: var(--color-surface-3); padding: var(--space-2) var(--space-4); z-index: var(--z-base);`).
- Header do grupo: nome da categoria em `var(--font-size-h3)` (17px) `font-weight: 600` à esquerda; subtotal `R$ {valor}` em `var(--font-size-meta)` (14px) `font-weight: 600` à direita; entre eles `var(--color-text-3)` " · {n} lançamentos".
- Dentro do grupo, mesmas linhas da lista cronológica MAS sem coluna de badge (categoria já está no header).
- Grupos ordenados por subtotal decrescente.

### Drawer (`ExpenseSidePanel`)

- Largura `26rem`, slide-in da direita (animação `sidePanelSlideIn` 250ms cubic-bezier — já em `globals.css:1734`).
- Overlay `var(--z-overlay)`, drawer `var(--z-modal)`.
- Esc fecha; click no overlay fecha; botão `×` superior direito (`.side-panel-close`).
- Focus trap obrigatório (mesmo padrão do `charge-side-panel.tsx:16-42`).
- Estrutura interna:
  - Header: `var(--font-size-h2)` "Nova despesa" ou "Editar despesa", padding inferior `var(--space-4)`, separador `1px solid var(--color-border)`.
  - **Etapa 1 (campos):** form com `display: grid; gap: var(--space-4)`. Ordem fixa: Data → Valor → Descrição → Categoria → Recorrência → (condicional) Repetir por.
  - Footer da etapa 1: `flex justify-between`. Esquerda: nada (criação) ou `Excluir despesa` (`.btn-danger`, edição). Direita: `Cancelar` (`.btn-ghost`) + `Salvar despesa` (`.btn-primary` via `<SubmitButton>`).
  - **Etapa 2 (upload, só após criar):** substitui o conteúdo do drawer (mesmo drawer, transição instantânea). Header passa a "Anexar comprovante" `var(--font-size-h2)`. Body: `ReceiptDropZone`. Footer: `Concluir sem comprovante` (`.btn-ghost`) à esquerda; `Concluir` (`.btn-primary`, desabilitado até upload completar) à direita.
- Em edição, drawer abre direto na etapa 1 com campos preenchidos; se houver comprovante, área dele aparece após os campos com preview + ações (substituir/remover).

### Segmented control de Recorrência (dentro do drawer)

- Três botões `Única` / `Mensal` / `Quinzenal`, mesmo estilo do toggle de view (pills agrupados, sem accent, semibold ativo).
- Default: `Única`.
- Ao selecionar `Mensal` ou `Quinzenal`: revela campo "Repetir por" com `<input type="number">` default `12`, min `1`, max `60`. Ao lado, helper text dinâmico em `var(--color-text-2)`: `"12 ocorrências serão criadas a partir desta data"`.

### ReceiptDropZone

- Estado vazio: container dashed border, ícone upload-cloud 32×32 em `var(--color-text-3)`, texto principal `var(--font-size-body)` `font-weight: 500` "Arraste o comprovante aqui", texto secundário `var(--font-size-meta)` `var(--color-text-3)` "ou", botão `.btn-secondary.btn-sm` "Selecionar arquivo", helper text `var(--font-size-xs)` `var(--color-text-3)` "PDF, JPG ou PNG · até 10 MB".
- Estado drag-over: border sólida em `var(--color-accent)`, background `var(--color-accent-light)`.
- Estado uploading: progress bar horizontal 4px de altura, fill `var(--color-accent)`, percentual ao lado em `var(--font-size-meta)`.
- Estado upload concluído (preview): card horizontal com ícone do tipo de arquivo (PDF ou imagem thumbnail 48×48), nome do arquivo (`var(--font-size-meta)` `var(--color-text-1)` `font-weight: 500`, truncar), tamanho + tipo abaixo (`var(--font-size-xs)` `var(--color-text-3)`, ex: "PDF · 1.2 MB"); à direita botão `Substituir` (`.btn-ghost.btn-sm`) + ícone trash (botão de remover) em `var(--color-text-3)` (hover `var(--color-error-text)`).
- Estado erro: card horizontal background `var(--color-error-bg)`, border `1px solid var(--color-error-border)`, ícone `!` em `var(--color-error-text)`, mensagem em `var(--color-error-text)` `var(--font-size-meta)`, botão `Tentar novamente` `.btn-ghost.btn-sm` à direita.

### ExpenseCategoryModal

- Modal centralizado: overlay `rgba(0,0,0,0.18)`, container `var(--color-surface-1)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-xl)`, width `min(560px, calc(100vw - 2rem))`, padding `var(--space-6)`, `z-index: var(--z-modal)`.
- Header: título `Gerenciar categorias` em `var(--font-size-h2)` à esquerda; botão `×` 32×32 à direita.
- Body: lista de categorias. Cada item = linha com:
  - Badge da categoria (mesmo estilo neutro) à esquerda — clicando entra em modo de edição inline (input substitui o badge).
  - Nome editável em modo inline (`.input-field`).
  - Toggle ativo/inativo à direita (switch nativo estilizado: 36×20px, ON `var(--color-accent)`, OFF `var(--color-border-med)`).
  - Em modo edição: botão `Salvar` `.btn-primary.btn-sm` + `Cancelar` `.btn-ghost.btn-sm`.
- Footer: linha separadora + linha com input "Nome da categoria" + botão `+ Nova categoria` (`.btn-primary.btn-sm`).
- Esc fecha; click no overlay fecha; mudanças são auto-saved item a item (toast por item).

### RecurrenceScopeDialog

- Modal pequeno (`min(440px, calc(100vw - 2rem))`), mesmo container visual do modal de categorias.
- Conteúdo: título + descrição + 3 radio cards verticais (cada card 56px de altura, padding `var(--space-3) var(--space-4)`, border `1px solid var(--color-border)`, `border-radius: var(--radius-md)`, gap `var(--space-2)` entre cards). Card selecionado: border `1.5px solid var(--color-accent)`, background `var(--color-accent-light)`.
- Cada card: radio circular à esquerda, título + descrição à direita.
- Footer: `Cancelar` (ghost) à esquerda, `Aplicar`/`Excluir` (primary ou danger conforme contexto) à direita.

### Animações

- Drawer slide-in: 250ms `cubic-bezier(0.16, 1, 0.3, 1)` (token existente).
- Tab fade: 150ms (token existente).
- Modal fade: 150ms.
- Toast slide-in da direita: 200ms (token existente).
- Confirm dialog: fade simples 120ms.
- ReceiptDropZone drag-over: transição instantânea de border/background (sem animação).
- **Sem animações decorativas.** Sem hover-glow. Sem pulse. Sem skeletons animados além do `skeleton-shimmer` já existente.

### Acessibilidade

- Todos os botões ≥44×44 (token global já força via `globals.css:1653-1657`).
- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-label="Detalhes da despesa"` (criação) ou `aria-label="Editar despesa"` (edição).
- Modal de categorias: `role="dialog"`, `aria-modal="true"`, `aria-label="Gerenciar categorias"`.
- RecurrenceScopeDialog: `role="alertdialog"`, `aria-labelledby` apontando para o título.
- ReceiptDropZone: `<input type="file">` com `aria-label="Selecionar arquivo de comprovante"`; container `role="button" tabindex="0"` para acionar via teclado (Enter/Space abre file picker); área de drop com `aria-describedby` apontando para o helper text de formatos aceitos.
- Foco visível garantido por `:focus-visible` global (`globals.css:580-584`).
- Lista: cada linha é `<button>`, anuncia "Editar despesa, {descrição}, {categoria}, {valor}" via `aria-label`.
- StatCards: `<article role="status">` com label legível.
- Filtros: cada controle com `<label>` associado.
- Reduzir motion: já governado pelo `@media (prefers-reduced-motion: reduce)` global em `globals.css:1251-1258`.
- Contraste WCAG AA: garantido pela paleta verificada em `globals.css:247-258`.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| n/a | nenhum — projeto não usa shadcn/registries de terceiros | not applicable |

Decisão de projeto explícita em `CLAUDE.md`: não há Tailwind, não há shadcn, não há componentes externos de design system. Toda UI é construída a partir da biblioteca interna em `src/components/ui/*` + classes utilitárias em `globals.css`. Vetting gate de registries não se aplica.

---

## Pre-Population Sources

| Source | Decisions Used |
|--------|----------------|
| `20-CONTEXT.md` | D-09 (aba interna), D-10 (modal de categorias), D-11 (lista densa), D-12 (toggle), D-13 (filtros), D-14 (StatCards), D-15 (drawer URL), D-16 (campos), D-17 (upload em 2 etapas), D-08 (escopo de série) |
| `19-CONTEXT.md` (Phase 19) | D-01 (lista densa estilo extrato), D-02 (drawer lateral), D-04 (URL state) — replicados literalmente |
| `CLAUDE.md` | Stack (sem Tailwind, inline styles + CSS vars), vocabulário pt-BR, anti-padrões visuais (sem gradientes, sem glassmorphism, sombras contidas), regras de tom |
| `globals.css` | Toda a escala de spacing, typography, color, shadows, radii, z-index, transitions — 100% reutilizada, zero token novo |
| `charge-side-panel.tsx` | Largura 26rem, classes CSS, focus trap, animações, comportamento de Esc/overlay — clone direto |
| `src/components/ui/*` | Componentes existentes (Tabs, StatCard, List, Badge, MaskedInput, SubmitButton, etc.) — reutilizados sem modificação |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
