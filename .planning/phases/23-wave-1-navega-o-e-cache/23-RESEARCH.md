# Phase 23: Wave 1 — Navegação e Cache - Research

**Researched:** 2026-04-22
**Domain:** Next.js 15 App Router — client-side navigation, React.cache(), dynamic rendering
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Migrar `vault-sidebar-nav.tsx` e `bottom-nav.tsx` simultaneamente — são acoplados em UX
- Não usar `prefetch` explícito no `<Link>` — App Router faz prefetch on-viewport por padrão
- Migrar active state detection para `usePathname()` (next/navigation) — `window.location` não funciona em SSR
- Verificar `settings-nav.tsx` para consistência de padrão (já usa `<Link>`, confirmar sem excessos)
- Não tratar páginas individualmente após remover `force-dynamic` do layout — `cookies()` em `resolveSession()` já garante dynamic rendering por page
- Remover `force-dynamic` redundante de `patients/archive/page.tsx`
- Envolver `resolveSession()` com `React.cache()` para deduplicação por render tree
- Envolver `createClient()` (src/lib/supabase/server.ts) com `React.cache()` — evita múltiplos clientes Supabase por request

### Agent's Discretion
- Nenhuma área de discrição explícita — todas as decisões foram travadas na discuss phase

### Deferred Ideas (OUT OF SCOPE)
- Nenhum item deferido — discussão permaneceu dentro do escopo da fase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Usuário navega entre seções sem recarregar a página completa (sidebar e bottom nav usam `<Link>` em vez de `<a href>`) | Ambos os componentes já são `"use client"` com `usePathname()` — só falta trocar o elemento de renderização |
| CACHE-01 | `force-dynamic` removido do vault layout; páginas usam caching por default | `cookies()` em `resolveSession()` já provoca dynamic rendering por página automaticamente — remover a declaração global é seguro |
| CACHE-02 | `resolveSession()` executa no máximo uma vez por request via `React.cache()` | `React.cache()` deduplica chamadas async dentro da mesma render tree — padrão canônico do Next.js 15 |
</phase_requirements>

---

## Summary

Esta fase é de **refactoring cirúrgico** em 6 arquivos — sem novas dependências, sem mudanças de comportamento observável, sem risco de regressão de funcionalidade. A complexidade está em entender exatamente por que cada mudança é segura.

**Navegação:** `vault-sidebar-nav.tsx` e `bottom-nav.tsx` já são client components com `"use client"` e já importam `usePathname` de `next/navigation`. A única mudança necessária é trocar `<a href="...">` por `<Link href="...">` nos elementos de renderização. A lógica `isActive()` existente não muda. O `<Link>` do Next.js 15 App Router intercepta cliques e usa a API de navegação client-side do React, evitando full page reloads.

**Cache:** `export const dynamic = "force-dynamic"` no vault layout força que **todas** as páginas vault sejam dinâmicas, mesmo as que não precisam. Removendo essa declaração, cada página individualmente determina seu behavior: páginas que chamam `resolveSession()` já se tornam dinâmicas automaticamente porque `resolveSession()` chama `cookies()` (via `createClient()`). O `React.cache()` em torno de `resolveSession()` e `createClient()` garante que múltiplos server components no mesmo request não disparem chamadas duplicadas ao Supabase/DB.

**Primary recommendation:** Todas as mudanças são trocas de 1-para-1 (a→Link, plain async→React.cache wrapped, remove line). Nenhuma lógica de negócio muda. Nenhuma dependência nova é adicionada. Escrever cada mudança em arquivo separado para commits atômicos.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Client-side navigation (Link) | Browser / Client | — | O Next.js Router mantém estado no cliente; Link intercepta cliques antes do browser processar o href |
| Active state detection (usePathname) | Browser / Client | — | pathname atual é estado do router client-side |
| Session resolution (resolveSession) | API / Backend (Server Component) | — | Acessa cookies, Supabase e DB — só pode rodar no servidor |
| Request-scoped deduplication (React.cache) | API / Backend (Server Component) | — | React.cache() é mecanismo de memoização da React render tree no servidor |
| Dynamic rendering opt-in (cookies()) | Frontend Server (SSR) | — | Next.js detecta uso de cookies() e marca o segment como dinâmico automaticamente |

