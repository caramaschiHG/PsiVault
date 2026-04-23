# Phase 28: Streaming e Suspense Granular — Context

## Decisions

### D-01: Async sections carregam dados próprios ou computam a partir de dados core
- `/financeiro`: Seções assíncronas computam a partir de dados core (charges, patients) carregados no `page.tsx` pai. Charges são dependência central para todas as seções — carregar independentemente seria redundante e aumentaria queries. O valor está na renderização progressiva, não no fetch independente.
- `/inicio`: Seções assíncronas carregam seus próprios dados independentemente, pois não há dependência central compartilhada (appointments, reminders, charges, patients são independentes).

### D-02: React 19 `use` API em Client Components
- `RemindersSection` (Client Component em `/inicio`) receberá `remindersPromise: Promise<...>` em vez de `reminders: []` resolvido. Usará `use(promise)` para unwrap, demonstrando streaming de promises de Server Component para Client Component.
- Outras seções Client Component que precisem de dados assíncronos seguirão o mesmo padrão.

### D-03: Skeletons com dimensões idênticas aos componentes finais
- Todos os skeletons usarão as mesmas variáveis CSS (`--space-*`, `--font-size-*`, grid layouts) dos componentes reais para garantir zero layout shift (CLS = 0).
- Skeletons não usam dimensões hardcoded em pixels — replicam a estrutura de layout exata.

### D-04: Transição suave de skeleton para conteúdo
- Seções com charts usam `transition: opacity var(--transition-normal)` ao trocar de skeleton para conteúdo renderizado.
- AsyncBoundary aplica classe `vault-page-transition` (fade-in existente) ao conteúdo resolvido.

### D-05: Error boundaries por seção, não por página
- `AsyncBoundary` (Client Component) combina Suspense + ErrorBoundary com fallback compacto inline (não quebra página inteira).
- Erros em uma seção não impedem renderização das demais.
- Route-level `error.tsx` permanece como última linha de defesa.

### D-06: Padrão de naming para seções assíncronas
- Arquivos em `src/app/(vault)/[rota]/sections/*.tsx`
- Nome: `[domain]-[data]-section.tsx` (ex: `trend-section.tsx`, `today-section.tsx`)
- Export default como async function component

## Deferred Ideas

- [ ] Streaming em `/agenda` (calendário pesado) — fora do escopo desta fase
- [ ] Skeletons animados com motion library — anti-padrão visual do projeto (sem animações decorativas)
- [ ] Prefetching de seções em hover — benefício marginal, adiciona complexidade

## the agent's Discretion

- Ordem de prioridade das seções no fallback de loading: header > summary cards > list > charts > insights. O executor pode ajustar a ordem visual se necessário para melhor percepção de velocidade.
- Altura exata do chart skeleton pode ser ajustada em ±4px se o container real variar com dados.
- A decisão de quantas barras mostrar no chart skeleton (6 para trend, 12 para year) fica a critério do executor — deve ser visualmente plausível.

## Source Audit

| Source | Item | Plan Coverage |
|--------|------|---------------|
| GOAL | Usuários percebem carregamento mais rápido em rotas pesadas | Plans 02, 03, 04 |
| REQ | STREAM-01: loading.tsx para /financeiro, /inicio | Plans 02, 03 |
| REQ | STREAM-02: Seções decompostas em Server Components assíncronos | Plans 02, 03 |
| REQ | STREAM-03: Suspense boundaries granulares com skeletons zero-CLS | Plans 01, 02, 03 |
| REQ | STREAM-04: React 19 `use` API para Client Components | Plans 01, 03 |
| REQ | STREAM-05: Streaming visual de charts com Suspense | Plans 01, 02 |
| CONTEXT | D-01: Async sections carregam dados próprios ou core | Plans 02, 03 |
| CONTEXT | D-02: React 19 `use` API | Plans 01, 03 |
| CONTEXT | D-03: Skeletons dimensões idênticas | Plans 01, 02, 03 |
| CONTEXT | D-04: Transição suave | Plans 01, 02 |
| CONTEXT | D-05: Error boundaries por seção | Plans 01, 02, 03 |
| CONTEXT | D-06: Naming de seções | Plans 02, 03 |
