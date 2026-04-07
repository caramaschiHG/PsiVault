# Context — Agenda Upgrade (Fases restantes)

## Estado Atual

A agenda já possui:
- **Time Grid** funcional via `CalendarGrid` component (`calendar-grid.tsx`)
- **Posicionamento por horário** via `layoutGridBlocks()` (`grid-layout.ts`)
- **Overlap packing** com sweep line algorithm
- **Drag to reschedule** com 15-min droppable slots
- **Week view** via `WeekCalendarGrid`
- **Side panel** com quick actions, comunicação, online care
- **Empty state** profissional

## O que falta implementar

1. **Month View** — grid 7×6 com barras compactas de status
2. **Mini Calendar** — sidebar com navegação por mês + dots
3. **Quick Create** — popover ao clicar em slot vazio do grid
4. **Keyboard Shortcuts** — ←/→ navega, T=hoje, D/W/M=views, Esc=fecha
5. **Current Time Indicator** — linha vermelha na hora atual

## Arquitetura existente para reutilizar

- `CalendarGrid`: já usa `layoutGridBlocks()`, DnD, hour labels
- `AppointmentBlock`: renderização compacta com border-left colorida
- `AppointmentSidePanel`: drawer com Escape key
- `AgendaToolbar`: já tem day/week tabs + date navigation
- `page.tsx`: server component, resolve session, load data
- `grid-layout.ts`: `layoutGridBlocks()`, `toGridBlock()`, `GridBlock`, `PositionedBlock`

## Decisões

- Manter `CalendarGrid` como está — já funcional e testado visualmente
- Month view usa `WeekCalendarGrid` como referência para grid layout
- Mini calendar é componente isolado na sidebar
- Quick create reusa `createAppointmentAction` existente
- Keyboard shortcuts no `page.tsx` via client wrapper (não no server component)
- CSS vars existentes em globals.css: `--color-accent`, `--color-border`, etc.

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/app/(vault)/agenda/page.tsx` | + month view data, sidebar layout |
| `src/app/(vault)/agenda/components/agenda-toolbar.tsx` | + tab "Mês" |
| `src/lib/appointments/agenda.ts` | + `deriveMonthAgenda()` |
| `src/app/globals.css` | + CSS vars se necessário |

## Arquivos a criar

| Arquivo | Fase |
|---------|------|
| `src/app/(vault)/agenda/components/agenda-month-view.tsx` | Month View |
| `src/app/(vault)/agenda/components/mini-calendar.tsx` | Mini Calendar |
| `src/app/(vault)/agenda/components/quick-create-popover.tsx` | Quick Create |
| `src/app/(vault)/agenda/components/agenda-keyboard.ts` | Keyboard Shortcuts |
