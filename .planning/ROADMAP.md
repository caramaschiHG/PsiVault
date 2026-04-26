# Roadmap: PsiVault

## Milestones

- ✅ **v1.0 MVP** — Phases 1–12 (shipped 2026-02)
- ✅ **v1.1 Notifications** — Phases 13–16 (shipped 2026-03)
- ✅ **v1.2 Finance** — Phases 17–22 (shipped 2026-04)
- ✅ **v1.3 Performance** — Phases 23–26 (shipped 2026-04-22)
- 📋 **v1.4 Performance Profunda** — Phases 27–31 (in progress)
- 📋 **v1.5 Motion & Feel** — Phases 32–36 (planned)
- 📋 **v1.6 Documentos — Workflow Clínico Impecável** — Phases 37–42 (planned)

## Phases

<details>
<summary>✅ v1.3 Performance (Phases 23–26) — SHIPPED 2026-04-22</summary>

- [x] Phase 23: Wave 1 — Navegação e Cache (2/2 plans) — completed 2026-04-22
- [x] Phase 24: Wave 2 — Auth Deduplication (1/1 plan) — completed 2026-04-22
- [x] Phase 25: Wave 3 — Finance Query Consolidation (3/3 plans) — completed 2026-04-22
- [x] Phase 26: Wave 4 — N+1 e Column Selection (2/2 plans) — completed 2026-04-22

Archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### 📋 v1.4 Performance Profunda (Planned)

- [x] **Phase 27: Diagnóstico e Fundação de Dados** — Baseline de bundle, CWV, índices DB e pooling (3/3 plans) — completed 2026-04-23
- [x] **Phase 28: Streaming e Suspense Granular** — loading.tsx, async sections, React 19 use API, skeletons (4/4 plans) — completed 2026-04-23
- [x] **Phase 29: Cache Seletivo e Seguro** — unstable_cache, revalidateTag, workspace-scoped keys, revalidatePath audit
- [ ] **Phase 30: Otimização de Assets e Bundle** — next/dynamic, optimizePackageImports, next/image, next/font, next/script
- [x] **Phase 31: Medição, Observabilidade e Iteração** — Lighthouse CI, RUM, memlab, react-scan, relatório before/after (completed 2026-04-23)

## Phase Details

### Phase 27: Diagnóstico e Fundação de Dados
**Goal**: Desenvolvedores podem medir performance objetivamente e queries no banco executam mais rápido
**Depends on**: Nothing (primeira fase do milestone)
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Bundle analyzer gera relatórios em toda build com `ANALYZE=true`
  2. Core Web Vitals são coletados de sessões reais e enviados para endpoint backend
  3. Queries em `Appointment` e `SessionCharge` usam novos índices compostos
  4. Supavisor transaction mode está ativo sem erros em migrations
  5. Prisma loga queries lentas (>500ms) para revisão do desenvolvedor
**Plans**: 3 plans

Plans:
- [x] 27-01-PLAN.md — Schema Foundation: PerformanceMetric model + composite indexes + Supavisor docs
- [x] 27-02-PLAN.md — Bundle Analyzer e CWV: @next/bundle-analyzer, web-vitals, /api/metrics endpoint
- [x] 27-03-PLAN.md — Query Logging e Column Selection: Prisma $extends, searchByName, EXPLAIN ANALYZE

### Phase 28: Streaming e Suspense Granular
**Goal**: Usuários percebem carregamento mais rápido em rotas pesadas com renderização progressiva
**Depends on**: Phase 27
**Requirements**: STREAM-01, STREAM-02, STREAM-03, STREAM-04, STREAM-05
**Success Criteria** (o que deve ser VERDADEIRO):
  1. `/financeiro` e `/inicio` mostram estados de loading imediatamente em vez de tela em branco
  2. Seções de página renderizam independentemente conforme dados ficam disponíveis
  3. Skeleton placeholders correspondem às dimensões finais do layout (zero layout shift)
  4. Client Components recebem promises streamadas com tratamento de erro adequado
  5. Charts exibem estados visuais de loading que transicionam suavemente para dados
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [x] 28-01-PLAN.md — Foundation: Skeletons, AsyncBoundary, useStreamedPromise hook
- [x] 28-02-PLAN.md — /financeiro Granular Suspense: async sections, page refactor, loading.tsx
- [x] 28-03-PLAN.md — /início Granular Suspense: async sections, React 19 use API, loading.tsx
- [x] 28-04-PLAN.md — Verification: integration tests, visual checkpoint

