# Phase 24: Continuidade e Fluxo - Research

**Researched:** 2026-04-02
**Domain:** Next.js App Router — nova rota de prontuário clínico, timeline cronológica, hierarquia visual
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Destino do fluxo clínico**
- Criar nova rota `/prontuario/[patientId]` — view clínica pura, separada de `/patients/[id]`
- A nova view contém: identidade do paciente + próxima sessão (como primeira entrada da timeline) + timeline cronológica + documentos clínicos
- `/patients/[patientId]` permanece intocada — continua sendo a página operacional (finanças, lembretes, edição de cadastro)
- Conexão entre as duas: link discreto na view clínica chamado "Dados cadastrais" apontando para `/patients/[id]`
- Link "Ver prontuário" nos cards da `/prontuario` mantém esse texto e aponta para a nova rota

**Navegação cronológica (timeline)**
- Agrupamento por status removido — lista cronológica pura, mais recente primeiro
- Próxima sessão integrada como primeira entrada da timeline (marcada visualmente como "Próxima")
- Canceladas/no-show: recolhidas por padrão — contagem discreta no final ("3 sessões dispensadas") com opção de expandir
- Cada entrada exibe: data + número da sessão, modo de atendimento (Presencial/Online), link para documento gerado (se existir)
- O indicador de "registro clínico escrito" não aparece por padrão — Claude decide se inclui como detalhe visual
- 5 sessões visíveis, restante recolhido com "Ver mais" (mantém padrão atual)

**Hierarquia visual e orientação (CONT-03)**
- Breadcrumb no topo: "Prontuário → [Nome do paciente]" — link "Prontuário" volta para `/prontuario`
- H1: nome do paciente — em serif (`var(--font-serif)`), proeminência editorial
- Separação de seções via h2 + separadores horizontais — hierarquia tipográfica explícita
- Seções não usam cards individuais — page flow linear com divisores

**Empty states e linguagem (CONT-04)**
- Timeline sem sessões: mensagem de início + CTA discreto para agendar ("Agendar primeira sessão" ou "Começar acompanhamento")
- Seção de documentos sem documentos: texto discreto "Nenhum documento gerado neste acompanhamento." — seção sempre visível
- Card na `/prontuario` sem notas clínicas: badge ou tag discreta "Novo acompanhamento" — diferencia visualmente
- Copy exato dos empty states: Claude decide dentro do vocabulário psicanalítico obrigatório

### Claude's Discretion
- Indicador visual de registro escrito por sessão (pode incluir como detalhe se fizer sentido)
- Densidade visual dos cards da timeline
- Loading skeleton do `/prontuario/[patientId]`
- Copy exato dos empty states (dentro do vocabulário obrigatório)
- Estilo exato do breadcrumb e separadores

### Deferred Ideas (OUT OF SCOPE)
- Nenhuma ideia de escopo fora desta fase surgiu durante a discussão — discussão ficou centrada nos requisitos CONT-01 a CONT-04
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Prontuário com navegação cronológica fluida — histórico de sessões visível, ordenado e navegável sem perda de contexto temporal | Nova rota `/prontuario/[patientId]` com timeline cronológica pura (mais recente primeiro), 5 visíveis + "Ver mais" com `<details>` nativo |
| CONT-02 | Fluxo sessão → registro → documento gerado é suave e intuitivo | Cada entrada da timeline linka para `/sessions/[id]/note`; documentos do paciente exibidos com link para visualizar, associados visualmente à sessão geradora |
| CONT-03 | Hierarquia paciente → sessões → registros → documentos é visualmente coerente | Breadcrumb, H1 em serif, h2 com `<hr>` separadores, flow linear sem cards soltos — orientação permanente na página |
| CONT-04 | Empty states, títulos e mensagens usam linguagem de acompanhamento ao longo do tempo | EmptyState reutilizável com copy psicanalítico; badge "Novo acompanhamento" no card da lista; seção de documentos sempre visível |
</phase_requirements>

---

## Summary

Esta fase cria a rota `/prontuario/[patientId]` como view clínica focada — separada da página operacional do paciente (`/patients/[id]`). O objetivo não é construir nova funcionalidade clínica, mas reorganizar e comunicar o que já existe de forma que transmita acompanhamento longitudinal, não lista de registros.

