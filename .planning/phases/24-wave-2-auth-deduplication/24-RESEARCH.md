# Phase 24: Wave 2 — Auth Deduplication - Research

**Researched:** 2026-04-22
**Domain:** Next.js 15 Middleware / Supabase Auth / MFA AAL JWT
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Critério 1 (getUser duplicado) já está satisfeito — `updateSession()` retorna `user` e o middleware o reutiliza. Não precisa de mudança.

### Claude's Discretion
Todos os choices de implementação estão à discrição do Claude — fase de pura infraestrutura.

Opção preferida: Ler o AAL do JWT diretamente via `supabase.auth.getSession()` (sem API call — lê do cookie) para determinar se step-up é necessário, evitando `getAuthenticatorAssuranceLevel()` para a maioria dos requests vault.

### Deferred Ideas (OUT OF SCOPE)
None — discuss phase skipped.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Middleware não duplica a chamada `supabase.auth.getUser()` já feita durante `updateSession()` — user é reutilizado ou passado via header para eliminar o 2º RTT Supabase por request | **ALREADY SATISFIED** — `updateSession()` retorna `{ supabase, supabaseResponse, user }` e middleware usa `user` diretamente. Zero code change needed. |
| AUTH-02 | Verificação de nível MFA (`getAuthenticatorAssuranceLevel`) no middleware não executa em todo request vault — status AAL é cacheado por request ou verificação é pulada quando já confirmado | **SOLVABLE via JWT decode** — o `aal` claim está no access_token JWT que já está no cookie. `getSession()` lê do cookie sem network call. Decodificar o JWT payload extrai `aal` sem round-trip. |
</phase_requirements>

---

## Summary

A fase tem dois critérios. O primeiro (AUTH-01) já está satisfeito na implementação atual: `updateSession()` retorna `user` e o middleware o usa diretamente, sem um segundo `getUser()`. Nenhuma mudança necessária para AUTH-01.

O segundo critério (AUTH-02) é o alvo real: `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` faz um round-trip ao Supabase Auth em todo request vault autenticado. A solução é ler o `aal` claim diretamente do JWT do access_token, que já está no cookie de sessão. Esse claim é `aal1` ou `aal2` e reflete o nível atual de autenticação.

A abordagem segura e sem network call: chamar `supabase.auth.getSession()` (lê do cookie, sem API call) para obter o `access_token`, decodificar o payload JWT (base64url decode simples do segundo segmento) e ler o campo `aal`. Se `aal === 'aal2'`, o usuário já passou por MFA — nenhuma ação necessária. Se `aal === 'aal1'` ou ausente, então verificar se `nextLevel` exigiria aal2 — mas sem chamar `getAuthenticatorAssuranceLevel()`.

O ponto crítico de segurança: a verificação original usa `aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2'` para redirecionar para `/mfa-verify`. O `nextLevel` é determinado pelo servidor (indica se o usuário *tem* fatores MFA registrados). Isso não está no JWT. Portanto a otimização mais segura é: **se `currentLevel` no JWT for `aal2`, skip da verificação** (usuário já tem MFA completo). Se for `aal1`, ainda chamar `getAuthenticatorAssuranceLevel()` — mas isso só acontece para usuários que potencialmente têm MFA configurado mas não completaram. Na prática, usuários que passaram pelo fluxo MFA completo (quase todos, já que o middleware força isso) terão `aal2` no JWT e pulam o check.

**Recomendação primária:** Decodificar o `aal` claim do JWT via `getSession()` (no network). Se `currentLevel === 'aal2'`, retornar `supabaseResponse` direto. Só chamar `getAuthenticatorAssuranceLevel()` quando `currentLevel !== 'aal2'`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Auth session refresh | Frontend Server (Middleware) | — | `updateSession()` já faz isso, retorna `user` |
| MFA AAL check | Frontend Server (Middleware) | — | Gate de acesso ao vault — deve estar no middleware |
| JWT decode (aal claim) | Frontend Server (Middleware) | — | Operação local, sem I/O, segura no Edge runtime |
| Supabase Auth API call | Supabase Auth Server | — | Só quando necessário (aal1 paths) |

## Standard Stack

### Core (versions verified via pnpm list)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.9.0 | SSR Supabase client / cookie handling | Instalado no projeto |
| `@supabase/supabase-js` | 2.103.3 | Auth client — `getSession()`, `getClaims()` | Instalado no projeto |
| `next/server` | 15.x | `NextRequest`, `NextResponse` | Framework do projeto |

### Sem novas dependências
A solução usa apenas APIs já presentes. Não instalar nada.

**JWT decode nativo:** A decodificação do payload JWT é simplesmente `JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))` — disponível em qualquer runtime incluindo Edge. Ou usar `supabase.auth.getSession()` que já retorna o session object com o access_token embutido.

## Architecture Patterns

### Fluxo atual (vault route, com problema)

```
Request → updateSession() [1 RTT: getUser()]
        → getAuthenticatorAssuranceLevel() [2º RTT: AAL check]
        → retorna response
```

### Fluxo proposto (vault route, otimizado)

