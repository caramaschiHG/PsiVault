# FASE 14 — Calendar Visual Polish & Popover UX

## Objetivo
Transformar o calendário de "funcional mas feio" para "polished e profissional".
Score estimado: visual 6.0 → 9.0

## Problemas Críticos (visuais)
1. Font sizes microscópicos (0.55rem–0.72rem em 12+ locais)
2. Contraste --color-text-4 fail AA (2.8:1)
3. Dots 3px e barras 4px invisíveis
4. Espaçamentos inconsistent (1px, 2px, 0.22rem, 0.35rem, 0.55rem, 0.65rem)
5. Touch targets abaixo de 44px (close 24px, nav 36px)
6. Drag-over feedback quase invisível (4-6% opacidade)
7. Token --font-size-page-title inexistente
8. Emoji ⚠ no overdue alert

## Problema de UX: Popover de slot click
- Abre sempre para baixo → quando slot está no final do grid, popover empurra layout para fora da viewport
- Sem animação — aparece instantaneamente
- Sem focus trap

## Tasks (7 tasks atômicas)

### 14.1 — Font sizes mínimos (8+ arquivos)
- MiniCalendar: 0.55rem→0.6875rem, 0.7rem→0.75rem, 0.8rem→0.8125rem
- MonthView: 0.65rem→0.75rem, 0.6rem→0.75rem
- CalendarGrid: 0.7rem→0.75rem (hour labels)
- WeekGrid: 0.7rem→0.75rem (day names)
- AppointmentBlock: 0.68rem→0.6875rem
- AppointmentCard: 0.97rem→0.9375rem, 0.8rem→0.8125rem
- Agenda page: 0.72rem→0.6875rem, 0.82rem→0.8125rem, 0.78rem→0.8125rem

### 14.2 — Contraste --color-text-4
- globals.css: #a8a29e → #78716c (stone-500, 4.6:1 sobre branco)

### 14.3 — Dots e barras visíveis
- MiniCalendar dots: 3px → 5px
- MonthView bars: 4px → 8px
- MonthView more text: 0.6rem → 0.75rem

### 14.4 — Espaçamento consistente (tokens)
- Todos os 1px, 2px → var(--space-1) (4px)
- 0.22rem → var(--space-1)
- 0.35rem → var(--space-1.5)
- 0.55rem → var(--space-2)
- 0.65rem → var(--space-3)
- 3px → var(--space-1)
- 6px → var(--space-1.5)
- 4px → var(--space-1)

### 14.5 — Touch targets
- Popover close button: 24px → 44px
- Toolbar nav buttons: 36px → 44px
- Chip padding: 0.22rem→0.375rem vertical

### 14.6 — Popover smart positioning + fluid animation
- Calcular posição: se slot Y > viewport.height - 400, abrir para cima
- Animar com spring physics: scale(0.95)→1 + opacity 0→1
- duration: 200ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1)
- Focus trap no popover

### 14.7 — Drag-over visibility + missing tokens
- Drag-over: 0.04/0.06 → 0.10
- Criar --font-size-page-title: 1.5rem
- Substituir ⚠ emoji por SVG

## Gate: Build ✅ + Tests 351/351
