# Phase 14: Quality & Production Hardening - Research

**Researched:** 2026-03-18
**Domain:** Next.js 15 hardening — re-auth gate, error boundaries, server action safety, Vercel deploy
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Re-auth Gate**
- Verificar senha via `supabase.auth.signInWithPassword` antes de liberar backup/export
- Usar fluxo completo do `evaluateSensitiveAction`: senha + texto de confirmação ("CONFIRMAR")
- Reutilizar o `re-auth-dialog` existente em `settings/security/components/re-auth-dialog.tsx` — adaptar para aceitar props configuráveis (título, razão, label de confirmação)
- Cobrir: GET /api/backup e GET /api/export/patient/[id] (os dois únicos endpoints com re-auth gate)
- `confirmBackupAuthAction` e `exportPatientAuthAction` devem verificar senha no Supabase antes de definir o cookie

**Error Boundaries**
- Adicionar `error.tsx` em: `sessions/[appointmentId]` e `patients/[patientId]/documents`
- Manter os 5 existentes (inicio, agenda, patients, patients/[patientId], financeiro) sem alteração
- Comportamento: mensagem genérica em pt-BR + botão "Tentar novamente" (chama reset())
- Visual consistente com os 5 existentes — verificar padrão atual antes de criar

**Server Action Error Handling**
- Estratégia: catch-all genérico com `console.error` + retorno `{ ok: false, error: 'Algo deu errado. Tente novamente.' }`
- Nunca vazar detalhes de erro do Prisma ou stack traces para o cliente
- Escopo: auditar todas as actions de mutação que não têm try/catch e adicionar
- Validação de input: manual em TypeScript (campos obrigatórios, tamanhos), sem biblioteca extra
- Validar workspaceId + autenticação em toda mutação (padrão já existe — confirmar cobertura)

**Deploy Target (Vercel)**
- Plataforma: Vercel
- Env vars obrigatórias a documentar/configurar: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (Supavisor pool para Next.js serverless), `DIRECT_URL` (conexão direta para `prisma migrate deploy`), outras vars relevantes identificadas no codebase
- Validação de migrations: `prisma migrate status` integrado ao build/deploy via script `postinstall` no package.json
- Verificar que `next build` completa sem erros em modo produção

### Claude's Discretion
- Mensagem exata dos error.tsx (desde que seja pt-BR, genérica, sem detalhes técnicos)
- Ordem de aplicação dos try/catch nas actions
- Como integrar `prisma migrate status` no script Vercel

### Deferred Ideas (OUT OF SCOPE)
- Row Level Security (RLS) no Supabase — fora de escopo para v1.2
- Testes E2E automatizados
- CI/CD pipeline completo — além do script de migration no Vercel
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QUAL-01 | Replace the re-auth gate stub in export/backup routes with the real `evaluateSensitiveAction` flow | `confirmBackupAuthAction` e `exportPatientAuthAction` devem chamar `supabase.auth.signInWithPassword` antes de setar cookie; `evaluateSensitiveAction` já implementado e pronto |
| QUAL-02 | Add structured error boundaries to all route segments to prevent white-screen crashes | Padrão já definido por 5 `error.tsx` existentes; criar 2 novos em `sessions/[appointmentId]` e `patients/[patientId]/documents` |
| QUAL-03 | Harden all server actions — validate inputs, handle Prisma errors, return typed error responses | 7 arquivos `actions.ts` sem try/catch identificados; estratégia catch-all definida |
| QUAL-04 | Ensure workspace audit trail is complete — remove the `auditEvents: never[]` stub from backup | Audit store já usa `PrismaAuditRepository` real; `buildWorkspaceBackup` já aceita `AuditEvent[]`; verificar se stub ainda existe em outro local |
| QUAL-05 | Security review — confirm no sensitive data leaks in search, audit, or dashboard surfaces (SECU-05) | Padrões SECU-05 já estabelecidos: `importantObservations` excluído de listagens, audit metadata whitelist por domínio |
| QUAL-06 | Ensure all domain tests pass against Prisma implementations (no in-memory repository usage) | Testes atuais ainda usam `createInMemory*` em: patient-domain, clinical-domain, document-domain, finance-domain, audit-events, appointment-recurrence, reminder-domain |
| DEPLOY-01 | Configure production environment variables for Supabase, Prisma, and Next.js | 5 vars identificadas; verificar se há outras no codebase |
| DEPLOY-02 | Verify the application builds and starts cleanly in production mode (`next build`) | `pnpm build` → `next build`; sem script de produção além do padrão Next.js |
| DEPLOY-03 | Confirm Prisma migrations are applied and the production database schema is correct | `prisma migrate deploy` + `prisma migrate status`; integrar como `postinstall` no package.json |
</phase_requirements>

