# Plano: Agenda Profissional — Estilo Google Calendar

## Contexto

A agenda atual do PsiLock exibe appointments como uma lista simples de cards empilhados (day view) ou distribuídos em 7 colunas (week view), sem nenhum grid temporal. Não há posicionamento por horário, visualização mensal, click-to-create, painel de detalhes, nem mini-calendário. Para um psicólogo que gerencia 5-8 sessões/dia, essa UX é insuficiente — ele precisa ver blocos de tempo, gaps entre sessões, e criar agendamentos rapidamente.

O objetivo é transformar a agenda numa experiência profissional inspirada no Google Calendar, mantendo a arquitetura existente (repository pattern, server components, inline styles, CSS vars).

---

## Fase 1 — Time Grid Engine + Views Reescritas (núcleo)

### 1.1 Função pura de layout: `timeGridLayout()`

**Novo arquivo**: `src/lib/appointments/time-grid.ts`

```ts
interface TimeGridConfig {
  dayStartHour: number;   // 7
  dayEndHour: number;     // 22
  slotHeightPx: number;   // 60 (1h = 60px)
}

interface PositionedCard {
  card: SerializedAgendaCard;
  topPx: number;
  heightPx: number;
  column: number;        // 0-based, para overlaps
  totalColumns: number;  // colunas paralelas no grupo
}
```

- `topPx = ((minutesFromDayStart) / 60) * slotHeightPx`
- `heightPx = (durationMinutes / 60) * slotHeightPx` — mínimo 20px
- **Overlap packing**: agrupar cards que se sobrepõem temporalmente, distribuir em colunas lado a lado. Cada card recebe `left: (col / totalCols) * 100%`, `width: (1 / totalCols) * 100%`
- Função pura, testável isoladamente, sem dependências externas

### 1.2 Tipo serializado na fronteira server/client

**Modificar**: `src/lib/appointments/agenda.ts`

```ts
export interface SerializedAgendaCard extends Omit<AgendaCard, 'startsAt' | 'endsAt'> {
  startsAt: string; // ISO
  endsAt: string;   // ISO
}

export function serializeAgendaCard(card: AgendaCard): SerializedAgendaCard { ... }
```

### 1.3 Componente `TimeGrid` (client component)

**Novo arquivo**: `src/app/(vault)/agenda/components/time-grid.tsx`

- `"use client"` — scroll automático para hora atual, click handlers, current time indicator
- Props: `cards: SerializedAgendaCard[]`, `date: string`, `patientNames`, `config`, `onSlotClick`, `onCardClick`
- Renderiza:
  - Container `position: relative`, altura total = `(endHour - startHour) * slotHeightPx`
  - **Hour labels** na coluna esquerda (3.5rem de largura)
  - **Hour lines** horizontais a cada hora (solid) e meia-hora (dashed)
  - **Current time indicator**: linha vermelha horizontal, atualizada a cada 60s via `useEffect`
  - **Appointment blocks**: divs `position: absolute` com top/height/left/width calculados por `timeGridLayout()`
  - **Click on empty area**: resolve horário clicado arredondando para 15min

### 1.4 Componente `TimeGridBlock`

**Novo arquivo**: `src/app/(vault)/agenda/components/time-grid-block.tsx`

- Versão compacta do AppointmentCard, otimizada para o grid
- Status indicado por **borda esquerda colorida** (4px solid) — não chip
- height >= 48px: horário + nome do paciente + care mode icon
- height < 48px: horário + nome truncado (single line)
- `cursor: pointer`, onClick → `onCardClick(card)`

### 1.5 Reescrever `AgendaDayView`

**Modificar**: `src/app/(vault)/agenda/components/agenda-day-view.tsx`

- Substituir lista de cards por `<TimeGrid>` de coluna única
- Adicionar contagem no topo: "4 sessões hoje"
- Manter empty state existente

### 1.6 Reescrever `AgendaWeekView`

**Modificar**: `src/app/(vault)/agenda/components/agenda-week-view.tsx`

- Header com nomes dos dias (Seg–Dom) + números
- Abaixo: 7 `<TimeGrid>` lado a lado compartilhando hour labels (renderizar labels só na 1ª coluna)
- Layout: `grid-template-columns: 3.5rem repeat(7, 1fr)`
- Scroll horizontal em mobile

### 1.7 CSS vars novas

**Modificar**: `src/app/globals.css`

```css
/* Time Grid */
--grid-slot-height: 60px;
--grid-hour-line: rgba(146, 64, 14, 0.08);
--grid-half-hour-line: rgba(146, 64, 14, 0.04);
--grid-current-time: #dc2626;
--grid-non-working-bg: rgba(0, 0, 0, 0.02);
--grid-time-label-width: 3.5rem;
```

### 1.8 Simplificar `page.tsx`

**Modificar**: `src/app/(vault)/agenda/page.tsx`