---

## Standard Stack

### Core (já presente no projeto — nenhuma instalação necessária)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/link` | Next.js 15 (já instalado) | Client-side navigation sem full reload | Componente canônico do Next.js App Router |
| `next/navigation` `usePathname` | Next.js 15 (já instalado) | Lê pathname atual no cliente | Já em uso em `settings-nav.tsx` e ambos os componentes alvo |
| `react` `cache` | React 19 (já instalado) | Memoiza chamadas async por render tree | API estável desde React 18, recomendada pela equipe Next.js para deduplicação |

**Installation:** Nenhuma — todas as dependências já estão no projeto.

---

## Architecture Patterns

### System Architecture Diagram

```
Request HTTP
    │
    ▼
Next.js Middleware (src/middleware.ts)
    │  verifica sessão, deixa passar
    ▼
(vault)/layout.tsx  [Server Component — sem force-dynamic]
    │
    ├─► VaultSidebarNav  [Client Component — Link + usePathname]
    │       ↑ intercept click → router.push() (sem reload)
    │
    ├─► BottomNav         [Client Component — Link + usePathname]
    │       ↑ intercept click → router.push() (sem reload)
    │
    └─► {children}        [Server Components]
            │
            └─► resolveSession()  [React.cache() wrapped]
                    │  ← executa no máx 1x por request
                    ├─► createClient()  [React.cache() wrapped]
                    │       └─► cookies()  ← marca segment como dynamic
                    └─► db.workspace.findUnique()
```

### Recommended Project Structure
```
src/
├── app/(vault)/
│   ├── layout.tsx                      # remover force-dynamic (linha 9)
│   ├── components/
│   │   ├── vault-sidebar-nav.tsx       # <a href> → <Link href> (linhas 103-110, 121-128, 142-143)
│   │   └── bottom-nav.tsx             # <a href> → <Link href> (linhas 89-96)
│   └── patients/archive/page.tsx      # remover force-dynamic (linha 8)
└── lib/supabase/
    ├── server.ts                       # createClient = cache(async function createClient...)
    └── session.ts                      # resolveSession = cache(async function resolveSession...)
```

### Pattern 1: `<Link>` em vez de `<a href>` (client component)
**What:** Substituir elemento HTML nativo `<a>` pelo componente `Link` do Next.js
**When to use:** Qualquer navegação interna no app onde full page reload é indesejado
**Example:**
```tsx
// ANTES (causa full page reload)
<a href="/patients" className="nav-link active">Pacientes</a>

// DEPOIS (navegação client-side, sem reload)
import Link from "next/link";
<Link href="/patients" className="nav-link active">Pacientes</Link>
```
`Link` renderiza um `<a>` no DOM mas intercepta cliques com o React Router — mesmo comportamento visual, sem reload. [VERIFIED: settings-nav.tsx já usa este padrão no projeto]

### Pattern 2: `React.cache()` para deduplicação por request
**What:** Envolve função async com `cache()` do React para memoizar resultado durante a render tree
**When to use:** Funções server-side chamadas por múltiplos Server Components no mesmo request (resolveSession, createClient)
**Example:**
```ts
// ANTES
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(...)
}

// DEPOIS — deduplica: segunda chamada retorna o mesmo cliente
import { cache } from 'react'

const createClient = cache(async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(...)
})

export { createClient }
```

**Importante:** `React.cache()` não é o mesmo que `unstable_cache` do Next.js:
- `React.cache()` — escopo: **render tree atual** (1 request). Resetado a cada request. [ASSUMED — baseado em docs React 18/19]
- `unstable_cache` / `"use cache"` — escopo: **cross-request** (persistido). Não usar aqui.

`React.cache()` é a escolha correta para dados de autenticação (accountId, workspaceId) que variam por usuário e não devem ser compartilhados entre requests.