O código existente já tem todos os building blocks: `ClinicalTimeline` (com agrupamento por status a ser substituído por ordem cronológica pura), `EmptyState` (componente reutilizável), repositórios com `listByPatient()` para appointamentos, notas clínicas e documentos, e padrão de Server Component puro para páginas de dados. A nova rota reconstrói a apresentação — não a lógica de dados.

Dois ajustes secundários completam a fase: na `/prontuario/page.tsx` (lista), o link "Ver prontuário" muda o destino de `/patients/[id]` para `/prontuario/[id]`, e um badge "Novo acompanhamento" é adicionado ao card quando `latestNote === null`.

**Primary recommendation:** Criar `/prontuario/[patientId]/page.tsx` como Server Component puro que carrega 4 repositórios em `Promise.all()`, monta a timeline cronológica mesclando todos os atendimentos (upcoming como "Próxima", completed + dismissed em ordem cronológica reversa), e usa `<details>` nativo para recolher dismissed e overflow — sem client JS.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15 | Roteamento, Server Components, loading.tsx | Stack do projeto — rota segue convenção `(vault)/prontuario/[patientId]/page.tsx` |
| React | 19 | UI Server Components | Stack do projeto |
| TypeScript | 5.8 strict | Tipagem de props e interfaces | Obrigatório no projeto |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Intl.DateTimeFormat` (nativo) | — | Formatação de datas em pt-BR | Padrão já estabelecido em `ClinicalTimeline` e `prontuario/page.tsx` |
| `<details>/<summary>` (HTML nativo) | — | Recolher dismissed e overflow de sessões | Já usado em `ClinicalTimeline` — sem JS, funciona com SSR |
| `next/navigation` `notFound()` | — | 404 quando paciente não pertence ao workspace | Padrão de todos os `[patientId]` routes |
| `next/link` | — | Navegação client-side (breadcrumb, links da timeline) | Padrão do projeto |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<details>` nativo para "Ver mais" | Estado client (`useState`) | `<details>` é zero-JS, SSR-safe, já funciona no projeto |
| Server Component puro | Client Component | Server Component evita hydration, alinha ao padrão dominante do vault |

**Installation:** Nenhum pacote novo necessário.

---

## Architecture Patterns

### Recommended Project Structure
```
src/app/(vault)/prontuario/
├── page.tsx                    # lista existente — ajustar link + badge
├── loading.tsx                 # skeleton existente — mantido
└── [patientId]/
    ├── page.tsx                # NOVO — view clínica focada
    └── loading.tsx             # NOVO — skeleton da view clínica
```

### Pattern 1: Server Component com Promise.all para múltiplos repositórios

**What:** Página async que carrega dados de 4 repositórios em paralelo, sem `use client`
**When to use:** Sempre que a página precisa de dados de múltiplos domínios — padrão estabelecido em `patients/[patientId]/page.tsx`

```typescript
// Padrão do projeto (src/app/(vault)/patients/[patientId]/page.tsx)
export default async function ProntuarioPatientPage({ params }: Props) {
  const { workspaceId } = await resolveSession();
  const { patientId } = await params;

  const [patient, appointments, notes, documents] = await Promise.all([
    patientRepo.findById(patientId, workspaceId),
    appointmentRepo.listByPatient(patientId, workspaceId),
    clinicalRepo.listByPatient(patientId, workspaceId),
    documentRepo.listActiveByPatient(patientId, workspaceId),
  ]);

  if (!patient) notFound();
  // ...
}
```

### Pattern 2: Timeline cronológica com mesclagem de status

**What:** Mesclar upcoming + completed + dismissed em lista única, ordenada por `startsAt` decrescente, com upcoming no topo como caso especial
**When to use:** Esta página — a nova timeline não agrupa por status como o `ClinicalTimeline` existente

```typescript
// Lógica de montagem da timeline
const now = new Date();
const upcoming = appointments
  .filter(a => (a.status === "SCHEDULED" || a.status === "CONFIRMED") && a.startsAt > now)
  .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
  .slice(0, 1); // só a próxima

const past = appointments
  .filter(a => a.startsAt <= now || a.status === "COMPLETED" || a.status === "CANCELED" || a.status === "NO_SHOW")
  .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime()); // mais recente primeiro

const completed = past.filter(a => a.status === "COMPLETED");
const dismissed = past.filter(a => a.status === "CANCELED" || a.status === "NO_SHOW");
```

