# Phase 43: Arquitetura Multi-Agent Foundation — Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Sistema de orquestração onde agentes inteligentes operam em background com filas isoladas, priorização de interrupções e lifecycle management. É a fundação para todos os agentes da v2.0 (Agenda, Calm UX, Monitoramento).

Scope: interface base de agente, sistema de registro dinâmico, fila de tarefas com priorização, orquestrador com lifecycle management, e endpoint de cron dedicado para processamento em background.

</domain>

<decisions>
## Implementation Decisions

### Execution Model
- **D-01:** Arquitetura **event-driven + cron híbrido**. Ações do usuário (mutações de atendimento, marcação de sessão completa/no-show) enfileiram tarefas de agente imediatamente via Server Actions.
- **D-02:** Cron processa a fila a cada **15 minutos**. Frequência suficiente para resposta próxima do real-time sem sobrecarga de compute no Vercel.
- **D-03:** Endpoint de cron **separado** de notificações: `/api/cron/agents`. Isolation completa do processamento de emails (`/api/cron/notifications`).
- **D-04:** Triggers automáticos em **todas as mutações de atendimento** (create, update, delete) e ao marcar sessão como `COMPLETED` ou `NO_SHOW`.

### Queue Strategy
- **D-05:** Nova tabela/modelo dedicado **`AgentTask`**. Não estende `NotificationJob` — separação de concerns entre fila de emails e fila de inteligência de agentes.
- **D-06:** Status lifecycle: `PENDING` → `RUNNING` → `DONE` | `ERROR` | `SKIPPED`.
  - `PENDING`: aguardando processamento
  - `RUNNING`: sendo processado pelo cron (previne double-processing em overlap)
  - `DONE`: processado com sucesso
  - `ERROR`: falhou após esgotar retries
  - `SKIPPED`: tornou-se irrelevante (ex: atendimento cancelado enquanto tarefa pendente)
- **D-07:** Retry automático com **backoff exponencial**: até 3 tentativas após falha (5min, 15min, 45min).
- **D-08:** Campo `payload` como JSON genérico (schema flexível por tipo de tarefa). Cada agente define seu próprio payload shape em TypeScript.

### Agent Scope & Registration
- **D-09:** Agentes são **escopados por workspace**. Cada workspace habilita e configura seus próprios agentes. O orquestrador filtra tarefas por `workspaceId`.
- **D-10:** Registro **dinâmico em runtime**. Agentes se registram no orquestrador em tempo de execução via API de registro. Isso habilita:
  - Fase 47: controle de intensidade (desligado/silencioso/normal) por workspace
  - Futuro ARCH-05: sistema de plugin para agentes de terceiros
- **D-11:** Todos os agentes **desabilitados por default** (opt-in). Novos workspaces não recebem agentes automaticamente. O usuário ativa explicitamente em Configurações → Agentes. Alinhado com princípio de Calm UX: não surpreender o usuário.
- **D-12:** Cada agente expõe: `id`, `name`, `description`, `defaultPriority`, `version`, `capabilities[]`.

### Priority & Interruption Model
- **D-13:** Prioridade afeta **ordem de execução na fila** e **canal de entrega** do output. Integração completa entre ARCH-02 e CALM-04.
- **D-14:** Hierarquia de prioridade mapeada para hierarquia de interrupção Calm:
  - `critical` (segurança) → **status light** (indicador periférico discreto, ex: dot vermelho no card do paciente)
  - `high` (falta iminente) → **badge/count** (contador sutil no elemento relevante)
  - `medium` (lembrete) → **notification dropdown** (sino de notificações, não intrusivo)
  - `low` (resumo) → **daily digest** ("Resumo do Dia" exibido após último atendimento, batching obrigatório)
- **D-15:** Cada agente tem **prioridade base configurável**. Tarefas individuais podem **sobrescrever** a prioridade base do agente. Ex: Agenda agent base="medium", mas tarefa de detecção de padrão de faltas críticas pode elevar para "high".
- **D-16:** Regra de ouro Calm: **nenhum agente entrega output como popup/modal durante sessão em andamento**. Qualquer output com prioridade `critical` ou `high` que ocorra durante sessão é adiado para o Resumo do Dia ou exibido como status light (nunca modal).

