# Phase 23: Copy Interna - Research

**Researched:** 2026-04-01
**Domain:** Copy/vocabulary audit — Next.js 15 App Router TSX, inline styles, pt-BR UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sidebar — estrutura de navegação**
- Adicionar item "Prontuário" à sidebar como entrada de topo
- Criar rota `/prontuario` como lista independente — visão clínica orientada ao registro (pacientes com evoluções recentes), não só cadastro
- Documentos **não** ganha entrada na sidebar nesta fase — acesso permanece via perfil do paciente
- Estrutura final da sidebar: Início, Agenda, Pacientes, Prontuário, Financeiro, Configurações

**Dashboard — título e seções**
- H1 "Início" mantido — neutro, funciona, não viola vocabulário proibido
- Seções "Hoje", "Lembretes ativos", "Resumo do mês" mantidas
- Framing clínico aplicado via empty states e labels, não via renomeação das seções
- Empty state da seção "Hoje": substituir "Nenhuma sessão agendada para hoje." por linguagem de atendimento — ex: "Sem atendimentos hoje." ou "Sua agenda está livre hoje."

**Dashboard — labels de métricas (Resumo do mês)**
- "Sessões realizadas" → "Atendimentos realizados" (Phase 21 define 'atendimento' como vocabulário obrigatório)
- "Pacientes ativos" → mantido (vocabulário já correto)
- "cobranças em aberto" → "A receber" ou "Recibos pendentes" — linguagem de consultório, sem jargão financeiro de software

**Onboarding (complete-profile)**
- H1: "Complete seu cadastro." → **"Configure seu consultório."** — framing de preparo do espaço de trabalho, não preenchimento de formulário
- Eyebrow "Perfil profissional" → mantido — preciso e neutro
- Subcopy mantido: "Esses dados identificam você nos documentos clínicos e configuram sua agenda." — já é concreto e funcional

### Claude's Discretion
- Copy exato do empty state da seção "Hoje" (desde que use "atendimento", não "sessão")
- Copy exato do label de métricas financeiras ("A receber" ou "Recibos pendentes")
- Estrutura visual e conteúdo da rota `/prontuario` (lista de pacientes com evoluções recentes — layout e densidade à critério do executor)

### Deferred Ideas (OUT OF SCOPE)
- Documentos como entrada de sidebar — decidido para fase posterior se necessário
- Mensagem de boas-vindas pós-onboarding no dashboard — não priorizou nesta discussão
- Redesign visual da rota `/prontuario` com hierarquia temporal — Phase 24 (Continuidade e Fluxo)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Sidebar e todos os itens de navegação em pt-BR com vocabulário psicanalítico (Prontuário, Agenda, Pacientes, Documentos, Financeiro) | Audit completo: sidebar já tem Agenda/Pacientes/Financeiro; faltam "Prontuário" na NAV_ITEMS e "Config" no bottom-nav está truncado |
| NAV-02 | Dashboard e visão geral com labels e framing de prática clínica — sem linguagem SaaS genérica ou métricas de "engajamento" | Audit: "Sessões realizadas" e "cobranças em aberto" identificados como violações em `inicio/page.tsx`; empty state usa "sessão" em vez de "atendimento" |
| NAV-03 | Onboarding usa tom de marca — calmo, profissional, específico para clínicos psicanalíticos — sem jargão genérico ou hype | Audit: h1 "Complete seu cadastro." em `(auth)/complete-profile/page.tsx` é o único ponto a corrigir |
</phase_requirements>

---

## Summary

Esta fase é um **audit de copy com entregáveis de código concretos** — não é uma feature phase. O trabalho é identificar cada string de UI que viola o vocabulário psicanalítico definido na Phase 21, substituir inline no JSX, e criar a rota `/prontuario` como novo ponto de entrada clínico na sidebar.