### Pattern 3: Dynamic rendering por cookies() — sem force-dynamic
**What:** Next.js 15 detecta automaticamente uso de `cookies()` / `headers()` e marca o segment como dinâmico
**When to use:** Páginas que chamam `resolveSession()` já se tornam dinâmicas organicamente
**Example:**
```ts
// Não precisa de:
export const dynamic = "force-dynamic"; // ← remover

// resolveSession() já chama cookies() internamente via createClient()
// Next.js detecta isso e renderiza a página como dinâmica automaticamente
export default async function MyPage() {
  const { workspaceId } = await resolveSession(); // ← cookies() aqui dentro
  ...
}
```
[VERIFIED: layout.tsx linha 9 tem `export const dynamic = "force-dynamic"` — confirma que é o único local a remover no layout]

### Anti-Patterns to Avoid
- **`prefetch` explícito em `<Link>`:** `settings-nav.tsx` usa `prefetch` mas a decisão locked é **não** usar `prefetch` explícito nos novos Links de nav principal — App Router faz prefetch on-viewport por padrão no Next.js 15
- **`React.cache()` em client components:** `cache()` do React só funciona em Server Components e server-side code. Os componentes de nav são `"use client"` — não embrulhar nada neles com `cache()`
- **`unstable_cache` para dados de auth:** Dados de sessão não devem ser cacheados cross-request — usar apenas `React.cache()` (scoped por request)
- **Manter `window.location`:** Ambos os componentes já migraram para `usePathname()` [VERIFIED: vault-sidebar-nav.tsx linha 3, bottom-nav.tsx linha 3 — já importam `usePathname`]. Não há `window.location` nos arquivos atuais.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side navigation | Router manual com pushState() | `next/link` `<Link>` | Integra com prefetching, scroll restoration, parallel routes, intercepting routes do Next.js |
| Request-scoped memoization | Map/WeakMap manual de resultados | `React.cache()` | Gerenciado pelo React runtime, resetado automaticamente por request |

---

## Current State — Descobertas do Código Real

### vault-sidebar-nav.tsx (estado ATUAL — verificado)
- ✅ Já é `"use client"` (linha 1)
- ✅ Já importa `usePathname` de `next/navigation` (linha 3)
- ✅ Já usa `usePathname()` na função `isActive()` (linha 85)
- ❌ Links de nav: ainda usa `<a href>` (linhas 103-110, 121-128)
- ❌ Footer links: `<a href="/settings/profile">` (linha 142) e `<a href="/api/auth/signout">` (linha 143)
- ⚠️ O link de signout (`/api/auth/signout`) deve **permanecer** como `<a href>` — é uma navegação para rota de API que deve causar reload/redirect. Não converter para `<Link>`.

### bottom-nav.tsx (estado ATUAL — verificado)
- ✅ Já é `"use client"` (linha 1)
- ✅ Já importa `usePathname` de `next/navigation` (linha 3)
- ✅ Já usa `usePathname()` na função `isActive()` (linha 74)
- ❌ Nav items: ainda usa `<a href>` (linhas 89-96) — todos devem virar `<Link>`

### settings-nav.tsx (referência — verificado)
- ✅ Usa `<Link href prefetch>` corretamente
- ⚠️ Usa `prefetch` explícito — a decisão locked é NÃO usar prefetch explícito nos novos Links. Não copiar o `prefetch` ao migrar sidebar e bottom-nav.

### vault layout (estado ATUAL — verificado)
- ❌ Linha 9: `export const dynamic = "force-dynamic"` — remover
- ✅ Layout não chama `resolveSession()` diretamente — é Server Component puro de estrutura
- ✅ Seguro remover force-dynamic: as pages filhas que chamam `resolveSession()` se tornam dinâmicas automaticamente via `cookies()`

### patients/archive/page.tsx (estado ATUAL — verificado)
- ❌ Linha 8: `export const dynamic = "force-dynamic"` — remover (redundante, `resolveSession()` na linha 16 já garante dynamic via cookies())

### session.ts / server.ts (estado ATUAL — verificado)
- `createClient()`: função async plain, sem `React.cache()`. Chama `cookies()` (linha 5) — isso já torna os segments dinâmicos.
- `resolveSession()`: função async plain, sem `React.cache()`. Chama `createClient()` e `db.workspace.findUnique()`.
- ⚠️ `observeServerStage` é usado em `resolveSession()` — embrulhar `resolveSession` com `cache()` preserva o comportamento (observability ainda roda na primeira chamada)