### Phase 29: Cache Seletivo e Seguro
**Goal**: Dados de leitura intensa carregam instantaneamente do cache sem risco de vazamento cross-tenant
**Depends on**: Phase 28
**Requirements**: CACHE-01, CACHE-02, CACHE-03, CACHE-04
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Practice profile e categorias de despesa carregam do cache em visitas repetidas
  2. Todas as Server Actions de mutação invalidam cache de domínio imediatamente
  3. Nenhum dado cacheado é servido sem `workspaceId` na chave de cache
  4. Todas as 13 chamadas `revalidatePath` existentes usam escopo `'page'` corretamente
**Plans**: 3 plans

Plans:
- [x] 29-01-PLAN.md — Cache Foundation: unstable_cache para practice profile e expense categories com workspace-scoped keys
- [x] 29-02-PLAN.md — revalidatePath Scope Audit & Fix: escopo "page" em todas as chamadas bare
- [x] 29-03-PLAN.md — revalidateTag Integration: invalidacao de cache de dominio em todas as mutation actions

### Phase 30: Otimização de Assets e Bundle
**Goal**: Aplicação carrega menos bytes e renderiza imagens/fontes de forma eficiente
**Depends on**: Phase 28
**Requirements**: ASSET-01, ASSET-02, ASSET-03, ASSET-04, ASSET-05
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Charts, date pickers e PDF preview carregam sob demanda em vez de no bundle inicial
  2. Imports de bibliotecas utilitárias são tree-shaken via `optimizePackageImports`
  3. Zero tags `<img>` raw permanecem na codebase
  4. Requests externos de fontes são eliminados ou migrados para `next/font`
  5. Scripts de terceiros carregam com estratégia apropriada (`lazyOnload`/`worker`)
**Plans**: 1 plan
**UI hint**: yes

Plans:
- [ ] 30-01-PLAN.md — Lazy Loading de Componentes Pesados, Documentação de Exceções <img>, e Verificação de Bundle

### Phase 31: Medição, Observabilidade e Iteração
**Goal**: Time tem visibilidade contínua de performance e relatório validado de melhorias
**Depends on**: Phase 27, Phase 28, Phase 29, Phase 30
**Requirements**: OBS-01, OBS-02, OBS-03, OBS-04, OBS-05
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Lighthouse CI falha builds que excedem thresholds de CWV (LCP < 2.5s, CLS < 0.1)
  2. Dashboard RUM mostra percentil 75 de LCP, INP, CLS para usuários reais
  3. memlab não detecta memory leaks no fluxo de navegação de pacientes
  4. react-scan destaca re-renders desnecessários durante desenvolvimento
  5. Relatório publicado mostra métricas before/after com próximos passos acionáveis
**Plans**: 3 plans

Plans:
- [x] 31-01-PLAN.md — Dev Observability Tools: Lighthouse CI, memlab, react-scan
- [x] 31-02-PLAN.md — RUM Dashboard: agregações p75, /admin/performance, cleanup
- [x] 31-03-PLAN.md — Report Generator: script `performance:report`, relatório Markdown

### 📋 v1.5 Motion & Feel — Interações Fluidas (Planned)

- [x] **Phase 32: Motion Tokens & Foundation CSS** — Tokens de duration/easing/stagger, reduced motion fallback, utility classes
- [x] **Phase 33: Micro-interações em Componentes Base** — Hover/focus/active states, focus rings, input micro-interactions, smooth scroll (completed 2026-04-23)
- [ ] **Phase 34: Feedback de Ação e Loading** — Toast AnimatePresence, useTransition em botões, skeleton shimmer, spinner
- [x] **Phase 35: Listas e Transições de Página** — Staggered lists, page transition fade, layout animations expand/collapse (completed 2026-04-24)
- [ ] **Phase 36: Polish, Accessibility & Measurement** — Motion audit, reduced motion test, INP/CLS validation, docs