O inventário de mudanças é pequeno e bem delimitado: três arquivos de UI existentes recebem edições cirúrgicas de copy, dois arquivos de nav (`vault-sidebar-nav.tsx` e `bottom-nav.tsx`) recebem o novo item "Prontuário", e uma nova rota `src/app/(vault)/prontuario/page.tsx` é criada do zero seguindo o padrão existente.

O maior risco não é técnico — é de regressão de copy: introduzir novas strings com vocabulário errado ao criar a rota `/prontuario`. O planner deve garantir que qualquer texto na nova rota passe pelo vocabulário obrigatório do CLAUDE.md.

**Primary recommendation:** Dividir em dois planos — P01 edita arquivos existentes (copy audit), P02 cria a rota `/prontuario`. Isola o risco de cada entregável.

---

## Audit Completo: Strings com Violações Identificadas

### `src/app/(vault)/components/vault-sidebar-nav.tsx`

| Localização | String atual | Problema | Correção |
|------------|--------------|----------|----------|
| `NAV_ITEMS` array | (ausência) | Falta entrada "Prontuário" | Adicionar `{href: "/prontuario", label: "Prontuário", icon: <svg...>}` entre "Pacientes" e "Financeiro" |
| `isActive` function | `pathname.startsWith("/patients")` | Precisa de equivalente para `/prontuario` | Adicionar `startsWith("/prontuario")` no guard de isActive |

### `src/app/(vault)/components/bottom-nav.tsx`

| Localização | String atual | Problema | Correção |
|------------|--------------|----------|----------|
| `NAV_ITEMS` array | (ausência) | Falta entrada "Prontuário" | Adicionar item entre "Pacientes" e "Financeiro" |
| `NAV_ITEMS[4]` | `label: "Config"` | Truncamento — não é vocabulário proibido, mas inconsistente com "Configurações" na sidebar | Avaliar: manter "Config" por restrição de espaço mobile OU expandir para "Configurações" |

**Nota sobre bottom-nav:** Mobile tem restrição de espaço. Com 5 itens já existentes + Prontuário = 6 itens. Decisão de arquitetura: remover "Config" do bottom-nav e deixar Configurações acessível apenas via sidebar desktop, OU manter 6 itens comprimidos. A critério do executor — não viola vocabulário, apenas UX.

### `src/app/(vault)/inicio/page.tsx`

| Localização | String atual | Problema | Correção |
|------------|--------------|----------|----------|
| linha 155 | `"Nenhuma sessão agendada para hoje."` | "sessão" em vez de "atendimento" | "Sem atendimentos hoje." ou "Sua agenda está livre hoje." |
| linha 211 | `"Sessões realizadas"` | "Sessões" é vocabulário proibido no contexto de métricas | "Atendimentos realizados" |
| linha 218–219 | `"cobrança em aberto"` / `"cobranças em aberto"` | Jargão de software financeiro | "A receber" (singular e plural) OU "Recibo pendente" / "Recibos pendentes" |
| linha 107 | `"Sua próxima sessão começa em ${minutesUntilNext} min"` | "sessão" em mensagem contextual | "Seu próximo atendimento começa em ${minutesUntilNext} min" |

**Nota:** linha 107 é mensagem dinâmica — também precisa ser corrigida para consistência total.

### `src/app/(auth)/complete-profile/page.tsx`

| Localização | String atual | Problema | Correção |
|------------|--------------|----------|----------|
| linha 39 | `<h1>Complete seu cadastro.</h1>` | Framing genérico de formulário | `<h1>Configure seu consultório.</h1>` |

**Strings mantidas (já corretas):**
- Eyebrow "Perfil profissional" — correto, neutro
- Subcopy "Esses dados identificam você nos documentos clínicos e configuram sua agenda." — concreto e funcional
- Botão "Entrar no PsiVault" — correto

### Strings em outros arquivos (sem violações, apenas verificação)

- `vault-sidebar-nav.tsx` labels existentes: "Início", "Agenda", "Pacientes", "Financeiro", "Configurações" — todos corretos
- `layout.tsx` tagline "Base clínica" — correto
- `inicio/page.tsx` eyebrow "Consultório" — correto

