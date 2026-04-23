# Roadmap: PsiVault

## Milestones

- ✅ **v1.0 MVP** — Phases 1–12 (shipped 2026-02)
- ✅ **v1.1 Notifications** — Phases 13–16 (shipped 2026-03)
- ✅ **v1.2 Finance** — Phases 17–22 (shipped 2026-04)
- ✅ **v1.3 Performance** — Phases 23–26 (shipped 2026-04-22)
- 📋 **v1.4 Performance Profunda** — Phases 27–31 (planned)

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

- [ ] **Phase 27: Diagnóstico e Fundação de Dados** — Baseline de bundle, CWV, índices DB e pooling
- [ ] **Phase 28: Streaming e Suspense Granular** — loading.tsx, async sections, React 19 use API, skeletons
- [ ] **Phase 29: Cache Seletivo e Seguro** — unstable_cache, revalidateTag, workspace-scoped keys, revalidatePath audit
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
**Plans**: TBD

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
**Plans**: TBD
**UI hint**: yes

### Phase 29: Cache Seletivo e Seguro
**Goal**: Dados de leitura intensa carregam instantaneamente do cache sem risco de vazamento cross-tenant
**Depends on**: Phase 28
**Requirements**: CACHE-01, CACHE-02, CACHE-03, CACHE-04
**Success Criteria** (o que deve ser VERDADEIRO):
  1. Practice profile e categorias de despesa carregam do cache em visitas repetidas
  2. Todas as Server Actions de mutação invalidam cache de domínio imediatamente
  3. Nenhum dado cacheado é servido sem `workspaceId` na chave de cache
  4. Todas as 13 chamadas `revalidatePath` existentes usam escopo `'page'` corretamente
**Plans**: TBD

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

## Progress Table

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 23. Wave 1 — Navegação e Cache | v1.3 | 2/2 | Complete | 2026-04-22 |
| 24. Wave 2 — Auth Deduplication | v1.3 | 1/1 | Complete | 2026-04-22 |
| 25. Wave 3 — Finance Query Consolidation | v1.3 | 3/3 | Complete | 2026-04-22 |
| 26. Wave 4 — N+1 e Column Selection | v1.3 | 2/2 | Complete | 2026-04-22 |
| 27. Diagnóstico e Fundação de Dados | v1.4 | 0/TBD | Not started | — |
| 28. Streaming e Suspense Granular | v1.4 | 0/TBD | Not started | — |
| 29. Cache Seletivo e Seguro | v1.4 | 0/TBD | Not started | — |
| 30. Otimização de Assets e Bundle | v1.4 | 0/TBD | Not started | — |
| 31. Medição, Observabilidade e Iteração | v1.4 | 0/TBD | Not started | — |

---
*Milestone v1.4: Performance Profunda — roadmap created: 2026-04-23*
