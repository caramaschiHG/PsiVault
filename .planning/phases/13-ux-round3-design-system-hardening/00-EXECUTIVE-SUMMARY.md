# UX Round 3: Executive Summary — Score 6.2 → 9.6+

## Visão

Transformar o PsiLock de "funcional mas com dívidas visuais" para "premium, polido e acessível" — score 9.6+/10.

## O Problema

O auditRound2 identificou **44 problemas** em 5 categorias:
- **7 Críticos** — acessibilidade quebrada, inconsistência visual massiva
- **13 Altos** — consistência visual comprometida
- **16 Médios** — polish e UX flows
- **8 Baixos** — nice-to-have

**Problema raiz:** 50+ arquivos usam inline styles que bypassam completamente o design system CSS. Resultado:
- 274+ cores hardcodadas → impossível dark mode, inconsistência
- 146+ border-radius hardcodados → visual caótico
- 26 z-index arbitrários → colisões inevitáveis
- 17 botões sem focus state → inacessível por teclado
- 8+ emojis como ícones → inconsistente entre plataformas

## A Solução: 5 Fases Atômicas

```
FASE 13 ──→ FASE 14 ──→ FASE 15 ──→ FASE 16 ──→ FASE 17
Foundation   Inline       Component    UX Flow    QA Final
Tokens       Migration    Polish       Polish     Performance
6.2→7.2      7.2→8.4      8.4→9.0      9.0→9.4    9.4→9.6+
```

### Fase 13: Foundation Tokens (8 tasks)
**O quê:** Criar/corrigir tokens no globals.css, limpar código morto
**Arquivos:** ~25 (principalmente globals.css)
**Risco:** Médio (muitas mudanças, mas reversível)
**Critérios:** Zero duplicatas CSS, zero z-index hardcodado, build+tests OK

### Fase 14: Inline Migration (6 tasks)
**O quê:** Migrar TODOS os inline styles para tokens em TODOS os arquivos
**Arquivos:** ~50 (sistemático por tipo de token)
**Risco:** Médio (cada arquivo é independente)
**Critérios:** Zero hex colors, zero hardcoded radius/spacing/font em TSX

### Fase 15: Component Polish (12 tasks)
**O quê:** Focus states, hover, SVG icons, acessibilidade total
**Arquivos:** ~12 (componentes UI + app components)
**Risco:** Baixo (cada componente é isolado)
**Critérios:** Lighthouse a11y ≥ 95, zero emojis, zero botões sem focus

### Fase 16: UX Flows (7 tasks)
**O quê:** Inline validation, keyboard support, external link indicators
**Arquivos:** ~8 (flows específicos)
**Risco:** Baixo-Médio (mudanças comportamentais)
**Critérios:** User testing manual, zero regressões

### Fase 17: QA Final (8 tasks)
**O quê:** Performance, CLS audit, Lighthouse, build final
**Arquivos:** Vários (otimizações)
**Risco:** Baixo
**Critérios:** Score ≥ 9.6, CLS < 0.05, 351/351 tests, build OK

## Dependency Graph

