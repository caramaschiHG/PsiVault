---
phase: 26-agenda-upgrade
plan: 03
status: complete
completed_at: "2026-04-07"
requirements_addressed:
  - AGENDA-03
---

# Plan 26-03 Summary — Keyboard Shortcuts + Current Time + Polish

## What Was Done

Implementados keyboard shortcuts, current time indicator e session count badge.

## Changes Made

**`src/app/(vault)/agenda/components/agenda-keyboard.ts`** (NOVO)
- Hook `useKeyboardShortcuts` com shortcuts:
  - `←/→`: navega período anterior/próximo
  - `T`: volta para hoje
  - `D/W/M`: troca view (day/week/month)
  - `Escape`: fecha panels/popovers
- Ignora eventos em inputs, textareas, selects
- Cleanup no unmount
- Prop `enabled` para ativar/desativar

**`src/app/(vault)/agenda/components/agenda-keyboard-wrapper.tsx`** (NOVO)
- Client component wrapper para uso em server component page.tsx
- Conecta `useKeyboardShortcuts` com `router.push` para navegação
- Calcula offsets corretos para day/week/month

**`src/app/(vault)/agenda/components/calendar-grid.tsx`**
- Adicionado `CurrentTimeIndicator` — linha vermelha horizontal com dot na esquerda
- Atualiza a cada 60 segundos via `setInterval`
- Só renderiza se dentro do range visível do grid
- z-index 10 acima dos appointment blocks

**`src/app/(vault)/agenda/page.tsx`**
- Integrado `AgendaKeyboard` client component
- Session count badge no header: "4 sessões" ao lado do botão "Nova consulta"
- `headingActionsStyle` com badge + button agrupados
- Badge: pill style com border, background surface, texto accent

## Decisions

- Keyboard shortcuts em arquivo separado do hook (separation of concerns)
- Wrapper client necessário porque page.tsx é server component
- Current time indicator dentro do CalendarGrid (não separado) — é específico deste componente
- Badge só aparece quando sessionCount > 0
- Singular/plural: "1 sessão" vs "N sessões"

## Verification

- `pnpm tsc --noEmit`: ✓ zero erros
- `pnpm test -- --run`: ✓ 351 testes passando, zero regressões
- `pnpm build`: ✓ green
