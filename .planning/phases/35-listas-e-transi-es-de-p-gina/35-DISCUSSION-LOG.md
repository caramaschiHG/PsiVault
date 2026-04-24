# Phase 35: Listas e Transições de Página - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 35-listas-e-transi-es-de-p-gina
**Areas discussed:** Staggered list animation mechanics

---

## Staggered List Animation Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Inline style com índice no .map() | Cada `<ListItem>` recebe `style={{ '--stagger-index': i }}`. Mantém Server Component. | ✓ |
| Wrapper Client Component | Criar `<StaggeredList>` que injeta índices via JS. Quebra CSS-only. | |
| CSS :nth-child() com delays fixos | Usar `:nth-child(1)` até `:nth-child(10)`. Menos flexível. | |

**User's choice:** Inline style com índice no .map()
**Notes:** Mantém Server Components como Server Components. Simples de implementar em qualquer `.map()` que renderiza listas.

---

## Escopo de Listagens Staggered

| Option | Description | Selected |
|--------|-------------|----------|
| Todas as listagens principais | Pacientes, atendimentos, financeiro, prontuário. Consistente, mas pode ser exagerado. | |
| Apenas listas verticais simples | Pacientes, financeiro charge list, prontuário. Agenda day/week skip. | ✓ |
| Apenas pacientes e financeiro | Mínimo viável. | |

**User's choice:** Apenas listas verticais simples
**Notes:** Agenda day/week view tem layout complexo — stagger competiria visualmente. Focar em listagens limpas e verticais.

---

## Tipo de Animação por Item

| Option | Description | Selected |
|--------|-------------|----------|
| FadeIn + slideUp suave (8px) | Reutiliza keyframe `slideUp` existente. Discreto e orientado. | ✓ |
| FadeIn puro | Apenas opacidade. Mais seguro para reduced motion, menos 'respiração'. | |
| ScaleIn leve (0.98 → 1) | Sutil crescimento. Pode parecer pop-in em listas longas. | |

**User's choice:** FadeIn + slideUp suave (8px)
**Notes:** Keyframe `slideUp` já existe em `motion.css`. Duração `--duration-200`, easing `--ease-out`.

---

## Cap de 10 Itens

| Option | Description | Selected |
|--------|-------------|----------|
| Itens 1-10 staggered, 11+ sem animação | Aplica `--stagger-index` só quando `i < 10`. Itens 11+ instantâneos. | ✓ |
| Todos staggered com delay máximo fixo | Itens 11+ usam delay de 540ms. Estranho em listas longas. | |
| Paginação para limitar a 10 | Fora do escopo desta fase. | |

**User's choice:** Itens 1-10 staggered, 11+ sem animação (instantâneo)
**Notes:** Evita delays excessivos em listas longas. Item 10 aparece em ~540ms.

---

## Re-render Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Não re-disparar — apenas no carregamento inicial | Filtros/buscas atualizam instantaneamente. Mais calmo. | ✓ |
| Re-disparar em toda mudança de dados | Cada filtro re-anima todos os itens. Pode ficar cansativo. | |
| A critério do executor | Deixa o executor decidir por lista. | |

**User's choice:** Não re-disparar — apenas no carregamento inicial da página
**Notes:** Evita "dança" visual em uso frequente. Stagger é uma animação de entrada, não de atualização.

---

## the agent's Discretion

- **Page transitions:** Se a animação deve ser pulada em navegações rápidas consecutivas.
- **Expand/collapse:** Técnica exata (`grid-template-rows` vs `max-height`) e quais componentes recebem.
- **Add/remove:** Como animar adição/remoção em listas client-side sem Framer Motion.
- **prefers-reduced-motion:** Como `.motion-stagger` deve se comportar em reduced motion.

## Deferred Ideas

None — discussion stayed within phase scope.
