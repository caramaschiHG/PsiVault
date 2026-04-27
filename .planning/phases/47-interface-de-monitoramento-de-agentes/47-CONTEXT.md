# Phase 47: Interface de Monitoramento de Agentes - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Dashboard em `/settings/agentes` para controle de agentes inteligentes. O usuário vê lista de agentes registrados com status visual (online/offline/paused), controla intensidade de cada agente (desligado/silencioso/normal), visualiza logs recentes de execução, e as configurações persistem por workspace.

Escopo fixo (ROADMAP.md):
- Lista de agentes com status (online/offline/paused)
- Controle de intensidade por agente (desligado/silencioso/normal)
- Logs recentes visíveis por agente
- Configurações persistem por workspace

Depends on: Phase 43 (Arquitetura Multi-Agent Foundation)
Requirements: ARCH-04

</domain>

<decisions>
## Implementation Decisions

### Mapeamento de status online/offline/paused
- **D-01:** Status visual é derivado **exclusivamente da configuração do workspace** (`WorkspaceAgentConfig`), não da atividade real de tarefas.
- **D-02:** `online` = `enabled=true` **E** `intensity="normal"`. Agente está ativo e operando com output completo.
- **D-03:** `paused` = `enabled=true` **E** `intensity="silent"`. Agente está ativo mas suprime outputs visíveis (entrega apenas via Resumo do Dia).
- **D-04:** `offline` = `enabled=false` **OU** `intensity="off"`. Agente está completamente desativado para o workspace.
- **D-05:** Se o agente não estiver registrado no `AgentRegistry` (runtime), também é considerado `offline`.