---

## Summary

Esta fase é inteiramente de hardening — não introduz features. O trabalho é substituir stubs conhecidos por implementações reais (re-auth gate), fechar gaps de resiliência (error boundaries, try/catch em actions), e confirmar que o build de produção está limpo.

A maior parte do código necessário já existe: `evaluateSensitiveAction` e `createSensitiveActionChallenge` estão implementados em `src/lib/security/sensitive-actions.ts`, o `ReAuthDialog` existe mas precisa ser adaptado para aceitar props configuráveis, e os 5 `error.tsx` existentes definem exatamente o padrão visual a replicar. O `PrismaAuditRepository` já está em produção via `getAuditRepository()`, então QUAL-04 pode ser uma verificação e não uma implementação nova.

A maior mudança real é QUAL-03 (try/catch em 7 arquivos de actions) e QUAL-06 (migrar testes de in-memory para Prisma ou confirmar que o escopo é apenas "stores usam Prisma, testes de domínio puro continuam com in-memory").

**Primary recommendation:** Executar em 5 ondas independentes: (1) re-auth gate, (2) error boundaries, (3) try/catch em actions, (4) QUAL-04/QUAL-05 audit/security review, (5) QUAL-06 + DEPLOY.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | ^0.9.0 | Supabase server-side auth com cookies | Já instalado; padrão do projeto |
| `@supabase/supabase-js` | ^2.99.1 | `signInWithPassword` para re-auth gate | Já instalado |
| `next` | ^15.2.4 | `error.tsx` conventions, server actions | Framework principal |
| `prisma` | ^6.6.0 | `migrate deploy`, `migrate status` | Já instalado |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | ^3.0.9 | Suite de testes | QUAL-06 — rodar após migração dos testes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual TypeScript validation | zod/yup | Decisão travada: sem biblioteca extra |
| cookie stub para re-auth | JWT separado | Decisão travada: manter cookie + `signInWithPassword` |

---

## Architecture Patterns

### Recommended Project Structure (nenhuma mudança necessária)

```
src/
├── app/(vault)/
│   ├── sessions/[appointmentId]/
│   │   └── error.tsx        # NOVO — QUAL-02
│   ├── patients/[patientId]/documents/
│   │   └── error.tsx        # NOVO — QUAL-02
│   └── settings/
│       ├── dados-e-privacidade/
│       │   └── actions.ts   # MODIFICAR — QUAL-01 (add signInWithPassword)
│       └── security/components/
│           └── re-auth-dialog.tsx  # MODIFICAR — props configuráveis
├── app/api/
│   ├── backup/route.ts      # MODIFICAR — QUAL-01 (substituir stub cookie)
│   └── export/patient/[patientId]/route.ts  # MODIFICAR — QUAL-01
└── lib/security/
    └── sensitive-actions.ts  # EXISTENTE — não modificar
```

### Pattern 1: Error Boundary (error.tsx)

**What:** Next.js App Router detecta erros em Server Components e redireciona para o `error.tsx` mais próximo no mesmo segmento de rota.
**When to use:** Qualquer segmento de rota com data fetching assíncrono que pode falhar.
**Example:**

```typescript
// Padrão exato dos 5 existentes — replicar para os 2 novos
"use client";
import React from "react";

export default function SegmentError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", display: "grid", gap: "1rem", maxWidth: "360px" }}>
        <p style={{ fontSize: "var(--font-size-body)", fontWeight: 600, color: "var(--color-text-1)" }}>
          Algo deu errado
        </p>
        <p style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-2)" }}>
          Não foi possível carregar esta página. Tente novamente ou volte mais tarde.
        </p>
        <button onClick={reset} className="btn-secondary">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
```

### Pattern 2: Server Action com try/catch (QUAL-03)

**What:** Envolver o corpo da action em try/catch, retornar `{ ok: false, error: '...' }` em vez de lançar exceções não tratadas.
**When to use:** Toda action de mutação que chama repositórios Prisma ou `redirect`.

**Atenção:** `redirect()` do Next.js lança uma exceção internamente. O catch-all não deve capturá-la. A estratégia correta é chamar `redirect` fora do bloco try, ou re-lançar se o erro for do tipo `NEXT_REDIRECT`:

