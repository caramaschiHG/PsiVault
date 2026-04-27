# Phase 46: Calm UX — Tema & Hierarquia de Notificações - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar light mode como tema padrão com toggle manual (sem dependência do OS), documentar e implementar hierarquia de interrupção (status light > badge > dropdown > modal) com bloqueio de modais durante sessão em andamento, e garantir WCAG 2.1 AA em ambos os temas.

Escopo fixo (ROADMAP.md):
- Light mode como default; dark mode disponível como toggle manual
- Toggle manual entre light/dark sem dependência do OS
- Nenhum popup/modal durante sessão marcada como "em andamento"
- Hover states e placeholders passam em WCAG 2.1 AA em ambos os temas

Depends on: Phase 45 (Focus Mode)
Requirements: CALM-03, CALM-04, CALM-05

</domain>

<decisions>
## Implementation Decisions

### Comportamento do tema padrão
- **D-01:** Manter opção **"Sistema" como terceira opção**, mas mudar o **default de "system" para "light"**. Novos usuários começam em light mode.
- **D-02:** Toggle rápido (botão de switch) **só alterna entre light/dark**, ignorando "system". Se o usuário está em "system" e clica no toggle, fixa no modo oposto ao OS.
- **D-03:** Página `/settings/aparencia` continua mostrando as **3 opções** (Claro, Escuro, Sistema), mas "Claro" vem selecionado por padrão para novos usuários.
- **D-04:** `DarkModeNotification` (toast sobre modo escuro disponível) **deve ser removido** — dark mode já é uma feature madura e conhecida.

### Definição de "sessão em andamento"
- **D-05:** Sessão em andamento é detectada **por horário**: se o horário atual está entre `startsAt` e `endsAt` de um atendimento com status **CONFIRMED**.
- **D-06:** Aplicar **margem de tolerância de ±5 minutos**: considera sessão ativa de `startsAt - 5min` até `endsAt + 5min`. Cobre atrasos leves do paciente e tempo de despedida.
- **D-07:** Não adicionar status `IN_PROGRESS` ao modelo de atendimento nesta fase. A detecção é puramente temporal.

### Mecanismo de bloqueio de interrupções
- **D-08:** Durante sessão em andamento, **só modais/popups são bloqueados**. Dropdowns de notificações (sino), badges e status lights continuam funcionando normalmente.
- **D-09:** Modais que tentam aparecer durante sessão vão para uma **fila e são exibidos automaticamente após o término da sessão** (quando o horário + margem expira).
- **D-10:** A hierarquia de interrupção (Phase 43) é respeitada: durante sessão, o sistema pode entregar outputs até o nível "dropdown" (notificações no sino), mas **nunca modal**.

### Escopo da auditoria WCAG
- **D-11:** Auditoria WCAG 2.1 AA cobre **todo o app** (não só componentes afetados por esta fase).
- **D-12:** Método **automatizado com axe-core** executado em ambos os temas (light e dark).
- **D-13:** Prioridade aos elementos mencionados em CALM-05: **hover states, placeholders e elementos desabilitados**. axe-core deve rodar em ambos os temas alternando `data-theme`.

