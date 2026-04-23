# Milestone v1.5 Requirements — Motion & Feel

## Scope

Elevar a percepção de qualidade do PsiVault através de animações sutis, micro-interações e refinamentos visuais que criam uma experiência clinicamente calma, estável e agradável — sem cair em exagero decorativo e sem impactar a performance objetiva conquistada em v1.3/v1.4.

---

## Requirements

### Motion Tokens & Foundation (MOTF)

- [ ] **MOTF-01**: Design tokens de motion (`--duration-*`, `--ease-*`, `--stagger-gap`) criados e integrados ao design system existente
- [ ] **MOTF-02**: Media query `prefers-reduced-motion: reduce` implementada como fallback global — todas as animações degradam para instantâneo
- [ ] **MOTF-03**: Utility classes CSS de motion criadas (`.motion-fade-in`, `.motion-slide-up`, `.motion-stagger`, etc.)
- [ ] **MOTF-04**: Arquivo `src/styles/motion.css` carregado no critical path (sem FOUC)

### Micro-interactions em Componentes Base (MICR)

- [ ] **MICR-01**: Todos os botões interativos possuem estados de hover (`translateY`, sombra suave), active (`scale(0.98)`), e disabled/loading (`opacity`, cursor)
- [ ] **MICR-02**: Todos os cards possuem hover state suave (elevação ou sombra)
- [ ] **MICR-03**: Focus rings elegantes e visíveis em todos os elementos focáveis (botões, links, inputs, nav items) — WCAG 2.1 AA compliant
- [ ] **MICR-04**: Inputs e campos de formulário possuem micro-interações: border glow suave no focus, transição de label (float), shake sutil em erro de validação
- [ ] **MICR-05**: Itens de navegação (sidebar, top bar) possuem indicador de ativo com transição suave e hover background
- [ ] **MICR-06**: Links e elementos clicáveis possuem cursor apropriado (`pointer`, `wait`, `not-allowed`, `grab`/`grabbing`)
- [ ] **MICR-07**: Smooth scroll habilitado globalmente (`scroll-behavior: smooth`) com fallback para reduced motion

### Feedback de Ação e Loading (FEED)

- [ ] **FEED-01**: Sistema de Toast existente integrado com `AnimatePresence` — enter (slide + fade), exit (fade), duração ≤300ms
- [ ] **FEED-02**: Botões que disparam Server Actions utilizam `useTransition` para estado de loading visual (opacity, spinner, texto alternativo)
- [ ] **FEED-03**: Skeletons substituem pulse mecânico por shimmer gradient orgânico (CSS animation, duração lenta 1.5–2s)
- [ ] **FEED-04**: Componente `Spinner` leve criado (SVG animado via CSS, sem bibliotecas externas)
- [ ] **FEED-05**: Estados de erro em formulários fornecem feedback visual imediato (border color transition, shake sutil) além de mensagem textual

### Listas e Transições de Página (LIST)

- [ ] **LIST-01**: Listagens principais (pacientes, atendimentos, financeiro) possuem staggered animation de entrada — itens aparecem em sequência com delay progressivo (cap em 10 itens)
- [ ] **LIST-02**: Transição suave entre rotas do vault — fade de conteúdo com duração ≤150ms, sem bloquear navegação rápida
- [ ] **LIST-03**: Cards, filtros e seções expansíveis possuem layout animation de altura suave (expand/collapse sem "jump")
- [ ] **LIST-04**: Reordenação ou adição/remoção de itens em listas possui feedback visual de movimento

### Polish, Accessibility & Measurement (POLI)

- [ ] **POLI-01**: Motion audit realizado em todas as páginas do vault — consistência de hover/focus/active verificada
- [ ] **POLI-02**: Teste de `prefers-reduced-motion` realizado em TODAS as animações — nenhuma animação persiste indevidamente
- [ ] **POLI-03**: Métricas de performance (INP, CLS) medidas antes e depois do milestone — sem regressão em relação ao baseline v1.4
- [ ] **POLI-04**: Documentação de padrões de motion adicionada ao CLAUDE.md (regras de uso, tokens, anti-padrões)
- [ ] **POLI-05**: Nenhum dos 407 testes existentes quebrado por mudanças de motion (visual-only, sem lógica)

---

## Future Requirements (Deferred)

- Number counting animation em dashboards estatísticos (complexidade baixa, mas impacto limitado)
- Swipe to dismiss em notificações mobile-only (esperar estratégia mobile)
- View Transition API nativa do browser quando suporte cross-browser for estável (progressive enhancement futura)
- Ripple effect em botões (questionável para o tom PsiVault; prototipar antes)

## Out of Scope

- **Parallax scrolling** — viola o tom discreto e pode causar desconforto vestibular
- **3D transforms, perspective, rotateX/Y** — anti-padrão visual do PsiVault (nada de glassmorphism/crypto aesthetic)
- **Celebration effects (confetti, etc.)** — anti-padrão de tom (proibido pelo CLAUDE.md)
- **Sound effects** — inapropriado para ambiente clínico
- **Typing animation em textos funcionais** — aumenta tempo de leitura, frustra usuários experientes
- **Full-screen loading spinners** — anti-padrão de UX; skeletons progressivos já implementados em v1.4
- **Background animated gradients / mesh** — viola regra visual do PsiVault
- **Dark mode motion tokens** — dark mode não está no roadmap atual

## Traceability

| REQ-ID | Phase | Plan |
|--------|-------|------|
| MOTF-01 | 29 | TBD |
| MOTF-02 | 29 | TBD |
| MOTF-03 | 29 | TBD |
| MOTF-04 | 29 | TBD |
| MICR-01 | 30 | TBD |
| MICR-02 | 30 | TBD |
| MICR-03 | 30 | TBD |
| MICR-04 | 30 | TBD |
| MICR-05 | 30 | TBD |
| MICR-06 | 30 | TBD |
| MICR-07 | 30 | TBD |
| FEED-01 | 31 | TBD |
| FEED-02 | 31 | TBD |
| FEED-03 | 31 | TBD |
| FEED-04 | 31 | TBD |
| FEED-05 | 31 | TBD |
| LIST-01 | 32 | TBD |
| LIST-02 | 32 | TBD |
| LIST-03 | 32 | TBD |
| LIST-04 | 32 | TBD |
| POLI-01 | 33 | TBD |
| POLI-02 | 33 | TBD |
| POLI-03 | 33 | TBD |
| POLI-04 | 33 | TBD |
| POLI-05 | 33 | TBD |

---
*Last updated: 2026-04-23 — Requirements defined for v1.5*