```
         ┌── 13.1 (z-index) ──┐
         ├── 13.2 (spacing) ──┤
         ├── 13.3 (font-size)─┤
         ├── 13.4 (contrast) ─┤
FASE 13 ── 13.5 (focus) ──────┤
         ├── 13.6 (keyframes)─┤      ┌── 14.1 (colors) ──────┐
         ├── 13.7 (duplicates)┤      ├── 14.2 (radius) ──────┤
         └── 13.8 (new colors)┘      ├── 14.3 (spacing) ─────┤
                                     ├── 14.4 (font-size) ───┤
                                     ├── 14.5 (shadow) ──────┤
        ┌────────────────────────────┴─ 14.6 (transition) ───┤
        │                                                   │
        │                                    ┌── 15.1 (RTE focus) ──┐
        │                                    ├── 15.2 (RTE icons) ──┤
        │                                    ├── 15.3 (ASI icons) ──┤
        │                                    ├── 15.4 (badge icon) ─┤
        │                                    ├── 15.5 (ASI transition)┤
        │                                    ├── 15.6 (Tab hover) ──┤
        │                                    ├── 15.7 (List hover) ──┤
        ├────────────────────────────────────┤ 15.8 (Template hover)┤
        │                                    ├── 15.9 (Modal trap) ─┤
        │                                    ├── 15.10 (Toast dismiss)┤
        │                                    ├── 15.11 (Focus mode) ─┤
        │                                    └── 15.12 (Card unify) ─┘
        │                                                     │
        │                                    ┌── 16.1 (validation) ─┐
        │                                    ├── 16.2 (autosave) ───┤
        │                                    ├── 16.3 (keyboard) ───┤
        ├────────────────────────────────────┤ 16.4 (external link)─┤
        │                                    ├── 16.5 (shell padding)┤
        │                                    ├── 16.6 (month jump) ─┤
        │                                    └── 16.7 (paste toggle)┘
        │                                                     │
        │                                    ┌── 17.1 (useMemo) ────┐
        │                                    ├── 17.2 (re-renders) ─┤
        ├────────────────────────────────────┤ 17.3 (CLS audit) ────┤
        │                                    ├── 17.4 (bundle size)─┤
        │                                    ├── 17.5 (lighthouse) ─┤
        │                                    ├── 17.6 (build+tests)─┤
        │                                    ├── 17.7 (docs update)─┤
        │                                    └── 17.8 (final commit)┘
        └─────────────────────────────────────┘
```

## Parallelization Strategy

**Dentro de cada fase, tasks são paralelizáveis:**
- Fase 14: 6 sub-tasks podem rodar em paralelo (cada uma migra um tipo de token)
- Fase 15: 12 sub-tasks podem rodar em paralelo (cada uma afeta componente diferente)
- Fase 16: 7 sub-tasks podem rodar em paralelo (cada uma afeta flow diferente)

**Entre fases:** Dependência sequencial (13 → 14 → 15 → 16 → 17)

## Success Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| **UX Score** | 6.2 | ≥ 9.6 | +55% |
| Cores hex em TSX | 274+ | 0 | -100% |
| Border-radius hardcoded | 146+ | 0 | -100% |
| Z-index hardcoded | 26 | 0 | -100% |
| Font-size fora da escala | 14+ | 0 | -100% |
| Emojis como ícones | 8+ | 0 | -100% |
| Missing focus states | 17 | 0 | -100% |
| Duplicate CSS | ~60 lines | 0 | -100% |
| Contrast failures | 1 | 0 | -100% |
| Build | ✅ | ✅ | — |
| Tests | 351/351 | 351/351 | — |
| Lighthouse A11y | ~70 | ≥ 95 | +36% |

## Files Impact Summary

| Category | Files | Lines Changed | Risk |
|----------|-------|--------------|------|
| Foundation (Fase 13) | ~25 | ~230 | Médio |
| Migration (Fase 14) | ~50 | ~800 | Médio |
| Polish (Fase 15) | ~12 | ~200 | Baixo |
| Flows (Fase 16) | ~8 | ~120 | Baixo-Médio |
| QA (Fase 17) | ~5 | ~50 | Baixo |
| **TOTAL** | **~100** | **~1,400** | **Controlado** |

## Execution Principles

1. **Atomic commits** — Cada task é um commit separado com mensagem clara
2. **Build gate** — `npx next build` após CADA task
3. **Test gate** — `pnpm test` após CADA task
4. **Visual diff** — Reverter se houver regressão visual não intencional
5. **Token first** — Criar token ANTES de migrar, nunca hardcode fallback

## Next Step

Execute `/gsd execute 13` para iniciar a Fase 13 (Foundation Tokens).
