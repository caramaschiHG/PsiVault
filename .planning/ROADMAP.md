# Roadmap: PsiVault v1.3 Performance

**Milestone:** v1.3 Performance
**Goal:** Eliminar a lentidão sistêmica do app resolvendo os 10 problemas identificados em auditoria — das navegações com full-reload às queries explosivas no /financeiro.
**Phases:** 23–26
**Coverage:** 10/10 requirements mapped ✓

---

## Phases

- [x] **Phase 23: Wave 1 — Navegação e Cache** - Eliminar full page reloads e habilitar caching do Next.js
- [x] **Phase 24: Wave 2 — Auth Deduplication** - Eliminar round-trips redundantes ao Supabase Auth no middleware
- [ ] **Phase 25: Wave 3 — Finance Query Consolidation** - Consolidar ~44 queries do /financeiro em agregações SQL
- [ ] **Phase 26: Wave 4 — N+1 e Column Selection** - Eliminar N+1 na agenda e colunas desnecessárias em listagens

---

## Phase Details

### Phase 23: Wave 1 — Navegação e Cache
**Goal**: Usuário navega entre seções sem full page reload, e o app aproveita o caching padrão do Next.js em todas as páginas vault
**Depends on**: Nothing (first phase of milestone)
**Requirements**: NAV-01, CACHE-01, CACHE-02
**Success Criteria** (what must be TRUE):
  1. Clicar em qualquer item da sidebar ou bottom nav não provoca full page reload — transição é client-side e instantânea
  2. Páginas vault são servidas com caching do Next.js por padrão — `force-dynamic` removido do layout raiz vault
  3. `resolveSession()` executa a chamada Supabase/DB no máximo uma vez por request, mesmo quando invocada por múltiplos server components
  4. 351 testes continuam passando sem regressão funcional
**Plans**: 2 plans
Plans:
- [ ] 23-01-PLAN.md — Migrar vault-sidebar-nav.tsx e bottom-nav.tsx para Link (NAV-01)
- [ ] 23-02-PLAN.md — Remover force-dynamic e envolver session/client com React.cache() (CACHE-01, CACHE-02)

### Phase 24: Wave 2 — Auth Deduplication
**Goal**: Cada request ao vault faz no máximo um round-trip ao Supabase Auth, eliminando chamadas duplicadas no middleware
**Depends on**: Phase 23
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. Middleware não chama `supabase.auth.getUser()` separadamente após `updateSession()` — user é reutilizado do resultado de `updateSession()`
  2. Verificação de MFA (`getAuthenticatorAssuranceLevel`) não executa em todo request vault — status AAL é cacheado por request ou verificação é condicional
  3. Autenticação e MFA continuam funcionando corretamente — login, logout e fluxo de MFA sem regressão
**Plans**: 1 plan
Plans:
- [ ] 24-01-PLAN.md — JWT fast-path para AAL check no vault (AUTH-01, AUTH-02)

### Phase 25: Wave 3 — Finance Query Consolidation
**Goal**: Página /financeiro carrega com ≤10 queries de DB e server actions não disparam re-renders desnecessários
**Depends on**: Phase 24
**Requirements**: QUERY-01, QUERY-02, QUERY-03
**Success Criteria** (what must be TRUE):
  1. `/financeiro` faz ≤10 queries de DB por page load — dados de trend (6 meses) e DRE anual (12 meses) consolidados em `GROUP BY` SQL em vez de 18 chamadas individuais a `loadMonthBreakdown`
  2. Charts de evolução (trend 6 meses e DRE anual) são renderizados client-side após o load inicial — não bloqueiam o SSR da listagem de cobranças
  3. Marcar cobrança como paga, criar cobrança e outras server actions não re-renderizam toda a página — `revalidatePath` com escopo narrowado para a rota específica ou updates otimistas
  4. Conteúdo principal (lista de cobranças, totais do mês) aparece visivelmente antes dos charts
**Plans**: TBD
**UI hint**: yes

### Phase 26: Wave 4 — N+1 e Column Selection
**Goal**: Agenda busca clinical notes em batch e listagens de pacientes não trafegam dados sensíveis desnecessários
**Depends on**: Phase 25
**Requirements**: QUERY-04, QUERY-05
**Success Criteria** (what must be TRUE):
  1. Página de agenda com N atendimentos completados executa 1 query batch para clinical notes — não N queries individuais
  2. `listActive()` e `listArchived()` do patient repository não retornam o campo `importantObservations` — excluído via `select` explícito
  3. Listagens de pacientes não expõem `importantObservations` em nenhum endpoint de listagem (apenas na página individual do paciente)
  4. 351 testes continuam passando; comportamento visual das páginas de agenda e pacientes sem regressão
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 23. Wave 1 — Navegação e Cache | 2/2 | Complete | 2026-04-22 |
| 24. Wave 2 — Auth Deduplication | 1/1 | Complete | 2026-04-22 |
| 25. Wave 3 — Finance Query Consolidation | 0/0 | Not started | - |
| 26. Wave 4 — N+1 e Column Selection | 0/0 | Not started | - |

---

## Coverage

| Requirement | Phase | Category |
|-------------|-------|----------|
| NAV-01 | Phase 23 | Navegação |
| CACHE-01 | Phase 23 | Cache e Renderização |
| CACHE-02 | Phase 23 | Cache e Renderização |
| AUTH-01 | Phase 24 | Auth e Middleware |
| AUTH-02 | Phase 24 | Auth e Middleware |
| QUERY-01 | Phase 25 | Finance Queries |
| QUERY-02 | Phase 25 | Finance Queries |
| QUERY-03 | Phase 25 | Finance Queries |
| QUERY-04 | Phase 26 | Queries e Limpeza |
| QUERY-05 | Phase 26 | Queries e Limpeza |

**Total mapped:** 10/10 ✓

---
*Created: 2026-04-22 — Milestone v1.3 Performance*
