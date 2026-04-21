# Phase 16: Arquitetura de Notificações - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Refatorar a base do sistema de notificações: tipos TypeScript discriminados, interface de storage abstraída (localStorage agora, server-side depois), migrar inline styles para CSS classes com design tokens. Nenhuma UI nova — apenas a fundação.

</domain>

<decisions>
## Implementation Decisions

### Estrutura dos Tipos
- **D-01:** Union discriminada com campo `type` literal. Cada tipo carrega dados extras tipados via intersection. Ex: `{ type: "session_reminder"; patientId: string; patientName: string; startsAt: string }`. Isso permite type narrowing com switch/case e garante que cada tipo tem exatamente os dados necessários.
- **D-02:** Base compartilhada: `id`, `title`, `description`, `read`, `createdAt`, `type`. Campos extras são por tipo.
- **D-03:** 5 tipos: `update`, `session_reminder`, `payment_pending`, `patient_noshow`, `birthday`. Enum-like com `as const`.

### Padrão do Storage
- **D-04:** Interface simples `NotificationStorage` com métodos `load(): AppNotification[]`, `save(notifications: AppNotification[]): void`, `clear(): void`. Sem observers/subscriptions — reatividade fica no React state (hook já faz isso). Mantém a interface mínima para facilitar swap para Supabase depois.
- **D-05:** Implementação `LocalNotificationStorage` que wrapa localStorage. Mesma lógica atual de fallback em caso de quota exceeded.
- **D-06:** Storage injetado via parâmetro no Provider, não via import direto. Permite trocar implementação sem alterar componentes.

### CSS Approach
- **D-07:** Classes globais em `globals.css` com prefixo `.notif-` (ex: `.notif-bell`, `.notif-dropdown`, `.notif-item`). Consistente com o padrão predominante do projeto (não usa CSS modules). Todos os valores via design tokens existentes.
- **D-08:** Zero inline styles nos componentes refatorados. Remover todos os `React.CSSProperties` objects de `notification-bell.tsx`.

### Agent's Discretion
- Naming conventions para arquivos novos
- Organização interna dos arquivos (um arquivo vs split por tipo)
- Estratégia de export (barrel file vs direct imports)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Notification System (current)
- `src/components/ui/notification-context.tsx` — Provider atual, hook, tipos, localStorage logic
- `src/components/ui/notification-bell.tsx` — Bell component com dropdown, todos inline styles
- `src/app/(vault)/layout.tsx` — Onde NotificationBell é montado (sidebar brand header)

### Design System
- `src/app/globals.css` — Design tokens (cores, radius, shadows, spacing, z-index, font-size)

### Project Context
- `.planning/PROJECT.md` — Milestone v1.1 goals e constraints
- `.planning/REQUIREMENTS.md` — ARCH-01 a ARCH-04 requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `notification-context.tsx`: Provider pattern com localStorage — refatorar, não reescrever
- `notification-bell.tsx`: Dropdown logic (click outside, Escape) — preservar behavior
- Design tokens em `globals.css`: 50+ variáveis CSS prontas para uso

### Established Patterns
- Provider + useContext hook para state compartilhado (NotificationProvider, ToastProvider)
- Componentes em `src/components/ui/` com exports nomeados
- CSS classes com design tokens em globals.css (prefixo por domínio)
- Server Components por default, "use client" apenas quando necessário

### Integration Points
- `src/app/(vault)/layout.tsx` — Provider wraps todo o vault, bell no sidebar header
- `globals.css` — Adicionar classes `.notif-*`
- Futuramente: top bar (Phase 17) consumirá o bell refatorado

</code_context>

<specifics>
## Specific Ideas

- User quer "a melhor UX possível" — arquitetura deve ser limpa o suficiente para suportar animações e interações complexas nas fases seguintes
- Referência: Gmail/Notion para posicionamento (Phase 17) — esta fase só prepara a base
- Storage deve ser trivial de trocar por Supabase quando migrar para server-side

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-arquitetura-notificacoes*
*Context gathered: 2026-04-21*
