---
phase: 26-agenda-upgrade
plan: 01
status: complete
completed_at: "2026-04-07"
requirements_addressed:
  - AGENDA-01
---

# Plan 26-01 Summary — Month View

## What Was Done

Implementada Month View completa na agenda — grid mensal com barras compactas de status por appointment.

## Changes Made

**`src/lib/appointments/agenda.ts`**
- Adicionados tipos `MonthDaySlot` e `MonthAgendaResult`
- Implementada `deriveMonthAgenda()` — função pura que gera grid de 35 ou 42 dias (5-6 semanas), sempre começando na segunda-feira
- Dias fora do mês marcados com `isCurrentMonth: false`
- Reutiliza `deriveDayAgenda()` e `getLocalDateParts()` existentes

**`src/app/(vault)/agenda/components/agenda-month-view.tsx`** (NOVO)
- Grid 7 colunas × 5-6 linhas
- Header com dias da semana em pt-BR (Seg–Dom)
- Barras compactas coloridas por status (SCHEDULED, CONFIRMED, COMPLETED, CANCELED, NO_SHOW)
- Até 3 barras por dia + "+N mais" se exceder
- Dias adjacentes com opacidade 0.35
- Hover sutil nas células
- Click no número do dia: `onDayClick` callback
- Click na barra: `onAppointmentClick` callback

**`src/app/(vault)/agenda/components/agenda-toolbar.tsx`**
- `AgendaView` type expandido: `"day" | "week" | "month"`
- Adicionada prop `monthViewHref`
- Terceira tab "Mês" no view switcher

**`src/app/(vault)/agenda/page.tsx`**
- Import de `AgendaMonthView` e `deriveMonthAgenda`
- `monthStart` e `monthResult` calculados
- `prevDate/nextDate` agora consideram month view (±30 dias)
- `periodLabel` suporta month view via `formatMonthLabel`
- Branch ternário expandido: day → week → month
- Funções auxiliares: `getMonthStart()`, `formatMonthLabel()`

## Decisions

- Grid sempre começa na segunda-feira (ISO 8601)
- 35 ou 42 dias dependendo de quantas semanas são necessárias para cobrir o mês
- Barras de status usam cores das CSS vars existentes (`--color-brown-mid`, `--color-sage`, etc.)
- `onDayClick` e `onAppointmentClick` são callbacks vazios por enquanto — serão implementados nas fases 26-02/03 com mini-calendar e side panel integration
- Não foi removido nenhum código existente — apenas adicionado

## Verification

- `pnpm tsc --noEmit`: ✓ zero erros (excluindo erros pré-existentes em testes)
- `pnpm test -- --run`: ✓ 351 testes passando (27 files), zero regressões
- `pnpm build`: ✓ green