### the agent's Discretion
- Visualização de logs recentes: formato, quantidade de entradas, campos exibidos
- Controle de intensidade: padrão de interação (segmented control, toggle, etc.), salvamento automático vs botão explícito
- Estado vazio e onboarding: mensagem quando nenhum agente está habilitado
- Layout exato da lista de agentes (cards, linhas, tabela)
- Indicador secundário de tarefa em execução (RUNNING) além do status base
- Cores e ícones para cada status (online/offline/paused)
- Responsividade mobile da tela de agentes

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition & requirements
- `.planning/ROADMAP.md` §Phase 47 — Goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` §ARCH-04 — Requisitos de interface de monitoramento
- `.planning/PROJECT.md` §Current Milestone v2.0 — Vision, constraints, Calm UX principles

### Prior phase context (decisions locked)
- `.planning/phases/43-arquitetura-multi-agent-foundation/43-CONTEXT.md` — Agent foundation decisions (D-01 a D-16), incluindo opt-in por default e mapeamento de intensidade
- `.planning/phases/44-agente-de-agenda-e-lembretes/44-CONTEXT.md` — Agenda Agent decisions, status light patterns

### Agent architecture (built in Phase 43)
- `src/lib/agents/model.ts` — `AgentTask`, `Agent` interface, `AgentTaskPriority`, `AgentTaskStatus`
- `src/lib/agents/config-model.ts` — `WorkspaceAgentConfig`, `AgentIntensity`
- `src/lib/agents/registry.ts` — `AgentRegistry`, dynamic registration
- `src/lib/agents/orchestrator.ts` — `AgentOrchestrator`, `getConfig`, `listConfigs`
- `src/lib/agents/processor.ts` — `processAgentTasks`, retry, stall detection
- `src/lib/agents/repository.ts` — `AgentTaskRepository`, `WorkspaceAgentConfigRepository`
- `src/lib/agents/build-registry.ts` — `buildAgentRegistry()`, production registry setup
- `src/lib/agents/store.ts` — Singleton stores

### Database schema
- `prisma/schema.prisma` §`AgentTask` (linhas 477-500) — Campos: id, workspaceId, agentId, type, status, priority, payload, scheduledFor, processedAt, failedAt, errorNote, retryCount, idempotencyKey, createdAt, updatedAt
- `prisma/schema.prisma` §`WorkspaceAgentConfig` (linhas 502-517) — Campos: id, workspaceId, agentId, enabled, intensity, settings, createdAt, updatedAt

### Settings UI patterns
- `src/app/(vault)/settings/layout.tsx` — SettingsLayout com SettingsNav
- `src/app/(vault)/settings/components/settings-nav.tsx` — Tabs de navegação de configurações (Perfil, Segurança, Notificações, Dados e Privacidade, Aparência)
- `src/app/(vault)/settings/aparencia/page.tsx` — Exemplo de página de configuração com toggle de tema

### Design system
- `DESIGN.md` — Sistema visual completo, tokens de cor, tipografia, espaçamento
- `src/styles/motion.css` — Tokens de animação, prefers-reduced-motion
- `CLAUDE.md` — Regras de vocabulário, anti-padrões visuais, direção de marca, motion tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`AgentRegistry`** — `list()` retorna todos os agentes registrados. Usar para renderizar lista de agentes disponíveis.
- **`AgentOrchestrator.listConfigs(workspaceId)`** — retorna configs existentes do workspace. Cruzar com `registry.list()` para mostrar todos os agentes (mesmo os sem config ainda).
- **`AgentOrchestrator.ensureDefaultConfig()`** — cria config default (disabled) se não existir. Útil para inicializar configs quando o usuário visita a página pela primeira vez.
- **`AgentTaskRepository.listByWorkspace()`** — retorna tasks do workspace ordenadas por createdAt desc. Usar para filtrar logs por agente.
- **`SettingsNav`** — Adicionar novo tab "Agentes" em `tabs` array.
- **`WorkspaceAgentConfigRepository`** — `save()` para persistir mudanças de intensidade/habilitação.

### Established Patterns
- **Repository pattern**: interface → Prisma impl → singleton store (`globalThis`). `WorkspaceAgentConfigRepository` já existe.
- **Server Actions**: validam `workspaceId` + `accountId` antes de qualquer operação; nunca chamam Prisma direto.
- **Settings pages**: rota em `src/app/(vault)/settings/{nome}/page.tsx`, layout compartilhado em `settings/layout.tsx`.
- **Workspace scoping**: todo query tem `workspaceId`; índices compostos `[workspaceId, ...]`.
- **CSS tokens**: referenciar `var(--color-*)`, `var(--radius-*)`, `var(--font-size-*)` do DESIGN.md. Nunca hex cru.
- **Inline styles com `satisfies React.CSSProperties`**: padrão do app para componentes.

### Integration Points
- **`SettingsNav`** — Adicionar tab `{ href: "/settings/agentes", label: "Agentes" }`.
- **Nova rota**: `src/app/(vault)/settings/agentes/page.tsx` — Server Component que carrega registry + configs do workspace.
- **Server Actions em `/settings/agentes/actions.ts`** — `updateAgentConfigAction(workspaceId, agentId, enabled, intensity, settings)` para salvar mudanças.
- **`AgentTaskRepository.listByWorkspace(workspaceId, limit)`** — Buscar tasks recentes para exibição de logs por agente. Filtrar por `agentId` no cliente ou adicionar método `listByWorkspaceAndAgent` no repository.
- **Prisma schema** — já possui `AgentTask` e `WorkspaceAgentConfig` com índices apropriados. Não requer novas tabelas para esta fase.

</code_context>

<specifics>
## Specific Ideas

- O tab "Agentes" deve aparecer na navegação de configurações ao lado de "Aparência"
- Cada agente na lista deve mostrar: nome, descrição curta, versão, status (online/offline/paused), controle de intensidade
- Logs recentes podem ser um drawer/accordion expansível por agente, não uma tela separada
- O status `online` pode usar um indicador verde sutil (dot de 8px), `paused` amarelo, `offline` cinza — seguindo o padrão de status light da Fase 44
- Como todos os agentes começam desabilitados (opt-in), a tela deve ser útil mesmo com 1 agente (Agenda Agent)

</specifics>

<deferred>
## Deferred Ideas

- Indicador de tarefa em execução no momento (RUNNING) — pode ser adicionado como indicador secundário no status, mas não é obrigatório para o sucesso da fase
- Controle global de intensidade que afeta todos os agentes de uma vez — nova capacidade, fora do escopo
- Ordenação/filtro de logs por status, data, ou tipo de tarefa — fora do escopo mínimo
- Notificações push quando agente muda de status — v2.2+
- Plugin system para agentes de terceiros (ARCH-05) — v2.1+

</deferred>

---

*Phase: 47-interface-de-monitoramento-de-agentes*
*Context gathered: 2026-04-27*
