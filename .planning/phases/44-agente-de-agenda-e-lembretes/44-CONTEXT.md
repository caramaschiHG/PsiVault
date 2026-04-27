# Phase 44: Agente de Agenda & Lembretes - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Agente inteligente de agenda que opera em background para detectar padrões de faltas, sugerir otimização de horários, e gerar Resumo do Dia — tudo sem interromper sessões. Lembretes proativos para pacientes via mock/skeleton (integração real em fase futura).

Scope:
- Detecção de padrões de faltas (no-shows) com alerta periférico (status light)
- Otimização de horários com badge clicável na agenda
- Lembretes proativos para pacientes (mock sender, batch diário)
- Resumo do Dia exibido após último atendimento

Depends on Phase 43 (Agent Foundation).

</domain>

<decisions>
## Implementation Decisions

### Detecção de Padrões de Faltas
- **D-01:** Threshold de alerta: **2 no-shows seguidos** (status `NO_SHOW` consecutivos no histórico do paciente).
- **D-02:** Alerta aparece em **3 surfaces**: `PatientSummaryCards` (perfil do paciente), lista de pacientes (`/patients`), e card de atendimento na agenda (day/week/month views).
- **D-03:** Visual: **dot vermelho sólido de 8px** com tooltip ao hover explicando "2 faltas consecutivas detectadas".
- **D-04:** Auto-dismiss: alerta **desaparece automaticamente** após o próximo atendimento do paciente ser confirmado ou completado (`status` muda para `CONFIRMED` ou `COMPLETED`).
- **D-05:** Prioridade da tarefa de detecção: `high` (mapeia para badge/count na hierarquia Calm).

### Otimização de Horários
- **D-06:** Sugestão: badge **verde** indicando horários com **maior taxa de comparecimento** do paciente.
- **D-07:** Local: badge aparece **no slot vazio da agenda** quando o psicólogo está criando novo agendamento para o paciente.
- **D-08:** Interação: badge é **clicável** e **preenche o horário sugerido** no formulário de agendamento.
- **D-09:** Algoritmo: baseado **apenas no histórico do paciente específico** — não mistura dados de outros pacientes.
- **D-10:** Threshold de dados: sugestão aparece apenas após **mínimo de 5 atendimentos** no histórico do paciente.
- **D-11:** Granularidade: **dia da semana + faixa horária** (ex: "quartas 14h").
- **D-12:** Prioridade da tarefa: `medium` (mapeia para notification dropdown).

### Lembretes Proativos
- **D-13:** Entrega: **mock/skeleton primeiro** — pipeline completo com sender que apenas loga/grava no banco. Integração real com WhatsApp/SMS (Twilio ou similar) é escopo de fase futura (v2.1+).
- **D-14:** Batch: **um lembrete por paciente por dia**, agregando todos os atendimentos do dia seguinte. Ex: "Você tem 2 atendimentos amanhã: 10h e 14h".
- **D-15:** Destinatário: **apenas paciente** — psicólogo já gerencia própria agenda.
- **D-16:** Timing: enviado **noite anterior às 20h** (horário padrão, configurável por paciente).
- **D-17:** Patient model ganha 2 campos novos: `reminderPhone` (telefone para lembretes, pode ser diferente de `phone`) e `preferredReminderTime` (hora do dia para receber lembretes, default 20h).
- **D-18:** Prioridade da tarefa: `medium` (mapeia para notification dropdown).

### Resumo do Dia
- **D-19:** Gatilho: aparece quando o **último atendimento do dia é marcado como `COMPLETED`**.
- **D-20:** Formato: **notificação no dropdown do sino** de notificações. Título: "Resumo do dia — {data}".
- **D-21:** Conteúdo: **apenas output do Agenda Agent** — faltas detectadas no dia, lembretes enviados, sugestões de horário geradas.
- **D-22:** Persistência: notificação **persiste como "lida"** no histórico do sino. Remove automaticamente após **7 dias**.
- **D-23:** Dias vazios: **não aparece** se não houver pelo menos 1 atendimento no dia.
- **D-24:** Audiência: **apenas o psicólogo** (`accountId` que criou os atendimentos), não todos os membros do workspace.
- **D-25:** Prioridade da tarefa: `low` (mapeia para daily digest).

