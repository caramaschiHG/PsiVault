# STATE — UI/UX Polish Project

## Current Phase: 13 (UX Round 3: Design System Hardening) — PLANNED
## Progress: 8/17 fases completas + 9 planejadas

## Target Score: 6.2 → 9.6+

## Decisions
- Inline styles foram extraídos para CSS classes e componentes
- Componentes novos em `src/components/ui/` com exports nomeados
- Cada página refatorada usa PageHeader, Section, Card, StatCard, List, Badge
- Mobile-first: sidebar com drawer pattern em mobile
- prefers-reduced-motion respeitado em todas as animações
- **Round 3**: Migração TOTAL de inline styles para tokens CSS (cores, radius, spacing, font-size, shadow, transition)
- **Round 3**: Zero emojis como ícones estruturais — substituir por SVG
- **Round 3**: Acessibilidade total — focus states, aria-pressed, focus trap, keyboard nav

## Metrics
- Inline style objects (inicio): 45 → 15 (-67%)
- Inline style objects (patients): 25 → 10 (-60%)
- Componentes UI: 6 → 12 (+100%)
- H2 font-size: 0.7rem → clamp(1.125rem, 2.5vw, 1.25rem) (+78%)
- Níveis de sombra: 3 → 5
- Tokens de espaçamento: 13+ → 8 sistemáticos
- Build: ✅ PASSING
- Tests: ✅ 351/351 PASSING

### Baseline para Round 3 (pre-migration)
- Cores hex hardcodadas em TSX: 274+
- Border-radius hardcoded: 146+
- Z-index hardcoded: 26
- Font-size hardcoded: 14+ valores fora da escala
- @keyframes duplicados: 5 pares (~40 lines)
- CSS declarations duplicadas: ~20 blocos
- Emojis como ícones: 8+
- Missing focus states: 17 toolbar buttons
- Contrast failures: 1 (--color-text-3 #78716c)

## Completed Phases
- [x] FASE 1: Foundation — Tokens
- [x] FASE 2: Componentes Core (6 novos)
- [x] FASE 3: Página Início
- [x] FASE 4: Página Patients
- [x] FASE 7: Vault Layout
- [x] FASE 8: Acessibilidade
- [x] FASE 9: globals.css
- [x] FASE 10: Micro-interações
- [x] FASE 12: Double Check & QA
- [x] FASE 13: Foundation Tokens (z-index, spacing, font-size, contrast, focus, cleanup)
- [x] FASE 14.1: Colors → CSS variables (200+ migrated)
- [x] FASE 14.2: Border-radius → tokens (146+ migrated)
- [x] FASE 14.5: Shadows → tokens (25+ migrated)
- [x] FASE 15: Component Polish (SVG icons, focus trap, toast dismiss, hover states)

## Pending Phases (Round 3)
- [ ] FASE 14.3: Padding/margin → tokens (iterative)
- [ ] FASE 14.4: Font-size → tokens (iterative)
- [ ] FASE 14.6: Transition → tokens (iterative)
- [ ] FASE 15.2: RTE SVG icons (17 buttons — deferred)
- [ ] FASE 15.11: Focus mode React state (deferred)
- [ ] FASE 16: UX Flow Polish
- [ ] FASE 17: Performance & QA Final

## Commits Round 3
- 3ed1e5c ux(tokens): add z-index token system, migrate all hardcoded values
- 0a82025 ux(tokens): harden foundation tokens, clean duplicate CSS
- f4a61a1 ux(colors): migrate hex colors to CSS variables (200+ colors, 53 files)
- 187d796 ux(radius): migrate border-radius to tokens (146+ values, 48 files)
- ed52cf2 docs(planning): add UX Round 3 phase plans and discussion docs
- 03754ac ux(shadows): migrate shadows to tokens (25+ shadows, 20 files)
- ac1240a ux(icons): replace emojis with SVG icons in AutoSaveIndicator, NoteBadge
- 41bc4d4 ux(components): polish hover states, focus trap, toast dismiss
- 6079b7c ux(rte): replace text labels with SVG icons in toolbar, add hover states

## Pending Phases (legacy)
- [ ] FASE 5: Agenda (complex — needs dedicated session)
- [ ] FASE 6: Financeiro (large client component)
- [ ] FASE 11: Performance (useMemo, code splitting)

## Notes
- Relatório de auditoria: `.planning/ui-ux-audit-report.md`
- Relatório de verificação: `.planning/verification-report.md`
- Roadmap: `.planning/ROADMAP.md`
- Round 3 plan: `.planning/phases/13-ux-round3-design-system-hardening/13-00-PLAN.md`