- Remover o bloco enorme de `nextSessionActions` (linhas 140–291) — essas ações migram para o detail panel (Fase 2)
- Serializar AgendaCards na fronteira server→client
- Page continua como Server Component, passa dados serializados para componentes client
- Manter toolbar, heading, FAB

---

## Fase 2 — Painel de Detalhes + Quick Actions

### 2.1 `AgendaShell` (client component wrapper)

**Novo arquivo**: `src/app/(vault)/agenda/components/agenda-shell.tsx`

- Gerencia o state interativo com `useReducer`:
  - `selectedCardId: string | null`
  - `quickCreateSlot: { dateISO: string; hour: number } | null`
- Recebe dados serializados da page.tsx
- Renderiza: view ativa + detail panel condicional + quick create condicional
- Prop-drilling para os filhos, sem Context necessário

### 2.2 `AppointmentDetailPanel`

**Novo arquivo**: `src/app/(vault)/agenda/components/appointment-detail-panel.tsx`

- **Desktop**: slide-in lateral (width: 380px, position: fixed, right: 0)
- **Mobile**: bottom sheet (via media query)
- Conteúdo:
  - Nome do paciente, horário, duração, care mode
  - Status badge colorido
  - **Quick actions** como forms com Server Actions:
    - Confirmar (SCHEDULED → CONFIRMED)
    - Concluir (→ COMPLETED)
    - Cancelar (→ CANCELED)
    - Não compareceu (→ NO_SHOW)
  - Link para evolução clínica
  - "Agendar próxima sessão" (COMPLETED)
  - Link da sessão online
  - Comunicação (WhatsApp/Email)
  - Botão fechar / Escape

### 2.3 Nova Server Action: `quickStatusChangeAction`

**Modificar**: `src/app/(vault)/appointments/actions.ts`

```ts
export async function quickStatusChangeAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult>
```

- Aceita `appointmentId` + `action` (confirm | complete | cancel | noShow)
- Reutiliza lógica existente (confirmAppointment, completeAppointment, etc.)
- Faz `revalidatePath("/agenda")` sem redirect
- Retorna ActionResult para feedback no panel

### 2.4 Dados extras para o panel

Na page.tsx, além dos cards serializados, passar:
- `appointmentDetails`: mapa `appointmentId → { meetingLink, careMode, seriesId, hasNote, priceInCents }` (dados necessários para o panel, sem clinical content)
- Comunicação: templates já construídos no server (URLs WhatsApp/Email)

---

## Fase 3 — Quick Create + Mini Calendar

### 3.1 `QuickCreatePopover`

**Novo arquivo**: `src/app/(vault)/agenda/components/quick-create-popover.tsx`

- Popover posicionado próximo ao slot clicado
- Campos mínimos: patient select (combobox), horário (pre-filled), duração, care mode
- Botão "Agendar" → `createAppointmentAction`
- Link "Formulário completo" → `/appointments/new?startsAt=...`
- `useActionState` para feedback

### 3.2 `MiniCalendar`

**Novo arquivo**: `src/app/(vault)/agenda/components/mini-calendar.tsx`

- Grid 7×6 de dias do mês
- Header: mês/ano com setas ← →
- Dots nos dias com appointments
- Hoje destacado com círculo accent
- Click num dia → navega via `router.push`
- Props: `currentDate`, `appointmentDates: Set<string>`

### 3.3 Layout com sidebar

**Modificar**: `src/app/(vault)/agenda/page.tsx`

- Desktop: `grid-template-columns: 240px 1fr` — sidebar com mini-calendar
- Mobile: mini-calendar hidden ou como dropdown no toolbar

### 3.4 Dados para mini-calendar

Na page.tsx, query extra para o mês inteiro (só startsAt) → set de datas ISO com appointments.

---

## Fase 4 — Month View

### 4.1 `deriveMonthAgenda()`

**Modificar**: `src/lib/appointments/agenda.ts`

```ts
interface MonthDaySlot {
  date: Date;
  cards: AgendaCard[];
  isCurrentMonth: boolean;
}
interface MonthAgendaResult {
  year: number;
  month: number;
  days: MonthDaySlot[]; // 35 ou 42 (preenchendo semanas)
}
```

### 4.2 `AgendaMonthView`

**Novo arquivo**: `src/app/(vault)/agenda/components/agenda-month-view.tsx`

- Grid 7 colunas × 5-6 linhas
- Cada célula: número do dia + até 3 barras compactas (cor do status + nome truncado) + "+N mais"
- Click na barra → abre detail panel
- Click no dia → navega para day view
- Dias fora do mês com opacidade reduzida

### 4.3 Toolbar: terceira tab "Mês"

**Modificar**: `src/app/(vault)/agenda/components/agenda-toolbar.tsx`

- Adicionar tab "Mês" no view switcher
- `activeView` aceita `day | week | month`

---

## Fase 5 — Polish e UX

### 5.1 Keyboard shortcuts