### Pattern 3: Associar nota clínica e documento a cada atendimento

**What:** Mapas `appointmentId → note` e `appointmentId → document` construídos server-side para lookup O(1), evitando N+1
**When to use:** Esta página — cada entrada da timeline precisa saber se tem nota e se tem documento

```typescript
// Padrão de notesByAppointment já estabelecido em patients/[patientId]/page.tsx
const notesByAppointment = new Map(notes.map(n => [n.appointmentId, n]));

// Para documentos: session_note e session_record são os tipos associados a atendimentos
const docsByAppointment = new Map<string, PracticeDocument>();
for (const doc of documents) {
  if (doc.type === "session_note" || doc.type === "session_record") {
    // appointmentId não está no modelo PracticeDocument — associar por proximidade de data
    // ou via campo de metadados se existir
  }
}
```

**Atenção:** O modelo `PracticeDocument` não tem campo `appointmentId`. Documentos são listados separadamente da timeline — não vinculados por ID de atendimento. O planer deve listar documentos em seção própria, não por entrada da timeline.

### Pattern 4: Breadcrumb server-side

**What:** Breadcrumb simples como markup estático — sem componente, sem estado
**When to use:** Esta página

```typescript
// Inline no page.tsx — sem componente separado
<nav style={breadcrumbStyle}>
  <Link href="/prontuario">Prontuário</Link>
  <span aria-hidden>→</span>
  <span>{patient.fullName}</span>
</nav>
```

### Pattern 5: loading.tsx skeleton para nova rota

**What:** Server Component puro com `skeleton-pulse` CSS class (sem `use client`) — replicar shell do page.tsx
**When to use:** Toda rota nova — `loading.tsx` é automático no App Router

```typescript
// Padrão de prontuario/loading.tsx existente — replicar para [patientId]/loading.tsx
// skeleton-pulse é classe CSS definida em globals.css
// Não usar use client — pure server component
```

### Anti-Patterns to Avoid

- **Criar ClinicalTimeline v2 como componente separado:** O componente existente em `patients/[patientId]/components/clinical-timeline.tsx` usa agrupamento por status e tem ComunicacaoGroup — a nova view não precisa dessas partes. Montar a timeline diretamente no `page.tsx` (inline) é mais simples que criar um novo componente pesado.
- **Importar o ClinicalTimeline existente para a nova rota:** A interface de props dele (`upcoming`, `completed`, `dismissed` separados) não corresponde à nova apresentação cronológica unificada. Reuso da lógica de dados, não do componente.
- **Usar `useState` para "Ver mais" / expandir dismissed:** `<details>/<summary>` nativo já faz isso sem JS. Padrão estabelecido.
- **Chamar repositórios em sequência em vez de `Promise.all`:** N repositórios em paralelo é o padrão do projeto.
- **`use client` na page.tsx:** Server Component puro — sem interatividade que precise de JS nesta view.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Expand/collapse de dismissed | Toggle JS customizado | `<details>/<summary>` HTML | Zero JS, SSR-safe, já funciona no projeto |
| Empty state | Bloco ad-hoc de markup | `EmptyState` em `(vault)/components/empty-state.tsx` | Componente reutilizável com suporte a `actionLabel` + `actionHref` |
| Autenticação/workspace | `resolveSession()` manual | `resolveSession()` importado de `@/lib/supabase/session` | Singleton já existente, retorna `{ accountId, workspaceId }` |
| Formatação de data pt-BR | `toLocaleDateString` sem timezone | `Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" })` | Padrão do projeto — evita bugs de timezone |
| Loading state | CSS manual | `className="skeleton-pulse"` | Keyframe definido em globals.css, usado em toda o vault |

---

## Common Pitfalls

### Pitfall 1: PracticeDocument não tem appointmentId

**What goes wrong:** Tentar vincular documentos a entradas específicas da timeline por `appointmentId`
**Why it happens:** O modelo `PracticeDocument` (`src/lib/documents/model.ts`) não tem campo `appointmentId` — documentos são entidade separada, listados por `patientId`
**How to avoid:** Listar documentos em seção própria abaixo da timeline, não embutidos em cada entrada
**Warning signs:** TypeScript error ao tentar acessar `doc.appointmentId`

