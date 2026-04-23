# Phase 29 Context — Cache Seletivo e Seguro

## Phase Goal

Dados de leitura intensa carregam instantaneamente do cache sem risco de vazamento cross-tenant.

## Scope

1. **CACHE-01**: Practice profile e categorias de despesa carregam do cache em visitas repetidas
2. **CACHE-02**: Todas as Server Actions de mutação invalidam cache de domínio imediatamente
3. **CACHE-03**: Nenhum dado cacheado é servido sem `workspaceId` na chave de cache
4. **CACHE-04**: Todas as chamadas `revalidatePath` existentes usam escopo `'page'` corretamente

## Existing State

### Caching already in place
- `React.cache()` em `resolveSession()` e `createClient()` — request-scoped deduplication (Phase 23)
- `revalidatePath("/financeiro", "page")` em 13 server actions — escopo correto (Phase 25)
- Full Route Cache do Next.js 15 ativo (force-dynamic removido em Phase 23)

### Read-heavy data patterns identified
- `getPracticeProfileSnapshot(workspaceId)` — chamada em 10+ páginas (financeiro, agenda, setup, profile, patients, appointments, complete-profile, document PDF route). Raramente muda.
- `expenseCategoryRepository.findActiveByWorkspace(workspaceId)` — chamada em `/financeiro` async section. Muda poucas vezes por dia.
- `expenseCategoryRepository.findByWorkspace(workspaceId)` — não identificado como chamado em hot path; envolver por consistência.

### revalidatePath audit (estado atual)

| Arquivo | Chamadas | Com "page" | Sem "page" |
|---------|----------|------------|------------|
| `financeiro/actions.ts` | 13 | 13 | 0 |
| `setup/actions.ts` | 3 | 0 | 3 |
| `settings/notificacoes/actions.ts` | 1 | 0 | 1 |
| `appointments/actions.ts` | 10 | 0 | 10 |
| `actions/reminders.ts` | 2 | 0 | 2 |
| **Total** | **29** | **13** | **16** |

**Nota**: O ROADMAP cita "13 chamadas existentes" — refere-se ao subconjunto de `/financeiro` que foi auditado em v1.3. Esta phase audita e corrige **todas** as 29 chamadas.

### Server Actions sem revalidatePath (usam redirect)
- `patients/actions.ts` — create, update, archive, recover (usam `redirect()`)
- `patients/[patientId]/documents/*/actions.ts` — create, archive document (usam `redirect()`)
- `sessions/[appointmentId]/actions.ts` — create/update note (usam `redirect()`)
- `settings/dados-e-privacidade/actions.ts` — sem revalidatePath identificado

## Decisions

### D-01: Cache API
Usar `unstable_cache` do `next/cache` para cache cross-request. `React.cache()` é request-scoped e já está em uso para auth — não serve para persistir entre visitas.

### D-02: Cache key discipline
Toda chave de `unstable_cache` DEVE incluir `workspaceId` como argumento da função cacheada. O prefixo da chave é estático (ex: `["practice-profile"]`), mas o `workspaceId` é serializado automaticamente pelo Next.js como parte da chave de cache quando passado como argumento.

### D-03: Tag strategy
Usar tags de domínio estáticas para invalidação. `revalidateTag('expense-categories')` invalida todas as workspaces — over-invalidation é aceitável e mais seguro que under-invalidation nesta escala. Tags por workspace (`expense-categories:${workspaceId}`) não são suportadas nativamente por `unstable_cache` sem wrapper complexo.

### D-04: revalidatePath scope
Toda chamada `revalidatePath` DEVE especificar `"page"` como segundo argumento, a menos que revalidação de layout seja explicitamente necessária. Nenhuma chamada bare `revalidatePath("/path")` deve permanecer.

### D-05: Invalidação dupla
Mutation actions que já usam `revalidatePath` ganham `revalidateTag` adicional. Não remover `revalidatePath` existente — manter ambos para garantir invalidação tanto no Full Route Cache quanto no Data Cache.

### D-06: Não adicionar revalidatePath a actions que usam redirect
Actions em `patients/actions.ts`, documentos e sessions usam `redirect()` após mutação. Não adicionar `revalidatePath` a estas — o redirect já provoca fetch fresh da rota destino. Adicionar `revalidateTag` apenas se o domínio correspondente tiver `unstable_cache`.

## Deferred Ideas

- Cache de listas de pacientes, atendimentos ou despesas — dados mutam com frequência; beneficiam menos de cache
- Wrapper genérico de `unstable_cache` por workspace — complexidade desnecessária para 2 métodos cacheados
- Custom Redis/cache externo — research recomenda evitar; built-in caching do Next.js é suficiente

## the agent's Discretion

- Escolher TTL `revalidate` apropriado: 3600s (1h) para practice profile e expense categories — dados raramente mudam
- Agrupar tags de domínio em arquivo central `src/lib/cache/tags.ts` para descoberta fácil
- Se `unstable_cache` import falhar em testes (Vitest node env), mockar em `tests/setup.ts` ou usar wrapper condicional

## Key Files

### Read cache targets
- `src/lib/setup/profile.ts` — wrap `db.practiceProfile.findUnique` with `unstable_cache`
- `src/lib/expense-categories/repository.prisma.ts` — wrap `findActiveByWorkspace` and `findByWorkspace`

### revalidatePath audit targets
- `src/app/(vault)/setup/actions.ts` — 3 calls
- `src/app/(vault)/settings/notificacoes/actions.ts` — 1 call
- `src/app/(vault)/appointments/actions.ts` — 10 calls
- `src/app/(vault)/actions/reminders.ts` — 2 calls

### revalidateTag targets
- `src/app/(vault)/financeiro/actions.ts` — add tags for charges, expenses, expense-categories
- `src/app/(vault)/setup/actions.ts` — add tag for practice-profile
- `src/app/(vault)/appointments/actions.ts` — add tag for appointments
- `src/app/(vault)/actions/reminders.ts` — add tag for reminders
- `src/app/(vault)/settings/notificacoes/actions.ts` — add tag for notifications

## Requirements Mapping

| REQ | Success Criteria | Plan |
|-----|-----------------|------|
| CACHE-01 | Practice profile e categorias de despesa carregam do cache | 29-01 |
| CACHE-02 | Server Actions de mutação invalidam cache imediatamente | 29-03 |
| CACHE-03 | workspaceId em toda chave de cache | 29-01 |
| CACHE-04 | revalidatePath com escopo 'page' | 29-02 |
