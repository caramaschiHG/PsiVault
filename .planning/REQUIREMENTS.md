# Requirements — UX Round 3 (Design System Hardening)

## Requirements

### R1: Design Token Consistency
**Priority:** CRITICAL  
**Source:** Audit C1, C2, C3, A9  
**Description:** Todos os valores visuais (cores, radius, spacing, font-size, shadow, transition, z-index) devem usar tokens CSS, nunca valores hardcodados.

**Acceptance Criteria:**
- [ ] R1.1: Zero cores hex hardcodadas em TSX (exceto SVG fills/strokes)
- [ ] R1.2: Zero border-radius hardcodados em TSX
- [ ] R1.3: Zero padding/margin hardcodados em TSX
- [ ] R1.4: Zero font-size hardcodados em TSX
- [ ] R1.5: Zero box-shadow hardcodados em TSX
- [ ] R1.6: Zero z-index hardcodados em TSX
- [ ] R1.7: Todos os tokens definidos em `:root` do globals.css

### R2: CSS Cleanliness
**Priority:** HIGH  
**Source:** Audit A1, A11, A16  
**Description:** Zero código duplicado no globals.css

**Acceptance Criteria:**
- [ ] R2.1: Zero @keyframes duplicados
- [ ] R2.2: Zero CSS declarations duplicadas
- [ ] R2.3: Zero variáveis CSS não utilizadas

### R3: Accessibility — Focus States
**Priority:** CRITICAL  
**Source:** Audit C4, C6, M1  
**Description:** Todos os elementos interativos devem ter focus states visíveis

**Acceptance Criteria:**
- [ ] R3.1: Todos os botões da toolbar do RichTextEditor têm :focus-visible
- [ ] R3.2: Todos os botões da toolbar têm :hover visual
- [ ] R3.3: Todos os botões da toolbar têm :active feedback
- [ ] R3.4: Botões toggle têm aria-pressed
- [ ] R3.5: Tabs têm :hover state
- [ ] R3.6: :focus-visible global não tem border-radius fixo

### R4: Accessibility — Icon Consistency
**Priority:** CRITICAL  
**Source:** Audit C7, M4  
**Description:** Zero emojis como ícones estruturais

**Acceptance Criteria:**
- [ ] R4.1: RichTextEditor toolbar usa SVG icons (17 botões)
- [ ] R4.2: AutoSaveIndicator usa SVG icons (3 estados)
- [ ] R4.3: NoteBadge usa SVG icon
- [ ] R4.4: External links têm ícone indicador

### R5: Accessibility — Contrast
**Priority:** CRITICAL  
**Source:** Audit C5  
**Description:** Todas as cores de texto passam WCAG AA (4.5:1)

**Acceptance Criteria:**
- [ ] R5.1: --color-text-3 ≥ 4.5:1 sobre --color-bg
- [ ] R5.2: --color-text-3 ≥ 4.5:1 sobre --color-surface-0
- [ ] R5.3: Todas as cores de texto inline passam em contraste

### R6: Component Interaction Polish
**Priority:** HIGH  
**Source:** Audit A2, A5, M2, M8  
**Description:** Todos os componentes interativos têm feedback visual

**Acceptance Criteria:**
- [ ] R6.1: Template cards têm :hover e :active
- [ ] R6.2: ListItem interativo tem :hover visual
- [ ] R6.3: Card variants usam tokens consistentemente
- [ ] R6.4: AutoSaveIndicator usa transition específica (não "all")

### R7: Modal Accessibility
**Priority:** HIGH  
**Source:** Audit A14  
**Description:** Modais têm focus trap e keyboard navigation

**Acceptance Criteria:**
- [ ] R7.1: KeyboardShortcutsModal tem focus trap
- [ ] R7.2: Tab cycle dentro do modal
- [ ] R7.3: Escape fecha o modal
- [ ] R7.4: Primeiro elemento recebe focus ao abrir

### R8: Toast UX
**Priority:** MEDIUM  
**Source:** Audit A8  
**Description:** Toasts têm dismiss button

**Acceptance Criteria:**
- [ ] R8.1: Cada toast tem botão ✕ visível
- [ ] R8.2: Botão tem aria-label "Fechar notificação"

### R9: UX Flow Improvements
**Priority:** MEDIUM  
**Source:** Audit M1-M16  
**Description:** Flows de usuário são melhorados

**Acceptance Criteria:**
- [ ] R9.1: PatientForm tem inline validation (blur)
- [ ] R9.2: PatientForm tem auto-save
- [ ] R9.3: DocumentsSection "Enviar" tem keyboard support
- [ ] R9.4: Communication links têm external link indicator
- [ ] R9.5: Focus mode usa React state (não DOM manipulation)

### R10: Performance
**Priority:** LOW  
**Source:** Audit M9, M15  
**Description:** Otimizações de performance

**Acceptance Criteria:**
- [ ] R10.1: Style objects repetidos usam useMemo
- [ ] R10.2: CLS < 0.05 em todas as páginas
- [ ] R10.3: Bundle size não aumenta significativamente

### R11: Quality Gates
**Priority:** CRITICAL  
**Source:** GSD workflow  
**Description:** Build e tests sempre passando

**Acceptance Criteria:**
- [ ] R11.1: `npx next build` passa (zero errors)
- [ ] R11.2: `pnpm test` passa (351/351)
- [ ] R11.3: Lighthouse Accessibility ≥ 95
- [ ] R11.4: Lighthouse Performance ≥ 90

## Traceability Matrix

| Requirement | Phase Tasks | Audit Items |
|-------------|-------------|-------------|
| R1: Token Consistency | 13.1-13.3, 14.1-14.6 | C1, C2, C3, A9 |
| R2: CSS Cleanliness | 13.6-13.7 | A1, A11, A16 |
| R3: Focus States | 15.1, 15.5, 15.6 | C4, M1 |
| R4: Icon Consistency | 15.2, 15.3, 15.4, 16.4 | C7, M4 |
| R5: Contrast | 13.4 | C5 |
| R6: Component Polish | 15.7, 15.8, 15.12 | A2, A5, M2 |
| R7: Modal A11y | 15.9 | A14 |
| R8: Toast UX | 15.10 | A8 |
| R9: UX Flows | 16.1-16.5, 15.11 | M1-M16 |
| R10: Performance | 17.1-17.4 | M9, M15 |
| R11: Quality Gates | 13.x-17.x (all) | — |

## Verification Plan

Cada requirement será verificada ao final da fase correspondente:

```bash
# R1: Token consistency
grep -rn '#[0-9a-fA-F]\{6\}' src/ --include='*.tsx' | grep -v 'globals.css' | grep -v 'svg' | grep -v 'data:image' | wc -l
# Expected: 0

# R2: CSS cleanliness
grep -c '@keyframes vaultPageIn' src/app/globals.css  # Expected: 1

# R3: Focus states
# Manual: Tab através da RTE toolbar, verificar focus visible

# R4: Icon consistency
grep -rn '📝\|✓\|⟳' src/ --include='*.tsx' | grep -v 'user content' | wc -l
# Expected: 0

# R5: Contrast
# Automated: Use axe-core ou lighthouse

# R11: Quality gates
npx next build && pnpm test
```
