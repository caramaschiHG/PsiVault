# Phase 23: Wave 1 — Navegação e Cache - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Substituir `<a href>` por `<Link>` em vault-sidebar-nav.tsx e bottom-nav.tsx para eliminar full page reloads. Remover `force-dynamic` do vault layout raiz e limpar declaração redundante em patients/archive. Envolver `resolveSession()` e `createClient()` com `React.cache()` para deduplicar chamadas Supabase/DB por request. 351 testes devem continuar passando.

</domain>

<decisions>
## Implementation Decisions

### Migração dos Componentes de Navegação
- Migrar `vault-sidebar-nav.tsx` e `bottom-nav.tsx` simultaneamente — são acoplados em UX
- Não usar `prefetch` explícito no `<Link>` — App Router faz prefetch on-viewport por padrão
- Migrar active state detection para `usePathname()` (next/navigation) — `window.location` não funciona em SSR
- Verificar `settings-nav.tsx` para consistência de padrão (já usa `<Link>`, confirmar sem excessos)

### Estratégia de Caching
- Não tratar páginas individualmente após remover `force-dynamic` do layout — `cookies()` em `resolveSession()` já garante dynamic rendering por page
- Remover `force-dynamic` redundante de `patients/archive/page.tsx`
- Envolver `resolveSession()` com `React.cache()` para deduplicação por render tree
- Envolver `createClient()` (src/lib/supabase/server.ts) com `React.cache()` — evita múltiplos clientes Supabase por request

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/(vault)/settings/components/settings-nav.tsx` já usa `<Link prefetch>` — padrão correto de referência
- `src/lib/supabase/session.ts` — função `resolveSession()` plain async, alvo de React.cache()
- `src/lib/supabase/server.ts` — função `createClient()` plain async, alvo de React.cache()

### Established Patterns
- `usePathname()` de `next/navigation` já em uso na codebase (settings-nav.tsx)
- Componentes client marcados com `"use client"` no topo
- Supabase SSR client via `createServerClient` de `@supabase/ssr`

### Integration Points
- `src/app/(vault)/layout.tsx` — remover `export const dynamic = "force-dynamic"` (linha 9)
- `src/app/(vault)/components/vault-sidebar-nav.tsx` — substituir `<a href>` por `<Link>` (linhas 103-110)
- `src/app/(vault)/components/bottom-nav.tsx` — substituir `<a href>` por `<Link>` (linhas 89-96)
- `src/app/(vault)/patients/archive/page.tsx` — remover `force-dynamic` redundante
- `src/lib/supabase/session.ts` — envolver resolveSession com React.cache()
- `src/lib/supabase/server.ts` — envolver createClient com React.cache()

</code_context>

<specifics>
## Specific Ideas

- Transições devem ser instantâneas e sem loading indicator artificial — o prefetch on-viewport do Next.js é suficiente
- `usePathname()` exige que os componentes de nav sejam `"use client"` — verificar se já são

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