---

## Standard Stack

Esta fase não introduz dependências. Usa o stack existente do projeto.

### Padrões de código existentes (HIGH confidence — verificados no código)

| Padrão | Onde aparece | Como usar |
|--------|-------------|-----------|
| Inline SVG stroke | `vault-sidebar-nav.tsx`, `bottom-nav.tsx` | `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.75}`, `width={16}` (sidebar) / `width={20}` (bottom-nav) |
| `isActive` guard | `vault-sidebar-nav.tsx` linha 66–71 | `pathname.startsWith("/prontuario")` para rotas com sub-páginas |
| `as const` no array de nav | linha 50 | Manter `as const` após adicionar novo item |
| `satisfies React.CSSProperties` | todo o projeto | Manter em todos os estilos inline |
| Server Component async page | `inicio/page.tsx`, `patients/page.tsx` | Padrão para `/prontuario/page.tsx` |
| `resolveSession()` + `workspaceId` | todas as pages vault | Sempre scope por workspaceId |

### Ícone SVG para "Prontuário"

Padrão do projeto: ícones Feather-style (stroke, viewBox 24×24). Para prontuário/clipboard clínico, o path canônico é:

```tsx
// Clipboard com linhas — evoca registro clínico
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  <rect x="9" y="3" width="6" height="4" rx="2" />
  <line x1="9" y1="12" x2="15" y2="12" />
  <line x1="9" y1="16" x2="13" y2="16" />
</svg>
```

---

## Architecture Patterns

### Estrutura atual da sidebar (verificada)

```
NAV_ITEMS (as const):
  /inicio      → "Início"
  /agenda      → "Agenda"
  /patients    → "Pacientes"
  /financeiro  → "Financeiro"

SETTINGS_ITEM:
  /settings/profile → "Configurações"
```

### Estrutura final da sidebar (Phase 23)

```
NAV_ITEMS (as const):
  /inicio      → "Início"
  /agenda      → "Agenda"
  /patients    → "Pacientes"
  /prontuario  → "Prontuário"       ← NOVO
  /financeiro  → "Financeiro"

SETTINGS_ITEM:
  /settings/profile → "Configurações"
```

### Nova rota `/prontuario`

**O que é:** Lista de pacientes ordenada por atividade clínica recente — entrada direta no registro clínico, não uma duplicata de `/patients`.

**Estrutura de arquivo:**
```
src/app/(vault)/prontuario/
├── page.tsx          ← CRIAR — lista pacientes c/ evoluções recentes
└── loading.tsx       ← CRIAR (opcional) — skeleton consistente com outras rotas
```

**Padrão de dados para `prontuario/page.tsx`:**
- Usa `PatientRepository.listActive(workspaceId)` — já existe
- Usa `ClinicalRepository` para buscar última evolução por paciente — padrão já usado em `patients/[patientId]/page.tsx`
- Server Component async, mesma estrutura de `patients/page.tsx`

**Pattern de `isActive` a adicionar em `vault-sidebar-nav.tsx`:**
```tsx
function isActive(href: string) {
  if (href === "/patients") {
    return pathname.startsWith("/patients");
  }
  if (href === "/prontuario") {
    return pathname.startsWith("/prontuario");
  }
  return pathname === href || pathname.startsWith(href + "/");
}
```

### Anti-Patterns a Evitar

- **Duplicar "Pacientes" sem diferenciação:** `/prontuario` deve ter framing diferente — "último registro", "evolução recente", ordem por atividade — não apenas a mesma lista de cadastro
- **Criar um novo arquivo de constantes de copy:** As strings ficam inline no JSX, como o padrão estabelecido. Não criar i18n, não criar constantes separadas.
- **Usar "sessão" em qualquer nova string:** O vocabulário obrigatório é "atendimento" — verificar cada nova string criada na rota `/prontuario`

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez |
|---------|---------------|-------------|
| Busca de última nota clínica por paciente | Query customizada | `ClinicalRepository` existente + `listByPatient(workspaceId, patientId)` |
| Ordenação por atividade recente | Sort customizado | `Array.sort()` sobre `createdAt` das notas retornadas |
| Loading state | Componente próprio | `loading.tsx` com `skeleton-pulse` CSS class (padrão Phase 13) |

