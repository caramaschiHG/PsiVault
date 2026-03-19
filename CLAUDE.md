# PsiLock — Prontuário Eletrônico para Psicólogos

## Stack
- **Next.js 15** (App Router, React 19, Server Components)
- **TypeScript 5.8** (strict)
- **Prisma 6** + PostgreSQL (Supabase)
- **Supabase Auth** (SSR)
- **Vitest** (node env, globals)
- **pnpm 8**
- **CSS**: inline `React.CSSProperties` + CSS vars em `globals.css`
- **i18n**: pt-BR (UI em português)

## Arquitetura

### Repository Pattern
- Interfaces em `src/lib/[domain]/repository.ts`
- Implementações Prisma em `src/lib/[domain]/repository.prisma.ts`
- Singletons em `src/lib/[domain]/store.ts` (via `globalThis`)
- **Nunca** chamar Prisma direto em componentes ou actions

### Domain Models
- Modelos canônicos em `src/lib/[domain]/model.ts` (separados do Prisma)
- Factories com injeção de `now` e `createId` para testabilidade
- IDs com prefixo: `pat_`, `appt_`, `ws_`, `acct_`
- Soft deletes: `deletedAt` + `deletedByAccountId`

### Server Actions
- Arquivo `actions.ts` colocado junto às pages
- Sempre `"use server"` no topo
- Validar workspace + role em toda mutation

### Roteamento
- `(auth)` — rotas públicas de autenticação
- `(vault)` — rotas protegidas (middleware valida sessão)
- Middleware em `src/middleware.ts`

## Convenções

### Código
- camelCase para arquivos/funções, PascalCase para componentes/types
- Imports com `@/*` (alias para `src/`)
- Timestamps ISO 8601, sufixo `_at` no banco
- Estilos inline com `satisfies React.CSSProperties`
- Campos sensíveis (`importantObservations`) nunca em listagens

### Testes
- Em `/tests/**/*.test.ts`
- Repositórios in-memory para unit tests
- `pnpm test` roda vitest

### Banco
- Todo query deve ter escopo de `workspaceId`
- Índices compostos: `[workspaceId, ...]`
- Enums: `AppointmentStatus`, `ServiceMode`, `AppointmentCareMode`

## Regras

- Não criar arquivos desnecessários — editar existentes
- Não adicionar features além do pedido
- Não poluir com comentários/docstrings onde não mudou
- Respostas curtas e diretas, em português quando falando comigo
- Usar Context7 para docs atualizadas de Next.js, Prisma, Supabase
- Usar Serena para navegação semântica do código
