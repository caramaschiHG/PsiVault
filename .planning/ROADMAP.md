# Roadmap: PsiVault

## Milestones

- ✅ **v1.0 MVP** — Phases 1–12 (shipped 2026-02)
- ✅ **v1.1 Notifications** — Phases 13–16 (shipped 2026-03)
- ✅ **v1.2 Finance** — Phases 17–22 (shipped 2026-04)
- ✅ **v1.3 Performance** — Phases 23–26 (shipped 2026-04-22)
- 📋 **v1.4 Performance Profunda** — Phases 27–31 (in progress)
- 📋 **v1.5 Motion & Feel** — Phases 32–36 (planned)

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
- [ ] **Phase 31: Medição, Observabilidade e Iteração** — Lighthouse CI, RUM, memlab, react-scan, relatório before/after

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
**Plans**: TBD
**UI hint**: yes

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
**Plans**: TBD

### 📋 v1.5 Motion & Feel — Interações Fluidas (Planned)

- [x] **Phase 32: Motion Tokens & Foundation CSS** — Tokens de duration/easing/stagger, reduced motion fallback, utility classes
- [ ] **Phase 33: Micro-interações em Componentes Base** — Hover/focus/active states, focus rings, input micro-interactions, smooth scroll
- [ ] **Phase 34: Feedback de Ação e Loading** — Toast AnimatePresence, useTransition em botões, skeleton shimmer, spinner
- [ ] **Phase 35: Listas e Transições de Página** — Staggered lists, page transition fade, layout animations expand/collapse
- [ ] **Phase 36: Polish, Accessibility & Measurement** — Motion audit, reduced motion test, INP/CLS validation, docs

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
**Plans**: TBD
**UI hint**: yes

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
**Plans**: TBD
**UI hint**: yes

### Phase 35: Listas e Transições de Página
**Goal**: Navegação e listagens "respiram" — entram suavemente e transicionam sem cortes secos
**Depends on**: Phase 32, Phase 33, Phase 34
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Listagens de pacientes, atendimentos e financeiro exibem staggered animation de entrada (cap 10 itens)
  2. Navegação entre rotas do vault apresenta fade suave ≤150ms sem bloquear clicks rápidos
  3. Cards e filtros expansíveis animam altura suavemente sem layout shift
  4. Adição/remoção de itens em listas fornece feedback visual de movimento
**Plans**: TBD
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
| 31. Medição, Observabilidade e Iteração | v1.4 | 0/TBD | Not started | — |
| 32. Motion Tokens & Foundation CSS | v1.5 | 3/3 | Complete | 2026-04-23 |
| 33. Micro-interações em Componentes Base | v1.5 | 0/TBD | Not started | — |
| 34. Feedback de Ação e Loading | v1.5 | 0/TBD | Not started | — |
| 35. Listas e Transições de Página | v1.5 | 0/TBD | Not started | — |
| 36. Polish, Accessibility & Measurement | v1.5 | 0/TBD | Not started | — |

---
*Milestone v1.4: Performance Profunda — roadmap created: 2026-04-23*
*Milestone v1.5: Motion & Feel — roadmap updated: 2026-04-23*