### Pitfall 2: Link "Ver prontuário" ainda aponta para /patients/[id]

**What goes wrong:** O link nos cards da `/prontuario/page.tsx` continua com `href={/patients/${patient.id}}` — o usuário é levado à página operacional em vez da nova view clínica
**Why it happens:** É um ajuste pontual que pode ser esquecido se o plano não listar explicitamente
**How to avoid:** Incluir a edição de `prontuario/page.tsx` como task separada no plano, mudando o `href` para `/prontuario/${patient.id}`

### Pitfall 3: deriveSessionNumber aplicado a CANCELED/NO_SHOW

**What goes wrong:** Exibir "Sessão 3" para atendimentos cancelados — número incorreto
**Why it happens:** `deriveSessionNumber` conta apenas `COMPLETED` — aplicar a dismissed retorna número de sessões completadas até aquele ponto, não o número daquele atendimento cancelado
**How to avoid:** Para dismissed, exibir apenas a data e o status — sem sessionNumber label

### Pitfall 4: Timezone nos atendimentos futuros

**What goes wrong:** A próxima sessão aparece com data errada (um dia antes ou depois)
**Why it happens:** `startsAt` é UTC — sem `timeZone` explícito em `Intl.DateTimeFormat`, pt-BR usa timezone local do servidor
**How to avoid:** Seguir o padrão já estabelecido: `timeZone: "UTC"` para listas, `timeZone: "America/Sao_Paulo"` apenas quando exibindo hora de início (como em `ComunicacaoGroup`)

### Pitfall 5: Badge "Novo acompanhamento" sem fallback visual

**What goes wrong:** Badge em texto sem contraste suficiente ou que pareça status/erro
**Why it happens:** Badges coloridos foram listados como anti-padrão visual no CLAUDE.md ("Sem badges, chips coloridos... sem função real")
**How to avoid:** Usar estilo discreto — texto pequeno, cor `var(--color-text-3)`, sem background colorido forte. É informação contextual, não alerta.

---

## Code Examples

### Montagem da timeline cronológica unificada

```typescript
// Construção server-side — sem hooks
const now = new Date();

const upcoming = appointments
  .filter(a =>
    (a.status === "SCHEDULED" || a.status === "CONFIRMED") &&
    a.startsAt > now
  )
  .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
  .at(0) ?? null; // só a próxima

const completedSorted = appointments
  .filter(a => a.status === "COMPLETED")
  .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

const dismissedAll = appointments
  .filter(a => a.status === "CANCELED" || a.status === "NO_SHOW")
  .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

const completedVisible = completedSorted.slice(0, 5);
const completedHidden = completedSorted.slice(5);
```

### Map de notas por atendimento (O(1) lookup)

```typescript
// Padrão estabelecido em patients/[patientId]/page.tsx
const notesByAppointment = new Map(
  notes.map(n => [n.appointmentId, n])
);

// Na renderização:
const note = notesByAppointment.get(entry.appointmentId) ?? null;
```

### Empty state com CTA

```typescript
// EmptyState com actionLabel + actionHref — suportado pelo componente existente
<EmptyState
  icon={/* SVG de calendário */}
  title="Nenhum atendimento registrado neste acompanhamento"
  description="O histórico aparecerá aqui conforme os atendimentos forem sendo realizados."
  actionLabel="Agendar primeiro atendimento"
  actionHref={`/agenda/new?patientId=${patientId}`}
/>
```

### Badge "Novo acompanhamento" na lista

```typescript
// Em prontuario/page.tsx — condição quando latestNote === null
{!latestNote && (
  <span style={newBadgeStyle}>Novo acompanhamento</span>
)}

const newBadgeStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
  fontStyle: "italic",
} satisfies React.CSSProperties;
```

### Seção de documentos sempre visível (empty state inline)