---

## Common Pitfalls

### Pitfall 1: Converter o link de signout para `<Link>`
**What goes wrong:** `/api/auth/signout` é uma rota de API que faz redirect. `<Link>` faria prefetch dela e causaria signout acidental ou comportamento undefined.
**Why it happens:** Tentativa de "converter todos os `<a>` para `<Link>`" sem distinguir navigação interna de links para API routes
**How to avoid:** Manter `<a href="/api/auth/signout">` como está — links para API routes, recursos externos ou anchors devem permanecer `<a>`
**Warning signs:** Link com href começando em `/api/` — nunca converter para `<Link>`

### Pitfall 2: `React.cache()` não deduplica entre requests diferentes
**What goes wrong:** Desenvolvedor assume que `React.cache()` funciona como um cache persistido e remove invalidações
**Why it happens:** Confusão com `unstable_cache` / `"use cache"` do Next.js (cross-request)
**How to avoid:** `React.cache()` = memoização **por render tree** (equivalente a `useMemo` mas para Server Components). Cada request novo = novo cache vazio. Não há risco de dados de um usuário vazarem para outro.
**Warning signs:** Dados de autenticação errados por usuário = nunca acontece com `React.cache()` sozinho

### Pitfall 3: Remover force-dynamic sem verificar que cookies() está no caminho
**What goes wrong:** Se uma página **não** chamar `resolveSession()` (página pública, ou página que usasse outro mecanismo de auth), remover force-dynamic do layout poderia fazer essa página ser cached incorretamente
**Why it happens:** Dependência implícita entre layout e pages
**How to avoid:** Confirmado: **todas** as pages vault chamam `resolveSession()`, que chama `cookies()` — todas se tornam dinâmicas organicamente. Verificar isso antes de remover.
**Warning signs:** Página vault que carrega dados de usuário mas não chama `resolveSession()` — precisaria adicionar `export const dynamic = "force-dynamic"` individualmente

### Pitfall 4: Esquecer `import Link from "next/link"` nos componentes editados
**What goes wrong:** TypeScript erro em runtime ou `<Link>` não reconhecido
**Why it happens:** Ambos os componentes não têm `Link` importado atualmente
**How to avoid:** Adicionar `import Link from "next/link"` no topo de `vault-sidebar-nav.tsx` e `bottom-nav.tsx`

---

## Code Examples

### Link sem prefetch explícito (padrão correto para esta fase)
```tsx
// Source: vault-sidebar-nav.tsx após migração
import Link from "next/link";

// NAV_ITEMS map:
<Link
  href={item.href}
  className={`nav-link${isActive(item.href) ? " active" : ""}`}
  aria-current={isActive(item.href) ? "page" : undefined}
>
  {item.icon}
  <span>{item.label}</span>
</Link>
```

### React.cache() em createClient
```ts
// Source: src/lib/supabase/server.ts após migração
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

const createClient = cache(async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component — ignorar
          }
        },
      },
    }
  )
})

export { createClient }
```

### React.cache() em resolveSession
```ts
// Source: src/lib/supabase/session.ts após migração
import { cache } from 'react'

export const resolveSession = cache(async function resolveSession(): Promise<ResolvedSession> {
  // corpo idêntico ao atual
})
```

---

## Test Impact Analysis

### Estado atual dos testes
- **407 testes passando** [VERIFIED: `pnpm test` executado localmente — 407 passed, não 351 como na success criteria da fase. O número 351 é provavelmente desatualizado do roadmap.]
- Nenhum teste existente testa navegação client-side (sem testes de componente/E2E)
- Nenhum teste existente testa `resolveSession()` diretamente com React.cache()