```typescript
// Source: Next.js 15 docs — server actions error handling
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function someAction(formData: FormData) {
  try {
    // ... lógica da action
    await repo.save(entity);
  } catch (err) {
    // Re-lançar erros de redirect/notFound do Next.js
    if (isRedirectError(err)) throw err;
    console.error("[someAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }
  redirect("/destino");
}
```

**Alternativa simples:** colocar o `redirect` fora do try/catch completamente (funciona quando o redirect é sempre o happy path final):

```typescript
export async function someAction(formData: FormData) {
  try {
    await repo.save(entity);
    audit.append(...);
  } catch (err) {
    console.error("[someAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }
  redirect("/destino"); // fora do try — não será capturado
}
```

### Pattern 3: Re-auth Gate com Supabase (QUAL-01)

**What:** `confirmBackupAuthAction` verifica a senha do usuário autenticado via `supabase.auth.signInWithPassword` antes de setar o cookie de autorização.
**When to use:** Antes de qualquer operação destrutiva ou de exportação de dados sensíveis.

```typescript
// Substituir stub em actions.ts
import { createClient } from "../../../../lib/supabase/server";

export async function confirmBackupAuthAction(input: {
  password: string;
}): Promise<ActionResult> {
  if (!input.password) {
    return { ok: false, error: "Senha obrigatória." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, error: "Sessão inválida. Faça login novamente." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error: "Senha incorreta." };
  }

  const cookieStore = await cookies();
  cookieStore.set("psivault_backup_auth", String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return { ok: true };
}
```

### Pattern 4: Prisma Migration no Deploy (DEPLOY-03)

**What:** Script `postinstall` no `package.json` garante que `prisma migrate deploy` roda automaticamente no Vercel após `npm install`.

```json
{
  "scripts": {
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

**Nota:** `prisma migrate deploy` requer `DATABASE_URL` ou `DIRECT_URL` com acesso direto (não Supavisor pool). Usar `DIRECT_URL` para migrations, `DATABASE_URL` para queries em runtime.

### Anti-Patterns to Avoid

- **Capturar redirect no try/catch:** `redirect()` lança `NEXT_REDIRECT` internamente. Se capturado e engolido, a navegação não acontece. Sempre re-lançar ou colocar `redirect` fora do try.
- **Vazar mensagem de erro do Prisma:** Nunca `return { error: err.message }` — pode expor schema ou query details.
- **`console.error` com dados clínicos:** Log apenas o tipo de erro e contexto técnico (action name, IDs de entidade), nunca o conteúdo dos campos clínicos.
- **Criar novo componente de re-auth dialog:** Adaptar o existente com props configuráveis — não criar um paralelo.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verificar senha na re-auth | Comparação local de hash | `supabase.auth.signInWithPassword` | Supabase gerencia hash, rate limiting, bloqueio de conta |
| Detectar redirect no catch | Checar `.message === "NEXT_REDIRECT"` por string | `isRedirectError(err)` de `next/dist/client/components/redirect` | API estável, à prova de mudanças internas |
| Serializar erros Prisma | Parse manual de PrismaClientKnownRequestError | Catch genérico + log — sem parse em produção | Segurança: nunca expor codes de erro do Prisma ao cliente |

**Key insight:** O catch-all genérico é a escolha correta aqui — as actions já fazem validação de negócio (guards `if (!existing) return`) antes das operações de banco. O try/catch é a última linha de defesa contra erros de infraestrutura inesperados.

---

## Common Pitfalls

### Pitfall 1: redirect() capturado pelo try/catch

**What goes wrong:** `try { ... redirect('/foo') } catch(e) { return { ok: false } }` — o redirect é capturado, a função retorna `{ ok: false }` e a navegação nunca acontece.
**Why it happens:** Next.js implementa `redirect()` como uma exceção especial.
**How to avoid:** Colocar `redirect()` após o bloco try/catch, ou re-lançar com `if (isRedirectError(err)) throw err` no catch.
**Warning signs:** Action retorna mas a página não navega; `NEXT_REDIRECT` aparece nos logs.

### Pitfall 2: signInWithPassword sem getUser() antes

**What goes wrong:** Chamar `signInWithPassword` com um email hardcoded ou extraído de FormData — usuário poderia tentar com email de outra conta.
**Why it happens:** O email deve vir da sessão autenticada atual, não do input do usuário.
**How to avoid:** Sempre chamar `supabase.auth.getUser()` primeiro para obter o email da sessão.
**Warning signs:** Possibilidade de brute force de senha de outras contas.

### Pitfall 3: prisma migrate deploy com Supavisor pool

**What goes wrong:** `DATABASE_URL` aponta para Supavisor (pooler); migrations falham porque o pooler não suporta todas as operações DDL.
**Why it happens:** Supavisor é para queries de aplicação, não para migrations DDL.
**How to avoid:** Usar `DIRECT_URL` (conexão direta sem pool) para `prisma migrate deploy`. Prisma usa automaticamente `DIRECT_URL` para migrations quando configurado no schema.
**Warning signs:** Erro `prepared statement does not exist` ou timeout em `migrate deploy`.

### Pitfall 4: QUAL-06 — escopo da migração de testes

**What goes wrong:** Interpretar QUAL-06 como "migrar todos os testes para usar Prisma real" — isso requer banco de testes e torna os testes lentos/frágeis.
**Why it happens:** Ambiguidade entre "testes rodam contra Prisma" vs "stores de produção usam Prisma".
**How to avoid:** O requisito real é que as *stores de produção* (`getPatientRepository()`, etc.) usam implementações Prisma reais. Os testes de domínio puro (model, factory, lógica) continuam com in-memory legítimo. Verificar que nenhum store de produção ainda importa a implementação in-memory.
**Warning signs:** Stores com `createInMemory*` em vez de `createPrisma*`.

### Pitfall 5: QUAL-04 — stub auditEvents já removido

**What goes wrong:** Implementar QUAL-04 sem verificar que o stub já foi removido nas fases anteriores.
**Why it happens:** `getAuditRepository()` já retorna `createPrismaAuditRepository()` (confirmado no `src/lib/audit/store.ts`). O backup em `/api/backup/route.ts` já chama `auditRepo.listForWorkspace(WORKSPACE_ID)`.
**How to avoid:** Verificar se o stub `auditEvents: never[]` ainda existe em algum lugar antes de implementar. Pode ser que QUAL-04 seja apenas uma verificação de que nada usa in-memory audit.
**Warning signs:** Se não houver stub para remover, a tarefa é de auditoria/confirmação, não de implementação.

---

## Code Examples

### Re-auth dialog com props configuráveis

O `ReAuthDialog` atual aceita apenas `challenge` e `decision`. Para ser reutilizável:

```typescript
// Nenhuma mudança na estrutura de dados — SensitiveActionChallenge já tem
// title, reason, confirmationLabel como campos configuráveis.
// A adaptação necessária é no componente pai que cria o challenge:

