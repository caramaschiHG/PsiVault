# Phase 12: Authentication UX - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Transformar as páginas de auth funcionais-mas-básicas em uma experiência profissional e confiável: erros visíveis em português, feedback de loading nos formulários, fluxo de reset de senha completo (solicitar + atualizar), e proteção contra usuário já autenticado acessando rotas de auth.

Não inclui: redesign visual profundo (Phase 13), alterações no fluxo MFA (Phase 1 definiu o padrão), nem novas formas de autenticação (OAuth, passkeys).

</domain>

<decisions>
## Implementation Decisions

### Exibição de Erros

- Erros aparecem **inline no form**: bloco de alerta abaixo do botão de submit, dentro do card
- **Mapa de tradução fixo** (`AUTH_ERRORS: Record<string, string>`) mapeia mensagens Supabase para pt-BR; erros não mapeados recebem mensagem genérica
- Erro **persiste até novo envio** — não some ao editar campos (sem estado cliente extra)
- **Erros por campo também**: server action pode retornar `{ field: 'email' | 'password', message: string }` via searchParams (`?field=password&error=...`); campos exibem mensagem abaixo do input quando `field` está presente
- Padrão de query param (`?error=` e `?field=`) já estabelecido na fase 8 — manter consistência

### Fluxo de Reset de Senha

- **Uma única rota `/reset-password`** para os dois estados:
  - Sem token na URL → estado "solicitar e-mail" (campo de e-mail + botão "Enviar link de recuperação")
  - Com token na URL (Supabase callback) → estado "nova senha" (dois campos: nova senha + confirmar senha)
- Link "Esqueceu a senha?" no sign-in aponta para `/reset-password`
- Após atualizar senha com sucesso → redirecionar para `/sign-in` com mensagem de sucesso (`?success=Senha atualizada. Faça login com a nova senha.`)
- Nova senha: **dois campos** (nova senha + confirmar senha) — proteção contra typo
- Se token expirado ou já utilizado → mensagem "Este link expirou ou já foi utilizado." com link para solicitar novo (`/reset-password`)

### Loading / Estados de Envio

- Botão de submit: **spinner SVG animado** durante pending (substituir texto)
- Botão extraído como `<SubmitButton>` com `"use client"` + `useFormStatus` — restante da página fica server component (padrão Next.js 15)
- **Todos os campos desabilitados** durante pending (inputs + botão) para evitar duplo envio
- Spinner: SVG animado (circle com animateTransform), inline, sem dependências externas

### Redirect de Autenticado (AUTHUX-05)

- Implementado **no middleware** (`src/middleware.ts`) — já usa `@supabase/ssr`, sem impacto nos componentes de página
- Regra: se sessão existe E rota é `(auth)` → redirecionar para `/mfa-setup` (MFA obrigatório, decisão fase 01) ou `/inicio` se MFA já completo
- Cobre: `/sign-in`, `/sign-up`, `/verify-email`, `/reset-password`
- Usuário autenticado sem MFA → `/mfa-setup`; com MFA completo → `/inicio`

### Claude's Discretion

- Exato design visual do bloco de erro (cor, ícone, border)
- Implementação interna da detecção de token Supabase no `/reset-password` (searchParams vs cookie)
- Texto exato das mensagens de sucesso/confirmação
- CSS keyframe do spinner SVG

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/app/(auth)/actions.ts` — já tem `signIn` e `signUp` com padrão `?error=encodeURIComponent(error.message)`; adicionar `requestPasswordReset` e `updatePassword`
- `src/lib/supabase/constants.ts` — `AUTH_ROUTE_PATHS` com paths de auth; adicionar entrada para reset se necessário
- `src/lib/supabase/server.ts` — `createClient()` para server actions
- `src/middleware.ts` — já usa `@supabase/ssr` para session refresh; adicionar lógica de redirect para rotas (auth)

### Established Patterns

- Inline styles com `satisfies React.CSSProperties` em toda a codebase — manter
- Erros via query param: `redirect(`${path}?error=${encodeURIComponent(error.message)}`)` — estender com `?field=` para erros por campo
- Server actions em `src/app/(auth)/actions.ts` colocadas junto ao grupo de rotas
- Pages existentes já têm o card visual estabelecido (rounded 28px, shadow, warm palette `#9a3412`)

### Integration Points

- `src/middleware.ts` — adicionar bloco de redirect para rotas auth quando sessão ativa
- `src/app/(auth)/reset-password/page.tsx` — bifurcar em dois estados por searchParams/token
- `src/app/(auth)/sign-in/page.tsx` — adicionar link "Esqueceu a senha?", ler `?error=` e `?field=`
- `src/app/(auth)/sign-up/page.tsx` — adicionar leitura de `?error=` e `?field=`
- Novo componente: `src/app/(auth)/components/submit-button.tsx` (`"use client"`, `useFormStatus`, spinner SVG)

</code_context>

<specifics>
## Specific Ideas

- Spinner SVG animado (sem CSS border trick) — animateTransform no SVG circle
- Dois campos no reset de senha (confirmar senha) para proteção contra typo
- Mapa `AUTH_ERRORS` centralizado — um único lugar para manter as traduções de erros Supabase

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia fora do escopo surgiu — discussão ficou dentro dos limites da Phase 12

</deferred>

---

*Phase: 12-authentication-ux*
*Context gathered: 2026-03-18*