---

## Common Pitfalls

### Pitfall 1: Perder a string dinâmica de "sessão" no contextualMessage
**O que vai errado:** O executor corrige os labels estáticos mas esquece a string dinâmica `"Sua próxima sessão começa em ${minutesUntilNext} min"` na linha 107 de `inicio/page.tsx`.
**Por que acontece:** A string está em lógica de negócio, não em JSX — fácil de passar batido no audit.
**Como evitar:** O plano deve listar explicitamente linha 107 como item de edição, não apenas as strings no JSX.

### Pitfall 2: Bottom-nav com 6 itens sem decisão de truncamento
**O que vai errado:** Adicionar "Prontuário" ao bottom-nav gera 6 itens numa barra mobile que foi desenhada para 5.
**Por que acontece:** A sidebar desktop e o bottom-nav mobile têm NAV_ITEMS separados — é fácil adicionar nos dois sem verificar o impacto mobile.
**Como evitar:** Decidir explicitamente no plano: manter "Config" no bottom-nav (6 itens) ou omitir (5 itens + Configurações só na sidebar).

### Pitfall 3: Criar a rota `/prontuario` com N+1 queries
**O que vai errado:** Para cada paciente na lista, fazer uma query separada de "última nota" — problema de performance com muitos pacientes.
**Por que acontece:** O padrão de `patients/[patientId]/page.tsx` busca notas por paciente individual — reutilizá-lo diretamente em uma lista gera N queries.
**Como evitar:** Buscar todas as notas do workspace em uma só query e agrupar no lado do servidor, como já feito em `notesByAppointment` map no perfil do paciente.

### Pitfall 4: Vocabulário errado em copy novo da rota `/prontuario`
**O que vai errado:** Empty states, títulos ou links na nova rota usam "sessão", "usuário", "registro" ou outras strings do vocabulário proibido.
**Por que acontece:** O executor não consulta o vocabulário do CLAUDE.md ao escrever copy novo.
**Como evitar:** O plano deve especificar o copy exato do empty state e do heading da rota `/prontuario` antes da implementação.

---

## Code Examples

### Padrão de adição de item em NAV_ITEMS (vault-sidebar-nav.tsx)

```tsx
// Source: verificado em src/app/(vault)/components/vault-sidebar-nav.tsx
{
  href: "/prontuario",
  label: "Prontuário",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
},
```

### Estrutura de page.tsx para /prontuario (padrão do projeto)

```tsx
// Source: padrão verificado em src/app/(vault)/patients/page.tsx e inicio/page.tsx
import { getPatientRepository } from "@/lib/patients/store";
import { getClinicalRepository } from "@/lib/clinical/store";
import { resolveSession } from "@/lib/supabase/session";

export default async function ProntuarioPage() {
  const { workspaceId } = await resolveSession();

  const patientRepo = getPatientRepository();
  const clinicalRepo = getClinicalRepository();

  const patients = await patientRepo.listActive(workspaceId);

  return (
    <main style={shellStyle}>
      <div style={headingRowStyle}>
        <p style={eyebrowStyle}>Registros</p>
        <h1 style={titleStyle}>Prontuário</h1>
      </div>
      {/* lista de pacientes com último registro */}
    </main>
  );
}
```

### Empty state com vocabulário correto

```tsx
// Correto — usa "atendimento"
<p>Sem atendimentos hoje.</p>
<p>Sua agenda está livre hoje.</p>

// Correto — usa "prontuário"
<p>Nenhum registro clínico ainda.</p>
<p>O histórico dos pacientes aparecerá aqui.</p>

// ERRADO — nunca usar
<p>Nenhuma sessão agendada para hoje.</p>  // ← "sessão" proibido
<p>Nenhum usuário encontrado.</p>           // ← "usuário" proibido
```