const challenge = createSensitiveActionChallenge(
  {
    actionId: "backup.download",
    title: "Baixar backup do cofre",
    reason: "Esta ação exporta todos os dados clínicos e financeiros.",
    confirmationLabel: "CONFIRMAR",  // ou "BAIXAR BACKUP" etc.
  },
  { now: new Date() }
);
```

O componente `ReAuthDialog` já renderiza `challenge.title`, `challenge.reason`, `challenge.confirmationLabel` dinamicamente — não precisa de mudança no componente, apenas no caller.

### Env vars para Prisma com Supavisor

```prisma
// schema.prisma — já deve ter este padrão
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    // Supavisor para runtime
  directUrl = env("DIRECT_URL")      // Conexão direta para migrations
}
```

### Auditoria de SECU-05 — campos que nunca devem aparecer em superfícies de busca/audit

Campos proibidos em audit metadata e search index (confirmados por decisões anteriores):
- `importantObservations` (patients)
- `freeText`, `demand`, `observedMood`, `themes`, `clinicalEvolution`, `nextSteps` (clinical notes)
- `content` (documents)
- `amountInCents`, `paymentMethod` (charges)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stub cookie sem verificação | `signInWithPassword` + cookie | Fase 14 | Re-auth gate real |
| In-memory audit repository | PrismaAuditRepository | Fase 11 | Audit trail persistido |
| `WORKSPACE_ID = "ws_1"` hardcoded | Session Supabase real | Fase 12 (auth) | Workspace por sessão autenticada |

**Deprecated/outdated:**
- `DEFAULT_WORKSPACE_ID = "ws_1"` nas actions: ainda presente em todos os arquivos de actions. A fase 14 não está removendo estes stubs de identidade (isso foi decidido como parte da integração de auth, já feita na fase 12 para middleware, mas as actions ainda usam hardcoded). **Verificar se as actions já leem da sessão Supabase após fase 12.**

---

## Open Questions

1. **Actions ainda usam `ws_1` hardcoded?**
   - What we know: `DEFAULT_WORKSPACE_ID = "ws_1"` aparece em todos os arquivos de actions lidos
   - What's unclear: A fase 12 integrou Supabase auth no middleware — as actions também foram atualizadas?
   - Recommendation: Verificar um arquivo de actions da fase 12+ antes de planejar QUAL-03; se ainda usam `ws_1`, a "validação de workspaceId + autenticação" do QUAL-03 implica também migrar as actions para ler da sessão real

2. **Stub `auditEvents: never[]` onde exatamente?**
   - What we know: `buildWorkspaceBackup` em `serializer.ts` aceita `auditEvents: AuditEvent[]` (type correto); `route.ts` chama `auditRepo.listForWorkspace` que usa Prisma real
   - What's unclear: O comentário do requirements menciona "remove the `auditEvents: never[]` stub" — pode existir em um snapshot de teste ou em uma versão anterior do serializer
   - Recommendation: Grep por `never\[\]` no codebase antes de planejar QUAL-04

3. **QUAL-06 — escopo exato**
   - What we know: Stores de produção já usam Prisma (`getPatientRepository()` retorna `createPrismaPatientRepository()`); testes de domínio usam `createInMemory*`
   - What's unclear: O requirements diz "no in-memory repository leakage" — refere-se a stores de produção ou a testes?
   - Recommendation: Interpretar como "verificar que nenhum store de produção importa in-memory"; testes de domínio puro com in-memory são corretos e não devem ser migrados

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUAL-01 | `confirmBackupAuthAction` retorna `{ ok: false }` com senha errada | unit | `pnpm test -- tests/export-backup.test.ts` | ✅ (verificar cobertura) |
| QUAL-01 | Re-auth gate retorna 401 sem cookie válido | manual-only | — | N/A (route handler) |
| QUAL-02 | `error.tsx` renderiza sem crash | manual-only | — | N/A (UI) |
| QUAL-03 | Action retorna `{ ok: false }` quando Prisma lança | unit | `pnpm test -- tests/patient-domain.test.ts` | ✅ (estender) |
| QUAL-04 | `listForWorkspace` retorna eventos reais (não `[]`) | manual-only | — | N/A (integração) |
| QUAL-05 | `importantObservations` ausente do search index | unit | `pnpm test -- tests/search-domain.test.ts` | ✅ |
| QUAL-06 | Stores de produção não importam in-memory | manual/grep | `grep -r "createInMemory" src/` | N/A |
| DEPLOY-01 | Build sem erros com env vars de produção | manual-only | `pnpm build` | N/A |
| DEPLOY-02 | `next build` completa sem erros | manual-only | `pnpm build` | N/A |
| DEPLOY-03 | `prisma migrate status` retorna "Database schema is up to date" | manual-only | `pnpm dlx prisma migrate status` | N/A |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** `pnpm test` verde + `pnpm build` sem erros antes de `/gsd:verify-work`

### Wave 0 Gaps
- Nenhum arquivo de teste novo necessário — os testes existentes cobrem os domínios afetados. A fase é principalmente de hardening de código existente e verificação manual de deploy.

---

## Sources

### Primary (HIGH confidence)
- Código fonte do projeto — leitura direta de todos os arquivos relevantes
- `src/lib/security/sensitive-actions.ts` — interface `SensitiveActionChallenge`, `evaluateSensitiveAction`
- `src/lib/audit/store.ts` + `repository.prisma.ts` — confirmação que audit já usa Prisma
- `src/app/(vault)/inicio/error.tsx` — padrão visual exato a replicar
- `tests/*.test.ts` — todos os 20 arquivos de teste, uso de `createInMemory*` confirmado

### Secondary (MEDIUM confidence)
- Next.js 15 App Router docs — `error.tsx` conventions, redirect behavior em server actions
- Supabase Auth docs — `signInWithPassword` API

### Tertiary (LOW confidence)
- `isRedirectError` de `next/dist/client/components/redirect` — API interna do Next.js, pode mudar entre versões menores

---

## Metadata

**Confidence breakdown:**
- Re-auth gate (QUAL-01): HIGH — padrão claro, `signInWithPassword` é a API correta
- Error boundaries (QUAL-02): HIGH — 5 exemplos existentes definem o padrão exato
- Server action try/catch (QUAL-03): HIGH — estratégia simples e bem definida, pitfall de redirect documentado
- Audit trail (QUAL-04): MEDIUM — pode ser apenas verificação, não implementação nova
- SECU-05 audit (QUAL-05): HIGH — decisões de whitelist já estabelecidas nas fases anteriores
- Test migration (QUAL-06): MEDIUM — escopo ambíguo, recomendação é interpretação conservadora
- Deploy (DEPLOY-01/02/03): HIGH — stack padrão Vercel + Next.js + Prisma

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stack estável)