```
Request → updateSession() [1 RTT: getUser()]
        → getSession() [0 RTT: lê cookie]
        → decode JWT payload → aal claim
        → se aal.currentLevel === 'aal2': return supabaseResponse (FAST PATH)
        → senão: getAuthenticatorAssuranceLevel() [2º RTT, só quando necessário]
        → retorna response
```

### Implementação recomendada

```typescript
// src/middleware.ts — vault routes section

// After: if (!user) { return redirect('/sign-in') }

// Fast path: decode AAL from JWT without API call
const { data: sessionData } = await supabase.auth.getSession()
const accessToken = sessionData.session?.access_token

let needsAalCheck = true
if (accessToken) {
  try {
    // Base64url decode do payload (segundo segmento do JWT)
    const payloadB64 = accessToken.split('.')[1]
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const jwtPayload = JSON.parse(payloadJson) as { aal?: string }
    // Se já é aal2, usuário passou por MFA — nenhuma verificação extra necessária
    if (jwtPayload.aal === 'aal2') {
      needsAalCheck = false
    }
  } catch {
    // Se falhar o decode (raro), cai no check normal
  }
}

if (needsAalCheck) {
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
    return NextResponse.redirect(new URL('/mfa-verify', request.url))
  }
}

return supabaseResponse
```

**Nota sobre `getSession()` vs decode direto do cookie:**  
`getSession()` é a forma limpa de obter o access_token já parseado do cookie de sessão do Supabase. Ele lê da storage (cookie) sem network call. [VERIFIED: leitura do source `__loadSession()` em `GoTrueClient.ts` — usa `getItemAsync(this.storage, this.storageKey)`, storage = cookies].

**Alternativa mais simples — sem `getSession()`:**  
Ler o cookie diretamente via `request.cookies` e decodificar. O cookie do Supabase se chama `sb-<project-ref>-auth-token` e contém o access_token. Isso é mais frágil (depende do nome do cookie). Preferir `getSession()`.

### Anti-Patterns to Avoid

- **Usar `getClaims()` com JWT HS256:** Se o projeto usar chave JWT simétrica (padrão do Supabase hosted), `getClaims()` internamente chama `getUser()` como fallback (verificado no source). Isso derrota o propósito — ainda faz um RTT.
- **Remover completamente o check de AAL:** Para usuários com `aal1` que têm MFA configurado, o redirect para `/mfa-verify` é necessário. Nunca remover, só pular no fast path.
- **Cache cross-request no Edge:** Middleware Edge runtime é stateless por request. Não tentar usar variáveis de módulo para cache — não funciona.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT signature verification | Código custom de verificação | `supabase.auth.getClaims()` (se RS256) ou confiar no `getUser()` já feito | Edge cases de crypto são traiçoeiros |
| Session refresh | Lógica custom de refresh | `updateSession()` já existente | Já está feito corretamente |

## Common Pitfalls

### Pitfall 1: `getClaims()` faz getUser() com HS256
**What goes wrong:** `getClaims()` parece ideal mas se o Supabase project usa JWT secret simétrico (HS256 — padrão), sem JWK disponível, ele executa `getUser()` internamente. Elimina o ganho.
**Why it happens:** Verificação criptográfica de HS256 exige a chave privada, que o cliente não tem. O fallback é validar via server.
**How to avoid:** Para o objetivo de apenas ler o `aal` claim (sem verificar assinatura — a confiança vem do `getUser()` já executado por `updateSession()`), usar decode simples do JWT payload. O JWT foi validado pelo `getUser()` chamado em `updateSession()` — o token é confiável nesse ponto.
**Warning signs:** Se `getClaims()` fizer network call, o RTT savings são zero.

### Pitfall 2: `getSession()` não é equivalente a `getUser()` para auth
**What goes wrong:** Usar `getSession()` como substituto de `getUser()` para *autenticar* o usuário (verificar que o token não foi revogado).
**Why it happens:** Confundir "ler o claim aal do JWT" (operação local válida) com "autenticar o usuário" (requer server validation).
**How to avoid:** `getSession()` é usado APENAS para ler o `aal` do token, não para autenticação. A autenticação já foi feita por `updateSession()` / `getUser()`. O user vem de `updateSession()` — esse fluxo não muda.

### Pitfall 3: JWT payload decode falha em Edge
**What goes wrong:** `atob()` pode não estar disponível ou o base64url (com `-` e `_`) precisa ser normalizado para base64 padrão.
**Why it happens:** JWT usa base64url encoding, não base64 padrão.
**How to avoid:** Substituir `-` por `+` e `_` por `/` antes de `atob()`. Ou usar `Buffer.from(b64, 'base64')` em Node.js. No Edge (Cloudflare/Vercel), `atob()` está disponível e funciona com base64 padrão.

### Pitfall 4: `needsAalCheck = true` como fallback não é chamado em todos os casos
**What goes wrong:** Esquecer que o `getAuthenticatorAssuranceLevel()` ainda precisa rodar quando `aal === 'aal1'` E o usuário tem MFA configurado (nextLevel seria 'aal2').
**Why it happens:** Otimização prematura — remover o fallback.
**How to avoid:** O fast path só pula quando `aal === 'aal2'`. Qualquer outro caso (`aal1`, ausente, erro de decode) cai no path normal com `getAuthenticatorAssuranceLevel()`.

