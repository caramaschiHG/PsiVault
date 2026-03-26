# Research Summary — v2.0 Reposicionamento Psicanalítico

## Stack Additions
- `@anthropic-ai/sdk` — única dependência nova real (assistente premium de pesquisa literária)
- Sem CMS, sem i18n, sem rebuild de módulos core
- Framer-motion: verificar se já existe antes de adicionar para animações sutis

## Feature Table Stakes
- Landing page específica para nicho psicanalítico (hero, módulos, pricing, FAQ, trust)
- Copy pt-BR com vocabulário psicanalítico em TODOS os módulos internos (não só landing)
- Renomeação consistente: "Prontuário" não "Records", "Agenda" não "Appointments"
- Pricing com distinção livre/premium clara em BRL
- Mensagem de preservação de longo prazo (responsável, sem promessas legais vagas)

## Differentiators
- Positioning explícito para orientação psicanalítica (não genérico para todos os psicólogos)
- Assistente Premium: pesquisa literária configurável por pensador/linha teórica preferida
- Tom editorial, adulto, discreto — nunca wellness ou startup
- Horizonte de 20 anos para preservação de registros como referência de produto

## Watch Out For
1. **Nicho só na landing** — copy interna genérica destrói a credibilidade. Reescrever TUDO.
2. **AI assistant drift clínico** — boundaries de system prompt são obrigatórios; nunca participar de caso clínico
3. **Copyright na literatura** — apenas domínio público / licenciado / enviado pelo usuário em texto completo
4. **Tom errado** — qualquer frase de hype, wellness ou "revolução" quebra o posicionamento
5. **Promessas legais** — nunca "em conformidade com CFP" sem evidência real no produto
6. **Pricing desconectado** — precisa estar em BRL e alinhado com realidade de consultório autônomo brasileiro

## Feature Table Stakes
- **Persistence:** Real PostgreSQL database replacing in-memory stores.
- **Authentication:** Supabase Auth for real login/signup flows, replacing the current stubs.
- **Connection Pooling:** Utilizing Supavisor (built into Supabase) to manage connections from Next.js serverless environment.

## Architectural Impact
- The existing Repository interfaces allow for a clean substitution. We will build `PrismaXRepository` classes to replace `InMemoryXRepository` instances.
- The `workspaceId` will map to the authenticated Supabase user's workspace.
- The application layer (Server Actions and React Server Components) remains largely untouched, proving the value of the v1.0 architecture.

## Watch Out For (Pitfalls)
- **Connection Exhaustion:** Must configure Prisma to use the connection pool URL (`DATABASE_URL`) and the direct URL for migrations (`DIRECT_URL`).
- **Auth Cookie Handling:** Next.js App Router has strict rules about where cookies can be set. Middleware must handle session refreshes using `@supabase/ssr`.
- **Tenancy Enforcement:** Since Prisma connects via a service role or direct connection, Row Level Security (RLS) is hard to use directly. We must strictly enforce `workspaceId` checks in every Prisma query at the application level.