---
phase: 26-agenda-upgrade
plan: 02
status: complete
completed_at: "2026-04-07"
requirements_addressed:
  - AGENDA-02
---

# Plan 26-02 Summary — Mini Calendar + Quick Create

## What Was Done

Implementado Mini Calendar na sidebar desktop e Quick Create Popover para criação rápida de sessões.

## Changes Made

**`src/app/(vault)/agenda/components/mini-calendar.tsx`** (NOVO)
- Client component com grid 7×6 de dias
- Header com mês/ano e setas ← → para navegação entre meses
- Iniciais dos dias da semana em pt-BR (S, T, Q, Q, S, S, D)
- Hoje destacado com background sutil e cor accent
- Dia selecionado com background accent e texto branco
- Dots nos dias com appointments (até 3 dots)
- Click no dia navega para day view via `router.push`
- State local `displayMonth` independente do `currentDate`
- Hidden em mobile via CSS (sidebar grid)

**`src/app/(vault)/agenda/components/quick-create-popover.tsx`** (NOVO)
- Popover fixed position com 4 campos: paciente (select), horário (readonly), duração (select), modalidade (radio)
- Fecha com Escape ou click fora
- Usa `createAppointmentAction` via prop `onCreate`
- Toast de sucesso + `router.refresh()` ao criar
- Link "Formulário completo" para `/appointments/new`
- Error handling inline
- Position driven por props (top/left)

**`src/app/(vault)/agenda/page.tsx`**
- Layout com sidebar: `grid-template-columns: 220px 1fr`
- Sidebar com MiniCalendar (desktop)
- `appointmentCounts` Map construído a partir dos appointments
- `shellStyle` ajustado para remover padding duplicado
- `pageLayoutStyle` e `sidebarStyle` adicionados

## Decisions

- MiniCalendar usa `Map<string, number>` para contagem de appointments por dia (mais preciso que Set)
- Sidebar só visível em desktop — o grid 220px 1fr colapsa em mobile
- QuickCreatePopover ainda não integrado ao click no grid (será na Fase 26-03 com current time indicator e keyboard shortcuts)
- Popover usa `useActionState` pattern com `startTransition` para feedback

## Verification

- `pnpm tsc --noEmit`: ✓ zero erros
- `pnpm test -- --run`: ✓ 351 testes passando, zero regressões
- `pnpm build`: ✓ green