### Claude's Discretion
- Estratégia de migração de usuários existentes com `"system"` salvo no localStorage (manter valor ou resetar para `"light"`)
- Implementação exata do mecanismo de fila de modais bloqueados (SessionBlockerContext, array de modais pendentes, disparo automático pós-sessão)
- Como integrar axe-core no projeto (script de teste, teste E2E com Playwright, ou checklist de build)
- Detalhes de como forçar tema dark durante execução dos testes axe (alternar `data-theme` antes de cada suite)
- Se a detecção de sessão em andamento deve ser feita no cliente (comparando horário local) ou no servidor (timezone-aware)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition & requirements
- `.planning/ROADMAP.md` §Phase 46 — Goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` §CALM-03, CALM-04, CALM-05 — Requisitos de Calm UX
- `.planning/PROJECT.md` §Current Milestone v2.0 — Vision, constraints, Calm UX principles
- `.planning/PROJECT.md` §Key Decisions — Light mode default, agentes nunca interrompem sessão

### Prior phase context
- `.planning/phases/45-calm-ux-modo-foco-tipografia/45-CONTEXT.md` — Focus mode, data-focus-mode attribute, VaultLayout
- `.planning/phases/43-arquitetura-multi-agent-foundation/43-CONTEXT.md` — Hierarquia de interrupção, prioridade de agentes, regra de ouro Calm

### Theme system
- `src/components/ui/theme-provider.tsx` — ThemeProvider com light/dark/system
- `src/components/ui/theme-toggle.tsx` — Toggle switch light/dark
- `src/app/(vault)/settings/aparencia/page.tsx` — Página de configuração de tema
- `src/app/components/dark-mode-notification.tsx` — Toast sobre dark mode (a ser removido)
- `src/app/globals.css` — Variáveis CSS, tema dark via `html[data-theme="dark"]`

### Notifications
- `src/components/ui/notification-context.tsx` — NotificationProvider, addNotification, client-side only
- `src/lib/notifications/` — Models, repository, queue de notificações

### Appointments
- `src/lib/appointments/model.ts` — AppointmentStatus, Appointment interface
- `src/lib/appointments/repository.ts` — Repository interface
- `src/lib/appointments/repository.prisma.ts` — Implementação Prisma

### Design system
- `DESIGN.md` — Sistema visual completo, tokens de cor, tipografia
- `src/styles/motion.css` — Tokens de animação, prefers-reduced-motion
- `CLAUDE.md` — Regras de vocabulário, anti-padrões visuais, direção de marca

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`ThemeProvider`** — Já gerencia light/dark/system com localStorage. Precisa de ajuste de default para "light".
- **`ThemeToggle`** — Toggle visual entre light/dark. Funciona bem, comportamento de toggle pode precisar de ajuste para ignorar "system".
- **`NotificationContext`** — Sistema de notificações client-side. Precisa de extensão para suportar bloqueio de modais durante sessão.
- **`VaultLayout`** — Layout principal. Pode receber classe/atributo indicando sessão ativa.
- **`AppointmentRepository`** — Já tem queries por workspace e range de data. Pode ser usado para buscar atendimentos do dia.

### Established Patterns
- **CSS tema via `data-theme`**: `html[data-theme="dark"]` já funciona. Variáveis CSS sobrescritas em dark mode.
- **localStorage para preferências**: `psivault-theme` key já existe. Migração deve respeitar dados existentes.
- **Client-side contexts**: ThemeProvider, NotificationProvider, FocusModeProvider — todos são client components com Context API.
- **Motion tokens**: `--duration-200`, `--ease-out` — usar para transições de tema.
- **prefers-reduced-motion**: `motion.css` já cobre. Transições de tema devem respeitar.

### Integration Points
- **`ThemeProvider`** — Mudar default inicial de `"system"` para `"light"`. Ajustar `getStoredTheme` para fallback.
- **`/settings/aparencia`** — Manter 3 opções, mas pre-selecionar "Claro".
- **`NotificationContext`** — Adicionar lógica de bloqueio de modais quando sessão ativa detectada.
- **`VaultLayout` ou novo `SessionActiveProvider`** — Detectar sessão ativa por horário e expor via context.
- **Agenda/Pages de atendimento** — Consumir `SessionActiveContext` para ajustar comportamento se necessário.
- **`DarkModeNotification`** — Remover componente e sua importação em `layout.tsx`.
- **Testes axe-core** — Adicionar como script de teste ou integrar em testes E2E existentes.

</code_context>

<specifics>
## Specific Ideas

- A transição entre temas deve usar `transition` suave nas propriedades de cor (como já existe em `globals.css` linha 2108+). O default para light não deve ser abrupto.
- A detecção de sessão ativa pode ser feita no cliente comparando `new Date()` com os horários dos atendimentos carregados na agenda do dia. Não precisa de query extra se a agenda já carrega os dados.
- O mecanismo de fila de modais bloqueados pode ser um array simples no `NotificationContext`: `blockedModals: CreateNotificationInput[]`. Quando a sessão termina, iterar e chamar `addNotification` para cada um.
- Para rodar axe em ambos os temas, pode-se criar um helper de teste que: (1) seta `data-theme="light"`, roda axe, (2) seta `data-theme="dark"`, roda axe, (3) reporta violações combinadas.

</specifics>

<deferred>
## Deferred Ideas

- **Status `IN_PROGRESS` para atendimentos** — seria mais preciso que detecção por horário, mas requer mudança no domain model e UI da agenda. Fora do escopo desta fase.
- **Botão "Iniciar sessão" explícito** — melhor UX que detecção automática, mas requer novo hábito do usuário e UI na agenda. Pode ser revisitado em fase futura.
- **Plugin de axe-core no CI** — rodar auditoria em cada build. Requer configuração de pipeline, pode ser feito em Phase 49 (Integration & Polish).
- **Notificações server-side persistentes** — atualmente é client-side apenas. Migrar para backend é fase futura (v2.2+).

</deferred>

---

*Phase: 46-calm-ux-tema-hierarquia-notificacoes*
*Context gathered: 2026-04-27*