### 📋 v1.6 Documentos — Workflow Clínico Impecável (Planned)

- [ ] **Phase 37: Foundation & Migration** — Schema seguro com status/appointmentId, domain model com ciclo de vida, migration zero-downtime de documentos existentes, repository extension com índices
- [x] **Phase 38: Estados e Rascunho Server-Side** — Ciclo de vida draft→finalized→signed→delivered, auto-save server-side de rascunhos, listagem cronológica com badges de estado, transições seguras via Server Actions (completed 2026-04-25)
- [x] **Phase 39: Editor Unificado e Preview A4** — Composer contextual (livre vs estruturado), visualização em layout A4 simulado, PDF universal para todos os tipos finalizados, preview embutido sem download
- [ ] **Phase 40: Integração com Atendimentos** — Ligação opcional appointment-document, criação de documento a partir de atendimento, pre-fill contextual com dados da sessão, fluxo sessão→nota→documento
- [ ] **Phase 41: Dashboard e Navegação** — Página `/documentos` com visão global, filtros por tipo/data/paciente/estado, breadcrumbs hierárquicos, tabs no perfil do paciente com deep-linking
- [ ] **Phase 42: Polish e Cleanup** — Remover código legado de documentos, garantir zero regressão em 419+ testes, auditoria de segurança, documentação do novo fluxo

## Phase Details

### Phase 32: Motion Tokens & Foundation CSS
**Goal**: Sistema unificado de motion tokens e utility classes serve como fundação para todo o milestone
**Depends on**: Nothing (primeira fase do milestone v1.5)
**Requirements**: MOTF-01, MOTF-02, MOTF-03, MOTF-04
**Success Criteria** (o que deve ser VERDADEIRO):
  1. `globals.css` inclui tokens `--duration-*`, `--ease-*`, `--stagger-gap` utilizáveis por qualquer componente
  2. Ativando `prefers-reduced-motion: reduce` no sistema desativa instantaneamente todas as animações do app
  3. Utility classes `.motion-fade-in`, `.motion-slide-up`, `.motion-stagger` funcionam em Server Components sem JS
  4. Nenhum flash de conteúdo não-estilizado ocorre em primeiro paint (CSS síncrono)
**Plans**: 3 plans

Plans:
- [x] 32-01-PLAN.md — Motion Tokens & motion.css Foundation: tokens in :root, motion.css with keyframes/utilities/reduced-motion, import wiring
- [x] 32-02-PLAN.md — Migration of Existing Animations: transition tokenization, keyframe consolidation, deprecated token removal
- [x] 32-03-PLAN.md — Verification & Reduced Motion Audit: prefers-reduced-motion coverage, FOUC prevention, build + tests

### Phase 33: Micro-interações em Componentes Base
**Goal**: Todo elemento interativo do app fornece feedback visual suave e consistente
**Depends on**: Phase 32
**Requirements**: MICR-01, MICR-02, MICR-03, MICR-04, MICR-05, MICR-06, MICR-07
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Todos os botões possuem hover, active e disabled states com transição suave (≤200ms)
  2. Todos os cards reagem a hover com elevação ou sombra suave
  3. Focus rings são visíveis e elegantes em todos os elementos focáveis (keyboard navigation)
  4. Inputs possuem border glow no focus e shake sutil em erro de validação
  5. Itens de navegação indicam estado ativo com transição suave
  6. Cursores apropriados em todos os elementos interativos
  7. Scroll entre âncoras e páginas longas é suave
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [x] 33-01-PLAN.md — CSS Foundation & Component Primitives: focus rings, card hover, button active, input shake, floating labels, sidebar nav transitions
- [x] 33-02-PLAN.md — Auth Forms Floating Labels & Error Shake: sign-in, sign-up, reset-password, complete-profile, password-input
- [x] 33-03-PLAN.md — Vault Forms & Verification: expense-filters, expense-side-panel, expense-category-modal, reminders-section, search-bar