---

## State of the Art

| Abordagem anterior | Abordagem atual (Phase 23) |
|-------------------|---------------------------|
| Strings de copy misturadas ("sessão" e "atendimento") | Vocabulário canônico único: "atendimento" em toda UI |
| Sidebar sem entrada de Prontuário | Prontuário como item de topo — sinaliza centralidade do registro clínico |
| Onboarding como formulário de cadastro genérico | Onboarding como configuração de espaço de trabalho clínico |

---

## Open Questions

1. **Bottom-nav com 6 itens**
   - O que sabemos: o bottom-nav atual tem 5 itens (Início, Agenda, Pacientes, Financeiro, Config); adicionar Prontuário = 6
   - O que está incerto: 6 itens comprimidos vs. omitir "Config" do mobile
   - Recomendação: omitir "Config" do bottom-nav mobile e deixar "Configurações" acessível apenas pela sidebar desktop — consultório não é área de uso frequente em mobile

2. **Dados de "último registro" na rota /prontuario**
   - O que sabemos: `ClinicalRepository` tem `listByPatient(workspaceId, patientId)` mas não um método `listRecentByWorkspace`
   - O que está incerto: se buscar todas as notas do workspace é performático com o repo atual
   - Recomendação: para Phase 23, buscar notas por paciente em paralelo (`Promise.all`) para a lista de ativos — Phase 24 otimiza com query dedicada

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- --reporter=verbose` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Sidebar contém item "Prontuário" com href correto | manual-only | — visual verification | — |
| NAV-02 | Labels de métricas do dashboard usam vocabulário clínico | manual-only | — visual verification | — |
| NAV-03 | Onboarding h1 usa "Configure seu consultório." | manual-only | — visual verification | — |

**Justificativa manual-only:** Esta é uma fase de copy/vocabulary — não há lógica de negócio nova, apenas edição de strings em JSX e criação de uma rota de listagem. Os testes existentes continuam cobertos (`dashboard-aggregation.test.ts` para a lógica de `deriveMonthlySnapshot`, `patient-domain.test.ts` para `PatientRepository`). Nenhum comportamento novo requer teste unitário.

**Verificação de regressão:** `pnpm test` deve continuar passando sem modificações nos arquivos de teste.

### Sampling Rate
- **Por task commit:** `pnpm test` — garantir que nenhuma edição quebrou import ou tipo
- **Por wave:** `pnpm test` full suite
- **Phase gate:** full suite verde + inspeção visual das 3 superfícies (sidebar, inicio, complete-profile) antes de `/gsd:verify-work`

### Wave 0 Gaps
Nenhum — a infraestrutura de testes existente cobre todo o domínio relevante. Phase 23 não adiciona lógica testável nova além de queries de listagem.

---

## Sources

### Primary (HIGH confidence)
- Código verificado diretamente: `vault-sidebar-nav.tsx`, `bottom-nav.tsx`, `inicio/page.tsx`, `complete-profile/page.tsx`, `layout.tsx`, `settings/profile/page.tsx`
- `23-CONTEXT.md` — decisões locked e discernimento do usuário
- `CLAUDE.md` do projeto — vocabulário obrigatório e anti-padrões

### Secondary (MEDIUM confidence)
- Padrão de `patients/page.tsx` inferido para estrutura de `/prontuario/page.tsx` — arquivo não lido integralmente mas padrão é consistente em todo o projeto

---

## Metadata

**Confidence breakdown:**
- Copy audit (strings a editar): HIGH — leitura direta do código
- Estrutura da nova rota: HIGH — padrão repetido em todo o projeto
- Abordagem de dados para /prontuario: MEDIUM — ClinicalRepository verificado mas query de "recentes por workspace" não existe ainda

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stack estável, sem dependências externas)