### the agent's Discretion
- Estratégia exata de lock/concurrency para evitar double-processing de tasks (`RUNNING` status + row-level locking ou atomic update)
- Detalhes de timeout por task (quanto tempo uma task pode rodar antes de ser considerada stalled)
- Estratégia de cleanup de tasks antigas (retention policy para `DONE` e `SKIPPED`)
- Formato exato do schema JSON de `payload` por tipo de agente (cada agente define seu próprio)
- Implementação específica do "Resumo do Dia" (quando e como é exibido — provavelmente na Fase 44)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition & requirements
- `.planning/ROADMAP.md` §Phase 43 — Goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` §ARCH-01 a ARCH-04 — Requisitos da arquitetura multi-agent
- `.planning/PROJECT.md` §Current Milestone v2.0 — Vision, constraints, Calm UX principles

### Existing queue & cron patterns (reference, not reuse)
- `src/lib/notifications/queue.ts` — Padrão de enfileiramento com idempotency key
- `src/app/api/cron/notifications/route.ts` — Padrão de cron job: auth via `CRON_SECRET`, processamento concorrente com `Promise.allSettled`, retry com reagendamento
- `src/lib/notifications/repository.ts` — Interface de repository para jobs (padrão a seguir para `AgentTaskRepository`)
- `src/lib/notifications/model.ts` — `NotificationJob` model (referência de campos e status)

### Architecture patterns
- `src/lib/[domain]/repository.ts` — Repository pattern (interface)
- `src/lib/[domain]/repository.prisma.ts` — Repository pattern (implementação Prisma)
- `src/lib/[domain]/store.ts` — Singleton store via `globalThis`
- `src/lib/[domain]/model.ts` — Domain model com factories
- `CLAUDE.md` — Regras de vocabulário, anti-padrões visuais, direção de marca, motion tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`NotificationJobRepository`** — padrão de interface para fila (save, findById, listDue, updateStatus). Adaptar para `AgentTaskRepository` com campos adicionais (`agentId`, `priority`, `payload`, `retryCount`).
- **Cron auth pattern** — `Authorization: Bearer $CRON_SECRET` já implementado em `/api/cron/notifications/route.ts`. Reutilizar em `/api/cron/agents`.
- **`Promise.allSettled` com métricas** — padrão de processamento concorrente de jobs com contagem de sent/failed/skipped/retried.
- **Workspace-scoped repositories** — todo repositório já recebe `workspaceId`. `AgentTaskRepository` segue mesmo padrão.
- **Idempotency keys** — `NotificationJob` usa `idempotencyKey` para evitar duplicatas. `AgentTask` pode reutilizar para tarefas triggered por eventos.

### Established Patterns
- **Repository pattern**: interface → Prisma impl → singleton store (`globalThis`)
- **Domain model**: factories com injeção de `now` e `createId` para testabilidade
- **Server Actions**: validam `workspaceId` + `accountId` antes de qualquer operação; nunca chamam Prisma direto
- **Cron jobs**: endpoint em `app/api/cron/{domain}/route.ts`, runtime="nodejs", auth via header
- **Workspace scoping**: todo query tem `workspaceId`; índices compostos `[workspaceId, ...]`
- **Audit trail**: toda mutation emite evento de audit. Agente deve emitir `agent.task.completed`, `agent.task.failed`, etc.

### Integration Points
- **Prisma schema** — adicionar tabela `AgentTask` com campos: `id`, `workspaceId`, `agentId`, `type`, `status`, `priority`, `payload` (JSON), `scheduledFor`, `processedAt`, `failedAt`, `errorNote`, `retryCount`, `idempotencyKey`, `createdAt`, `updatedAt`
- **Server Actions de atendimento** — após `createAppointmentAction`, `updateAppointmentAction`, `cancelAppointmentAction`, `completeAppointmentAction`, enfileirar tarefa de agente relevante
- **Notification system** — agentes de média/baixa prioridade entregam output via notificação existente (sino, dropdown)
- **Settings UI (Fase 47)** — `/settings/agentes` consome registry de agentes e configurações por workspace
- **Dashboard de pacientes** — status lights de agentes aparecem nos cards de paciente (badge discreto)

</code_context>

<specifics>
## Specific Ideas

- O nome do orquestrador no código deve ser `AgentOrchestrator` (em português na UI: "Orquestrador de Agentes")
- Cada agente é uma classe/module que implementa uma interface base (`Agent` com métodos `register()`, `executeTask()`, `getCapabilities()`)
- O orquestrador mantém um `Map<string, Agent>` de agentes registrados
- Configuração por workspace pode ser uma tabela `WorkspaceAgentConfig` com: `workspaceId`, `agentId`, `enabled` (boolean), `intensity` ("off" | "silent" | "normal"), `settings` (JSON)
- O cron `/api/cron/agents` deve processar tasks em ordem de prioridade (critical > high > medium > low), depois por `scheduledFor` (mais antigo primeiro)
- Durante processamento, tasks são marcadas como `RUNNING` com um `startedAt` para detectar stalls

</specifics>

<deferred>
## Deferred Ideas

- **Integração com Google Calendar/Outlook** (AGEND-05) — v2.1+
- **Previsão de cancelamento com ML** (AGEND-06) — v2.1+
- **Plugin system para agentes de terceiros** (ARCH-05) — v2.1+
- **Agente de Pesquisa Psicanalítica** (ARCH-06) — v2.1+
- **Agente de Documentação** (ARCH-07) — v2.1+
- **Push notifications real-time** — v2.2+, requer Supabase Realtime ou service workers

</deferred>

---

*Phase: 43-arquitetura-multi-agent-foundation*
*Context gathered: 2026-04-27*