### Phase 34: Feedback de Ação e Loading
**Goal**: Usuários recebem feedback visual calmo e imediato sobre o estado de suas ações
**Depends on**: Phase 32, Phase 33
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04, FEED-05
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Toasts entram com slide+fade e saem com fade — duração ≤300ms, sem bloquear interação
  2. Botões de Server Action exibem estado de loading visual via `useTransition` (opacity + spinner)
  3. Skeletons exibem shimmer gradient orgânico em vez de pulse mecânico de opacidade
  4. Spinner leve (SVG + CSS) disponível para todos os estados de loading
  5. Erros de formulário acionam border color transition e shake sutil imediato
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 34-01-PLAN.md — Toast Animation: enter slide+fade ≤300ms, exit fade ≤300ms, tokenized timing, prefers-reduced-motion
- [ ] 34-02-PLAN.md — Skeleton Shimmer + Spinner Component: organic gradient shimmer 1.6s, standalone Spinner with 3 sizes
- [ ] 34-03-PLAN.md — Button Loading State (useTransition): audit all ~10 components, wire isPending to Button[isLoading] or opacity/cursor feedback
- [ ] 34-04-PLAN.md — Form Error Feedback: audit all forms for .input-error-shake wiring, border color transition, shake re-trigger via onAnimationEnd

### Phase 35: Listas e Transições de Página
**Goal**: Navegação e listagens "respiram" — entram suavemente e transicionam sem cortes secos
**Depends on**: Phase 32, Phase 33, Phase 34
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Listagens de pacientes, atendimentos e financeiro exibem staggered animation de entrada (cap 10 itens)
  2. Navegação entre rotas do vault apresenta fade suave ≤150ms sem bloquear clicks rápidos
  3. Cards e filtros expansíveis animam altura suavemente sem layout shift
  4. Adição/remoção de itens em listas fornece feedback visual de movimento
**Plans**: 5 plans in 2 waves

Plans:
- [x] 35-01-PLAN.md — CSS Foundation: update motion.css (.motion-stagger → slideUp, .details-animated, .list-item-start/exit), adjust vault-page-enter to 150ms
- [x] 35-02-PLAN.md — LIST-01 Stagger: apply to /patients and /prontuario Server Component lists
- [x] 35-03-PLAN.md — LIST-03 Expand/Collapse: apply to agenda and prontuario/[patientId] details elements
- [x] 35-04-PLAN.md — LIST-03 Expand/Collapse: apply to financeiro expense-filters and patient finance-section details
- [x] 35-05-PLAN.md — LIST-01 + LIST-04 Financeiro: stagger charge list + add/remove enter/exit feedback

**UI hint**: yes

### Phase 36: Polish, Accessibility & Measurement
**Goal**: Motion é consistente, acessível e não regressa a performance objetiva
**Depends on**: Phase 32, Phase 33, Phase 34, Phase 35
**Requirements**: POLI-01, POLI-02, POLI-03, POLI-04, POLI-05
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Audit page-by-page confirma que 100% dos elementos interativos têm feedback visual consistente
  2. Teste com `prefers-reduced-motion: reduce` ativo mostra zero animações persistentes
  3. INP e CLS permanecem dentro dos thresholds do v1.4 (sem regressão)
  4. CLAUDE.md documenta padrões de motion, tokens e anti-padrões
  5. Todos os 407 testes existentes continuam passando
**Plans**: TBD