No `AgendaShell`:
- `←/→`: dia anterior/próximo
- `T`: hoje
- `D/W/M`: views
- `Escape`: fecha panel/popover
- `N`: quick create para agora

### 5.2 Working hours dimming

- Horas fora do expediente: `background: var(--grid-non-working-bg)`
- Configuração vem do practice profile (se houver)

### 5.3 Session count badge

- Day header: "4 sessões"
- Week header de cada dia: badge com contagem

### 5.4 Mobile polish

- Swipe para navegar dias (touch events no AgendaShell)
- Bottom sheet para detail panel (CSS media query)
- FAB conectado ao QuickCreatePopover

---

## Arquivos Envolvidos

### Novos
| Arquivo | Fase |
|---------|------|
| `src/lib/appointments/time-grid.ts` | 1 |
| `src/app/(vault)/agenda/components/time-grid.tsx` | 1 |
| `src/app/(vault)/agenda/components/time-grid-block.tsx` | 1 |
| `src/app/(vault)/agenda/components/agenda-shell.tsx` | 2 |
| `src/app/(vault)/agenda/components/appointment-detail-panel.tsx` | 2 |
| `src/app/(vault)/agenda/components/quick-create-popover.tsx` | 3 |
| `src/app/(vault)/agenda/components/mini-calendar.tsx` | 3 |
| `src/app/(vault)/agenda/components/agenda-month-view.tsx` | 4 |

### Modificados
| Arquivo | Fase | Mudança |
|---------|------|---------|
| `src/lib/appointments/agenda.ts` | 1, 4 | + SerializedAgendaCard, serializeAgendaCard(), deriveMonthAgenda() |
| `src/app/(vault)/agenda/page.tsx` | 1, 2, 3 | Simplificar render, serializar cards, layout com sidebar |
| `src/app/(vault)/agenda/components/agenda-day-view.tsx` | 1 | Reescrever com TimeGrid |
| `src/app/(vault)/agenda/components/agenda-week-view.tsx` | 1 | Reescrever com TimeGrid |
| `src/app/(vault)/agenda/components/agenda-toolbar.tsx` | 4 | + tab "Mês" |
| `src/app/(vault)/appointments/actions.ts` | 2 | + quickStatusChangeAction |
| `src/app/globals.css` | 1 | + CSS vars do time grid |

### Preservados (sem mudança)
- `src/lib/appointments/model.ts`
- `src/lib/appointments/conflicts.ts`
- `src/lib/appointments/recurrence.ts`
- `src/lib/appointments/repository.ts`
- `src/lib/appointments/repository.prisma.ts`
- `src/lib/appointments/store.ts`
- `src/lib/appointments/audit.ts`
- `src/lib/appointments/defaults.ts`
- `src/app/(vault)/agenda/components/appointment-card.tsx` (reutilizado no month view)
- `prisma/schema.prisma` (nenhuma mudança de schema necessária)

---

## Reutilizar

- **STATUS_COLORS** de `appointment-card.tsx` → extrair para uso compartilhado entre card e grid block
- **CARE_MODE_ICONS** de `appointment-card.tsx` → reutilizar no grid block
- **deriveAgendaCard()** de `agenda.ts` → reutilizar como está
- **Conflict detection** de `conflicts.ts` → já integrado nas actions
- **Toast system** (`useToast()`) → usar no detail panel para feedback de ações
- **SubmitButton** → usar nos forms do detail panel e quick create
- **EmptyState** → manter no day view quando sem appointments
- **Communication templates** de `src/lib/communication/templates.ts` → mover para detail panel

---

## Verificação

1. **Visual**: Dev server (`pnpm dev`) → navegar para /agenda → verificar time grid renderiza com hour lines, appointments posicionados corretamente por horário
2. **Day view**: Appointments de 50min devem ocupar ~50px de altura no grid, posicionados no horário correto
3. **Week view**: 7 colunas com time grid compartilhado, appointments distribuídos por dia
4. **Current time**: Linha vermelha horizontal na hora atual, movendo a cada minuto
5. **Click to create**: Clicar em slot vazio abre quick create com horário pre-filled
6. **Detail panel**: Clicar em appointment block abre painel lateral com informações e ações
7. **Quick actions**: Confirmar/concluir/cancelar via panel funciona sem navegar para fora
8. **Mini calendar**: Dots nos dias com appointments, click navega
9. **Month view**: Grid de dias com barras compactas
10. **Mobile**: Day view funcional, bottom sheet para detalhes, FAB para criar
11. **Keyboard**: ← → navega dias, T=hoje, D/W/M=views, Escape fecha panel
12. **Performance**: Testar com 30+ appointments numa semana — render deve ser fluido

---

## Como Executar

Para implementar, basta abrir uma nova conversa e dizer:

```
Execute o plano em .planning/agenda-upgrade.md, começando pela Fase 1
```

Cada fase pode ser executada independentemente como um commit separado.