### Agent's Discretion
- Estratégia exata de cálculo da taxa de comparecimento (ex: janela de 90 dias, peso por recência)
- Formato exato da mensagem de lembrete mock (template string)
- CSS exato do dot vermelho (8px, cor, posicionamento)
- Estrutura do payload JSON para cada tipo de tarefa do Agenda Agent
- Lógica exata para detectar "último atendimento do dia" (comparação de `startsAt` no mesmo dia)
- Estratégia de persistência do Resumo do Dia no notification storage (novo tipo ou reuse)
- Schema migration para campos `reminderPhone` e `preferredReminderTime` no Patient

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition & requirements
- `.planning/ROADMAP.md` §Phase 44 — Goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` §AGEND-01 a AGEND-04 — Requisitos do agente de agenda
- `.planning/PROJECT.md` §Current Milestone v2.0 — Vision, constraints, Calm UX principles

### Prior phase context (decisions locked)
- `.planning/phases/43-arquitetura-multi-agent-foundation/43-CONTEXT.md` — Agent foundation decisions (D-01 a D-16)

### Agent foundation (built in Phase 43)
- `src/lib/agents/model.ts` — `AgentTask`, `Agent` interface, `AgentTaskPriority`
- `src/lib/agents/registry.ts` — `AgentRegistry`, dynamic registration
- `src/lib/agents/orchestrator.ts` — `AgentOrchestrator`, `enqueueTask`, workspace config
- `src/lib/agents/processor.ts` — `processAgentTasks`, retry, stall detection
- `src/lib/agents/repository.ts` — `AgentTaskRepository`, `WorkspaceAgentConfigRepository`
- `src/lib/agents/config-model.ts` — `WorkspaceAgentConfig`, `AgentIntensity`
- `src/lib/agents/store.ts` — Singleton stores
- `src/app/api/cron/agents/route.ts` — Cron endpoint

### Appointment domain
- `src/lib/appointments/model.ts` — `Appointment`, `AppointmentStatus`, `NO_SHOW`
- `src/lib/appointments/repository.ts` — `AppointmentRepository`, `listByPatient`, `listByDateRange`
- `src/lib/appointments/repository.prisma.ts` — Prisma implementation

### Patient domain
- `src/lib/patients/model.ts` — `Patient`, `CreatePatientInput`, `updatePatient`
- `src/lib/patients/repository.ts` — `PatientRepository`

### UI surfaces for status light
- `src/app/(vault)/patients/components/patient-summary-cards.tsx` — `PatientSummaryCards`
- `src/app/(vault)/patients/page.tsx` — Patient list
- `src/app/(vault)/agenda/components/agenda-day-view.tsx` — Day view cards
- `src/app/(vault)/agenda/components/agenda-week-view.tsx` — Week view cards
- `src/app/(vault)/agenda/components/agenda-month-view.tsx` — Month view cards

### Notification system
- `src/lib/notifications/types.ts` — `AppNotification`, `NotificationType`
- `src/lib/notifications/storage.ts` — `LocalNotificationStorage`

### Patterns & conventions
- `CLAUDE.md` — Vocabulary rules, visual anti-patterns, motion tokens, Calm UX

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`AgentOrchestrator` + `AgentRegistry`** — foundation completa. Agenda Agent se registra em runtime via `registerAgent()`.
- **`AgentTaskRepository`** — `listPendingByPriority` já retorna tasks ordenadas por prioridade + scheduledFor. Reuse para cron.
- **`AppointmentRepository.listByPatient`** — histórico completo de atendimentos por paciente, necessário para cálculo de padrões e sugestões.
- **`PatientSummaryCards`** — surface ideal para status light de alerta de faltas.
- **Notification system** — `AppNotification` union type pode ser extendido com novo tipo `agent_summary` para Resumo do Dia.
- **Cron auth pattern** — `/api/cron/agents/route.ts` já implementa auth via `CRON_SECRET`.

### Established Patterns
- **Repository pattern**: interface → Prisma impl → singleton store (`globalThis`)
- **Domain model**: factories com injeção de `now` e `createId`
- **Server Actions**: validam `workspaceId` + `accountId`; nunca chamam Prisma direto
- **Workspace scoping**: todo query tem `workspaceId`; índices compostos `[workspaceId, ...]`
- **Audit trail**: toda mutation emite evento. Agenda Agent deve emitir `agent.task.completed`, `agent.task.failed`.
- **Patient model updates**: `updatePatient` factory já suporta campos parciais — fácil adicionar `reminderPhone` e `preferredReminderTime`.

### Integration Points
- **Prisma schema** — adicionar `reminderPhone` e `preferredReminderTime` ao `Patient` model
- **Appointment mutations** — `completeAppointmentAction`, `noShowAppointmentAction`, `cancelAppointmentAction` devem enfileirar tasks do Agenda Agent via `AgentOrchestrator.enqueueTask()`
- **Agenda views** — day/week/month view cards precisam receber prop opcional com alerta de faltas do paciente
- **Patient list** — `listActive` precisa hidratar dados de alerta de faltas (pode ser feito em query separada ou join)
- **Notification dropdown** — novo tipo de notificação `agent_summary` para Resumo do Dia
- **Settings (Fase 47)** — `/settings/agentes` controla `enabled`/`intensity` do Agenda Agent por workspace

</code_context>

<specifics>
## Specific Ideas

- O dot vermelho de alerta de faltas deve ser posicionado no canto superior direito do `PatientSummaryCards`, próximo ao nome do paciente, sem quebrar o layout grid existente
- O tooltip do dot deve usar o padrão de tooltip do sistema (provavelmente `title` nativo ou componente tooltip existente) — verificar se há tooltip component em `src/components/ui/`
- Badge de otimização na agenda: usar cor `var(--color-green-mid)` ou token verde do DESIGN.md, nunca hex cru
- O mock sender de lembretes deve ser uma interface `ReminderSender` com implementação `MockReminderSender` (loga no console) e futura `TwilioReminderSender`
- O Resumo do Dia deve ser gerado como notificação do tipo `agent_summary` com `source: "agenda-agent"` para permitir filtragem futura
- O cálculo de "último atendimento do dia" deve considerar o timezone do workspace (ou UTC) — usar `startsAt` e comparar por data local
- Para o algoritmo de sugestão de horários: agrupar atendimentos por `(dia da semana, hora)` e calcular taxa de `COMPLETED / (COMPLETED + NO_SHOW + CANCELED)` — slots com 100% de comparecimento são candidatos

</specifics>

<deferred>
## Deferred Ideas

- **Integração real WhatsApp/SMS** (Twilio, etc.) — v2.1+, quando mock estiver validado
- **Integração Google Calendar/Outlook** (AGEND-05) — v2.1+
- **Previsão de cancelamento com ML** (AGEND-06) — v2.1+
- **Resumo do Dia com output de outros agentes** — quando Calm UX Agent e Monitoramento Agent existirem
- **Plugin system para agentes de terceiros** (ARCH-05) — v2.1+
- **Push notifications real-time** — v2.2+, requer Supabase Realtime ou service workers
- **Lembretes para psicólogo** — pode ser adicionado futuramente como opção configurável

</deferred>

---

*Phase: 44-agente-de-agenda-e-lembretes*
*Context gathered: 2026-04-27*