## Code Examples

### JWT payload decode em Edge runtime
```typescript
// Source: Supabase MFA docs — aal claim is in JWT payload
// https://supabase.com/docs/guides/auth/auth-mfa

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    // base64url → base64
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// Usage in middleware:
const payload = decodeJwtPayload(accessToken)
const currentAal = payload?.aal as string | undefined
```

### getSession() sem network call
```typescript
// Source: GoTrueClient.ts source — __loadSession() lê de this.storage (cookie)
// getSession() = read from cookie storage, zero network
const { data: { session } } = await supabase.auth.getSession()
const aal = session?.access_token 
  ? decodeJwtPayload(session.access_token)?.aal 
  : undefined
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getUser()` para verificar auth | `getUser()` permanece — obrigatório para server-side auth | N/A | `getSession()` é inseguro para auth, seguro para leitura de claims locais |
| Sem `getClaims()` | `getClaims()` adicionado em supabase-js 2.x | ~2024 | Útil para RS256; com HS256 ainda faz fallback para getUser() |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | O projeto Supabase usa JWT simétrico (HS256) — default do Supabase hosted | Pitfall 1 | Se RS256 + JWK endpoint, `getClaims()` funcionaria sem network call — solução alternativa válida mas mais complexa |
| A2 | `atob()` está disponível no Vercel Edge runtime (Next.js middleware) | Code Examples | Se não disponível, usar `Buffer.from(b64, 'base64').toString()` como fallback |

## Open Questions

1. **RS256 vs HS256 no projeto**
   - O que sabemos: Supabase hosted usa HS256 por padrão; RS256 requer configuração explícita
   - O que não sabemos: Se o projeto usa RS256 (JWT Secret customizado + JWK endpoint)
   - Recomendação: A solução de decode simples funciona em ambos os casos — não precisa saber

## Environment Availability

Fase é puramente code — sem dependências externas novas. Sem step 2.6 necessário.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | vitest.config.ts (or package.json) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `updateSession()` retorna `user` sem segundo `getUser()` | unit | `pnpm test -- middleware` | ❌ Wave 0 (se necessário) |
| AUTH-02 | AAL check pula round-trip quando JWT aal=aal2 | unit | `pnpm test -- middleware` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Phase gate:** Full suite green

### Wave 0 Gaps
- AUTH-01 já satisfeito — sem mudança de código, sem teste novo necessário
- AUTH-02 pode ser verificado manualmente em dev ou com um test unitário do decoder JWT

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `getUser()` via `updateSession()` — não alterado |
| V3 Session Management | yes | Cookie-based session — não alterado |
| V4 Access Control | yes | Redirect para `/mfa-verify` preservado para aal1 paths |
| V5 Input Validation | no | N/A |
| V6 Cryptography | no | JWT decode é leitura de claim, não operação criptográfica nova |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Spoofing JWT payload | Spoofing | O `aal` claim é lido apenas para fast-path skip — a autenticação principal já foi feita por `getUser()` em `updateSession()`. Atacante que manipulasse o cookie seria barrado pelo `getUser()`. |
| Bypass MFA via aal1 → aal2 forge | Elevation of Privilege | Fast path só aplica quando `aal === 'aal2'` — usuários com aal1 ainda passam pelo `getAuthenticatorAssuranceLevel()` completo. Não há bypass. |

**Análise de segurança completa:**
- `updateSession()` chama `getUser()` — valida o token com Supabase Auth server. Isso detecta tokens revogados, expirados, etc.
- Ler `aal` do JWT _depois_ de `getUser()` ter sido bem-sucedido é seguro: o token já foi validado pelo servidor. O claim `aal` no payload reflete o que o Supabase Auth emitiu.
- A única diferença comportamental: para usuários com `aal2` no token, o segundo RTT é eliminado. Para usuários com `aal1`, o comportamento é idêntico ao atual.

## Sources

### Primary (HIGH confidence)
- `/supabase/supabase-js` — Context7 + leitura direta do source `GoTrueClient.ts` no node_modules
- `/supabase/ssr` — Context7 docs sobre `getSession()` vs `getUser()`
- `https://supabase.com/docs/guides/auth/auth-mfa` — documentação oficial confirmando que `aal` está no JWT payload

### Secondary (MEDIUM confidence)
- `GoTrueClient.ts` source (node_modules local) — leitura direta de `__loadSession()`, `getClaims()`, `getSession()` para confirmar comportamento de network vs local read

## Metadata

**Confidence breakdown:**
- AUTH-01 já satisfeito: HIGH — verificado lendo o código atual
- JWT contém `aal` claim: HIGH — documentação oficial + exemplo de payload JSON na doc
- `getSession()` não faz network call: HIGH — source code lido diretamente
- `getClaims()` faz fallback para `getUser()` com HS256: HIGH — source code lido diretamente
- decode JWT base64url em Edge runtime: HIGH — `atob()` disponível no Vercel Edge

**Research date:** 2026-04-22
**Valid until:** 2026-07-22 (APIs estáveis)
