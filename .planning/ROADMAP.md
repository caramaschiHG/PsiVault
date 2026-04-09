# ROADMAP — UI/UX Polish

## Phase 1: Foundation — Design Tokens & Tipografia
- 1.1 Refatorar tokens de tipografia (escala de 6 níveis)
- 1.2 Refatorar tokens de espaçamento (escala de 4px, 8 tokens)
- 1.3 Refatorar tokens de sombra (5 níveis de elevação)
- 1.4 Adicionar tokens de superfície (3 níveis)
- 1.5 Corrigir H1/H2 em todas as páginas
- 1.6 Adicionar fluid typography (clamp)

## Phase 2: Componentes Core
- 2.1 Criar `<Card>` unificado (4 variants)
- 2.2 Criar `<Section>` unificado
- 2.3 Criar `<StatCard>` (para métricas/números)
- 2.4 Criar `<List>` e `<ListItem>` unificados
- 2.5 Criar `<Separator>` component
- 2.6 Criar `<Badge>` unificado (extender StatusBadge)
- 2.7 Refatorar Button (adicionar variantes faltando)

## Phase 3: Refatorar Página Início
- 3.1 Usar PageHeader
- 3.2 Usar Section em todas as seções
- 3.3 Usar Card para sessões de hoje
- 3.4 Usar StatCard para resumo do mês
- 3.5 Usar List para cobranças pendentes
- 3.6 Melhorar mensagem contextual
- 3.7 Verificar e polir responsividade

## Phase 4: Refatorar Página Patients
- 4.1 Usar PageHeader
- 4.2 Usar List/PatientListItem
- 4.3 Usar Section para formulário
- 4.4 Verificar responsividade mobile

## Phase 5: Refatorar Página Agenda
- 5.1 Simplificar toolbar visual
- 5.2 Usar PageHeader
- 5.3 Reduzir cognitive load dos cards
- 5.4 Overdue alert menos intrusivo
- 5.5 WhatsApp panel integrado
- 5.6 MiniCalendar sidebar refinamento

## Phase 6: Refatorar Página Financeiro
- 6.1 Usar PageHeader
- 6.2 Usar Card/List/StatCard
- 6.3 Status badges consistentes
- 6.4 Tabelas responsivas

## Phase 7: Refatorar Vault Layout
- 7.1 Sidebar refinamentos visuais
- 7.2 Mobile: drawer pattern
- 7.3 Bottom nav refinado
- 7.4 Search bar melhorias
- 7.5 Transições de página

## Phase 8: Acessibilidade
- 8.1 Keyboard navigation completa
- 8.2 ARIA roles em todos os componentes
- 8.3 prefers-reduced-motion
- 8.4 Focus states consistentes
- 8.5 Screen reader testing

## Phase 9: globals.css Refatoração
- 9.1 Separar por domínios (tokens, components, pages, utilities)
- 9.2 Remover código morto
- 9.3 Organizar imports
- 9.4 Landing page CSS cleanup

## Phase 10: Polish & Micro-interações
- 10.1 Hover states em cards
- 10.2 Active states com feedback
- 10.3 Loading states (skeletons)
- 10.4 Empty states refinados
- 10.5 Toast notifications polish
- 10.6 Page transitions

## Phase 11: Performance
- 11.1 useMemo em style objects
- 11.2 Code splitting
- 11.3 CLS reduction
- 11.4 Bundle size check

## Phase 12: Double Check & QA
- 12.1 Visual review de todas as páginas
- 12.2 Mobile testing completo
- 12.3 Accessibility audit
- 12.4 Performance metrics
- 12.5 Build e teste final

## Phase 13: UX Round 3 — Design System Hardening (Score 6.2 → 9.6+)
### Fase 13: Foundation Tokens (6.2 → 7.2)
- 13.1 Criar z-index token system (8 tokens)
- 13.2 Adicionar spacing tokens faltando (--space-1.5, --space-5, --space-7)
- 13.3 Corrigir redundância font-size (unificar xs/label, adicionar 2xs)
- 13.4 Corrigir contraste --color-text-3 (#57534e)
- 13.5 Corrigir :focus-visible border-radius fixo
- 13.6 Limpar @keyframes duplicados (~40 lines)
- 13.7 Limpar CSS declarations duplicadas (~20 blocos)
- 13.8 Criar tokens de cores semânticas faltando (kbd, template cards, etc.)

### Fase 14: Inline Styles → Token Migration (7.2 → 8.4)
- 14.1 Cores inline → CSS variables (TODOS os arquivos)
- 14.2 Border-radius inline → tokens (TODOS os arquivos)
- 14.3 Padding/margin inline → tokens (TODOS os arquivos)
- 14.4 Font-size inline → tokens (TODOS os arquivos)
- 14.5 Shadow inline → tokens (TODOS os arquivos)
- 14.6 Transition inline → tokens (TODOS os arquivos)

### Fase 15: Component Polish & Acessibilidade (8.4 → 9.0)
- 15.1 RichTextEditor toolbar: focus/hover/active/aria-pressed
- 15.2 RichTextEditor: emojis → SVG icons (17 botões)
- 15.3 AutoSaveIndicator: emojis → SVG icons
- 15.4 ClinicalTimeline NoteBadge: emoji → SVG icon
- 15.5 AutoSaveIndicator: transition específica (não "all")
- 15.6 Tab: adicionar hover state
- 15.7 ListItem: adicionar hover visual
- 15.8 Template cards: hover/press feedback
- 15.9 KeyboardShortcutsModal: focus trap
- 15.10 Toast: dismiss button
- 15.11 NoteComposer focus mode: React state (não DOM)
- 15.12 Card variants: unificar radius/shadow

### Fase 16: UX Flow & Interaction Polish (9.0 → 9.4)
- 16.1 Inline validation em PatientForm
- 16.2 Auto-save em PatientForm
- 16.3 DocumentsSection "Enviar": keyboard support
- 16.4 External link indicator (communication links)
- 16.5 Shell page padding → tokens
- 16.6 ClinicalTimeline: month jump nav
- 16.7 RichTextEditor: paste formatting toggle

### Fase 17: Performance & QA Final (9.4 → 9.6+)
- 17.1 useMemo em style objects repetidos
- 17.2 RichTextEditor: reduzir re-renders
- 17.3 CLS audit (CLS < 0.05)
- 17.4 Bundle size check
- 17.5 Lighthouse audit completo
- 17.6 Build + tests finais
- 17.7 Atualizar ROADMAP e STATE
- 17.8 Commit atômico final