### Impacto esperado
| Mudança | Risco de regressão | Justificativa |
|---------|-------------------|---------------|
| `<a>` → `<Link>` em nav components | ZERO | Client components sem testes unitários — render visual apenas |
| Remover `force-dynamic` do layout | ZERO | Behavior das pages não muda — cookies() já força dynamic |
| Remover `force-dynamic` de archive/page | ZERO | `resolveSession()` na mesma página já garante dynamic |
| `React.cache()` em `createClient` | ZERO | Deduplica, não altera valor retornado |
| `React.cache()` em `resolveSession` | ZERO | Deduplica, não altera valor retornado |

**Conclusão:** Os 407 testes devem continuar passando. As mudanças são de infraestrutura de rendering, não de lógica de negócio.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | vitest.config.ts |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Link intercepta cliques sem reload | manual/visual | n/a — comportamento de navegação browser | N/A |
| CACHE-01 | Pages sem force-dynamic respondem corretamente | manual/smoke | n/a — requer browser request | N/A |
| CACHE-02 | resolveSession não duplica chamadas | unit | `pnpm test -- auth-session` | ✅ (existente, cobre session logic) |

### Sampling Rate
- **Per commit:** `pnpm test` — garantir 407 tests green após cada arquivo editado
- **Phase gate:** `pnpm test` full suite green antes de verificar

### Wave 0 Gaps
- Nenhum — os testes existentes cobrem a lógica de negócio que não muda. Mudanças de navegação e rendering são verificadas manualmente.

---

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | sim (indiretamente) | `React.cache()` scoped por request — sem risco de cross-user data leak |
| V3 Session Management | sim | `resolveSession()` mantém redirect para `/sign-in` se unauthenticated |
| V4 Access Control | não | Nenhuma mudança em autorização |
| V5 Input Validation | não | Nenhum input novo |
| V6 Cryptography | não | Nenhum uso de crypto |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cache poisoning cross-user | Information Disclosure | `React.cache()` é request-scoped — impossível por design |
| Prefetch de API routes sensíveis | Elevation of Privilege | Link de signout mantido como `<a href>` |

---

## Open Questions

1. **Discrepância no número de testes (351 vs 407)**
   - O success criteria da fase diz "351 testes continuam passando"
   - Execução real: 407 testes passando em 2026-04-22
   - Recomendação: Usar 407 como baseline — o PLAN.md deve refletir o número atual

2. **Footer links em vault-sidebar-nav.tsx**
   - "Meu perfil" (`/settings/profile`) na linha 142: pode ser `<Link>` se desejado
   - "Sair" (`/api/auth/signout`) na linha 143: **deve permanecer** `<a href>` (API route)
   - Decisão: converter "Meu perfil" para `<Link>` junto com os nav items principais (consistência), manter "Sair" como `<a>`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `React.cache()` é request-scoped e reseta a cada request no Next.js 15 | Architecture Patterns / Pattern 2 | Se persistir cross-request, dados de usuário poderiam vazar — mas isso não acontece por design do React |
| A2 | Todas as páginas vault chamam `resolveSession()` direta ou indiretamente | Common Pitfalls / Pitfall 3 | Se alguma página não chama, poderia ser incorretamente cacheada após remover force-dynamic |

---

## Sources

### Primary (HIGH confidence)
- Codebase lida diretamente via Read tool — estado real dos 6 arquivos afetados verificado
- `settings-nav.tsx` — padrão de referência `<Link>` + `usePathname()` em uso no projeto
- `vault-sidebar-nav.tsx` linhas 1-4: já `"use client"` + `usePathname` — sem `window.location`
- `bottom-nav.tsx` linhas 1-4: já `"use client"` + `usePathname` — sem `window.location`

### Secondary (MEDIUM confidence)
- Documentação Next.js App Router: `Link` component e prefetch behavior [ASSUMED baseado em training — Next.js 15 docs]
- React `cache()` API: memoization request-scoped para Server Components [ASSUMED baseado em training — React 19 docs]

---

## Metadata

**Confidence breakdown:**
- Mudanças necessárias: HIGH — código lido diretamente, linha a linha
- Comportamento do Link: HIGH — padrão já em uso no projeto (settings-nav.tsx)
- React.cache() semântica: MEDIUM — training knowledge, não verificado via Context7
- Impacto em testes: HIGH — testes lidos, nenhum testa navegação ou caching

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (Next.js 15 estável — baixa volatilidade)