```typescript
// Sem EmptyState component — texto discreto inline
<section style={sectionStyle}>
  <h2 style={h2Style}>Documentos clínicos</h2>
  <hr style={dividerStyle} />
  {documents.length === 0 ? (
    <p style={emptyDocStyle}>Nenhum documento gerado neste acompanhamento.</p>
  ) : (
    <ul>
      {documents.map(doc => (
        <li key={doc.id}>
          {/* tipo + data + link */}
        </li>
      ))}
    </ul>
  )}
</section>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Link "Ver prontuário" → `/patients/[id]` | Link → `/prontuario/[id]` | Esta fase | Separa view clínica de view operacional |
| ClinicalTimeline com agrupamento por status | Timeline cronológica pura | Esta fase | Novo componente inline em `page.tsx` |
| Prontuário não tinha rota própria | `/prontuario/[patientId]` como view focada | Esta fase | Hierarquia de roteamento reflete hierarquia clínica |

---

## Open Questions

1. **Documentos sem appointmentId — como exibir o tipo em pt-BR**
   - O que sabemos: `DocumentType` é um union de strings em inglês snake_case (`"session_note"`, `"receipt"`, etc.)
   - O que é incerto: não há mapeamento `DocumentType → label pt-BR` centralizado verificado
   - Recomendação: criar mapeamento local no `page.tsx` (ex: `{ session_note: "Nota de sessão", receipt: "Recibo" }`) — não é complexidade que justifique arquivo separado nesta fase

2. **Ordem de exibição de documentos**
   - O que sabemos: `listActiveByPatient` retorna sem ordenação garantida (in-memory itera Map)
   - O que é incerto: se existe índice de data ou se a ordenação precisa ser explícita
   - Recomendação: ordenar por `createdAt` decrescente no page.tsx após carregar

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test --reporter=verbose` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Timeline ordena atendimentos cronologicamente (mais recente primeiro) | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ Wave 0 |
| CONT-01 | Upcoming aparece como primeiro item mesmo sendo futuro | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ Wave 0 |
| CONT-02 | notesByAppointment map retorna nota correta por appointmentId | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ Wave 0 |
| CONT-03 | Breadcrumb renderiza link para `/prontuario` | manual-only | — | N/A — markup estático |
| CONT-04 | Empty state exibe quando lista de atendimentos está vazia | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ Wave 0 |
| CONT-04 | Badge "Novo acompanhamento" exibido quando latestNote === null | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ Wave 0 |

**Nota:** CONT-03 (hierarquia visual/breadcrumb) é verificação de markup — teste manual ou visual review, não unit test automático.

### Sampling Rate
- **Per task commit:** `pnpm test tests/prontuario-timeline.test.ts -x`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green antes de `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/prontuario-timeline.test.ts` — cobre CONT-01, CONT-02, CONT-04 com repositórios in-memory
- [ ] Fixtures de atendimentos (upcoming, completed, dismissed) para montar cenários de timeline

*(Infraestrutura de testes (vitest, repositórios in-memory) já existe — nenhum setup adicional necessário)*

---

## Sources

### Primary (HIGH confidence)
- Leitura direta: `src/app/(vault)/prontuario/page.tsx` — estado atual da lista, lógica de ordenação, estilos
- Leitura direta: `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx` — padrões de componentes, interfaces de dados, estilos de chips e cards
- Leitura direta: `src/app/(vault)/components/empty-state.tsx` — interface do componente reutilizável
- Leitura direta: `src/lib/documents/model.ts` — confirmação de que `PracticeDocument` não tem `appointmentId`
- Leitura direta: `src/lib/appointments/repository.ts` — interface `listByPatient`
- Leitura direta: `src/lib/clinical/repository.ts` — interface `listByPatient`, `findByAppointmentId`
- Leitura direta: `src/app/globals.css` — tokens CSS disponíveis (`--font-serif`, `--radius-*`, `skeleton-pulse`, `--shadow-*`)
- Leitura direta: `src/app/(vault)/patients/[patientId]/page.tsx` — padrão `Promise.all`, `notesByAppointment` map

### Secondary (MEDIUM confidence)
- `24-CONTEXT.md` — decisões verificadas contra o código existente; todas são implementáveis com os padrões encontrados

### Tertiary (LOW confidence)
- Nenhum

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — sem pacotes novos, tudo verificado no codebase
- Architecture: HIGH — padrões copiados do código existente (`patients/[patientId]/page.tsx`, `ClinicalTimeline`)
- Pitfalls: HIGH — identificados por leitura direta dos modelos (PracticeDocument sem appointmentId, deriveSessionNumber semântica)

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stack estável, sem dependências externas voláteis)