### Phase 37: Foundation & Migration
**Goal**: Data layer e domain model preparados para o ciclo de vida completo de documentos, com migração 100% segura de dados existentes
**Depends on**: Phase 36
**Requirements**: MIGR-01, MIGR-02, MIGR-03, MIGR-04, MIGR-05
**Success Criteria** (what must be TRUE):
   1. Schema possui `status`, `appointmentId`, `signedAt`, `signedByAccountId`, `deliveredAt`, `deliveredTo`, `deliveredVia` — todos nullable com defaults seguros
   2. Migration Prisma mapeia documentos existentes: `archivedAt != null` → `status='archived'`; demais → `status='finalized'`
   3. Índices compostos novos: `[workspaceId, patientId, status]`, `[workspaceId, patientId, createdAt]`, `[appointmentId]`
   4. Domain model inclui `DocumentStatus` enum, funções de transição puras (`finalizeDocument`, `signDocument`, `deliverDocument`), guards imutáveis
   5. Todos os documentos existentes continuam acessíveis e funcionais sem intervenção do usuário — zero downtime
   6. Repository extended com `listByStatus`, `listDraftsByPatient`, `findByAppointmentId`
**Plans**: TBD

### Phase 38: Estados e Rascunho Server-Side
**Goal**: Documentos têm ciclo de vida claro (draft→finalized→signed→delivered) com auto-save server-side e listagem inteligente
**Depends on**: Phase 37
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06
**Success Criteria** (what must be TRUE):
   1. Documento pode ser criado como `draft` e persistir no servidor via auto-save debounce
   2. Transições `finalize`, `sign`, `deliver` são Server Actions validadas com workspace + role
   3. Listagem de documentos é cronológica com badges de estado visuais (Rascunho, Pendente, Assinado, Entregue, Arquivado)
   4. Filtros rápidos: "Mostrar rascunhos", "Mostrar pendentes de assinatura", "Mostrar assinados"
   5. Documento `signed` tem conteúdo imutável; `delivered` registra data/destino/método
   6. Rascunhos de `session_record` são privados e nunca aparecem em exportações ou listagens globais
**Plans**: TBD
**UI hint**: yes

### Phase 39: Editor Unificado e Preview A4
**Goal**: Experiência de escrita e visualização de documentos é premium — editor contextual, preview como documento real, PDF universal
**Depends on**: Phase 37
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06
**Success Criteria** (what must be TRUE):
   1. `DocumentEditor` único com modo `free` (rich text completo para session_record) e modo `structured` (seções guiadas para documentos formais)
   2. Visualização de documento renderiza em layout A4 simulado na tela — tipografia, margens, cabeçalho com dados do profissional/paciente
   3. Todo documento `finalized` ou `signed` pode gerar PDF; preview PDF embutido em modal sem precisar baixar
   4. Assinatura digital é ritual de finalização, não gate no meio da criação
   5. `@react-pdf/renderer` renderiza rich text convertendo HTML para nodes do react-pdf
   6. Templates visuais por tipo (declaração, laudo, recibo, registro privado) com substituição segura de variáveis
**Plans**: 3 plans in 2 waves
**UI hint**: yes

Plans:
- [x] 39-01-PLAN.md — PDF Rich Text Foundation: custom HTML→react-pdf mapper, universal PDF generation, route updates
- [x] 39-02-PLAN.md — A4 Document View: paper layout component, view page refactor, responsive scaling
- [x] 39-03-PLAN.md — Preview Modal, Signature Ritual & Structured Editor: lazy-loaded modal, sign action gate, structured templates

### Phase 40: Integração com Atendimentos
**Goal**: Documentos nascem do contexto clínico correto — ligados a atendimentos, com pre-fill preciso e fluxo contínuo
**Depends on**: Phase 37
**Requirements**: APPT-01, APPT-02, APPT-03, APPT-04, APPT-05
**Success Criteria** (what must be TRUE):
   1. Documento pode ter `appointmentId` opcional; quando preenchido, exibe contexto da sessão na visualização
   2. Criar documento a partir da página de atendimento preenche automaticamente data, hora, tipo de atendimento
   3. Declaração de comparecimento nasce diretamente de um atendimento específico
   4. Relatório de acompanhamento preenche com notas clínicas do período correto (últimas N sessões), não todas as notas do paciente
   5. Fluxo sessão→nota→documento preserva contexto e parâmetro `from` para navegação de volta
**Plans**: TBD
**UI hint**: yes

