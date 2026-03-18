# Phase 14: Quality & Production Hardening - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Hardening final antes do lançamento: substituir o re-auth gate stub por verificação real via Supabase Auth, adicionar error boundaries nas rotas faltantes, aplicar try/catch nas server actions de mutação, e validar que o app builda e roda corretamente na Vercel com as env vars de produção configuradas.

Fases de novas features, RLS, ou integrações externas estão fora de escopo.

</domain>

<decisions>
## Implementation Decisions

### Re-auth Gate
- Verificar senha via `supabase.auth.signInWithPassword` antes de liberar backup/export
- Usar fluxo completo do `evaluateSensitiveAction`: senha + texto de confirmação ("CONFIRMAR")
- Reutilizar o `re-auth-dialog` existente em `settings/security/components/re-auth-dialog.tsx` — adaptar para aceitar props configuráveis (título, razão, label de confirmação)
- Cobrir: GET /api/backup e GET /api/export/patient/[id] (os dois únicos endpoints com re-auth gate)
- `confirmBackupAuthAction` e `exportPatientAuthAction` devem verificar senha no Supabase antes de definir o cookie

### Error Boundaries
- Adicionar `error.tsx` em: `sessions/[appointmentId]` e `patients/[patientId]/documents`
- Manter os 5 existentes (inicio, agenda, patients, patients/[patientId], financeiro) sem alteração
- Comportamento: mensagem genérica em pt-BR + botão "Tentar novamente" (chama reset())
- Visual consistente com os 5 existentes — verificar padrão atual antes de criar

### Server Action Error Handling
- Estratégia: catch-all genérico com `console.error` + retorno `{ ok: false, error: 'Algo deu errado. Tente novamente.' }`
- Nunca vazar detalhes de erro do Prisma ou stack traces para o cliente
- Escopo: auditar todas as actions de mutação que não têm try/catch e adicionar
- Validação de input: manual em TypeScript (campos obrigatórios, tamanhos), sem biblioteca extra
- Validar workspaceId + autenticação em toda mutação (padrão já existe — confirmar cobertura)

### Deploy Target (Vercel)
- Plataforma: Vercel
- Env vars obrigatórias a documentar/configurar:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (Supavisor pool para Next.js serverless)
  - `DIRECT_URL` (conexão direta para `prisma migrate deploy`)
  - Outras vars relevantes identificadas no codebase (ex: `NEXTAUTH_SECRET` se aplicável)
- Validação de migrations: `prisma migrate status` integrado ao build/deploy via script `postinstall` no package.json
- Verificar que `next build` completa sem erros em modo produção

### Claude's Discretion
- Mensagem exata dos error.tsx (desde que seja pt-BR, genérica, sem detalhes técnicos)
- Ordem de aplicação dos try/catch nas actions
- Como integrar `prisma migrate status` no script Vercel

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/security/sensitive-actions.ts`: `evaluateSensitiveAction`, `createSensitiveActionChallenge`, `SensitiveActionDecision` — já implementados, prontos para uso
- `src/app/(vault)/settings/security/components/re-auth-dialog.tsx`: Dialog de re-auth existente — adaptar para ser genérico/configurável
- `src/app/(vault)/inicio/error.tsx` (e outros 4): Padrão visual dos error.tsx existentes — replicar nos 2 novos

### Established Patterns
- Server actions retornam `{ ok: boolean, error?: string }` — manter esse contrato
- Inline styles + CSS vars de `globals.css` — sem Tailwind
- `"use server"` no topo do arquivo de actions
- `WORKSPACE_ID = "ws_1"` ainda em uso — será substituído pela sessão Supabase real nas actions

### Integration Points
- `src/app/api/backup/route.ts`: Substituir cookie stub por verificação Supabase + evaluateSensitiveAction
- `src/app/api/export/patient/[patientId]/route.ts`: Mesmo padrão que backup
- `src/app/(vault)/settings/dados-e-privacidade/actions.ts`: `confirmBackupAuthAction` e `exportPatientAuthAction` — adicionar verificação real de senha
- `src/app/(vault)/sessions/[appointmentId]/`: Adicionar error.tsx
- `src/app/(vault)/patients/[patientId]/documents/`: Adicionar error.tsx

</code_context>

<specifics>
## Specific Ideas

- No re-auth gate: o fluxo deve ser transparente para o usuário — o dialog já abre ao clicar em "Baixar backup", sem etapa extra antes do dialog
- Não criar novos arquivos desnecessários — adaptar o re-auth-dialog existente ao invés de criar um novo

</specifics>

<deferred>
## Deferred Ideas

- Row Level Security (RLS) no Supabase — fora de escopo para v1.2 (documentado em REQUIREMENTS.md como out-of-scope)
- Testes E2E automatizados — não mencionados nos requirements desta fase
- CI/CD pipeline completo — além do script de migration no Vercel

</deferred>

---

*Phase: 14-quality-production-hardening*
*Context gathered: 2026-03-18*
