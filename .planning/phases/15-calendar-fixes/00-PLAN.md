# FASE 15 — MiniCalendar Fix + Month View Fix

## Problemas
1. **MiniCalendar vazando** — grid de 42 dias, espaçamento, font sizes, layout
2. **Month view não funciona** — clique em "Mês" vai pro modo dia

## Tasks

### T1: MiniCalendar — Grid e layout (arquivo: mini-calendar.tsx)
- Analisar TODOS os estilos inline
- Verificar se container tem largura suficiente
- Verificar se dia cells vazam
- Verificar weekday labels
- Verificar dots de appointments
- Verificar border/padding

### T2: MiniCalendar — Sidebar sizing (arquivo: agenda/page.tsx)
- Verificar sidebarStyle width (220px)
- Verificar se mini calendar cabe em 220px
- Verificar pageLayout grid

### T3: Month View — Navegação (arquivos: agenda-toolbar, agenda/page.tsx)
- Verificar como activeView="month" é passado
- Verificar href do botão "Mês" no toolbar
- Verificar se agenda/page.tsx renderiza month view

### T4: Month View — Renderização
- Verificar AgendaMonthView componente
- Verificar se dados corretos chegam
- Verificar layout do mês

### T5: Build + Test + Commit