### Phase 41: Dashboard e Navegação
**Goal**: Usuários navegam e visualizam todos os documentos do workspace de forma centralizada, com hierarquia clara
**Depends on**: Phase 38, Phase 39
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
   1. Página `/documentos` acessível com todos os documentos do workspace, ordenados cronologicamente
   2. Filtros por tipo, intervalo de datas, paciente e estado do documento
   3. Breadcrumbs hierárquicos em todos os fluxos (ex: Pacientes > Fulano > Documentos > Novo > Laudo)
   4. Tabs no perfil do paciente preservam estado ativo na URL para deep-linking e refresh seguro
   5. Documentos agrupados visualmente por tipo com badges de contagem
   6. Nenhuma listagem inclui campos sensíveis (`importantObservations`)
**Plans**: TBD
**UI hint**: yes

### Phase 42: Polish e Cleanup
**Goal**: Código legado de documentos é removido, app estável, zero regressão, documentação atualizada
**Depends on**: Phase 38, Phase 39, Phase 40, Phase 41
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04
**Success Criteria** (what must be TRUE):
   1. Código do fluxo antigo de documentos (auto-save localStorage, textarea para documentos formais, visualização em `<pre>`) é removido
   2. Todos os 419+ testes existentes continuam passando; novos testes cobrem transições de estado e migração
   3. Documentos existentes de usuários reais permanecem intactos e acessíveis
   4. Audit trail cobre todas as transições de estado (finalize, sign, deliver, archive)
   5. CLAUDE.md atualizado com padrões do novo fluxo de documentos
**Plans**: TBD

## Progress Table

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 23. Wave 1 — Navegação e Cache | v1.3 | 2/2 | Complete | 2026-04-22 |
| 24. Wave 2 — Auth Deduplication | v1.3 | 1/1 | Complete | 2026-04-22 |
| 25. Wave 3 — Finance Query Consolidation | v1.3 | 3/3 | Complete | 2026-04-22 |
| 26. Wave 4 — N+1 e Column Selection | v1.3 | 2/2 | Complete | 2026-04-22 |
| 27. Diagnóstico e Fundação de Dados | v1.4 | 3/3 | Complete | 2026-04-23 |
| 28. Streaming e Suspense Granular | v1.4 | 4/4 | Complete | 2026-04-23 |
| 29. Cache Seletivo e Seguro | v1.4 | 3/3 | Complete | 2026-04-23 |
| 30. Otimização de Assets e Bundle | v1.4 | 0/TBD | Not started | — |
| 31. Medição, Observabilidade e Iteração | v1.4 | 3/3 | Complete    | 2026-04-23 |
| 32. Motion Tokens & Foundation CSS | v1.5 | 3/3 | Complete | 2026-04-23 |
| 33. Micro-interações em Componentes Base | v1.5 | 3/3 | Complete    | 2026-04-24 |
| 34. Feedback de Ação e Loading | v1.5 | 4/4 | Planned | — |
| 35. Listas e Transições de Página | v1.5 | 5/5 | Complete    | 2026-04-24 |
| 36. Polish, Accessibility & Measurement | v1.5 | 0/TBD | Not started | — |
| 37. Foundation & Migration | v1.6 | 5/5 | Complete | 2026-04-25 |
| 38. Estados e Rascunho Server-Side | v1.6 | 1/1 | Complete    | 2026-04-25 |
| 39. Editor Unificado e Preview A4 | v1.6 | 3/3 | Complete | 2026-04-25 |
| 40. Integração com Atendimentos | v1.6 | 0/TBD | Not started | — |
| 41. Dashboard e Navegação | v1.6 | 0/TBD | Not started | — |
| 42. Polish e Cleanup | v1.6 | 0/TBD | Not started | — |

---
*Milestone v1.4: Performance Profunda — roadmap created: 2026-04-23*
*Milestone v1.5: Motion & Feel — roadmap updated: 2026-04-23*
*Milestone v1.6: Documentos — Workflow Clínico Impecável — roadmap created: 2026-04-25*
