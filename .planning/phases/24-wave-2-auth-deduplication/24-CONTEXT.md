# Phase 24: Wave 2 — Auth Deduplication - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Otimizar o middleware de autenticação para eliminar round-trips desnecessários ao Supabase Auth. O middleware atual chama `getAuthenticatorAssuranceLevel()` em todo request vault — essa chamada extra pode ser evitada lendo o AAL do JWT do cookie da sessão (sem API call) ou tornando a verificação condicional. O `user` já é retornado pelo `updateSession()` customizado — esse critério está satisfeito. O foco é o AAL check.

Arquivos afetados: `src/middleware.ts` e possivelmente `src/lib/supabase/middleware.ts`.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
Todos os choices de implementação estão à discrição do Claude — fase de pura infraestrutura.

Opção preferida: Ler o AAL do JWT diretamente via `supabase.auth.getSession()` (sem API call — lê do cookie) para determinar se step-up é necessário, evitando `getAuthenticatorAssuranceLevel()` para a maioria dos requests vault. Ou, alternativamente, usar a sessão/token JWT disponível no middleware para extrair `aal` sem network roundtrip.

O critério 1 (getUser separado) já está satisfeito na implementação atual — `updateSession()` retorna `user` e o middleware o reutiliza sem chamar `getUser()` de novo.

</decisions>

<code_context>
## Existing Code Insights

### Current State
- `src/middleware.ts` — chama `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` em todo request vault autenticado (linha 47)
- `src/lib/supabase/middleware.ts` — função `updateSession()` customizada que retorna `{ supabase, supabaseResponse, user }`. Chama `getUser()` internamente.
- Para vault routes: `const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()` — round-trip extra ao Supabase
- Para auth routes: `Promise.all([getAuthenticatorAssuranceLevel(), listFactors()])` — dois calls em paralelo

### Integration Points
- `src/middleware.ts` — principal arquivo a modificar
- `src/lib/supabase/middleware.ts` — possível refatoração para retornar mais info de session

</code_context>

<specifics>
## Specific Ideas

- Verificar se `supabase.auth.getSession()` é cache-free (lê do cookie sem API call) em Next.js Middleware context
- Alternativamente: fazer o AAL check apenas quando houver indication de que o usuário tem MFA configurado (mas isso exige conhecimento prévio que não temos sem outro call)
- Mais seguro: condicional baseada em claims do JWT se disponível, ou aceitar o AAL call mas colocá-lo de forma a não duplicar com nenhum outro call

</specifics>

<deferred>
## Deferred Ideas

None — discuss phase skipped.

</deferred>
